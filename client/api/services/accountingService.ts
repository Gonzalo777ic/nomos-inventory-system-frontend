import { httpStore } from "../httpStore";
import { AccountingJournalEntry } from "../../types/store";



const BASE_URL = 'http://localhost:8083/api/accounting/entries';

export const AccountingService = {

    /**
     * Obtener el Libro Diario completo (Historial de asientos).
     */
    getAll: async (): Promise<AccountingJournalEntry[]> => {
        const response = await httpStore.get<AccountingJournalEntry[]>(BASE_URL);
        return response.data;
    },

    /**
     * Obtener un asiento específico con sus líneas por ID.
     */
    getById: async (id: number): Promise<AccountingJournalEntry> => {
        const response = await httpStore.get<AccountingJournalEntry>(`${BASE_URL}/${id}`);
        return response.data;
    },

    /**
     * Buscar asientos por referencia de documento (Ej: "SALE-1023").
     */
    getByReference: async (ref: string): Promise<AccountingJournalEntry[]> => {
        const response = await httpStore.get<AccountingJournalEntry[]>(`${BASE_URL}/reference/${ref}`);
        return response.data;
    },
};