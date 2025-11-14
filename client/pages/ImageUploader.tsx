import React, { useState, useEffect, useCallback } from "react";
import { ProductImage } from "../types";
import {
  getProductImages,
  uploadProductImage,
  deleteProductImage,
  setDefaultProductImage,
  addProductImageFromUrl,
} from "../api/services/productImages";
import {
  Loader2,
  UploadCloud,
  Trash2,
  Star,
  CheckCircle,
  Image,
  Link,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

// Definición de las propiedades que espera el componente
interface ImageUploaderProps {
  productId: number;
  // Opcional: callback para notificar al padre sobre cambios en la imagen principal
  onUpdateProductImage?: (newImageUrl: string | undefined) => void;
}

/**
 * Componente para cargar, ver y gestionar las imágenes asociadas a un producto.
 * Permite drag-and-drop o ingresar una URL.
 */
const ImageUploader: React.FC<ImageUploaderProps> = ({
  productId,
  onUpdateProductImage,
}) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // ESTADOS CLAVE PARA EL PROCESO DE PREVISUALIZACIÓN UNIFICADO
  const [imageUrlInput, setImageUrlInput] = useState(""); // Contiene la URL pegada en el input
  const [localFile, setLocalFile] = useState<File | null>(null); // Contiene el File object local
  const [pendingUrl, setPendingUrl] = useState<string | null>(null); // Contiene la URL de Internet lista para guardar
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null); // URL para mostrar en el <img src>
  const [urlPreviewError, setUrlPreviewError] = useState<string | null>(null);

  // 1. Carga inicial de imágenes
  const loadImages = useCallback(async () => {
    if (!productId) return;
    setIsLoading(true);
    try {
      const loadedImages = await getProductImages(productId);
      setImages(loadedImages);
      const mainImage = loadedImages.find((img) => img.isDefault);
      if (onUpdateProductImage) {
        onUpdateProductImage(mainImage?.imageUrl);
      }
    } catch (error) {
      console.error("🚨 Error al cargar las imágenes:", error);
      toast.info("Imágenes cargadas, pero podría haber un problema de red.");
    } finally {
      setIsLoading(false);
    }
  }, [productId, onUpdateProductImage]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Limpiar previsualización y estados pendienes
  const clearPendingStates = () => {
    if (localPreviewUrl && localFile) URL.revokeObjectURL(localPreviewUrl);
    setLocalFile(null);
    setImageUrlInput("");
    setLocalPreviewUrl(null);
    setPendingUrl(null);
    setUrlPreviewError(null);
  };

  // Función auxiliar para actualizar el estado después de una subida/cambio
  const updateImageState = (newImage: ProductImage) => {
    setImages((prev) => {
      let updatedImages: ProductImage[];

      // Si la imagen nueva es la principal, desmarcamos las demás
      if (newImage.isDefault) {
        updatedImages = prev.map((img) => ({ ...img, isDefault: false }));
        updatedImages.push(newImage);
      } else {
        // Previene duplicados si el backend no es idempotente o si la lógica es compleja
        if (prev.some((img) => img.id === newImage.id)) {
          updatedImages = prev.map((img) =>
            img.id === newImage.id ? newImage : img,
          );
        } else {
          updatedImages = [...prev, newImage];
        }
      }

      // @ts-ignore: Asumimos que el tipo ProductImage ya se corrigió para incluir sortOrder
      updatedImages.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return (a.sortOrder || 999) - (b.sortOrder || 999);
      });

      if (newImage.isDefault && onUpdateProductImage) {
        onUpdateProductImage(newImage.imageUrl);
      }

      return updatedImages;
    });

    // Limpiar el estado de subida y previsualización
    clearPendingStates();
  };

  // 2. Manejo de la subida de archivos locales
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith("image/")) {
      toast.error("El archivo seleccionado no es una imagen válida.");
      return;
    }

    // Limpiar URL pendiente si el usuario decide subir un archivo
    setPendingUrl(null);
    setImageUrlInput("");
    setUrlPreviewError(null);

    // AÑADIR ARCHIVO A ESTADO LOCAL PARA PREVISUALIZACIÓN
    setLocalFile(file);
    setLocalPreviewUrl(URL.createObjectURL(file));
  };

  // Función de subida real del archivo local
  const submitLocalFile = async () => {
    if (!localFile || isUploading) return;

    setIsUploading(true);
    console.log(`[ImageUploader] 📤 Subiendo archivo local: ${localFile.name}`);

    try {
      const newImage = await uploadProductImage(productId, localFile);
      updateImageState(newImage);
      toast.success("Imagen subida con éxito.");
    } catch (error) {
      console.error("🚨 Error en la subida:", error);
      toast.error("Error al subir la imagen. Verifica el backend.");
    } finally {
      setIsUploading(false);
    }
  };

  // 3. Manejo de la URL de Internet (AHORA SOLO PARA PREVISUALIZACIÓN)
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrlInput(url);
    setLocalFile(null); // Limpiar local file si se usa URL
    setPendingUrl(null); // Limpiar URL pendiente

    if (url && url.match(/^https?:\/\/.+/)) {
      // Validación básica
      if (url.length > 2048) {
        setUrlPreviewError("URL demasiado larga.");
        setLocalPreviewUrl(null);
        return;
      }

      // Intentar precargar la imagen para previsualización
      const img = new window.Image();
      img.onload = () => {
        setLocalPreviewUrl(url);
        setPendingUrl(url); // Establecer URL como pendiente de guardar
        setUrlPreviewError(null);
      };
      img.onerror = () => {
        setLocalPreviewUrl(null);
        setPendingUrl(null);
        setUrlPreviewError(
          "No se pudo cargar la previsualización de la URL. Verifica que la URL sea pública y accesible.",
        );
      };
      // Usamos un pequeño timeout para que la UI no se bloquee inmediatamente
      setTimeout(() => {
        img.src = url;
      }, 100);
    } else {
      setLocalPreviewUrl(null);
      setPendingUrl(null);
      setUrlPreviewError(null);
    }
  };

  // Función de subida real de la URL
  const submitUrl = async () => {
    if (!pendingUrl || isUploading) return;

    setIsUploading(true);
    console.log(`[ImageUploader] 🌐 Guardando imagen desde URL: ${pendingUrl}`);

    try {
      const newImage = await addProductImageFromUrl(productId, pendingUrl);
      updateImageState(newImage);
      toast.success("URL de imagen guardada con éxito.");
    } catch (error) {
      console.error("🚨 Error al guardar URL:", error);
      toast.error(
        "Error al guardar la URL. (Revisa el backend para detalles).",
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Función unificada para el botón de Guardar en la previsualización
  const handleSavePendingImage = () => {
    if (localFile) {
      submitLocalFile();
    } else if (pendingUrl) {
      submitUrl();
    }
  };

  // Manejar el evento de arrastrar y soltar
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  // 4. Establecer imagen como principal
  const handleSetDefault = async (imageId: number) => {
    // Lógica de establecer como principal
    try {
      setIsLoading(true);
      // La API solo necesita productId y imageId
      await setDefaultProductImage(productId, imageId);
      toast.success("Imagen principal actualizada.");
      await loadImages(); // loadImages llama a onUpdateProductImage
    } catch (error) {
      console.error("Error al establecer imagen principal:", error);
      toast.error("No se pudo establecer la imagen principal.");
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Eliminar imagen
  const handleDeleteImage = async (imageId: number) => {
    // Lógica de eliminar (omito detalles por ser externa a la corrección)
    try {
      setIsLoading(true);
      await deleteProductImage(productId, imageId);
      toast.success("Imagen eliminada correctamente.");
      await loadImages(); // Recargar para refrescar la galería
    } catch (error) {
      console.error("Error al eliminar imagen:", error);
      toast.error("No se pudo eliminar la imagen.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!productId) {
    return (
      <div className="text-center text-gray-500 p-4 border border-dashed border-gray-300 rounded-lg dark:border-gray-700">
        Guarda el producto primero para habilitar la carga de imágenes.
      </div>
    );
  }

  // Determinar si el modo de previsualización debe estar activo
  const showPreviewMode = localFile || pendingUrl;

  return (
    <div className="space-y-4">
      <h4 className="text-xl font-semibold dark:text-white border-b pb-2">
        Galería de Imágenes
      </h4>

      {/* Subida por URL (Ahora solo para entrada de datos) */}
      <form className="flex space-x-2">
        <div className="relative w-full">
          <input
            type="url"
            placeholder="Pegar URL de imagen aquí"
            value={imageUrlInput}
            onChange={handleUrlChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 pl-9"
            disabled={isUploading || isLoading || localFile !== null}
          />
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        {/* 🛑 EL BOTÓN DE GUARDAR SE ELIMINA DE AQUÍ. LA ACCIÓN SE HACE EN LA PREVISUALIZACIÓN */}
        <button
          type="button" // Cambiado a type="button" para no enviar el formulario
          disabled={true} // Deshabilitado porque el submit ahora es solo a través del panel central
          className="flex items-center justify-center p-2 bg-emerald-600 text-white font-semibold rounded-md shadow-md hover:bg-emerald-700 disabled:opacity-50 transition min-w-[100px]"
          title="Pegue la URL para previsualizar"
        >
          <span>Guardar</span>
        </button>
      </form>

      {/* Mensaje de error de previsualización de URL */}
      {urlPreviewError && (
        <div className="flex items-center text-sm text-red-500 bg-red-100 dark:bg-red-900/50 p-2 rounded-md">
          <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
          {urlPreviewError}
        </div>
      )}

      <div className="flex items-center my-3">
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        <span className="flex-shrink mx-4 text-gray-500 text-sm">o</span>
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
      </div>

      {/* 🔑 ÁREA DE CARGA/PREVISUALIZACIÓN CENTRAL (UNIFICADA) */}
      {showPreviewMode && localPreviewUrl ? (
        // --- MODO PREVISUALIZACIÓN ---
        <div className="border-2 border-dashed border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-4 text-center animate-fadeIn">
          <div className="flex justify-center items-center h-48 w-full overflow-hidden mb-3">
            <img
              src={localPreviewUrl}
              alt="Previsualización de imagen"
              className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
              onError={(e) => {
                // Fallback para el caso de previsualización de URL que falla después del load
                if (pendingUrl) {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://placehold.co/100x100/CCCCCC/333333?text=URL+No+Cargada`;
                  setUrlPreviewError(
                    "La previsualización falló. Intente guardar bajo su propio riesgo.",
                  );
                }
              }}
            />
          </div>
          <p className="text-sm font-semibold dark:text-gray-300 mb-2">
            {localFile
              ? `Archivo local: ${localFile.name}`
              : "Imagen lista para guardar desde URL"}
          </p>
          <div className="flex justify-center space-x-2">
            <button
              onClick={handleSavePendingImage}
              disabled={
                isUploading ||
                isLoading ||
                (pendingUrl && urlPreviewError !== null)
              }
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 disabled:opacity-50 transition min-w-[120px]"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Guardar Imagen</span>
              )}
            </button>
            <button
              onClick={clearPendingStates}
              className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
              disabled={isUploading}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        // --- MODO DRAG & DROP ---
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-500 transition duration-150"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          <input
            type="file"
            id="fileInput"
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            disabled={isUploading || isLoading}
          />
          <UploadCloud className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
          <p className="text-sm font-medium dark:text-gray-300">
            Arrastra y suelta una imagen local, o haz click para seleccionar.
          </p>
        </div>
      )}

      {/* Galería de Imágenes */}
      {isLoading && (
        <div className="flex justify-center items-center h-20">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
          <span className="ml-3 text-gray-500">Cargando imágenes...</span>
        </div>
      )}

      {!isLoading && images.length === 0 && (
        <div className="text-center text-gray-500 p-4">
          Aún no hay imágenes cargadas para este producto.
        </div>
      )}

      {!isLoading && images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shadow-xl border border-gray-200 dark:border-gray-600"
            >
              <div className="aspect-square flex items-center justify-center">
                <img
                  src={img.imageUrl}
                  alt={`Imagen de Producto ${img.id}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://placehold.co/100x100/CCCCCC/333333?text=ID+${img.id}`;
                  }}
                />
              </div>

              {/* Overlay de acciones */}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                {/* Botón para establecer como principal */}
                <button
                  onClick={() => handleSetDefault(img.id)}
                  className={`p-2 rounded-full transition ${img.isDefault ? "bg-emerald-500 text-white" : "bg-white text-gray-800 hover:bg-emerald-100"}`}
                  title={
                    img.isDefault
                      ? "Imagen Principal"
                      : "Establecer como Principal"
                  }
                >
                  {img.isDefault ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Star className="w-5 h-5" />
                  )}
                </button>

                {/* Botón para eliminar */}
                <button
                  onClick={() => handleDeleteImage(img.id)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  title="Eliminar Imagen"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Indicador de Principal (si es la principal) */}
              {img.isDefault && (
                <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-current" />
                  <span>Principal</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
