import React, { useCallback, useMemo, useEffect } from 'react'; // <-- AÑADIDO: useEffect
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Category } from '../types';
import { Card, CardContent } from '../components/ui/card';

// Asegúrate de haber ejecutado: pnpm install d3
import * as d3 from 'd3'; 

// Definiciones de tipos para los datos de ReactFlow
type FlowNode = Node<Category>;
type FlowEdge = Edge;

interface CategoryTreeProps {
  categories: Category[]; // Lista plana para referencia de datos
  treeData: Category[];   // Estructura de árbol
  onMoveCategory: (childId: number, newParentId: number | null) => void;
}

// ----------------------------------------------------
// Lógica de Mapeo y Diseño de ReactFlow
// ----------------------------------------------------

// Utiliza el layout de árbol de D3 para calcular las posiciones (esto es lo más difícil)
const layout = (treeData: Category[]): { nodes: FlowNode[]; edges: FlowEdge[] } => {
  if (treeData.length === 0) return { nodes: [], edges: [] };

  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];
  
  // 1. Crear la estructura de datos D3 (root)
  // Nota: D3 requiere que las categorías estén en una sola raíz para el layout
  const rootCategory: Category = { id: 0, name: 'Root', children: treeData };
  const d3Root = d3.hierarchy(rootCategory, d => d.children);
  
  // 2. Definir el layout de árbol
  // El tamaño del diagrama debe ajustarse al contenedor. Usamos valores fijos para el espaciado.
  const treeLayout = d3.tree<Category>().nodeSize([200, 150]); // [width, height]
  const layoutData = treeLayout(d3Root);

  // 3. Mapear nodos y bordes
  layoutData.each(d => {
    // Ignoramos el nodo 'Root' artificial
    if (d.data.id === 0) return; 

    // Crear el Nodo de ReactFlow
    nodes.push({
      id: String(d.data.id),
      type: 'default', // Puedes crear tipos de nodos personalizados aquí
      position: { x: d.x, y: d.y }, // Posición calculada por D3
      data: { ...d.data, label: d.data.name }, // Datos de la categoría
      draggable: true, // Permitir arrastrar
    });

    // Crear el Borde (Edge) de ReactFlow
    if (d.parent && d.parent.data.id !== 0) {
      edges.push({
        id: `e${d.parent.data.id}-${d.data.id}`,
        source: String(d.parent.data.id),
        target: String(d.data.id),
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
      });
    }
  });

  return { nodes, edges };
};

// ----------------------------------------------------
// Componente principal de ReactFlow
// ----------------------------------------------------

const CategoryTreeViewer: React.FC<CategoryTreeProps> = ({ categories, treeData, onMoveCategory }) => {
  
  // Mapear el árbol a nodos y bordes cada vez que treeData cambia
  const { initialNodes, initialEdges } = useMemo(() => {
    const { nodes, edges } = layout(treeData);
    return { initialNodes: nodes, initialEdges: edges };
  }, [treeData]);


  // ReactFlow hooks para manejar el estado interno de los nodos (posiciones, etc.)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Sincronizar nodos y bordes cuando las props cambian (ej. al guardar una mutación)
  useEffect(() => {
      setNodes(initialNodes);
      setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);
  

  // Handler de arrastrar y soltar para REASIGNAR el padre
  const handleNodeDragStop = useCallback((event, node) => {
    // 1. Encontrar el nodo sobre el que se soltó (el nuevo padre)
    // Nota: Esta es una detección de colisión simple basada en coordenadas.
    const dropTarget = nodes.find(n => {
        // Lógica simple: si el centro del nodo soltado está cerca del centro de otro nodo
        const threshold = 50; 
        return n.id !== node.id && 
               Math.abs(n.position.x - node.position.x) < threshold && 
               Math.abs(n.position.y - node.position.y) < threshold;
    });

    const movedCategoryId = Number(node.id);
    const oldParentId = categories.find(c => c.id === movedCategoryId)?.parent?.id || null;
    let newParentId = null;

    if (dropTarget) {
      newParentId = Number(dropTarget.id);
      
      // Chequeo de ciclo: Evitar que un nodo sea padre de sí mismo
      if (newParentId === movedCategoryId) {
          console.warn("No puedes soltar un nodo sobre sí mismo.");
          return;
      }
      
      // La lógica de detección de ciclos más robusta (evitar mover un padre a uno de sus hijos)
      // debe implementarse en el backend o en una función de utilidad de JS, 
      // pero por simplicidad se deja solo la lógica de reasignación.

    } else {
        // Si no se soltó sobre nadie, se convierte en categoría raíz (newParentId = null)
        newParentId = null;
    }

    // 2. Ejecutar la reubicación si el padre ha cambiado
    if (newParentId !== oldParentId) {
        console.log(`Reubicando Cat ${movedCategoryId} de ${oldParentId} a ${newParentId}`);
        onMoveCategory(movedCategoryId, newParentId);
    }
    
    // Si no hubo cambio de padre, el nodo permanece en su posición arrastrada temporalmente por ReactFlow.
  }, [nodes, categories, onMoveCategory]); // <-- Elimino setNodes, setEdges del dep array, ya que no se usan dentro de useCallback
  
  
  return (
    <Card className="shadow-lg h-[600px] w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
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
          {/* Solución al error de Background: Usamos 'dots' que es compatible */}
          <Background variant="dots" gap={12} size={1} />
          <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 100, backgroundColor: 'white', padding: 5, borderRadius: 4, border: '1px solid #ccc', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              **Arrastra un nodo** para reasignar el padre.
          </div>
        </ReactFlow>
      </CardContent>
    </Card>
  );
};

export default CategoryTreeViewer;
