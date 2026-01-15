import { httpStore } from "../httpStore";
import { LegalEntity } from "../../types/store";

const BASE_URL = 'http://localhost:8083/api/store/legal-entities';

export const LegalEntityService = {

  /**
   * Obtener todas las entidades legales (para llenar selects).
   */
  getAll: async (): Promise<LegalEntity[]> => {
    const response = await httpStore.get<LegalEntity[]>(BASE_URL);
    return response.data;
  },

  /**
   * Obtener una entidad por ID.
   */
  getById: async (id: number): Promise<LegalEntity> => {
    const response = await httpStore.get<LegalEntity>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Crear una nueva Entidad Legal (Maestro).
   */
  create: async (data: Omit<LegalEntity, 'id'>): Promise<LegalEntity> => {
    const response = await httpStore.post<LegalEntity>(BASE_URL, data);
    return response.data;
  },

  /**
   * Actualizar datos de una Entidad Legal.
   */
  update: async (id: number, data: Partial<LegalEntity>): Promise<LegalEntity> => {
    const response = await httpStore.put<LegalEntity>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar una entidad (solo si no tiene documentos asociados).
   */
  delete: async (id: number): Promise<void> => {
    await httpStore.delete(`${BASE_URL}/${id}`);
  }
};