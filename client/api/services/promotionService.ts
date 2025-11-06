import { httpStore } from "../httpStore";

const BASE_URL = 'http://localhost:8083/api/store';
const PROMO_URL = `${BASE_URL}/promotions`;
// Nuevo endpoint para los targets
const TARGET_URL = `${BASE_URL}/promotion-targets`; 

// --- Interfaces Existentes ---

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

// --- NUEVA Interfaz para PromotionTarget ---

export interface PromotionTarget {
    id?: number; // Opcional al crear
    promotionId: number;
    targetType: 'PRODUCT' | 'CATEGORY' | string; // Coincide con Promotion.appliesTo
    targetId: number; // ID del producto o categoría
}

// --- Métodos de Promotion (Sin Cambios) ---

export const PromotionService = {
  
  getAll: async (): Promise<Promotion[]> => {
    // ... (código anterior)
    const response = await httpStore.get<Promotion[]>(PROMO_URL);
    return response.data;
  },
  
  create: async (data: PromotionPayload): Promise<Promotion> => {
    // ... (código anterior)
    const response = await httpStore.post<Promotion>(PROMO_URL, data);
    return response.data;
  },

  update: async (id: number, data: PromotionPayload): Promise<Promotion> => {
    // ... (código anterior)
    const response = await httpStore.put<Promotion>(`${PROMO_URL}/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    // ... (código anterior)
    await httpStore.delete(`${PROMO_URL}/${id}`);
  },

  // --- NUEVOS Métodos para PromotionTarget ---
  
  getTargetsByPromotion: async (promotionId: number): Promise<PromotionTarget[]> => {
    // GET /api/store/promotion-targets/by-promotion/{promotionId}
    const response = await httpStore.get<PromotionTarget[]>(`${TARGET_URL}/by-promotion/${promotionId}`);
    return response.data;
  },

  bulkUpdateTargets: async (promotionId: number, targets: PromotionTarget[]): Promise<PromotionTarget[]> => {
    // POST /api/store/promotion-targets/bulk-update/{promotionId}
    const response = await httpStore.post<PromotionTarget[]>(`${TARGET_URL}/bulk-update/${promotionId}`, targets);
    return response.data;
  },
  
  // No necesitamos el delete individual aquí, ya que usamos bulkUpdateTargets en el flujo.
};