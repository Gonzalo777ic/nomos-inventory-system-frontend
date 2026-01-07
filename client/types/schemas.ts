import { z } from 'zod';

export const SupplierSchema = z.object({
    id: z.number().int().positive().optional(),
    name: z.string().min(2, { message: "El nombre de la compañía es obligatorio." }).max(150),
    taxId: z.string().min(5, { message: "El ID Fiscal (RUC/NIT) es obligatorio." }).max(50),
    email: z.string().email({ message: "El correo electrónico no es válido." }),
    phone: z.string().min(8, { message: "El teléfono debe tener al menos 8 dígitos." }).max(20),
    address: z.string().min(5, { message: "La dirección es obligatoria." }).max(250),
    contactName: z.string().min(3, { message: "El nombre del contacto es obligatorio." }).max(100),
});

export const UnitOfMeasureSchema = z.object({
    name: z.string().min(2, "El nombre requerido (min 2).").max(50, "Máx 50 caracteres."),
    abbreviation: z.string().min(1, "Abreviatura requerida.").max(10, "Máx 10 caracteres."),
});

export type UnitOfMeasureFormValues = z.infer<typeof UnitOfMeasureSchema>;

export const BrandSchema = z.object({
    name: z.string().min(2, "El nombre de la marca es obligatorio.").max(150),
    code: z.string().max(20, "Máx 20 caracteres.").optional().nullable(),
    website: z.string().max(255).url("Debe ser una URL válida").optional().nullable().or(z.literal('')),
    logoUrl: z.string().max(255).url("URL de imagen inválida").optional().nullable().or(z.literal('')),
});

export type BrandFormValues = z.infer<typeof BrandSchema>;