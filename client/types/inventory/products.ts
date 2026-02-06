export type ProductImage = {
  id: number;
  productId: number;
  imageUrl: string;
  isDefault: boolean;
  sortOrder: number;
};

export type Product = {
  id: number;
  sku: string;
  name: string;
  imageUrl?: string;
  brandId: number; 
  categoryId: number; 
  unitOfMeasureId: number;
  price: number;
  minStockThreshold: number;
};

export type ProductSupplierDTO = {
    productId: number;
    supplierId: number;
    unitCost: number;
    leadTimeDays: number;
    isPreferred: boolean;
    isActive: boolean;
    supplierProductCode?: string | null;
};

export interface ProductListItem extends Product {
    brandName: string;
    supplierName: string;
    categoryName: string; 
    unitOfMeasureName: string; 
    currentStock?: number; 
}


export interface ProductWithAttributeDetails {
    productId: number;
    productName: string;
    productSku: string;
    attributeValue: string;
}


export interface AddAttributeValuePayload {
    productId: number;
    attributeId: number;
    value: string;
}