import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from './components/Navbar' // Asegúrate que la ruta sea correcta
import { API_URL, getImageUrl } from './config';

function Catalog() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [availableBrands, setAvailableBrands] = useState([]) 
  const [loading, setLoading] = useState(true)

  // Estado para abrir/cerrar los filtros en móvil
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  const categoryId = searchParams.get('category');
  const ordering = searchParams.get('ordering'); 
  const selectedBrands = searchParams.getAll('brand');

  // 1. CARGA INICIAL
  useEffect(() => {
    fetch(`${API_URL}/api/categories/`)
      .then(res => res.json())
      .then(data => setCategories(data));

    fetch(`${API_URL}/api/brands/`)
      .then(res => res.json())
      .then(data => setAvailableBrands(data));
  }, [])

  // 2. MANEJADORES
  const handleCloseFilters = () => {
      setIsClosing(true);
      setTimeout(() => {
          setShowMobileFilters(false);
          setIsClosing(false);
      }, 300);
  };

  const handleBrandChange = (brand) => {
    const newParams = new URLSearchParams(searchParams);
    if (selectedBrands.includes(brand)) {
        const keptBrands = selectedBrands.filter(b => b !== brand);
        newParams.delete('brand');
        keptBrands.forEach(b => newParams.append('brand', b));
    } else {
        newParams.append('brand', brand);
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (orderType) => {
    const newParams = new URLSearchParams(searchParams);
    if (orderType === ordering) { newParams.delete('ordering'); } 
    else { newParams.set('ordering', orderType); }
    setSearchParams(newParams);
    handleCloseFilters(); 
  }

  const handleCategoryClick = (id) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryId == id) { newParams.delete('category'); } 
    else { newParams.set('category', id); newParams.delete('search'); }
    setSearchParams(newParams);
  }

  const handleReset = () => { 
      setSearchParams({});
      handleCloseFilters();
  }

  // 3. CARGA DE PRODUCTOS
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (categoryId) params.append('category', categoryId);
    if (ordering) params.append('ordering', ordering); 
    selectedBrands.forEach(brand => params.append('brand', brand));

    fetch(`${API_URL}/api/products/?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
      .catch(err => {
          console.error("Error conectando:", err);
          setLoading(false);
      });
  }, [searchParams]) 

  const calculateDiscount = (original, current) => {
      if (!original || !current) return 0;
      const discount = ((original - current) / original) * 100;
      return Math.round(discount);
  };

  const getLabelStyle = (code) => {
    switch(code) {
        case 'BF': return 'bg-black text-white';
        case 'OF': return 'bg-[#e3002b] text-white';
        case 'NW': return 'bg-[#0071e3] text-white';
        case 'LQ': return 'bg-orange-500 text-white';
        default: return 'hidden';
    }
  };

  // Variable auxiliar para el nombre de la categoría
  const currentCategoryName = categoryId && categories.length > 0 
    ? categories.find(c => c.id == categoryId)?.name 
    : null;

  // --- CONTENIDO DEL MODAL MÓVIL ---
  const MobileFilterContent = () => (
     <div className="space-y-6">
        <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Ordenar por
            </h3>
            <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${ordering === 'min_price' ? 'border-[#0071e3] bg-blue-50/50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${ordering === 'min_price' ? 'bg-[#0071e3] text-white' : 'bg-gray-100 text-gray-400'}`}>
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 17l-4 4m0 0l-4-4m4 4V3"/></svg>
                        </div>
                        <span className={`text-sm ${ordering === 'min_price' ? 'font-bold text-[#0071e3]' : 'text-gray-700 font-medium'}`}>Menor precio</span>
                    </div>
                    <input type="radio" name="price_sort" className="hidden" checked={ordering === 'min_price'} onChange={() => handleSortChange('min_price')} />
                    {ordering === 'min_price' && <div className="w-2.5 h-2.5 rounded-full bg-[#0071e3]"></div>}
                </label>

                <label className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${ordering === 'max_price' ? 'border-[#0071e3] bg-blue-50/50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${ordering === 'max_price' ? 'bg-[#0071e3] text-white' : 'bg-gray-100 text-gray-400'}`}>
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7l4-4m0 0l4 4m-4-4v18"/></svg>
                        </div>
                        <span className={`text-sm ${ordering === 'max_price' ? 'font-bold text-[#0071e3]' : 'text-gray-700 font-medium'}`}>Mayor precio</span>
                    </div>
                    <input type="radio" name="price_sort" className="hidden" checked={ordering === 'max_price'} onChange={() => handleSortChange('max_price')} />
                    {ordering === 'max_price' && <div className="w-2.5 h-2.5 rounded-full bg-[#0071e3]"></div>}
                </label>
            </div>
        </div>
     </div>
  );

  // --- CONTENIDO ESCRITORIO ---
  const DesktopFilterContent = () => (
    <>
        <div className="mb-6">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 pb-2 border-b border-gray-100">
                Categorías
            </h3>
            <ul className="space-y-1">
                {categories.map((cat) => {
                    const isActive = categoryId == cat.id;
                    return (
                        <li key={cat.id}>
                            <button 
                                onClick={() => handleCategoryClick(cat.id)} 
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex justify-between items-center group
                                    ${isActive 
                                        ? 'bg-blue-50 font-bold text-[#0071e3]' 
                                        : 'text-gray-600 hover:text-black hover:bg-gray-50'
                                    }`}
                            >
                                {cat.name}
                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#0071e3]"></div>}
                            </button>
                        </li>
                    )
                })}
            </ul>
        </div>
        <MobileFilterContent />
    </>
  );

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans selection:bg-blue-100">
      <Navbar />

      {/* CORRECCIÓN DE ALTURA:
         pt-36 (aprox 144px) en móvil asegura que el contenido empiece DEBAJO de tu Navbar fija.
         Si tus productos salen "muy abajo", prueba cambiar pt-36 a pt-32.
      */}
      <div className="pt-40 lg:pt-40 max-w-[1400px] mx-auto px-4 pb-20">
        
        {/* =========================================================
            BARRA DE HERRAMIENTAS MÓVIL (CORREGIDA)
            ========================================================= */}
        {/* AQUÍ ESTÁ LA SOLUCIÓN: top-[135px]
           Esto le dice al filtro que se pegue a 135px del techo, que es (más o menos)
           donde termina tu menú de categorías.
           Z-40 para asegurarnos que flote por encima de productos pero debajo de modales.
        */}
        <div className="lg:hidden sticky top-[157px] z-30 bg-[#F9F9F9]/95 backdrop-blur-md -mx-4 px-4 py-2 mb-2 flex justify-between items-center border-b border-gray-200/50 shadow-sm transition-all">
            
            {/* BOTÓN IZQUIERDA: Outline limpio */}
            <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 bg-white border border-gray-300 shadow-sm rounded-full px-4 py-1.5 text-sm font-bold text-gray-700 active:bg-gray-50 transition-colors"
            >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                Filtros
                {(ordering) && <div className="w-2 h-2 bg-[#0071e3] rounded-full"></div>}
            </button>

            {/* TEXTO DERECHA: Cantidad de resultados */}
            <span className="text-xs font-semibold text-gray-400">
                {products.length} resultados
            </span>
        </div>

{/* =========================================================
            MODAL "BOTTOM SHEET"
            ========================================================= */}
        {showMobileFilters && (
            <div className="fixed inset-0 z-[60] flex justify-center items-end lg:hidden">
                {/* Overlay */}
                <div 
                    className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`} 
                    onClick={handleCloseFilters}
                ></div>
                
                {/* Panel Blanco */}
                <div 
                    className={`relative w-full bg-white rounded-t-[24px] shadow-2xl p-6 pb-10 overflow-hidden transform transition-transform duration-300 cubic-bezier(0.32, 0.72, 0, 1) ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}
                >
                    <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-6 opacity-50"></div>

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
                        {/* Pequeño botón de texto arriba a la derecha (Opcional) */}
                        {(ordering || categoryId || searchQuery) && (
                            <button onClick={handleReset} className="text-sm font-semibold text-[#0071e3] hover:underline">
                                Restablecer
                            </button>
                        )}
                    </div>
                    
                    <MobileFilterContent />

                    {/* --- AQUÍ AGREGAMOS EL BOTÓN DE BORRAR FILTROS GRANDE --- */}
                    <div className="mt-8 space-y-3">
                        {(ordering || categoryId || searchQuery) && (
                            <button 
                                onClick={handleReset}
                                className="w-full py-3.5 border border-gray-200 text-gray-700 font-bold rounded-xl active:scale-[0.98] transition-transform hover:bg-gray-50 flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                Borrar filtros
                            </button>
                        )}

                        <button 
                            onClick={handleCloseFilters} 
                            className="w-full py-3.5 bg-black text-white font-bold rounded-xl active:scale-[0.98] transition-transform shadow-lg"
                        >
                            Ver {products.length} resultados
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            <aside className="hidden lg:block w-60 flex-shrink-0 sticky top-28 self-start bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <DesktopFilterContent />
            </aside>

            {/* --- GRID DE PRODUCTOS --- */}
            <main className="flex-1">
                {/* Header Escritorio */}
                <div className="hidden lg:flex bg-white p-4 rounded-xl shadow-sm mb-6 justify-between items-center border border-gray-100">
                    <h1 className="text-xl font-bold text-gray-800">
                        {categoryId && categories.find(c => c.id == categoryId)?.name || "Todos los productos"}
                    </h1>
                    <span className="text-xs font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-600">{products.length} Items</span>
                </div>
                
                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0071e3]"></div></div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-500 mb-2">No hay productos que coincidan.</p>
                        <button onClick={handleReset} className="text-[#0071e3] font-bold underline">Ver todo</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
                        {products.map((product) => (
                        <Link 
                            to={`/product/${product.id}`} 
                            key={product.id} 
                            className="bg-white rounded-lg shadow-sm hover:shadow-xl transition-all p-2 md:p-4 relative group border border-transparent hover:border-gray-200"
                        >
                            {product.label && product.label !== 'NONE' && (
                                <span className={`absolute top-2 left-2 text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded z-10 ${getLabelStyle(product.label)}`}>
                                    {product.label_display || product.label}
                                </span>
                            )}

                            <div className="aspect-square bg-gray-100 mb-2 md:mb-4 overflow-hidden rounded-md">
                                <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"/>
                            </div>

                            <div>
                                <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase mb-1">{product.brand}</p>
                                <h3 className="text-xs md:text-sm text-gray-800 font-medium leading-tight mb-2 h-8 md:h-10 overflow-hidden line-clamp-2">{product.name}</h3>
                                
                                <div className="flex items-center gap-2">
                                    <span className="text-sm md:text-lg font-bold text-gray-900">S/ {product.price}</span>
                                    {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                                        <span className="text-[9px] md:text-xs font-bold text-red-600 bg-red-50 px-1 rounded">
                                            -{calculateDiscount(product.original_price, product.price)}%
                                        </span>
                                    )}
                                </div>

                                <div className="mt-2 flex items-center gap-1">
                                    <span className="text-green-600 text-[9px] md:text-xs font-bold bg-green-50 px-1 md:px-2 py-0.5 rounded border border-green-100">
                                        Llega mañana
                                    </span>
                                </div>
                            </div>
                        </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
      </div>
    </div>
  )
}

export default Catalog;