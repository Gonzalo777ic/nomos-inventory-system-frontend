import { httpStore } from "../httpStore";

const BASE_URL = 'http://localhost:8083/api/store';
const PROMO_URL = `${BASE_URL}/promotions`;

const TARGET_URL = `${BASE_URL}/promotion-targets`; 



export interface Promotion {
  id: number;
  name: string;
  type: 'PORCENTAJE' | 'MONTO_FIJO' | 'TRES_POR_DOS' | string;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  appliesTo: 'PRODUCT' | 'CATEGORY' | 'SALE_TOTAL' | string;
}

export type PromotionPayload = Omit<Promotion, 'id'>;



export interface PromotionTarget {
    id?: number;
    promotionId: number;
    targetType: 'PRODUCT' | 'CATEGORY' | string;
    targetId: number;
}



export const PromotionService = {
  
  getAll: async (): Promise<Promotion[]> => {

    const response = await httpStore.get<Promotion[]>(PROMO_URL);
    return response.data;
  },
  
  create: async (data: PromotionPayload): Promise<Promotion> => {

    const response = await httpStore.post<Promotion>(PROMO_URL, data);
    return response.data;
  },

  update: async (id: number, data: PromotionPayload): Promise<Promotion> => {

    const response = await httpStore.put<Promotion>(`${PROMO_URL}/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {

    await httpStore.delete(`${PROMO_URL}/${id}`);
  },


  
  getTargetsByPromotion: async (promotionId: number): Promise<PromotionTarget[]> => {

    const response = await httpStore.get<PromotionTarget[]>(`${TARGET_URL}/by-promotion/${promotionId}`);
    return response.data;
  },

  bulkUpdateTargets: async (promotionId: number, targets: PromotionTarget[]): Promise<PromotionTarget[]> => {

    const response = await httpStore.post<PromotionTarget[]>(`${TARGET_URL}/bulk-update/${promotionId}`, targets);
    return response.data;
  },
  

};