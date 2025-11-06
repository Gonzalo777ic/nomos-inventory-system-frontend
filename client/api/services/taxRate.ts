import { httpStore } from "../httpStore"; // Asume que httpStore está correctamente interceptado

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

// 🛑 Definimos la carga útil sin el ID
type TaxRatePayload = Omit<TaxRate, 'id'>;

export const TaxRateService = {
  getAll: async (): Promise<TaxRate[]> => {
    // GET /api/store/tax-rates
    const response = await httpStore.get<TaxRate[]>(TAX_RATE_URL);
    return response.data;
  },

  create: async (data: TaxRatePayload): Promise<TaxRate> => {
    // POST /api/store/tax-rates
    const response = await httpStore.post<TaxRate>(TAX_RATE_URL, data);
    return response.data;
  },
  
  /** 🛑 MÉTODO UPDATE AGREGADO 🛑 */
  update: async (id: number, data: TaxRatePayload): Promise<TaxRate> => {
    // PUT /api/store/tax-rates/{id}
    const response = await httpStore.put<TaxRate>(`${TAX_RATE_URL}/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    // DELETE /api/store/tax-rates/{id}
    await httpStore.delete(`${TAX_RATE_URL}/${id}`);
  }
};