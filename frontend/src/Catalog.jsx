import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from './components/Navbar' // Asegúrate que la ruta sea correcta
import { API_URL, getImageUrl } from './config';

function Catalog() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [availableBrands, setAvailableBrands] = useState([]) 
  const [loading, setLoading] = useState(true)

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
  }

  const handleCategoryClick = (id) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryId == id) { newParams.delete('category'); } 
    else { newParams.set('category', id); newParams.delete('search'); }
    setSearchParams(newParams);
  }

  const handleReset = () => { setSearchParams({}); }

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

  const ACTIVE_TEXT_COLOR = "text-[#0071e3]"; 

  // Variable auxiliar para el nombre de la categoría (Para el breadcrumb nuevo)
  const currentCategoryName = categoryId && categories.length > 0 
    ? categories.find(c => c.id == categoryId)?.name 
    : null;

  return (
    <div className="min-h-screen bg-[#F6F6F6] font-sans">
      <Navbar />

      <div className="pt-36 max-w-[1400px] mx-auto px-4 pb-20">
        
        {/* =========================================================
            BREADCRUMBS PREMIUM (NUEVO DISEÑO APPLE)
           ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-gray-200">
            
            {/* Navegación Visual */}
            <nav className="flex items-center text-sm font-medium text-gray-500 space-x-2">
                {/* Home */}
                <Link to="/" className="hover:text-[#0071e3] transition-colors duration-200 flex items-center gap-1">
                    <svg className="w-4 h-4 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    Home
                </Link>

                {/* Separador Chevron */}
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>

                {/* Link a Catálogo */}
                <Link 
                    to="/catalogo" 
                    onClick={handleReset} 
                    className={`transition-colors duration-200 ${!currentCategoryName && !searchQuery ? 'text-black font-bold cursor-default' : 'hover:text-[#0071e3]'}`}
                >
                    Catálogo
                </Link>

                {/* Categoría Dinámica */}
                {currentCategoryName && (
                    <>
                        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                        <span className="text-black font-bold animate-fade-in uppercase tracking-wide">
                            {currentCategoryName}
                        </span>
                    </>
                )}

                {/* Búsqueda Dinámica */}
                {!currentCategoryName && searchQuery && (
                    <>
                        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                        <span className="text-black font-bold animate-fade-in">"{searchQuery}"</span>
                    </>
                )}
            </nav>

            {/* Botón de Limpiar Estilizado */}
            {(searchQuery || categoryId || ordering) && (
                 <button 
                    onClick={handleReset} 
                    className="mt-3 sm:mt-0 text-xs font-bold text-[#0071e3] bg-white hover:bg-blue-50 px-4 py-2 rounded-full transition-all flex items-center gap-2 group border border-gray-200 shadow-sm"
                 >
                    <svg className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    Limpiar filtros
                 </button>
            )}
        </div>
        {/* ========================================================= */}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* SIDEBAR (TU CÓDIGO ORIGINAL INTACTO) */}
            <aside className="w-full lg:w-60 flex-shrink-0 sticky top-28 self-start bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                
                {/* 1. Explorar */}
                <div className="mb-5">
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-2">
                        Explorar
                    </h3>
                    <ul className="space-y-0.5">
                        {categories.map((cat) => {
                            const isActive = categoryId == cat.id;
                            return (
                                <li key={cat.id}>
                                    <button 
                                        onClick={() => handleCategoryClick(cat.id)} 
                                        className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-all duration-200 flex justify-between items-center group
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

                {/* 2. Marcas */}
                <div className="bg-white p-5 rounded-lg shadow-sm mb-4 border border-gray-100 hidden"> 
                   <h3 className="font-bold text-gray-900 mb-3 text-lg">Servicios</h3>
                   {/* ... lógica de marcas original ... */}
                </div>

                {/* 3. Ordenar */}
                <div>
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-2">
                        Ordenar
                    </h3>
                    <div className="space-y-1">
                        <label className={`flex items-center gap-2 cursor-pointer p-1.5 rounded-md transition-colors ${ordering === 'min_price' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${ordering === 'min_price' ? 'border-[#0071e3]' : 'border-gray-300'}`}>
                                {ordering === 'min_price' && <div className="w-1.5 h-1.5 rounded-full bg-[#0071e3]"></div>}
                            </div>
                            <input type="radio" name="price_sort" className="hidden" checked={ordering === 'min_price'} onChange={() => handleSortChange('min_price')} />
                            <span className={`text-sm ${ordering === 'min_price' ? 'font-bold text-black' : 'text-gray-600'}`}>Menor precio</span>
                        </label>

                        <label className={`flex items-center gap-2 cursor-pointer p-1.5 rounded-md transition-colors ${ordering === 'max_price' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${ordering === 'max_price' ? 'border-[#0071e3]' : 'border-gray-300'}`}>
                                {ordering === 'max_price' && <div className="w-1.5 h-1.5 rounded-full bg-[#0071e3]"></div>}
                            </div>
                            <input type="radio" name="price_sort" className="hidden" checked={ordering === 'max_price'} onChange={() => handleSortChange('max_price')} />
                            <span className={`text-sm ${ordering === 'max_price' ? 'font-bold text-black' : 'text-gray-600'}`}>Mayor precio</span>
                        </label>
                    </div>
                </div>
            </aside>

            {/* --- GRID DE PRODUCTOS (MODIFICADO A 2 COLUMNAS) --- */}
            <main className="flex-1">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex justify-between items-center border border-gray-100">
                    <h1 className="text-xl font-bold">
                        {categoryId && categories.find(c => c.id == categoryId)?.name || "Todos los productos"}
                    </h1>
                    <p className="text-sm text-gray-500">{products.length} resultados</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0071e3]"></div></div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg border border-gray-100">
                        <p className="text-gray-500 mb-2">No hay productos que coincidan.</p>
                        <button onClick={handleReset} className="text-[#0071e3] font-bold underline">Ver todo el catálogo</button>
                    </div>
                ) : (
                    /* AQUÍ ESTÁ EL CAMBIO: grid-cols-2 */
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
                        {products.map((product) => (
                        <Link 
                            to={`/product/${product.id}`} 
                            key={product.id} 
                            /* AQUÍ: Padding reducido en móvil (p-2) para que quepa bien */
                            className="bg-white rounded-lg shadow-sm hover:shadow-xl transition-all p-2 md:p-4 relative group border border-transparent hover:border-gray-200"
                        >
                            
                            {/* Etiquetas Dinámicas */}
                            {product.label && product.label !== 'NONE' && (
                                <span className={`absolute top-2 left-2 text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded z-10 ${getLabelStyle(product.label)}`}>
                                    {product.label_display || product.label}
                                </span>
                            )}

                            <div className="aspect-square bg-gray-100 mb-2 md:mb-4 overflow-hidden rounded-md">
                                <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"/>
                            </div>

                            <div>
                                <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase mb-1">{product.brand}</p>
                                <h3 className="text-xs md:text-sm text-gray-700 font-medium leading-tight mb-2 h-8 md:h-10 overflow-hidden">{product.name}</h3>
                                
                                {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                                    <div className="text-[10px] md:text-xs text-gray-400 line-through">
                                        S/ {product.original_price}
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-2">
                                    <span className="text-sm md:text-lg font-bold text-red-600">S/ {product.price}</span>
                                    {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                                        <span className="text-[9px] md:text-xs font-bold text-red-600 bg-red-100 px-1 rounded">
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