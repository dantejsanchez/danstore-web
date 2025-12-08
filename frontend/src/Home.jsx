import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from './components/Navbar'

function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [availableBrands, setAvailableBrands] = useState([]) 
  const [loading, setLoading] = useState(true)

  // LEER URL Y FILTROS
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  const categoryId = searchParams.get('category');
  
  // Capturamos el orden y las marcas/servicios
  const ordering = searchParams.get('ordering'); 
  const selectedBrands = searchParams.getAll('brand');

  // --- 1. CARGA INICIAL DE DATOS ---
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/categories/')
      .then(res => res.json())
      .then(data => setCategories(data));

    fetch('http://127.0.0.1:8000/api/brands/')
      .then(res => res.json())
      .then(data => setAvailableBrands(data));
  }, [])

  // --- 2. MANEJADORES DE CLIC (Funciones) ---
  
  // Función para manejar el clic en Servicios (Checkboxes)
  const handleBrandChange = (brand) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (selectedBrands.includes(brand)) {
        // Desmarcar: Crea una nueva lista sin la marca
        const keptBrands = selectedBrands.filter(b => b !== brand);
        newParams.delete('brand');
        keptBrands.forEach(b => newParams.append('brand', b));
    } else {
        // Marcar: Agrega la marca
        newParams.append('brand', brand);
    }
    setSearchParams(newParams);
  };

  // Función para manejar el cambio de precio (Radio Buttons)
  const handleSortChange = (orderType) => {
    const newParams = new URLSearchParams(searchParams);
    if (orderType === ordering) {
        newParams.delete('ordering'); // Si le das click al mismo, lo desactiva
    } else {
        newParams.set('ordering', orderType);
    }
    setSearchParams(newParams);
  }

  // Función para manejar el clic en Categorías
  const handleCategoryClick = (id) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryId == id) {
        newParams.delete('category'); // Si ya estaba, lo desactiva
    } else {
        newParams.set('category', id); // Setea la nueva categoría
        newParams.delete('search'); // Limpia la búsqueda de texto si cambiamos de categoría
    }
    setSearchParams(newParams);
  }

  const handleReset = () => {
    setSearchParams({}); // Borra todos los filtros de la URL
  }

  // --- 3. CARGA DE PRODUCTOS (Responde a todos los filtros) ---
  useEffect(() => {
    setLoading(true);
    
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (categoryId) params.append('category', categoryId);
    if (ordering) params.append('ordering', ordering); 
    
    selectedBrands.forEach(brand => params.append('brand', brand));

    fetch(`http://127.0.0.1:8000/api/products/?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
  }, [searchParams]) 


  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Navbar />

      <div className="pt-36 max-w-[1400px] mx-auto px-4 pb-20">
        
        {/* BREADCRUMB */}
        <div className="text-xs text-gray-500 mb-4 flex items-center gap-2">
            <span>Home</span> &gt; 
            <span className="font-bold text-black">Catálogo</span>
            {(searchQuery || categoryId || selectedBrands.length > 0 || ordering) && (
                 <button onClick={handleReset} className="ml-4 text-blue-600 hover:underline cursor-pointer">
                    Limpiar filtros
                 </button>
            )}
        </div>

        <div className="flex gap-8">
            
            {/* --- SIDEBAR IZQUIERDO (CONECTADO) --- */}
            <aside className="w-64 hidden lg:block flex-shrink-0">
                
                {/* 1. Categorías (AHORA FUNCIONAL) */}
                <div className="bg-white p-5 rounded-lg shadow-sm mb-4 border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Categorías</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        {categories.map((cat) => (
                            <li key={cat.id}>
                                <button 
                                    onClick={() => handleCategoryClick(cat.id)} // <--- CLICK A LA FUNCIÓN
                                    className={`block w-full text-left hover:text-black hover:font-bold transition ${categoryId == cat.id ? 'font-bold text-black' : ''}`}
                                >
                                    {cat.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 2. Servicios / Filtro de Marcas (AHORA FUNCIONAL) */}
                <div className="bg-white p-5 rounded-lg shadow-sm mb-4 border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Servicios</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {availableBrands.length > 0 ? availableBrands.map(brand => (
                            <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    checked={selectedBrands.includes(brand)}
                                    onChange={() => handleBrandChange(brand)} // <--- ON CHANGE A LA FUNCIÓN
                                    className="rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                                />
                                <span className={`text-sm group-hover:text-black transition ${selectedBrands.includes(brand) ? 'text-black font-bold' : 'text-gray-600'}`}>
                                    {brand}
                                </span>
                            </label>
                        )) : (
                            <p className="text-xs text-gray-400">No hay marcas registradas</p>
                        )}
                    </div>
                </div>

                 {/* 3. Precio / Ordenamiento (MANTENEMOS FUNCIONAL) */}
                 <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Precio</h3>
                    <div className="space-y-3">
                        
                        {/* Opción Menor a Mayor */}
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                                type="radio" 
                                name="price_sort"
                                checked={ordering === 'min_price'}
                                onChange={() => handleSortChange('min_price')} // <--- ON CHANGE A LA FUNCIÓN
                                className="text-black focus:ring-black cursor-pointer"
                            />
                            <span className={`text-sm group-hover:text-black transition ${ordering === 'min_price' ? 'text-black font-bold' : 'text-gray-600'}`}>
                                Menor a Mayor
                            </span>
                        </label>

                        {/* Opción Mayor a Menor */}
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                                type="radio" 
                                name="price_sort"
                                checked={ordering === 'max_price'}
                                onChange={() => handleSortChange('max_price')} // <--- ON CHANGE A LA FUNCIÓN
                                className="text-black focus:ring-black cursor-pointer"
                            />
                            <span className={`text-sm group-hover:text-black transition ${ordering === 'max_price' ? 'text-black font-bold' : 'text-gray-600'}`}>
                                Mayor a Menor
                            </span>
                        </label>
                    </div>
                </div>
            </aside>

            {/* --- GRID DE PRODUCTOS --- */}
            <main className="flex-1">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex justify-between items-center border border-gray-100">
                    <h1 className="text-xl font-bold">Todos los productos</h1>
                    <p className="text-sm text-gray-500">{products.length} resultados</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg border border-gray-100">
                        <p className="text-gray-500 mb-2">No hay productos que coincidan con los filtros.</p>
                        <button onClick={handleReset} className="text-blue-600 font-bold underline">Ver todo el catálogo</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {products.map((product) => (
                        <Link to={`/product/${product.id}`} key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-xl transition-all p-4 relative group border border-transparent hover:border-gray-200">
                            
                            {/* Sticker Oferta */}
                            <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded z-10">
                                BLACK FRIDAY
                            </span>

                            <div className="aspect-square bg-gray-100 mb-4 overflow-hidden rounded-md">
                                <img src={`http://127.0.0.1:8000${product.image}`} alt={product.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"/>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1">{product.brand}</p>
                                <h3 className="text-sm text-gray-700 font-medium leading-tight mb-2 h-10 overflow-hidden">{product.name}</h3>
                                
                                {product.original_price && (
                                    <div className="text-xs text-gray-400 line-through">
                                        S/ {product.original_price}
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-red-600">S/ {product.price}</span>
                                    {product.original_price && (
                                        <span className="text-xs font-bold text-red-600 bg-red-100 px-1 rounded">-30%</span>
                                    )}
                                </div>

                                <div className="mt-2 flex items-center gap-1">
                                    <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded border border-green-100">
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

export default Home