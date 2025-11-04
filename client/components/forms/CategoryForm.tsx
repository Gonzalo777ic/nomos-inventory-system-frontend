import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod"; 
import { zodResolver } from "@hookform/resolvers/zod";
import { Category } from "../../types"; 
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  createCategory,
  updateCategory,
  getCategories,
} from "../../api/services/category"; 
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"; 
import { Textarea } from '../ui/textarea'; 

// 1. Esquema de validación para Category (Sin cambios)
export const CategorySchema = z.object({
  name: z.string().min(2, "El nombre de la categoría es requerido.").max(100),
  description: z.string().optional(),
  parentId: z.string().nullable().optional().or(z.literal("null")), 
});

// Tipo derivado del esquema para uso en el formulario (Sin cambios)
export type CategoryFormValues = z.infer<typeof CategorySchema>;

interface CategoryFormProps {
  initialData?: Category | null;
  onSuccess: () => void;
  onClose: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData,
  onSuccess,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const isEditMode = !!initialData;

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<
    Category[]
  >({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // CORRECCIÓN CLAVE: Extraer el parentId desde el objeto 'parent'
  const parentIdFromInitialData = initialData?.parent?.id 
    ? String(initialData.parent.id) 
    : "null";
    
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      // Usamos el ID extraído del objeto 'parent'
      parentId: parentIdFromInitialData, 
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CategoryFormValues) => {
      const parentIdNumber =
        data.parentId === "null" || data.parentId === ""
          ? null
          : Number(data.parentId);

      const parentObject =
        parentIdNumber !== null ? { id: parentIdNumber } : null;

      const categoryData = {
        name: data.name,
        description: data.description || null, 
        parent: parentObject, 
      };

      return isEditMode && initialData?.id
        ? updateCategory(initialData.id, categoryData)
        : createCategory(categoryData); 
    },
    onSuccess: () => {
      toast.success(
        `Categoría ${isEditMode ? "actualizada" : "creada"} con éxito.`,
      );
      // Fuerte invalidación para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        `Error al ${isEditMode ? "actualizar" : "crear"} la categoría.`;
      toast.error(errorMessage);
    },
  });

  const onSubmit = (values: CategoryFormValues) => {
    mutation.mutate(values);
  };

  // Se filtra para que la categoría actual no se pueda seleccionar como su propio padre
  const availableParents = categories.filter((c) => c.id !== initialData?.id);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Categoría</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Electrónica, Oficinas, Ropa"
                  {...field}
                  disabled={mutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (Opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Escriba una breve descripción de la categoría..."
                  {...field}
                  value={field.value ?? ""} 
                  disabled={mutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría Padre (Opcional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ?? "null"} 
                disabled={mutation.isPending || isLoadingCategories}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una categoría padre..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null">
                    — Sin Categoría Padre (Principal) —
                  </SelectItem>
                  {availableParents.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoadingCategories && (
                <p className="text-xs text-gray-500 flex items-center">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Cargando
                  padres...
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 mt-6" 
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isEditMode ? (
            "Guardar Cambios"
          ) : (
            "Crear Categoría"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default CategoryForm;