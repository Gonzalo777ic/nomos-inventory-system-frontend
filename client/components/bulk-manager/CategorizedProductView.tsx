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

    

    
  }, [products, categories]);



  return (
    <div className="space-y-6 pb-20">
      
    </div>
  );
};
