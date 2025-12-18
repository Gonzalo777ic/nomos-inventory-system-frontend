import React, { useState, useEffect, useCallback } from 'react';
import { ProductImage } from '../types';
import { getProductImages } from '../api/services/productImages';
import { Loader2, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'; 

interface ProductImageCarouselProps {
    productName: string;
    productId: number;
}

/**
 * Componente Carrusel de Imágenes para la vista de detalle del producto.
 * Carga todas las imágenes del producto y muestra un carrusel interactivo
 * con zoom "lupa" y navegación por miniaturas.
 */
const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({ productName, productId }) => {
    
    const [images, setImages] = useState<ProductImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    

    useEffect(() => {
        const loadImages = async () => {
            if (!productId) return;
            setIsLoading(true);
            try {

                const loadedImages = await getProductImages(productId);
                

                const sortedImages = loadedImages.sort((a, b) => {
                    if (a.isDefault && !b.isDefault) return -1;
                    if (!a.isDefault && b.isDefault) return 1;

                    return (a.sortOrder || 999) - (b.sortOrder || 999);
                });
                
                setImages(sortedImages);

                setCurrentIndex(0); 
                
            } catch (error) {
                console.error("Error loading product images:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadImages();
    }, [productId]);
    

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: '50%', y: '50%' });


    const currentImage = images[currentIndex];


    const nextImage = useCallback(() => {
        if (images.length === 0) return;
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, [images.length]);

    const prevImage = useCallback(() => {
        if (images.length === 0) return;
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }, [images.length]);


    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isHovered) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - left) / width * 100;
        const y = (e.clientY - top) / height * 100;
        setZoomPosition({ x: `${x}%`, y: `${y}%` });
    };


    
    if (isLoading) {
        return <div className="flex justify-center items-center h-full min-h-[300px]"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
    }

    if (images.length === 0 || !currentImage) {
        return (
            <div className="flex flex-col justify-center items-center h-full min-h-[300px] text-gray-500 bg-gray-100 dark:bg-gray-900 rounded-xl border border-dashed border-gray-300">
                <ImageIcon className="w-12 h-12 text-gray-400" />
                <p className="mt-2 text-sm">No hay imágenes disponibles.</p>
                <p className="text-xs text-emerald-500">Producto ID: {productId}</p>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-full items-center space-y-4">
            
            {}
            <div 
                className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-2xl"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseMove={handleMouseMove}
            >
                {}
                <img 
                    src={currentImage.imageUrl} 
                    alt={`${productName} - Imagen ${currentIndex + 1}`}
                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 cursor-zoom-in ${isHovered ? 'opacity-0' : 'opacity-100'}`}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; 
                        target.src = "https://placehold.co/800x800/FEE2E2/EF4444?text=Error+Carga";
                    }}
                />
                
                {}
                <div
                    className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                        backgroundImage: `url(${currentImage.imageUrl})`,
                        backgroundSize: '250%',
                        backgroundPosition: `${zoomPosition.x} ${zoomPosition.y}`,
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: 'white', 
                    }}
                    aria-hidden={!isHovered}
                >
                </div>
                
                {}
                <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition z-10 shadow-lg"
                    aria-label="Imagen Anterior"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition z-10 shadow-lg"
                    aria-label="Imagen Siguiente"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
            
            {}
            <div className="flex space-x-3 overflow-x-auto w-full py-2 px-1">
                {images.map((img, index) => (
                    <div
                        key={img.id}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200 shadow-md ${
                            index === currentIndex
                                ? 'border-emerald-500 ring-4 ring-emerald-200 dark:ring-emerald-700/50'
                                : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-400'
                        }`}
                        onClick={() => setCurrentIndex(index)}
                    >
                        <img
                            src={img.imageUrl}
                            alt={`Miniatura ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = `https://placehold.co/80x80/CCCCCC/333333?text=Thumb`;
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductImageCarousel;