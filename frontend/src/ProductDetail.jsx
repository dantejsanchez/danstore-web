import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import { useCart } from './context/CartContext';
import { API_URL, getImageUrl } from './config';

// CONFIGURACIÓN DE OPCIONES
const availableSizes = ['S', 'M', 'L', 'XL']; 
const ratioOptions = [
    { label: 'Cuadrado', value: 'aspect-square' },
    { label: 'Retrato', value: 'aspect-[3/4]' },
    { label: 'Panorámico', value: 'aspect-video' },
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
  
  // Usamos una referencia de estado para asegurar que el elemento existe antes de medirlo
  const [imageContainerRef, setImageContainerRef] = useState(null);

  // --- EFECTOS ---
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    fetch(`${API_URL}/api/products/${id}/`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        if (data.image) setMainImageUrl(getImageUrl(data.image));
      })
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    if (product && product.id) {
        fetch(`${API_URL}/api/recommendations/${product.id}/`)
            .then(res => res.json())
            .then(data => setRecommendations(Array.isArray(data) ? data : []))
            .catch(console.error);
    }
  }, [product]);

  // --- ESTILOS VISUALES ---
  const BLUE_COLOR = "bg-[#0071e3]";
  const TEXT_BLUE = "text-[#0071e3]";
  const BORDER_FOCUS = "ring-2 ring-[#0071e3] ring-offset-1";

  const getLabelStyle = (code) => {
    switch(code) {
        case 'BF': return 'bg-black text-white';
        case 'OF': return 'bg-[#e3002b] text-white';
        case 'NW': return 'bg-[#0071e3] text-white';
        case 'LQ': return 'bg-orange-500 text-white';
        default: return 'hidden';
    }
  };

  const calculateDiscount = (original, current) => {
      if (!original || !current) return 0;
      return Math.round(((original - current) / original) * 100);
  };

  if (!product) return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0071e3]"></div></div>

  // --- HANDLERS ---
  const handleQuantityChange = (type) => {
    if (type === 'inc') setQuantity(prev => prev + 1);
    else if (type === 'dec' && quantity > 1) setQuantity(prev => prev - 1);
  }

  const handleAddToCart = () => {
    const ratioLabel = ratioOptions.find(r => r.value === selectedRatio)?.label || '1:1';
    const focusLabel = focusOptions.find(f => f.value === focusPosition)?.label || 'Centro';
    addToCart(product, quantity, selectedColor, ratioLabel, focusLabel); 
    alert(`Añadido al carrito`);
  }

  const galleryImages = product.images ? product.images.filter(img => !img.is_variant_swatch) : [];
  const colorSwatches = product.images ? product.images.filter(img => img.is_variant_swatch) : [];

  // =====================================================================
  // 🔧 CORRECCIÓN TÉCNICA DEL ZOOM (CLAMPING)
  // =====================================================================
  const handleMouseMove = (e) => {
    if (!imageContainerRef) return;
    
    const { left, top, width, height } = imageContainerRef.getBoundingClientRect();
    
    // Calculamos posición relativa
    let x = (e.clientX - left) / width;
    let y = (e.clientY - top) / height;

    // 🛡️ REGLA DE ORO: CLAMP (Forzar valores entre 0 y 1)
    // Esto evita que la imagen "salga volando" si el mouse se sale un píxel del borde
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));

    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => setZoomEnabled(true);
  const handleMouseLeave = () => setZoomEnabled(false);

  const zoomImageStyle = {
    backgroundImage: `url(${mainImageUrl})`,
    backgroundSize: zoomEnabled ? '200%' : 'cover', // 200% es un zoom estándar bueno
    backgroundPosition: zoomEnabled ? `${mousePosition.x * 100}% ${mousePosition.y * 100}%` : 'center center',
    transition: 'background-position 0.08s ease-out', // Un poco más suave para que no vibre
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#1d1d1f]">
      <Navbar />

      <div className="pt-28 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* =========================================================
            BREADCRUMBS ESTILO PROFESIONAL (CAMBIO SOLICITADO) 
           ========================================================= */}
        <div className="flex items-center text-xs text-gray-500 mb-8 gap-2">
            <Link to="/" className={`flex items-center gap-1 hover:${TEXT_BLUE} transition-colors`}>
                {/* Icono Home */}
                <svg className="w-3.5 h-3.5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                Home
            </Link>
            
            {/* Separador */}
            <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            
            {/* Catálogo en Negrita */}
            <Link to="/catalogo" className="font-bold text-black hover:opacity-70 transition-opacity">Catálogo</Link>
            
            {/* Separador */}
            <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            
            {/* Nombre del Producto en Azul */}
            <span className={`${TEXT_BLUE} font-medium`}>{product.name}</span>
        </div>
        {/* ========================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-[450px_minmax(400px,_1fr)] xl:grid-cols-[550px_minmax(400px,_1fr)] gap-12 items-start">
            
            {/* --- GALERÍA --- */}
            <div className="flex gap-4 items-start">
                
                {/* Thumbnails */}
                <div className="flex flex-col gap-3">
                    {[product.image, ...galleryImages.map(img => img.image)].map((imgUrl, index) => (
                         <div 
                            key={index}
                            onClick={() => setMainImageUrl(getImageUrl(imgUrl))}
                            className={`w-20 h-20 rounded-xl cursor-pointer overflow-hidden flex items-center justify-center bg-gray-50 transition-all border 
                                ${mainImageUrl.includes(imgUrl) ? 'border-[#0071e3] shadow-md' : 'border-transparent hover:border-gray-300'}`}
                        >
                            <img src={getImageUrl(imgUrl)} alt={`Thumb ${index}`} className="w-full h-full object-cover"/>
                        </div>
                    ))}
                </div>

                {/* IMAGEN PRINCIPAL */}
                <div 
                    className="flex-1 relative h-[550px] w-full flex items-center justify-center p-2"
                >
                    <div 
                        ref={setImageContainerRef}
                        className={`relative w-full ${selectedRatio} max-h-full transition-all duration-500 ease-in-out rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white cursor-crosshair group`}
                        onMouseMove={handleMouseMove}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        {/* Etiqueta dentro del marco */}
                        {product.label && product.label !== 'NONE' && (
                            <span className={`absolute top-4 left-4 z-30 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm ${getLabelStyle(product.label)}`}>
                                {product.label_display || product.label}
                            </span>
                        )}

                         {zoomEnabled ? (
                            // Zoom Activo
                            <div style={zoomImageStyle} className="absolute inset-0 w-full h-full bg-no-repeat bg-white" />
                        ) : (
                            // Imagen Normal
                            <img 
                                src={mainImageUrl} 
                                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${focusPosition}`} 
                                alt={product.name} 
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* --- INFO (DERECHA) --- */}
            <div className="pl-4 pt-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{product.brand || "DOO AUSTRALIA"}</p>
                <h1 className="text-4xl font-semibold text-[#1d1d1f] mb-2 leading-tight">{product.name}</h1>
                
                <div className="flex items-baseline gap-3 mb-8 pb-6 border-b border-gray-100">
                    <span className="text-3xl font-bold text-[#1d1d1f]">S/ {product.price}</span>
                    {product.original_price && (
                        <>
                            <span className="text-xl text-gray-400 line-through font-light">S/ {product.original_price}</span>
                            <span className="text-xs font-bold text-[#e3002b] bg-red-50 px-2 py-1 rounded-full">
                                -{calculateDiscount(product.original_price, product.price)}%
                            </span>
                        </>
                    )}
                </div>

                {/* Color */}
                <div className="mb-8">
                    <div className="flex justify-between mb-3">
                        <span className="text-sm font-medium text-gray-900">Color: <span className="text-gray-500 font-normal">{selectedColor}</span></span>
                    </div>
                    <div className="flex gap-3">
                        {colorSwatches.length > 0 ? colorSwatches.map(img => (
                            <div 
                                key={img.image}
                                onClick={() => { setMainImageUrl(getImageUrl(img.image)); setSelectedColor('Variante'); }}
                                className={`w-12 h-12 rounded-full cursor-pointer border-2 p-0.5 transition-all ${mainImageUrl.includes(img.image) ? 'border-[#0071e3]' : 'border-transparent hover:border-gray-200'}`}
                            >
                                <img src={getImageUrl(img.image)} className="w-full h-full object-cover rounded-full bg-gray-100"/>
                            </div>
                        )) : (
                            <button onClick={() => setSelectedColor('Amarillo')} className={`w-10 h-10 rounded-full bg-yellow-400 transition-all ${selectedColor === 'Amarillo' ? BORDER_FOCUS : ''}`}></button>
                        )}
                    </div>
                </div>

                {/* Talla y Ajustes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">Talla</span>
                            <span className="text-xs text-[#0071e3] hover:underline cursor-pointer">Guía</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {availableSizes.map(size => (
                                <button 
                                    key={size} 
                                    onClick={() => setSelectedSize(size)} 
                                    className={`px-4 py-2 text-sm rounded-lg font-medium transition-all border
                                        ${selectedSize === size 
                                            ? 'border-[#0071e3] text-[#0071e3] bg-blue-50' 
                                            : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:text-black'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Visualización</p>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Forma del marco</label>
                                <select 
                                    value={selectedRatio} onChange={(e) => setSelectedRatio(e.target.value)}
                                    className="w-full bg-gray-50 border-0 rounded-lg text-sm px-3 py-2 text-gray-700 focus:ring-2 focus:ring-[#0071e3] cursor-pointer"
                                >
                                    {ratioOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Enfoque de la imagen</label>
                                <select 
                                    value={focusPosition} onChange={(e) => setFocusPosition(e.target.value)}
                                    className="w-full bg-gray-50 border-0 rounded-lg text-sm px-3 py-2 text-gray-700 focus:ring-2 focus:ring-[#0071e3] cursor-pointer"
                                >
                                    {focusOptions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compra */}
                <div className="flex items-center gap-4 mt-8 pt-8 border-t border-gray-100">
                    <div className="flex items-center bg-gray-100 rounded-full px-4 py-3 h-12">
                        <button onClick={() => handleQuantityChange('dec')} disabled={quantity <= 1} className="text-lg text-gray-500 hover:text-black px-2 disabled:opacity-30">-</button>
                        <span className="mx-2 font-semibold w-6 text-center">{quantity}</span>
                        <button onClick={() => handleQuantityChange('inc')} className="text-lg text-gray-500 hover:text-black px-2">+</button>
                    </div>
                    
                    <button 
                        onClick={handleAddToCart} 
                        className={`flex-1 text-white py-3 rounded-full text-lg font-semibold transition-all shadow-lg active:scale-[0.98] ${BLUE_COLOR} hover:opacity-90`}
                    >
                        Agregar a la bolsa
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">Envío gratis a todo el país en compras superiores a S/ 200</p>
            </div>
        </div>

        <hr className="my-16 border-gray-200"/>

        {/* Recomendaciones */}
        {recommendations.length > 0 && (
            <div>
                <h2 className="text-2xl font-bold text-[#1d1d1f] mb-8">También podría interesarte</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {recommendations.map((rec) => (
                        <Link to={`/product/${rec.id}`} key={rec.id} className="group cursor-pointer">
                            <div className="aspect-square bg-[#F5F5F7] rounded-2xl mb-3 overflow-hidden relative border border-transparent group-hover:border-gray-200 transition-all">
                                {rec.label && rec.label !== 'NONE' && (
                                    <span className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-1 rounded z-10 uppercase ${getLabelStyle(rec.label)}`}>
                                        {rec.label_display || rec.label}
                                    </span>
                                )}
                                <img src={getImageUrl(rec.image)} alt={rec.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{rec.brand}</p>
                            <h3 className="text-sm font-medium text-[#1d1d1f] line-clamp-1 group-hover:text-[#0071e3] transition-colors">{rec.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-bold text-[#1d1d1f]">S/ {rec.price}</span>
                                {rec.original_price && (
                                    <span className="text-xs text-gray-400 line-through">S/ {rec.original_price}</span>
                                )}
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

export default ProductDetail;