import { useState } from 'react';
import { toast } from 'sonner';
import { CreditDocumentService } from '../api/services/creditDocumentService';

export const useDocumentActions = () => {
    const [isLoading, setIsLoading] = useState(false);


    const handleSign = async (id: number, onSuccess: () => void) => {
        try {
            setIsLoading(true);
            await CreditDocumentService.signDocument(id);
            toast.success("Documento firmado correctamente. PDF oficial habilitado.");
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Error al firmar el documento.");
        } finally {
            setIsLoading(false);
        }
    };


    const handleDownloadPdf = async (id: number, filename: string) => {
        try {
            setIsLoading(true);
            const blob = await CreditDocumentService.downloadPdf(id);
            

            const url = window.URL.createObjectURL(blob);
            

            window.open(url, '_blank');


            /*
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            */


            setTimeout(() => window.URL.revokeObjectURL(url), 100);

        } catch (error: any) {

            if (error.response?.status === 403) {
                toast.error("Debes firmar el documento antes de descargar el PDF oficial.");
            } else {
                toast.error("Error al generar el PDF.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return { handleSign, handleDownloadPdf, isLoading };
};