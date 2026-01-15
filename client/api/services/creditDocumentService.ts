import { httpStore } from "../httpStore";
import { CreditDocument, CreditDocumentPayload, CreditDocumentStatus } from "../../types/store";

const BASE_URL = 'http://localhost:8083/api/store/credit-documents';

export const CreditDocumentService = {

  /**
   * Obtener TODOS los documentos legales (Dashboard General)
   */
  getAll: async (): Promise<CreditDocument[]> => {

    const response = await httpStore.get<CreditDocument[]>(BASE_URL);
    return response.data;
  },

  getByAccount: async (arId: number): Promise<CreditDocument[]> => {
    const response = await httpStore.get<CreditDocument[]>(`${BASE_URL}/ar/${arId}`);
    return response.data;
  },

  create: async (data: CreditDocumentPayload): Promise<CreditDocument> => {
    const response = await httpStore.post<CreditDocument>(BASE_URL, data);
    return response.data;
  },

  updateStatus: async (id: number, status: string): Promise<CreditDocument> => {
    const response = await httpStore.patch<CreditDocument>(`${BASE_URL}/${id}/status?status=${status}`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await httpStore.delete(`${BASE_URL}/${id}`);
  },

  downloadPdf: async (id: number): Promise<Blob> => {
    const response = await httpStore.get<Blob>(`${BASE_URL}/${id}/pdf`, {
      responseType: 'blob' 
    });
    return response.data;
  },

  /**
   * Firma el documento cambiando su estado a SIGNED.
   * Esto habilita la descarga del PDF oficial.
   */
  signDocument: async (id: number): Promise<CreditDocument> => {
    return CreditDocumentService.updateStatus(id, 'SIGNED');
  }
  
};