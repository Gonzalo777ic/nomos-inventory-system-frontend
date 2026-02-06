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
        <div
          className="cursor-pointer flex items-center justify-center text-purple-600 hover:scale-110 transition-transform"
          onClick={() => onToggleCategory(allIdsInNode)}
          title={
            isAllSelected ? "Deseleccionar grupo" : "Seleccionar todo el grupo"
          }
        >
          {isAllSelected ? (
            <CheckSquare className="w-5 h-5" />
          ) : isIndeterminate ? (
            <MinusSquare className="w-5 h-5 opacity-80" />
          ) : (
            <Square className="w-5 h-5 text-gray-300 dark:text-gray-600" />
          )}
        </div>

        {}
        <div
          className="flex-1 flex items-center gap-2 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <FolderOpen
              className={`w-4 h-4 ${level === 0 ? "text-purple-500" : "text-blue-400"}`}
            />
          ) : (
            <Folder
              className={`w-4 h-4 ${level === 0 ? "text-purple-500" : "text-gray-400"}`}
            />
          )}

          <span
            className={`font-medium text-sm ${level === 0 ? "text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"}`}
          >
            {node.category.name}
          </span>
        </div>

        {}
        <Badge
          variant={selectedCount > 0 ? "default" : "secondary"}
          className="text-[10px] h-5 px-2"
        >
          {selectedCount} / {totalCount}
        </Badge>
      </div>

      {}
      {isExpanded && (
        <div
          className={`mt-2 border-l-2 ${levelStyles.borderColor} pl-4 ml-3 space-y-3`}
        >
          {}
          {node.products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 mb-4 animate-in fade-in slide-in-from-top-1">
              {node.products.map((product) => {
                const isSelected = selectedIds.includes(product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => onToggleProduct(product.id)}
                    className={`
                                            group flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200
                                            ${
                                              isSelected
                                                ? "bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800 shadow-sm"
                                                : "bg-white border-gray-100 dark:bg-gray-800/40 dark:border-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                            }
                                        `}
                  >
                    <Checkbox
                      checked={isSelected}
                      className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-3 h-3 text-gray-400 group-hover:text-purple-400 transition-colors" />
                        <p
                          className={`text-xs font-medium truncate ${isSelected ? "text-purple-900 dark:text-purple-100" : "text-gray-700 dark:text-gray-300"}`}
                        >
                          {product.name}
                        </p>
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono truncate pl-4.5">
                        {product.sku}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          
        </div>
      )}
    </div>
  );
};
