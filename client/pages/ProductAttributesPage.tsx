import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  X,
  Tag,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import {
  getAttributeValuesByProduct,
  addProductAttributeValue,
  updateProductAttributeValue,
  deleteProductAttributeValue,
} from "../api/services/productAttributeValue";
import { getProductAttributes } from "../api/services/product-attribute";
import { getProductById } from "../api/services/products";

import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import { ProductAttribute, ProductAttributeValue } from "../types";

const ProductAttributesPage: React.FC = () => {
  
  
  
  
    return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-800 min-h-screen"></div>
  );
};

import { Pencil } from "lucide-react";

export default ProductAttributesPage;
