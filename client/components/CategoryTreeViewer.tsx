
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { Category } from "../types";
import { Card, CardContent } from "../components/ui/card";
import * as d3 from "d3";

type FlowNode = Node<Category>;
type FlowEdge = Edge;

interface SaveChange {
  id: number;
  newParentId: number | null;
}

interface CategoryTreeProps {
  treeData: Category[];
  onSave: (changes: SaveChange[]) => void;
}



const deepCloneTree = (t: Category[]): Category[] => {
  return JSON.parse(JSON.stringify(t || []));
};

const ensureChildren = (tree: Category[]) => {
  for (const n of tree) {
    if (!Array.isArray(n.children)) n.children = [];
    ensureChildren(n.children);
  }
};


const findAndRemoveNode = (tree: Category[], id: number): { node: Category | null; tree: Category[] } => {
  for (let i = 0; i < tree.length; i++) {
    const n = tree[i];
    if (n.id === id) {
      const [removed] = tree.splice(i, 1);
      return { node: removed, tree };
    }
    if (n.children) {
      const res = findAndRemoveNode(n.children, id);
      if (res.node) return res;
    }
  }
  return { node: null, tree };
};

const insertNodeUnderParent = (tree: Category[], node: Category, parentId: number | null): boolean => {
  if (parentId === null) {
    tree.push(node);
    node.parent = null;
    return true;
  }
  for (const n of tree) {
    if (n.id === parentId) {
      if (!Array.isArray(n.children)) n.children = [];
      n.children.push(node);
      node.parent = { id: parentId } as Category;
      return true;
    }
    if (n.children) {
      const ok = insertNodeUnderParent(n.children, node, parentId);
      if (ok) return true;
    }
  }
  return false;
};

const findParentId = (tree: Category[], id: number, parent: number | null = null): number | null => {
  for (const n of tree) {
    if (n.id === id) return parent;
    if (n.children) {
      const res = findParentId(n.children, id, n.id);
      if (res !== null) return res;
    }
  }
  return null;
};

const buildParentMap = (tree: Category[], map = new Map<number, number | null>(), parent: number | null = null) => {
  for (const n of tree) {
    map.set(n.id, parent);
    if (n.children) buildParentMap(n.children, map, n.id);
  }
  return map;
};

const isDescendant = (tree: Category[], ancestorId: number, targetId: number): boolean => {

  const findNode = (nodes: Category[], id: number): Category | null => {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children) {
        const r = findNode(n.children, id);
        if (r) return r;
      }
    }
    return null;
  };
  const anc = findNode(tree, ancestorId);
  if (!anc || !anc.children) return false;

  const search = (nodes: Category[]): boolean => {
    for (const n of nodes) {
      if (n.id === targetId) return true;
      if (n.children && search(n.children)) return true;
    }
    return false;
  };
  return search(anc.children);
};



const layout = (treeData: Category[]): { nodes: FlowNode[]; edges: FlowEdge[] } => {
  if (!treeData || treeData.length === 0) return { nodes: [], edges: [] };

  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];

  const rootCategory: Category = { id: 0, name: "Root", children: treeData };
  const d3Root = d3.hierarchy(rootCategory, (d) => d.children);
  const treeLayout = d3.tree<Category>().nodeSize([200, 150]);
  const layoutData = treeLayout(d3Root);

  layoutData.each((d) => {
    if (d.data.id === 0) return;
    nodes.push({
      id: String(d.data.id),
      type: "default",
      position: { x: d.x, y: d.y },
      data: { ...d.data, label: d.data.name },
      draggable: true,
    });

    if (d.parent && d.parent.data.id !== 0) {
      edges.push({
        id: `e${d.parent.data.id}-${d.data.id}`,
        source: String(d.parent.data.id),
        target: String(d.data.id),
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed },
      });
    }
  });

  return { nodes, edges };
};



const CategoryTreeViewer: React.FC<CategoryTreeProps> = ({ treeData, onSave }) => {

  const originalRef = useRef<Category[]>(deepCloneTree(treeData || []));

  const [workingTree, setWorkingTree] = React.useState<Category[]>(() => {
    const t = deepCloneTree(treeData || []);
    ensureChildren(t);
    return t;
  });


  const undoStack = useRef<Category[][]>([]);
  const redoStack = useRef<Category[][]>([]);


  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(() => layout(workingTree), [workingTree]);


  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge[]>([]);


  useEffect(() => {
    originalRef.current = deepCloneTree(treeData || []);
    const clone = deepCloneTree(treeData || []);
    ensureChildren(clone);
    setWorkingTree(clone);
  }, [treeData]);


  useEffect(() => {
    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [layoutNodes, layoutEdges, setNodes, setEdges]);


  const pushUndo = useCallback((snapshot: Category[]) => {
    undoStack.current.push(deepCloneTree(snapshot));
    if (undoStack.current.length > 50) undoStack.current.shift();
    redoStack.current = [];
  }, []);


  const handleNodeDragStop = useCallback(
    (_event: any, node: any) => {

      const dropTarget = nodes.find((n) => {
        const threshold = 50;
        return (
          n.id !== node.id &&
          Math.abs(n.position.x - node.position.x) < threshold &&
          Math.abs(n.position.y - node.position.y) < threshold
        );
      });

      const movedId = Number(node.id);
      const oldParent = findParentId(workingTree, movedId);
      let newParentId: number | null = null;

      if (dropTarget) {
        newParentId = Number(dropTarget.id);
        if (newParentId === movedId) {
          console.warn("No puedes soltar un nodo sobre sí mismo.");
          return;
        }
        if (isDescendant(workingTree, movedId, newParentId)) {
          console.warn("No puedes asignar una categoría a uno de sus descendientes.");
          return;
        }
      } else {
        newParentId = null;
      }

      if (newParentId === oldParent) return;


      pushUndo(workingTree);


      const newTree = deepCloneTree(workingTree);
      ensureChildren(newTree);
      const { node: removed } = findAndRemoveNode(newTree, movedId);
      if (!removed) {
        console.error("Nodo no encontrado", movedId);
        return;
      }
      removed.parent = null;
      const inserted = insertNodeUnderParent(newTree, removed, newParentId);
      if (!inserted) {

        newTree.push(removed);
      }

      setWorkingTree(newTree);
    },
    [nodes, workingTree, pushUndo]
  );


  const handleUndo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const last = undoStack.current.pop()!;
    redoStack.current.push(deepCloneTree(workingTree));
    setWorkingTree(deepCloneTree(last));
  }, [workingTree]);

  const handleRedo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop()!;
    undoStack.current.push(deepCloneTree(workingTree));
    setWorkingTree(deepCloneTree(next));
  }, [workingTree]);

  const handleResetLayout = useCallback(() => {

    setWorkingTree((prev) => deepCloneTree(prev));
  }, []);

  const handleCancel = useCallback(() => {
    undoStack.current = [];
    redoStack.current = [];
    const orig = deepCloneTree(originalRef.current || []);
    ensureChildren(orig);
    setWorkingTree(orig);
  }, []);

  const computeChanges = useCallback((): SaveChange[] => {
    const origMap = buildParentMap(originalRef.current || []);
    const curMap = buildParentMap(workingTree || []);
    const changes: SaveChange[] = [];
    for (const [id, newParent] of curMap.entries()) {
      const oldParent = origMap.get(id) ?? null;
      if (oldParent !== newParent) {
        changes.push({ id, newParentId: newParent ?? null });
      }
    }
    return changes;
  }, [workingTree]);

  const handleSave = useCallback(() => {
    const changes = computeChanges();
    if (changes.length === 0) {
      console.log("No hay cambios que guardar");
      return;
    }
    onSave(changes);

    originalRef.current = deepCloneTree(workingTree);
    undoStack.current = [];
    redoStack.current = [];
  }, [computeChanges, onSave, workingTree]);

  const pending = useMemo(() => computeChanges(), [computeChanges]);
  const canUndo = undoStack.current.length > 0;
  const canRedo = redoStack.current.length > 0;


  return (
    <Card className="shadow-lg h-[700px] w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 relative">
      {}
      <div style={{ position: "absolute", top: 10, left: 12, right: 12, zIndex: 40, display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          style={{
            backgroundColor: canUndo ? "#f59e0b" : "#e5e7eb",
            color: canUndo ? "white" : "#6b7280",
            border: "none",
            padding: "6px 10px",
            borderRadius: 6,
            cursor: canUndo ? "pointer" : "not-allowed",
          }}
        >
          Undo
        </button>

        <button
          onClick={handleRedo}
          disabled={!canRedo}
          style={{
            backgroundColor: canRedo ? "#10b981" : "#e5e7eb",
            color: canRedo ? "white" : "#6b7280",
            border: "none",
            padding: "6px 10px",
            borderRadius: 6,
            cursor: canRedo ? "pointer" : "not-allowed",
          }}
        >
          Redo
        </button>

        <div style={{ marginLeft: 12, flex: 1, color: "#374151" }}>
          Cambios pendientes: <strong>{pending.length}</strong>
        </div>

        <button
          onClick={handleSave}
          disabled={pending.length === 0}
          style={{
            backgroundColor: pending.length === 0 ? "#9ca3af" : "#2563eb",
            color: "white",
            border: "none",
            padding: "6px 12px",
            borderRadius: 6,
            cursor: pending.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          Guardar ({pending.length})
        </button>

        <button
          onClick={handleCancel}
          style={{
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            padding: "6px 10px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>

        <button
          onClick={handleResetLayout}
          style={{
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            padding: "6px 10px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Reset Layout
        </button>
      </div>

      <CardContent className="h-full w-full p-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={handleNodeDragStop}
          fitView
          attributionPosition="bottom-right"
        >
          <MiniMap nodeStrokeColor="#1e90ff" nodeColor="#1e90ff" nodeBorderRadius={5} />
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <div
            style={{
              position: "absolute",
              top: 60,
              left: 12,
              zIndex: 30,
              backgroundColor: "white",
              padding: "6px 8px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            Arrastra un nodo para reasignar el padre. Luego Guarda o Cancela.
          </div>
        </ReactFlow>
      </CardContent>
    </Card>
  );
};

export default CategoryTreeViewer;
