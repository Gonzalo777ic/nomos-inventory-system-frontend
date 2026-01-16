import { httpStore } from "../httpStore"; 
import { SalesDocument, SalesDocumentType } from "../../types/store";

const BASE_URL = 'http://localhost:8083/api/sales-documents';

export const SalesDocumentService = {

  /**
   * EMITIR DOCUMENTO (Generar Factura/Boleta)
   * Corresponde a: POST /api/sales-documents/issue
   */
  issue: async (saleId: number, type: SalesDocumentType): Promise<SalesDocument> => {
    const response = await httpStore.post<SalesDocument>(`${BASE_URL}/issue`, null, {
      params: {
        saleId: saleId,
        type: type
      }
    });
    return response.data;
  },

  /**
   * DESCARGAR PDF
   * Corresponde a: GET /api/sales-documents/{id}/pdf
   * IMPORTANTE: responseType: 'blob' para recibir el archivo binario
   */
  downloadPdf: async (documentId: number): Promise<Blob> => {
    const response = await httpStore.get<Blob>(`${BASE_URL}/${documentId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Opcional: Buscar documento por ID (si creaste el endpoint findById)
   */
  getById: async (id: number): Promise<SalesDocument> => {
    const response = await httpStore.get<SalesDocument>(`${BASE_URL}/${id}`);
    return response.data;
  }
};