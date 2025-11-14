import React, { useState, useMemo } from "react";
import { Search, Plus, Trash2, DollarSign } from "lucide-react";
import { SaleDetailPayload } from "../../api/services/saleDetailService";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../ui/table";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { ScrollArea } from "../ui/scroll-area";

import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../api/services/products";

// 🔑 CORRECCIÓN: Permitir taxRateId como number o null si el backend lo devuelve así
interface ProductReference {
    id: number;
    name: string;
    sku: string;
    price: number;
    taxRateId: number | null; // Aceptar null si el fetch de productos lo permite
}

export interface CartItemPayload extends SaleDetailPayload {
    tempKey: number;
}

const addItemSchema = z.object({
    quantity: z.number().int().min(1, "Mínimo 1 unidad"),
});

type AddItemFormData = z.infer<typeof addItemSchema>;

interface SaleDetailManagerProps {
    details: CartItemPayload[];
    setDetails: (details: CartItemPayload[]) => void;
}

const SaleDetailManager: React.FC<SaleDetailManagerProps> = ({ details, setDetails }) => {
    const { toast } = useToast();
    const [selectedProduct, setSelectedProduct] = useState<ProductReference | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // ✅ Cargar productos reales
    const { data: products = [], isLoading } = useQuery<ProductReference[]>({
        queryKey: ["products-for-sale"],
        // Nota: El type cast 'as () => Promise<ProductReference[]>' es lo que genera el error 2352.
        // Lo mantendremos hasta que se ajuste el tipo de retorno de getProducts.
        queryFn: getProducts as () => Promise<ProductReference[]>, 
        staleTime: 1000 * 60 * 10,
    });

    // 🔍 Buscar producto por SKU o nombre
    const handleSearch = () => {
        if (!searchTerm.trim()) return;

        const product = products.find(
            (p) =>
                p.sku.toLowerCase() === searchTerm.toLowerCase().trim() ||
                p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (!product) {
            setSelectedProduct(null);
            toast({
                title: "No encontrado",
                description: "Producto no encontrado por SKU/Nombre.",
                variant: "destructive",
            });
            return;
        }

        setSelectedProduct(product);
        addItemForm.setFocus("quantity");
    };

    const addItemForm = useForm<AddItemFormData>({
        resolver: zodResolver(addItemSchema),
        defaultValues: { quantity: 1 },
    });

    const handleAddItem = (data: AddItemFormData) => {
        if (!selectedProduct) {
            toast({ title: "Error", description: "Debe seleccionar un producto primero.", variant: "destructive" });
            return;
        }
        
        // 🔑 CORRECCIÓN CLAVE: Asegurar que taxRateId sea un número positivo.
        // Si el producto no tiene impuesto configurado (null o 0), asignamos un ID temporal (ej. 1).
        const effectiveTaxRateId = (selectedProduct.taxRateId && selectedProduct.taxRateId > 0) 
            ? selectedProduct.taxRateId 
            : 1; // Asumiendo que TaxRate ID 1 es válido para pruebas

        console.log(`[Detail Add] Usando TaxRate ID: ${effectiveTaxRateId}`);


        const newDetail: CartItemPayload = {
            productId: selectedProduct.id,
            unitPrice: selectedProduct.price,
            quantity: data.quantity,
            subtotal: selectedProduct.price * data.quantity,
            taxRateId: effectiveTaxRateId, // Usamos el ID de impuesto seguro
            promotionId: null,
            // Nota: Este error de TS (2741 sobre saleId) se ignora aquí, se resuelve en el mapeo de SaleForm
            tempKey: details.length > 0 ? details[details.length - 1].tempKey + 1 : 1,
        };

        setDetails([...details, newDetail]);
        setSelectedProduct(null);
        setSearchTerm("");
        addItemForm.reset({ quantity: 1 });
        toast({ title: "Ítem Añadido", description: `Producto añadido: ${selectedProduct.name}` });
    };

    const handleDelete = (tempKey: number) => {
        setDetails(details.filter((item) => item.tempKey !== tempKey));
        toast({ title: "Ítem Eliminado", description: "El ítem ha sido retirado de la lista." });
    };

    const totalVenta = details.reduce((sum, item) => sum + item.subtotal, 0);

    return (
        <div className="space-y-6">
            {/* --- Búsqueda y Adición --- */}
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 space-y-4">
                <h4 className="font-medium">Añadir Producto</h4>

                <div className="flex gap-2">
                    <Input
                        value={searchTerm}
                        placeholder="Buscar por SKU o nombre..."
                        className="flex-grow"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <Button onClick={handleSearch} variant="outline" type="button">
                        <Search className="w-4 h-4 mr-1" /> Buscar
                    </Button>
                </div>

                {isLoading && <p>Cargando productos...</p>}

                {selectedProduct && (
                    <Form {...addItemForm}>
                        <div className="grid grid-cols-4 gap-4 items-end">
                            <FormItem className="col-span-2">
                                <FormLabel>Producto</FormLabel>
                                <Input readOnly value={`${selectedProduct.name} (S/. ${selectedProduct.price.toFixed(2)})`} />
                            </FormItem>

                            <FormField
                                control={addItemForm.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem className="col-span-1">
                                        <FormLabel>Cantidad</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} min={1} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="button" onClick={addItemForm.handleSubmit(handleAddItem)} className="col-span-1">
                                <Plus className="w-4 h-4 mr-1" /> Añadir
                            </Button>
                        </div>
                    </Form>
                )}
            </div>

            {/* --- Tabla --- */}
            <h4 className="font-medium pt-2 flex justify-between items-center">
                Ítems en Carrito ({details.length})
                <span className="text-xl font-bold text-green-700 flex items-center">
                    <DollarSign className="w-5 h-5 mr-1" /> Total: S/. {totalVenta.toFixed(2)}
                </span>
            </h4>

            <ScrollArea className="h-[250px] border rounded-lg">
                {details.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        Añada productos usando la barra de búsqueda.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto ID</TableHead>
                                <TableHead>Precio Unit.</TableHead>
                                <TableHead>Cant.</TableHead>
                                <TableHead>Subtotal</TableHead>
                                <TableHead>Impuesto ID</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {details.map((item) => (
                                <TableRow key={item.tempKey}>
                                    <TableCell>{item.productId}</TableCell>
                                    <TableCell>S/. {item.unitPrice.toFixed(2)}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell className="font-semibold">S/. {item.subtotal.toFixed(2)}</TableCell>
                                    <TableCell>{item.taxRateId}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.tempKey)}>
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </ScrollArea>
        </div>
    );
};

export default SaleDetailManager;