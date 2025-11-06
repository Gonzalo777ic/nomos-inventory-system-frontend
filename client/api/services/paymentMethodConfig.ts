import { httpStore } from "../httpStore";

const BASE_URL = 'http://localhost:8083/api/store';
const PM_URL = `${BASE_URL}/payment-methods`;

/**
 * Interfaz para la configuración del método de pago (Modelo simplificado)
 */
export interface PaymentMethodConfig {
  id: number;
  name: string; // Ej: VISA, Yape, Efectivo
  type: string; // Ej: TARJETA, EFECTIVO, ELECTRÓNICO
}

// Carga útil para crear/actualizar (sin el ID)
export type PaymentMethodPayload = Omit<PaymentMethodConfig, 'id'>;

export const PaymentMethodService = {
  
  getAll: async (): Promise<PaymentMethodConfig[]> => {
    // GET /api/store/payment-methods
    const response = await httpStore.get<PaymentMethodConfig[]>(PM_URL);
    return response.data;
  },

  create: async (data: PaymentMethodPayload): Promise<PaymentMethodConfig> => {
    // POST /api/store/payment-methods
    const response = await httpStore.post<PaymentMethodConfig>(PM_URL, data);
    return response.data;
  },
  
  update: async (id: number, data: PaymentMethodPayload): Promise<PaymentMethodConfig> => {
    // PUT /api/store/payment-methods/{id}
    const response = await httpStore.put<PaymentMethodConfig>(`${PM_URL}/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    // DELETE /api/store/payment-methods/{id}
    await httpStore.delete(`${PM_URL}/${id}`);
  }
};