import { http } from '@/api/http'; 
import { 
    Quotation, 
    QuotationPayload,
    PurchaseOrder 
} from '../../types/index';

const BASE_URL = '/v1/quotations';


export const getQuotations = async (params?: { supplierId?: number }): Promise<Quotation[]> => {

    const { data } = await http.get(BASE_URL, { params });
    return data;
};


export const getQuotationById = async (id: number): Promise<Quotation> => {
    const { data } = await http.get(`${BASE_URL}/${id}`);
    return data;
};


export const createQuotation = async (payload: QuotationPayload): Promise<Quotation> => {

    const body = {
        requestDate: payload.requestDate,
        status: payload.status,
        notes: payload.notes,
        supplier: { id: payload.supplierId },
        details: payload.details.map(d => ({
            productName: d.productName,
            quantity: d.quantity,
            quotedPrice: d.quotedPrice,
            skuSuggestion: d.skuSuggestion,


            product: d.productId ? { id: d.productId } : null 
        }))
    };

    console.log("Enviando al Backend:", body);

    const { data } = await http.post(BASE_URL, body);
    return data;
};


export const linkProductToDetail = async (quotationId: number, detailId: number, productId: number): Promise<Quotation> => {
    const { data } = await http.put(
        `${BASE_URL}/${quotationId}/details/${detailId}/link-product/${productId}`
    );
    return data;
};


export const convertToOrder = async (quotationId: number): Promise<PurchaseOrder> => {
    const { data } = await http.post(`${BASE_URL}/${quotationId}/convert-to-order`);
    return data;
};


export const updateQuotation = async (id: number, payload: QuotationPayload): Promise<Quotation> => {

const body = {
        requestDate: payload.requestDate,
        status: payload.status,
        notes: payload.notes,
        supplier: { id: payload.supplierId },
        details: payload.details.map(d => ({
            productName: d.productName,
            quantity: d.quantity,
            quotedPrice: d.quotedPrice,
            skuSuggestion: d.skuSuggestion,


            product: d.productId ? { id: d.productId } : null 
        }))
    };    const { data } = await http.put(`${BASE_URL}/${id}`, body);
    return data;
};


export const changeQuotationStatus = async (id: number, status: string): Promise<Quotation> => {
    const { data } = await http.put(`${BASE_URL}/${id}/status`, null, { params: { status } });
    return data;
};