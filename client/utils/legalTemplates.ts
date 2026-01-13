

import { CreditDocumentPayload } from "../types/store"


const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);


const formatDateLong = (dateStr: string) => {
    if (!dateStr) return "___";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const generatePreviewContent = (data: Partial<CreditDocumentPayload>) => {
    const { 
        type, documentNumber, amount, issueDate, dueDate, 
        debtorName, debtorIdNumber, creditorName, 
        placeOfIssue, placeOfPayment, guarantorName, legalNotes 
    } = data;

    const commonStyles = "font-serif text-sm leading-relaxed text-justify";
    const titleStyles = "text-xl font-bold text-center mb-6 uppercase tracking-widest border-b-2 border-black pb-2";

    if (type === 'PAGARE') {
        return {
            title: "PAGARÉ",
            content: `
                Yo, ${debtorName || "___________"}, identificado con DNI/RUC N° ${debtorIdNumber || "___________"}, 
                me obligo incondicionalmente a pagar a la orden de ${creditorName || "MI EMPRESA S.A.C."} 
                la suma de ${formatCurrency(amount || 0)} (${amount || "0.00"}).
                \n\n
                Este pago se realizará en la ciudad de ${placeOfPayment || "___________"} el día ${formatDateLong(dueDate || "")}.
                \n\n
                El presente Pagaré se emite en la ciudad de ${placeOfIssue || "___________"} con fecha ${formatDateLong(issueDate || "")}.
                \n\n
                Cláusulas Especiales:\n${legalNotes || "Sin cláusulas adicionales."}
                \n\n
                La falta de pago a su vencimiento generará automáticamente la mora pactada sin necesidad de protesto ni requerimiento previo.
            `
        };
    } else {
        return {
            title: "LETRA DE CAMBIO",
            content: `
                Por esta LETRA DE CAMBIO, se servirá Ud. pagar incondicionalmente a la orden de ${creditorName || "MI EMPRESA S.A.C."} 
                en la ciudad de ${placeOfPayment || "___________"} el día ${formatDateLong(dueDate || "")}.
                \n\n
                La cantidad de: ${formatCurrency(amount || 0)}.
                \n\n
                Girado a cargo de: ${debtorName || "___________"} con DNI/RUC ${debtorIdNumber || "___________"}.
                \n\n
                ${guarantorName ? `Avalado por: ${guarantorName}` : ""}
                \n\n
                Lugar y Fecha de Emisión: ${placeOfIssue || "___________"}, ${formatDateLong(issueDate || "")}.
                \n\n
                Cláusulas:\n${legalNotes || "Sin protesto."}
            `
        };
    }
};