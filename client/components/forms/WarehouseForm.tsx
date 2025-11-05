// client/components/forms/WarehouseForm.tsx
import React, { useEffect, useState, useMemo } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MapPin } from "lucide-react";

// 💡 IMPORTACIONES REALES NECESARIAS
import { useMutation, useQueryClient } from "@tanstack/react-query"; 
import { createWarehouse as createWarehouseApi, updateWarehouse as updateWarehouseApi, WarehousePayload } from '@/api/services/warehouse'; 
import { useToast } from '@/components/ui/use-toast'; 

// ✅ IMPORTACIONES REALES DE UI (Necesitas importar todos los componentes usados)
import { Input } from '@/components/ui/input'; 
import { Button } from '@/components/ui/button'; // <--- Usamos el real
import { Checkbox } from '@/components/ui/checkbox'; // <--- Asumimos que tienes un Checkbox real
// Asumimos que estos están definidos en form.tsx (como en el ejemplo de InventoryItemForm)
import { 
    Form, 
    FormControl, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage 
} from '@/components/ui/form'; 


// ---------------------------
// TIPOS y ESQUEMA ZOD
// ---------------------------

// 7. Warehouse (Almacén)
export type Warehouse = {
  id: number;
  name: string;
  locationAddress: string;
  isMain: boolean;
};


// Usamos Omit<Warehouse, 'id'> para la base y añadimos campos de formulario
const warehouseSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres.")
    .max(100),
  locationAddress: z
    .string()
    .min(5, "La dirección de la ubicación es obligatoria.")
    .max(255),
  
  // Transformar string vacío a null, opcional.
  houseNumber: z.union([z.string().nullable(), z.literal('')])
    .transform(e => (e === '' ? null : e))
    .optional(),
  
  floor: z.union([z.string().nullable(), z.literal('')])
    .transform(e => (e === '' ? null : e))
    .optional(),

  latitude: z.number().nullable().optional().default(null),
  longitude: z.number().nullable().optional().default(null),
  isMain: z.boolean(),
});

type WarehouseFormValues = z.infer<typeof warehouseSchema>;

interface WarehouseFormProps {
  defaultWarehouse?: Warehouse & {
    houseNumber?: string | null; 
    floor?: string | null;
  }; 
  onSuccess: () => void;
}

// ---------------------------
// GEOCODIFICACIÓN INVERSA (Nominatim) (SIN CAMBIOS)
// ---------------------------

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    // ... lógica de reverseGeocode (Sin cambios)
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Nominatim error:", response.status, response.statusText);
      return `Error servicio (${response.status} ${response.statusText})`;
    }
    const data = await response.json();

    if (data.display_name && data.display_name !== "undefined") {
      return data.display_name;
    }

    if (data.address) {
      const {
        house_number,
        road,
        neighbourhood,
        suburb,
        city,
        town,
        county,
        state,
        country,
      } = data.address;

      const parts = [
        [road, house_number].filter(Boolean).join(" "),
        neighbourhood || suburb,
        city || town || county,
        state,
        country,
      ]
        .flatMap(Boolean)
        .filter(Boolean);

      if (parts.length > 0) {
        return parts.join(", ");
      }
    }
    return "Dirección no encontrada para estas coordenadas.";
  } catch (err) {
    console.error("Reverse geocode network error:", err);
    return "Error de conexión o bloqueo (CORS/Red).";
  }
};


// ---------------------------
// MapPicker (Leaflet) (SIN CAMBIOS)
// ---------------------------

declare global {
  interface Window {
    L: any;
    mapInstance?: any;
  }
}

interface MapPickerProps {
  form: UseFormReturn<WarehouseFormValues>;
  initialLat?: number | null;
  initialLng?: number | null;
}

const MapPicker: React.FC<MapPickerProps> = ({
  form,
  initialLat,
  initialLng,
}) => {
  const { toast } = useToast();
  
  const initialCenter = useMemo(() => {
    if (initialLat != null && initialLng != null) {
      return [initialLat, initialLng] as [number, number];
    }
    return [-12.046374, -77.042793] as [number, number]; 
  }, [initialLat, initialLng]);
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  const markerRef = React.useRef<any>(null); 
  const isGeocodingRef = React.useRef(false); 

  // Cargar Leaflet dinámicamente
  useEffect(() => {
    // ... Lógica de carga de Leaflet (Sin cambios)
    let mounted = true;
    const load = async () => {
      if ((window as any).L) {
        if (mounted) setIsMapLoaded(true);
        return;
      }
      try {
        const cssLink = document.createElement("link");
        cssLink.rel = "stylesheet";
        cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(cssLink);

        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = () => resolve();
          script.onerror = reject;
          document.body.appendChild(script);
        });

        if (mounted) setIsMapLoaded(true);
      } catch (err) {
        console.error("Error cargando Leaflet:", err);
        toast({
          title: "Mapa",
          description: "No se pudo cargar la librería de mapas.",
          variant: "destructive",
        });
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [toast]);

  useEffect(() => {
    if (!isMapLoaded || !window.L) return;

    const mapContainerId = "map-container";
    const container = document.getElementById(mapContainerId);
    if (!container) return;

    // ... Lógica de inicialización del mapa (Sin cambios)
    const safeGetDomUtil = () => {
      try {
        return window.L?.DomUtil?.get
          ? window.L.DomUtil.get(mapContainerId)
          : null;
      } catch {
        return null;
      }
    };

    const existing = safeGetDomUtil();
    if (existing && (existing as any)._leaflet_id) {
      try {
        const maybeMap = (window as any).mapInstance;
        if (maybeMap && maybeMap.remove) {
          maybeMap.remove();
          (window as any).mapInstance = undefined;
        }
      } catch (e) {
        // noop
      }
    }

    const mapInstance = window.L.map(mapContainerId, {
      center: initialCenter, 
      zoom: 13,
      attributionControl: false,
    });

    (window as any).mapInstance = mapInstance;

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(mapInstance);

    if (initialLat != null && initialLng != null) {
      const initialMarker = window.L.marker([initialLat, initialLng]).addTo(mapInstance);
      markerRef.current = initialMarker;
    }


    const updateLocation = async (
      lat: number,
      lng: number,
      shouldRecenter = true,
    ) => {
      if (isGeocodingRef.current) return;
      isGeocodingRef.current = true; 
      
      let markerToUpdate = markerRef.current;
      if (markerToUpdate) {
        markerToUpdate.setLatLng([lat, lng]);
      } else {
        const newMarker = window.L.marker([lat, lng]).addTo(mapInstance);
        markerRef.current = newMarker;
        markerToUpdate = newMarker;
      }
      
      if (shouldRecenter) {
         mapInstance.setView([lat, lng], mapInstance.getZoom());
      }


      form.setValue("latitude", lat, { shouldValidate: false });
      form.setValue("longitude", lng, { shouldValidate: false });
      form.clearErrors(["latitude", "longitude"]);

      form.setValue("locationAddress", "Buscando dirección...", {
        shouldValidate: false,
      });

      const address = await reverseGeocode(lat, lng);

      form.setValue("locationAddress", address, { shouldValidate: true });
      
      isGeocodingRef.current = false; 
    };

    const clickHandler = (e: any) => {
      updateLocation(e.latlng.lat, e.latlng.lng, true);
    };

    mapInstance.on("click", clickHandler);


    if (initialLat != null && initialLng != null) {
      updateLocation(initialLat, initialLng, false);
    }

    return () => {
      try {
        mapInstance.off("click", clickHandler); 
        
        if (markerRef.current) {
             markerRef.current.remove();
             markerRef.current = null;
        }

        if (mapInstance && mapInstance.remove) mapInstance.remove();
        if ((window as any).mapInstance)
          (window as any).mapInstance = undefined;
      } catch (e) {
        // noop
      }
    };
  }, [isMapLoaded, initialCenter, form, initialLat, initialLng, toast]); 

  return (
    <div
      id="map-container"
      className="w-full h-80 rounded-lg overflow-hidden border border-gray-300 shadow-inner bg-gray-100 flex items-center justify-center"
      style={{ minHeight: 320 }}
    >
      {!isMapLoaded && (
        <div className="text-gray-500 flex items-center space-x-2 p-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Cargando mapa interactivo...</span>
        </div>
      )}
    </div>
  );
};

// ---------------------------
// Componente Principal WarehouseForm
// ---------------------------

const WarehouseForm: React.FC<WarehouseFormProps> = ({
  defaultWarehouse,
  onSuccess,
}) => {
  // @ts-ignore
  const { toast } = useToast();
  const queryClient = useQueryClient(); 
  const isEditing = !!defaultWarehouse;

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: defaultWarehouse?.name || "",
      locationAddress: defaultWarehouse?.locationAddress || "",
      
      houseNumber: defaultWarehouse?.houseNumber || "", 
      floor: defaultWarehouse?.floor || "",
      
      latitude: null,
      longitude: null,
      isMain: defaultWarehouse?.isMain ?? false,
    },
  });

  const selectedLat = form.watch("latitude");
  const selectedLng = form.watch("longitude");
  const locationAddressValue = form.watch("locationAddress");


  // 🚀 CONEXIÓN REAL A LA API (Mutations sin cambios)
  const createMutation = useMutation({
    mutationFn: (data: WarehousePayload) => createWarehouseApi(data),
    onSuccess: () => {
      toast({ title: "Creado", description: "Almacén creado correctamente." });
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      onSuccess();
    },
    onError: (error: any) => {
      const message = error?.response?.data || error.message || "Error al crear.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: WarehousePayload }) =>
      updateWarehouseApi(id, payload),
    onSuccess: () => {
      toast({
        title: "Actualizado",
        description: "Almacén actualizado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse", defaultWarehouse?.id] }); 
      onSuccess();
    },
    onError: (error: any) => {
      const message = error?.response?.data || error.message || "Error al actualizar.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: WarehouseFormValues) => {
    
    const houseNumberPart = values.houseNumber ? ` Nro. ${values.houseNumber}` : "";
    const floorPart = values.floor ? ` Piso ${values.floor}` : "";
    
    const finalAddress = `${values.locationAddress}${houseNumberPart}${floorPart}`;

    // Usamos el tipo correcto para el payload
    const payload: Omit<Warehouse, 'id'> = {
      name: values.name,
      locationAddress: finalAddress, 
      isMain: values.isMain,
    };
    
    console.log(`Payload final. Dirección enviada: ${finalAddress}`);

    if (isEditing && defaultWarehouse) {
      updateMutation.mutate({ id: defaultWarehouse.id, payload: payload as WarehousePayload });
    } else {
      createMutation.mutate(payload as WarehousePayload);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // ✅ CARGA DE DATOS EN EDICIÓN (Sin cambios)
  useEffect(() => {
    if (defaultWarehouse) {
      const latMatch = defaultWarehouse.locationAddress.match(/Lat:(-?\d+\.\d+)/);
      const lngMatch = defaultWarehouse.locationAddress.match(/Lng:(-?\d+\.\d+)/);

      const initialLat = latMatch ? parseFloat(latMatch[1]) : null;
      const initialLng = lngMatch ? parseFloat(lngMatch[1]) : null;
      
      form.reset({
        name: defaultWarehouse.name,
        locationAddress: defaultWarehouse.locationAddress,
        houseNumber: defaultWarehouse.houseNumber || "", 
        floor: defaultWarehouse.floor || "",           
        latitude: initialLat,
        longitude: initialLng,
        isMain: defaultWarehouse.isMain,
      });
    } else {
      form.reset({
        name: "",
        locationAddress: "",
        houseNumber: "",
        floor: "",
        latitude: null,
        longitude: null,
        isMain: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultWarehouse]);


  return (
    // ¡Eliminamos el bloque <style> ya que tus componentes reales manejan el estilo!
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Almacén</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej: Almacén Central Lima" 
                    {...field} 
                    value={field.value || ""} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* SECCIÓN DE UBICACIÓN */}
          <div>
            <FormLabel className="flex items-center space-x-2 mb-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Ubicación en el Mapa (Clic para Seleccionar)</span>
            </FormLabel>

            <MapPicker
              form={form}
              initialLat={selectedLat ?? null}
              initialLng={selectedLng ?? null}
            />

            <div className="mt-4 grid grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Latitud</FormLabel>
                <Input
                  readOnly 
                  value={
                    selectedLat != null
                      ? (selectedLat as number).toFixed(6)
                      : "N/A"
                  }
                  className="bg-gray-50 border-gray-200"
                  placeholder="Latitud (se auto-llena)"
                />
                <FormMessage>
                  {form.formState.errors.latitude?.message}
                </FormMessage>
              </FormItem>

              <FormItem>
                <FormLabel>Longitud</FormLabel>
                <Input
                  readOnly 
                  value={
                    selectedLng != null
                      ? (selectedLng as number).toFixed(6)
                      : "N/A"
                  }
                  className="bg-gray-50 border-gray-200"
                  placeholder="Longitud (se auto-llena)"
                />
                <FormMessage>
                  {form.formState.errors.longitude?.message}
                </FormMessage>
              </FormItem>
            </div>
          </div>
          {/* FIN SECCIÓN MAPA */}

          {/* DIRECCIÓN FÍSICA Y DETALLES */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="locationAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección Física Base</FormLabel>
                  <FormControl>
                    <Input
                      {...field} 
                      value={locationAddressValue} 
                      readOnly={selectedLat != null && selectedLng != null}
                      className={
                        selectedLat != null && selectedLng != null
                          ? "bg-gray-100"
                          : ""
                      }
                      placeholder="Dirección base auto-llenada o manual"
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                      Esta es la dirección de la calle/barrio. Añade abajo el número exacto y el piso.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="houseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Nro. Ej: 123"
                        value={field.value || ""} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Piso/Dpto. (Opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Ej: 1, 5A, Sótano"
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          {/* CAMPO ISMAIN */}
          <FormField
            control={form.control}
            name="isMain"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  {/* El componente Checkbox real de shadcn-ui usa 'checked' y 'onCheckedChange' */}
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Establecer como Almacén Principal
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Solo un almacén puede ser el principal.
                  </p>
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isEditing ? (
              "Guardar Cambios"
            ) : (
              "Crear Almacén"
            )}
          </Button>
        </form>
      </Form>
  );
};

export default WarehouseForm;