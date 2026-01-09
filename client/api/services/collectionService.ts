import { httpStore } from "../httpStore";
import { Collection, CollectionPayload } from "../../types/inventory/collections";

const BASE_URL = 'http://localhost:8083/api/store/collections';

export const CollectionService = {
  

  getAll: async (): Promise<Collection[]> => {
    const response = await httpStore.get<Collection[]>(BASE_URL);
    return response.data;
  },


  getBySaleId: async (saleId: number): Promise<Collection[]> => {
    const response = await httpStore.get<Collection[]>(`${BASE_URL}/sale/${saleId}`);
    return response.data;
  },


  create: async (data: CollectionPayload): Promise<Collection> => {
    const response = await httpStore.post<Collection>(BASE_URL, data);
    return response.data;
  },
  

  delete: async (id: number): Promise<void> => {
    await httpStore.delete(`${BASE_URL}/${id}`);
  }
};