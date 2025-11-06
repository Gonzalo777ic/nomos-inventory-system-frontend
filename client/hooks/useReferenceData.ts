import { useQuery } from '@tanstack/react-query';
// 💡 Solo importamos la función ClientService y la interfaz Client del archivo de servicio
import { ClientService, Client, DocumentTypeRef } from '../api/services/client'; 
// 💡 Solo importamos la función InternalUserService y la interfaz InternalUser 
// (ya que getSellers devuelve un tipo mapeado que definiremos aquí)
import { InternalUserService, InternalUser } from '../api/services/internalUserService.ts'; 
import { SaleService, SaleTypeRef } from '../api/services/saleService';
// --- Definiciones de Tipos de Referencia para el UI ---

/**
 * Define la estructura simple de una opción de Select (Vendedor, Cliente, Documento).
 * Esto resuelve el error de tipos en 'select'.
 */
export interface ReferenceOption {
    id: number | string; // Permitir number para IDs de DB y string para claves de Enum
    name: string;
}

/**
 * Tipo devuelto por InternalUserService.getSellers
 * Se usa aquí para mantener la consistencia, aunque el service lo genera.
 */
export type SellerReference = ReferenceOption;


export interface ReferenceData {
    clients: ReferenceOption[];
    sellers: SellerReference[];
    documentTypes: ReferenceOption[]; // 💡 Agregamos los tipos de documento
    saleTypes: ReferenceOption[];
    loading: boolean;
    error: Error | null; // Tipado de error más limpio
}

// --- Hook Personalizado ---
export const useReferenceData = (): ReferenceData => {
    // 1. Obtener Clientes
    const { 
        data: clientReferences, 
        isLoading: isLoadingClients, 
        error: errorClients 
    } = useQuery<Client[], Error, ReferenceOption[]>({ // 💡 TIPO CORREGIDO: TData, TError, TSelected
        queryKey: ['clients-reference'],
        queryFn: ClientService.getAll, 
        staleTime: 5 * 60 * 1000, 
        // 💡 Transformación de Client[] (TData) a ReferenceOption[] (TSelected)
        select: (clients) => clients.map(c => ({ 
            id: c.id, 
            name: c.fullName // Asumo que fullName siempre está presente y es lo mejor para mostrar
        })),
    });

    // 2. Obtener Vendedores
    // NOTA: Asumo que InternalUserService.getSellers ya devuelve el tipo ReferenceOption[]
    const { 
        data: sellerReferences, 
        isLoading: isLoadingSellers, 
        error: errorSellers 
    } = useQuery<ReferenceOption[], Error>({ 
        queryKey: ['sellers-reference'],
        queryFn: InternalUserService.getSellers,
        staleTime: 5 * 60 * 1000,
    });
    
    // 3. Obtener Tipos de Documento
    const { 
        data: documentTypeReferences, 
        isLoading: isLoadingDocTypes, 
        error: errorDocTypes 
    } = useQuery<DocumentTypeRef[], Error, ReferenceOption[]>({ // 💡 TIPO CORREGIDO
        queryKey: ['document-types-reference'],
        queryFn: ClientService.getDocumentTypes,
        staleTime: Infinity, // Estos datos son estáticos
        // Transformación de DocumentTypeRef[] (TData) a ReferenceOption[] (TSelected)
        select: (docTypes) => docTypes.map(dt => ({
            id: dt.key, 
            name: dt.description
        })),
    });

    // 4. Obtener Tipos de Venta (Boleta, Factura, Ticket)
    const { 
        data: saleTypeReferences, 
        isLoading: isLoadingSaleTypes, 
        error: errorSaleTypes 
    } = useQuery<SaleTypeRef[], Error, ReferenceOption[]>({ 
        queryKey: ['sale-types-reference'],
        queryFn: SaleService.getSaleTypes, // 💡 Llamada al nuevo servicio
        staleTime: Infinity, // Datos estáticos
        select: (saleTypes) => saleTypes.map(st => ({
            id: st.key, 
            name: st.description // Usamos la descripción amigable para el frontend
        })),
    });


    const loading = isLoadingClients || isLoadingSellers || isLoadingDocTypes;
    const error = errorClients || errorSellers || errorDocTypes || null;

    return {
        clients: clientReferences || [],
        sellers: sellerReferences || [],
        documentTypes: documentTypeReferences || [],
        saleTypes: saleTypeReferences || [],
        loading,
        error,
    };
};