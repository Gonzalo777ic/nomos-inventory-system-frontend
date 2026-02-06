export type Brand = {
  id: number;
  name: string;
  code?: string;
  website?: string;
  logoUrl?: string;
};

export type UnitOfMeasure = {
  id: number;
  name: string;
  abbreviation: string;
};

export type Category = {
  id: number;
  name: string;
  description?: string;
  parent?: Category | null; 
  children?: Category[]; 
};

export type Supplier = {
  id: number;
  name: string;
  taxId: string;
  email: string;
  phone: string;
  address: string;
  contactName: string;
};

export type Warehouse = {
    id: number;
    name: string;
    locationAddress: string;
    isMain: boolean;
};

export type ProductAttribute = {
  id: number;
  name: string;
  dataType: 'String' | 'Number' | 'Boolean';
};

export type ProductAttributeValue = {
  id: number;
  productId: number;
  attributeId: number;
  value: string;
};

export interface BulkAttributePayload {
    productIds: number[];
    attributeId: number;
    value: string;
}