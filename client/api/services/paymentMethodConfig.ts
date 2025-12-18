import { httpStore } from "../httpStore";

const BASE_URL = 'http://localhost:8083/api/store';
const PM_URL = `${BASE_URL}/payment-methods`;

/**
 * Interfaz para la configuración del método de pago (Modelo simplificado)
 */
export interface PaymentMethodConfig {
  id: number;
  name: string;
  type: string;
}


export type PaymentMethodPayload = Omit<PaymentMethodConfig, 'id'>;

export const PaymentMethodService = {
  
  getAll: async (): Promise<PaymentMethodConfig[]> => {

    const response = await httpStore.get<PaymentMethodConfig[]>(PM_URL);
    return response.data;
  },

  create: async (data: PaymentMethodPayload): Promise<PaymentMethodConfig> => {

    const response = await httpStore.post<PaymentMethodConfig>(PM_URL, data);
    return response.data;
  },
  
  update: async (id: number, data: PaymentMethodPayload): Promise<PaymentMethodConfig> => {

    const response = await httpStore.put<PaymentMethodConfig>(`${PM_URL}/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {

    await httpStore.delete(`${PM_URL}/${id}`);
  }
};