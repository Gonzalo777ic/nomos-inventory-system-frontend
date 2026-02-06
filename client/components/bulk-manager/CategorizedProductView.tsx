import React, { useMemo, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  CheckSquare,
  Square,
  MinusSquare,
  Box,
  Folder,
} from "lucide-react";
import { ProductListItem, Category } from "../../types";
import { Checkbox } from "../../components/ui/checkbox";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

interface CategoryTreeNode {
  category: Category;
  products: ProductListItem[];
  children: CategoryTreeNode[];
}

interface CategorizedProductViewProps {
  products: ProductListItem[];
  categories: Category[];
  selectedIds: number[];
  onToggleProduct: (id: number) => void;
  onToggleCategory: (productIdsInCat: number[]) => void;
}

interface CategorySectionProps {
  node: CategoryTreeNode;
  level: number;
  selectedIds: number[];
  onToggleProduct: (id: number) => void;
  onToggleCategory: (ids: number[]) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  node,
  level,
  selectedIds,
  onToggleProduct,
  onToggleCategory,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getAllNodeProductIds = (n: CategoryTreeNode): number[] => {
    const directIds = n.products.map((p) => p.id);
    const childIds = n.children.flatMap((child) => getAllNodeProductIds(child));
    return [...directIds, ...childIds];
  };

  const allIdsInNode = useMemo(() => getAllNodeProductIds(node), [node]);

  const selectedCount = allIdsInNode.filter((id) =>
    selectedIds.includes(id),
  ).length;
  const isAllSelected =
    allIdsInNode.length > 0 && selectedCount === allIdsInNode.length;
  const isIndeterminate =
    selectedCount > 0 && selectedCount < allIdsInNode.length;

  if (allIdsInNode.length === 0) return null;

  return (
    <div className="mb-4" style={{ marginLeft: level > 0 ? "1.5rem" : "0" }}>
      {}
      <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mb-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        {}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-0 text-gray-400"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>

        {}
        <div
          className="cursor-pointer text-purple-600"
          onClick={() => onToggleCategory(allIdsInNode)}
        >
          {isAllSelected ? (
            <CheckSquare className="w-5 h-5" />
          ) : isIndeterminate ? (
            <MinusSquare className="w-5 h-5 opacity-70" />
          ) : (
            <Square className="w-5 h-5 text-gray-300" />
          )}
        </div>

        <Folder
          className={`w-4 h-4 ${level === 0 ? "text-purple-600" : "text-gray-500"}`}
        />

        <span className="font-semibold text-sm text-gray-700 dark:text-gray-200 select-none">
          {node.category.name}
        </span>

        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 ml-auto">
          {selectedCount} / {allIdsInNode.length}
        </Badge>
      </div>

      {}
      {isExpanded && (
        <div className="pl-2 border-l-2 border-gray-100 dark:border-gray-800 ml-3 space-y-2">
          {}
          {node.products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 py-2">
              {node.products.map((product) => {
                const isSelected = selectedIds.includes(product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => onToggleProduct(product.id)}
                    className={`
                                            flex items-center gap-3 p-2 rounded-md border cursor-pointer transition-all select-none
                                            ${
                                              isSelected
                                                ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800"
                                                : "bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700 hover:border-gray-300"
                                            }
                                        `}
                  >
                    <Checkbox checked={isSelected} />
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate text-gray-700 dark:text-gray-200">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-400 font-mono truncate">
                        {product.sku}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {}
          {node.children.map((childNode) => (
            <CategorySection
              key={childNode.category.id}
              node={childNode}
              level={level + 1}
              selectedIds={selectedIds}
              onToggleProduct={onToggleProduct}
              onToggleCategory={onToggleCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategorizedProductView: React.FC<CategorizedProductViewProps> = ({
  products,
  categories,
  selectedIds,
  onToggleProduct,
  onToggleCategory,
}) => {
  const tree = useMemo(() => {
    if (!categories.length) return [];

    const nodeMap = new Map<number, CategoryTreeNode>();

    categories.forEach((cat) => {
      nodeMap.set(cat.id, {
        category: cat,
        products: [],
        children: [],
      });
    });

    const unclassifiedProducts: ProductListItem[] = [];

    products.forEach((p) => {
      if (p.categoryId && nodeMap.has(p.categoryId)) {
        nodeMap.get(p.categoryId)!.products.push(p);
      } else {
        unclassifiedProducts.push(p);
      }
    });

    const rootNodes: CategoryTreeNode[] = [];

    nodeMap.forEach((node) => {
      const parentId = node.category.parent?.id;

      if (parentId && nodeMap.has(parentId)) {
        nodeMap.get(parentId)!.children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    if (unclassifiedProducts.length > 0) {
      rootNodes.push({
        category: { id: -1, name: "Sin Categoría", abbreviation: "N/A" } as any,
        products: unclassifiedProducts,
        children: [],
      });
    }

    return rootNodes;
  }, [products, categories]);

  if (products.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No hay productos para mostrar.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {tree.map((node) => (
        <CategorySection
          key={node.category.id}
          node={node}
          level={0}
          selectedIds={selectedIds}
          onToggleProduct={onToggleProduct}
          onToggleCategory={onToggleCategory}
        />
      ))}
    </div>
  );
};
