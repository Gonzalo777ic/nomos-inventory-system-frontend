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

  

  

  return (
    <div className="mb-4" style={{ marginLeft: level > 0 ? "1.5rem" : "0" }}>
      {}
      <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mb-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        {}
        
        {}
        

        

        
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
