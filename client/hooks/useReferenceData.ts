import { useQuery } from '@tanstack/react-query';

import { ClientService, Client, DocumentTypeRef } from '../api/services/client'; 


import { InternalUserService, InternalUser } from '../api/services/internalUserService.ts'; 
import { SaleService} from '../api/services/saleService';
import { SaleTypeRef } from '../types/store';


/**
 * Define la estructura simple de una opción de Select (Vendedor, Cliente, Documento).
 * Esto resuelve el error de tipos en 'select'.
 */
export interface ReferenceOption {
    id: number | string;
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
    documentTypes: ReferenceOption[];
    saleTypes: ReferenceOption[];
    loading: boolean;
    error: Error | null;
}


export const useReferenceData = (): ReferenceData => {

    const { 
        data: clientReferences, 
        isLoading: isLoadingClients, 
        error: errorClients 
    } = useQuery<Client[], Error, ReferenceOption[]>({
        queryKey: ['clients-reference'],
        queryFn: ClientService.getAll, 
        staleTime: 5 * 60 * 1000, 

        select: (clients) => clients.map(c => ({ 
            id: c.id, 
            name: c.fullName
        })),
    });



    const { 
        data: sellerReferences, 
        isLoading: isLoadingSellers, 
        error: errorSellers 
    } = useQuery<ReferenceOption[], Error>({ 
        queryKey: ['sellers-reference'],
        queryFn: InternalUserService.getSellers,
        staleTime: 5 * 60 * 1000,
    });
    

    const { 
        data: documentTypeReferences, 
        isLoading: isLoadingDocTypes, 
        error: errorDocTypes 
    } = useQuery<DocumentTypeRef[], Error, ReferenceOption[]>({
        queryKey: ['document-types-reference'],
        queryFn: ClientService.getDocumentTypes,
        staleTime: Infinity,

        select: (docTypes) => docTypes.map(dt => ({
            id: dt.key, 
            name: dt.description
        })),
    });


    const { 
        data: saleTypeReferences, 
        isLoading: isLoadingSaleTypes, 
        error: errorSaleTypes 
    } = useQuery<SaleTypeRef[], Error, ReferenceOption[]>({ 
        queryKey: ['sale-types-reference'],
        queryFn: SaleService.getSaleTypes,
        staleTime: Infinity,
        select: (saleTypes) => saleTypes.map(st => ({
            id: st.key, 
            name: st.description
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