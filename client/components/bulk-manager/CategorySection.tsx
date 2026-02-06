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





export const CategorySection: React.FC<CategorySectionProps> = ({
  node,
  level,
  selectedIds,
  onToggleProduct,
  onToggleCategory,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  

  

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
