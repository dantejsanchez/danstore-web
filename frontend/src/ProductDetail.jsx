import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import { useCart } from './context/CartContext';
import { API_URL, getImageUrl } from './config'; // <--- 1. IMPORTACIÓN NECESARIA

const availableSizes = ['S', 'M', 'L', 'XL']; 
const ratioOptions = [
    { label: '1:1', value: 'aspect-square' },
    { label: '3:4', value: 'aspect-[3/4]' },
    { label: '16:9', value: 'aspect-video' },
];
const focusOptions = [
    { label: 'Superior', value: 'object-top' },
    { label: 'Centro', value: 'object-center' },
    { label: 'Inferior', value: 'object-bottom' },
];

function ProductDetail() {
  const { id } = useParams();
  
  // --- ESTADOS ---
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1); 
  const [mainImageUrl, setMainImageUrl] = useState(''); 
  const [selectedSize, setSelectedSize] = useState(availableSizes[0]); 
  const [selectedColor, setSelectedColor] = useState('Amarillo'); 
  const [selectedRatio, setSelectedRatio] = useState(ratioOptions[0].value); 
  const [focusPosition, setFocusPosition] = useState(focusOptions[1].value); 
  const [recommendations, setRecommendations] = useState([]); 
  
  const { addToCart } = useCart();
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [imageContainerRef, setImageContainerRef] = useState(null);

  // --- EFECTOS ---

  // 1. Scroll al inicio
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // 2. Carga de Producto Principal (CONECTADO A TU PC O NUBE)
  useEffect(() => {
    fetch(`${API_URL}/api/products/${id}/`) // <--- Usamos API_URL
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        if (data.image) {
            // Usamos getImageUrl para que funcione en local
            setMainImageUrl(getImageUrl(data.image));
        }
      });
  }, [id]);

  // 3. Carga de Recomendaciones (CONECTADO)
  useEffect(() => {
    if (product && product.id) {
        fetch(`${API_URL}/api/recommendations/${product.id}/`) // <--- Usamos API_URL
            .then(res => res.json())
            .then(data => {
                setRecommendations(Array.isArray(data) ? data : []); 
            })
            .catch(error => console.error("Error fetching recommendations:", error));
    }
  }, [product]);

  // --- HELPER PARA ETIQUETAS ---
  const getLabelStyle = (code) => {
    switch(code) {
        case 'BF': return 'bg-black text-white';
        case 'OF': return 'bg-red-600 text-white';
        case 'NW': return 'bg-blue-600 text-white';
        case 'LIQ': return 'bg-orange-500 text-white';
        default: return 'hidden';
    }
  };

  if (!product) return <div className="text-center pt-40">Cargando producto...</div>

  // --- HANDLERS ---

  const handleQuantityChange = (type) => {
    if (type === 'inc') {
        setQuantity(prev => prev + 1);
    } else if (type === 'dec' && quantity > 1) {
        setQuantity(prev => prev - 1);
    }
  }

  const handleAddToCart = () => {
    const ratioLabel = ratioOptions.find(r => r.value === selectedRatio)?.label || '1:1';
    const focusLabel = focusOptions.find(f => f.value === focusPosition)?.label || 'Centro';
    
    addToCart(product, quantity, selectedColor, ratioLabel, focusLabel); 
    alert(`Añadido ${quantity}x ${product.name} (Talla: ${selectedSize}, Color: ${selectedColor}, Ratio: ${ratioLabel}) al carrito!`);
  }

  const galleryImages = product.images ? product.images.filter(img => !img.is_variant_swatch) : [];
  const colorSwatches = product.images ? product.images.filter(img => img.is_variant_swatch) : [];

  // --- ZOOM ---
  const handleMouseMove = (e) => {
    if (!imageContainerRef) return;

    const { left, top, width, height } = imageContainerRef.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => setZoomEnabled(true);
  const handleMouseLeave = () => setZoomEnabled(false);

  const backgroundPosition = zoomEnabled 
    ? `${mousePosition.x * 100}% ${mousePosition.y * 100}%` 
    : 'center center';
  
  const backgroundSize = zoomEnabled ? '200%' : 'cover'; 
  
  const zoomImageStyle = {
    backgroundImage: `url(${mainImageUrl})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: backgroundPosition,
    backgroundSize: backgroundSize,
    transition: 'background-position 0.1s ease-out',
    cursor: zoomEnabled ? 'crosshair' : 'default',
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Breadcrumb */}
        <div className="text-xs text-gray-500 mb-6 flex gap-1">
            <Link to="/" className="hover:underline">Home</Link> &gt; 
            <span>Navidad</span> &gt; 
            <span className="font-bold text-black">Moda Hombre</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[450px_minmax(400px,_1fr)] xl:grid-cols-[550px_minmax(400px,_1fr)] gap-10 items-start">
            
            {/* --- GALERÍA --- */}
            <div className="flex gap-4 mt-8">
                
                {/* Thumbnails */}
                <div className="flex flex-col gap-2">
                    {[product.image, ...galleryImages.map(img => img.image)].map((imgUrl, index) => (
                         <div 
                            key={index}
                            onClick={() => setMainImageUrl(getImageUrl(imgUrl))} // <--- URL CORREGIDA
                            className={`w-20 h-20 border cursor-pointer overflow-hidden rounded-md flex items-center justify-center transition-colors ${mainImageUrl.includes(imgUrl) ? 'border-2 border-black' : 'border-gray-200 hover:border-gray-400'}`}
                        >
                            <img 
                                src={getImageUrl(imgUrl)} // <--- URL CORREGIDA
                                alt={`Thumbnail ${index}`} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>

                {/* Imagen Principal */}
                <div 
                    ref={setImageContainerRef}
                    className={`rounded-lg overflow-hidden bg-gray-100 shadow-xl relative cursor-crosshair max-h-[550px] w-full flex items-center justify-center`} 
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className={`w-full ${selectedRatio} max-w-full`}>
                        <div 
                            style={zoomImageStyle} 
                            className="w-full h-full transition-opacity duration-300"
                        >
                            {!zoomEnabled && (
                                <img 
                                    src={mainImageUrl} 
                                    className={`w-full h-full object-cover ${focusPosition}`} 
                                    alt={product.name} 
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- INFO Y OPCIONES --- */}
            <div className="pl-4">
                
                {/* 4. ETIQUETA DINÁMICA (AQUÍ LA AGREGAMOS) */}
                {product.label && product.label !== 'NONE' && (
                    <span className={`inline-block mb-2 text-[10px] font-bold px-2 py-1 rounded uppercase ${getLabelStyle(product.label)}`}>
                        {product.label_display || product.label}
                    </span>
                )}

                <h1 className="text-3xl font-bold text-gray-900 mb-1">{product.name}</h1>
                <p className="text-base text-gray-600 mb-6">{product.brand || "DOO AUSTRALIA"}</p>
                
                {/* Precio */}
                <div className="border-t border-gray-200 py-4 mb-6 flex items-center gap-3">
                    <span className="text-3xl font-black text-red-600">S/ {product.price}</span>
                    {product.original_price && (
                        <span className="text-xl text-gray-500 line-through">S/ {product.original_price}</span>
                    )}
                    {product.original_price && (
                        <span className="text-sm font-bold text-white bg-red-600 px-2 py-1 rounded-md">
                            -{(100 - (product.price / product.original_price * 100)).toFixed(0)}%
                        </span>
                    )}
                </div>

                {/* Variantes: Color */}
                <div className="mb-8">
                    <p className="font-semibold text-gray-700 mb-3">Color: <span className="text-black font-bold">{selectedColor}</span></p>
                    <div className="flex gap-2">
                        {colorSwatches.length > 0 ? colorSwatches.map(img => (
                            <div 
                                key={img.image}
                                onClick={() => {
                                    setMainImageUrl(getImageUrl(img.image)); // <--- URL CORREGIDA
                                    setSelectedColor('Variante'); 
                                }}
                                className={`w-12 h-12 border cursor-pointer overflow-hidden rounded-md transition-colors p-0.5 ${mainImageUrl.includes(img.image) ? 'border-2 border-black' : 'border-gray-300 hover:border-gray-400'}`}
                            >
                                <img src={getImageUrl(img.image)} alt="Swatch" className="w-full h-full object-cover rounded-sm"/>
                            </div>
                        )) : (
                            <span className="w-12 h-12 border border-gray-400 bg-yellow-100 rounded-md cursor-pointer flex items-center justify-center text-xs" onClick={() => setSelectedColor('Amarillo')}>A/M</span>
                        )}
                    </div>
                </div>

                {/* Talla y Proporción */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                        <p className="font-semibold text-gray-700 mb-2">Talla: <span className="text-black font-bold">{selectedSize}</span></p>
                        <div className="flex gap-2">
                            {availableSizes.map(size => (
                                <button key={size} onClick={() => setSelectedSize(size)} className={`px-4 py-2 text-sm border rounded-lg font-medium transition-all ${selectedSize === size ? 'border-black bg-gray-900 text-white' : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-600'}`}>{size}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-700 mb-2">Proporción: <span className="text-black font-bold">{ratioOptions.find(r => r.value === selectedRatio)?.label}</span></p>
                        <div className="flex gap-2">
                            {ratioOptions.map(ratio => (
                                <button key={ratio.value} onClick={() => setSelectedRatio(ratio.value)} className={`px-4 py-2 text-sm border rounded-lg font-medium transition-all ${selectedRatio === ratio.value ? 'border-black bg-gray-900 text-white' : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-600'}`}>{ratio.label}</button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Enfoque */}
                <div className="mb-8">
                    <p className="font-semibold text-gray-700 mb-2">Enfoque: <span className="text-black font-bold">{focusOptions.find(f => f.value === focusPosition)?.label}</span></p>
                    <div className="flex gap-2">
                        {focusOptions.map(focus => (
                            <button key={focus.value} onClick={() => setFocusPosition(focus.value)} className={`px-4 py-2 text-sm border rounded-lg font-medium transition-all ${focusPosition === focus.value ? 'border-black bg-gray-900 text-white' : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-600'}`}>{focus.label}</button>
                        ))}
                    </div>
                </div>

                {/* Cantidad y Compra */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button onClick={() => handleQuantityChange('dec')} className="w-8 h-10 text-xl text-gray-600 hover:bg-gray-100" disabled={quantity <= 1}>-</button>
                        <span className="px-3 text-lg font-medium w-10 text-center border-l border-r border-gray-300">{quantity}</span>
                        <button onClick={() => handleQuantityChange('inc')} className="w-8 h-10 text-xl text-gray-600 hover:bg-gray-100">+</button>
                    </div>
                    <span className="text-sm text-gray-500">Máximo 10 unidades.</span>
                </div>

                <button onClick={handleAddToCart} className="w-full bg-gray-900 text-white py-3 rounded-md text-lg font-semibold hover:bg-black transition-colors shadow-lg">Elige tus opciones</button>
            </div>
        </div>

        <hr className="my-12"/>

        {/* Recomendaciones */}
        {recommendations.length > 0 && (
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Productos Relacionados (Completa el Outfit)</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {recommendations.map((rec) => (
                        <Link to={`/product/${rec.id}`} key={rec.id} className="group bg-white rounded-lg p-3 shadow-md border border-gray-100 relative cursor-pointer block hover:shadow-lg transition-shadow">
                            
                            {/* 5. ETIQUETA DINÁMICA EN RECOMENDACIONES (Si existe etiqueta) */}
                            {rec.label && rec.label !== 'NONE' && (
                                <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded z-10 uppercase ${getLabelStyle(rec.label)}`}>
                                    {rec.label_display || rec.label}
                                </span>
                            )}

                            <div className="aspect-square bg-gray-100 mb-3 overflow-hidden rounded-md">
                                <img src={getImageUrl(rec.image)} alt={rec.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                            </div>
                            <p className="text-xs text-gray-500 uppercase font-bold">{rec.brand}</p>
                            <p className="text-sm font-medium text-gray-800 h-8 overflow-hidden">{rec.name}</p>
                            
                            {/* Precios y Descuento */}
                            <div className="mt-1 flex flex-col">
                                {rec.original_price && (
                                    <span className="text-xs text-gray-400 line-through">S/ {rec.original_price}</span>
                                )}
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-bold text-red-600">S/ {rec.price}</span>
                                    {rec.original_price && (
                                        <span className="text-xs font-bold text-white bg-red-600 px-1.5 py-0.5 rounded">
                                            -{(100 - (rec.price / rec.original_price * 100)).toFixed(0)}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        )}

      </div>
    </div>
  )
}

export default ProductDetail