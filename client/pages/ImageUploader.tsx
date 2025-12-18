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


interface ImageUploaderProps {
  productId: number;

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


  const [imageUrlInput, setImageUrlInput] = useState("");
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [urlPreviewError, setUrlPreviewError] = useState<string | null>(null);


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


  const clearPendingStates = () => {
    if (localPreviewUrl && localFile) URL.revokeObjectURL(localPreviewUrl);
    setLocalFile(null);
    setImageUrlInput("");
    setLocalPreviewUrl(null);
    setPendingUrl(null);
    setUrlPreviewError(null);
  };


  const updateImageState = (newImage: ProductImage) => {
    setImages((prev) => {
      let updatedImages: ProductImage[];


      if (newImage.isDefault) {
        updatedImages = prev.map((img) => ({ ...img, isDefault: false }));
        updatedImages.push(newImage);
      } else {

        if (prev.some((img) => img.id === newImage.id)) {
          updatedImages = prev.map((img) =>
            img.id === newImage.id ? newImage : img,
          );
        } else {
          updatedImages = [...prev, newImage];
        }
      }


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


    clearPendingStates();
  };


  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith("image/")) {
      toast.error("El archivo seleccionado no es una imagen válida.");
      return;
    }


    setPendingUrl(null);
    setImageUrlInput("");
    setUrlPreviewError(null);


    setLocalFile(file);
    setLocalPreviewUrl(URL.createObjectURL(file));
  };


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


  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrlInput(url);
    setLocalFile(null);
    setPendingUrl(null);

    if (url && url.match(/^https?:\/\/.+/)) {

      if (url.length > 2048) {
        setUrlPreviewError("URL demasiado larga.");
        setLocalPreviewUrl(null);
        return;
      }


      const img = new window.Image();
      img.onload = () => {
        setLocalPreviewUrl(url);
        setPendingUrl(url);
        setUrlPreviewError(null);
      };
      img.onerror = () => {
        setLocalPreviewUrl(null);
        setPendingUrl(null);
        setUrlPreviewError(
          "No se pudo cargar la previsualización de la URL. Verifica que la URL sea pública y accesible.",
        );
      };

      setTimeout(() => {
        img.src = url;
      }, 100);
    } else {
      setLocalPreviewUrl(null);
      setPendingUrl(null);
      setUrlPreviewError(null);
    }
  };


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


  const handleSavePendingImage = () => {
    if (localFile) {
      submitLocalFile();
    } else if (pendingUrl) {
      submitUrl();
    }
  };


  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };


  const handleSetDefault = async (imageId: number) => {

    try {
      setIsLoading(true);

      await setDefaultProductImage(productId, imageId);
      toast.success("Imagen principal actualizada.");
      await loadImages();
    } catch (error) {
      console.error("Error al establecer imagen principal:", error);
      toast.error("No se pudo establecer la imagen principal.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleDeleteImage = async (imageId: number) => {

    try {
      setIsLoading(true);
      await deleteProductImage(productId, imageId);
      toast.success("Imagen eliminada correctamente.");
      await loadImages();
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


  const showPreviewMode = localFile || pendingUrl;

  return (
    <div className="space-y-4">
      <h4 className="text-xl font-semibold dark:text-white border-b pb-2">
        Galería de Imágenes
      </h4>

      {}
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
        {}
        <button
          type="button"
          disabled={true}
          className="flex items-center justify-center p-2 bg-emerald-600 text-white font-semibold rounded-md shadow-md hover:bg-emerald-700 disabled:opacity-50 transition min-w-[100px]"
          title="Pegue la URL para previsualizar"
        >
          <span>Guardar</span>
        </button>
      </form>

      {}
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

      {}
      {showPreviewMode && localPreviewUrl ? (

        <div className="border-2 border-dashed border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-4 text-center animate-fadeIn">
          <div className="flex justify-center items-center h-48 w-full overflow-hidden mb-3">
            <img
              src={localPreviewUrl}
              alt="Previsualización de imagen"
              className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
              onError={(e) => {

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

      {}
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

                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://placehold.co/100x100/CCCCCC/333333?text=ID+${img.id}`;
                  }}
                />
              </div>

              {}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                {}
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

                {}
                <button
                  onClick={() => handleDeleteImage(img.id)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  title="Eliminar Imagen"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {}
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
