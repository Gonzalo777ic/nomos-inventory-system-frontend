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

  

  return (
    <div
      className={`mb-3 transition-all duration-300 ease-in-out`}
      style={{ marginLeft: levelStyles.marginLeft }}
    >
      {}
     

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
