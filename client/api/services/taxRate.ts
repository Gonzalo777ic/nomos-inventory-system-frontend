import { httpStore } from "../httpStore";

const BASE_URL = 'http://localhost:8083/api/store';
const TAX_RATE_URL = `${BASE_URL}/tax-rates`;

/**
 * INTERFAZ DE MODELO SINCRONIZADA CON EL BACKEND
 */
export interface TaxRate {
  id: number;
  name: string;
  rate: number;
}


type TaxRatePayload = Omit<TaxRate, 'id'>;

export const TaxRateService = {
  getAll: async (): Promise<TaxRate[]> => {

    const response = await httpStore.get<TaxRate[]>(TAX_RATE_URL);
    return response.data;
  },

  create: async (data: TaxRatePayload): Promise<TaxRate> => {

    const response = await httpStore.post<TaxRate>(TAX_RATE_URL, data);
    return response.data;
  },
  
  
  update: async (id: number, data: TaxRatePayload): Promise<TaxRate> => {

    const response = await httpStore.put<TaxRate>(`${TAX_RATE_URL}/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {

    await httpStore.delete(`${TAX_RATE_URL}/${id}`);
  }
};