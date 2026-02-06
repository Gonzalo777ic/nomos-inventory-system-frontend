import React, { useState, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  CheckSquare,
  Square,
  MinusSquare,
  Folder,
  Package,
  FolderOpen,
} from "lucide-react";
import { ProductListItem, Category } from "../../types";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";

export interface CategoryTreeNode {
  category: Category;
  products: ProductListItem[];
  children: CategoryTreeNode[];
}

interface CategorySectionProps {
  node: CategoryTreeNode;
  level: number;
  selectedIds: number[];
  onToggleProduct: (id: number) => void;
  onToggleCategory: (productIdsInCat: number[]) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  node,
  level,
  selectedIds,
  onToggleProduct,
  onToggleCategory,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const allIdsInNode = useMemo(() => {
    const getIds = (n: CategoryTreeNode): number[] => {
      const directIds = n.products.map((p) => p.id);
      const childIds = n.children.flatMap((child) => getIds(child));
      return [...directIds, ...childIds];
    };
    return getIds(node);
  }, [node]);

  const selectedCount = allIdsInNode.filter((id) =>
    selectedIds.includes(id),
  ).length;
  const totalCount = allIdsInNode.length;

  const isAllSelected = totalCount > 0 && selectedCount === totalCount;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  if (totalCount === 0) return null;

  const levelStyles = {
    marginLeft: level > 0 ? "1.5rem" : "0",
    paddingLeft: level > 0 ? "0.5rem" : "0",
    borderColor:
      level === 0
        ? "border-purple-200 dark:border-purple-900"
        : "border-gray-200 dark:border-gray-700",
  };

  return (
    <div
      className={`mb-3 transition-all duration-300 ease-in-out`}
      style={{ marginLeft: levelStyles.marginLeft }}
    >
      {}
      <div
        className={`
                    flex items-center gap-3 p-3 rounded-lg border shadow-sm select-none transition-colors
                    ${
                      level === 0
                        ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        : "bg-gray-50/50 dark:bg-gray-800/50 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                `}
      >
        {}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>

        {}
        

        {}
        

        {}
        
      </div>

      {}
      {isExpanded && (
        <div
          className={`mt-2 border-l-2 ${levelStyles.borderColor} pl-4 ml-3 space-y-3`}
        >
          {}
          

          
        </div>
      )}
    </div>
  );
};
