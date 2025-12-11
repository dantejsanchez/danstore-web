import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import { API_URL, getImageUrl } from './config'; // <--- 1. IMPORTANTE: Usamos tu config para que funcione en Local y Nube

function Home() {
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [secondaryProducts, setSecondaryProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // 2. USAMOS API_URL EN LUGAR DE LA URL FIJA
    // Cargar Productos
    fetch(`${API_URL}/api/products/`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
            setFeaturedProduct(data[0]); 
            setSecondaryProducts(data.slice(1)); 
        }
      })
      .catch(err => console.error("Error productos:", err));

    // Cargar Categorías
    fetch(`${API_URL}/api/categories/`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Error categorías:", err));
  }, []);

  // 3. HELPER PARA COLORES DE ETIQUETAS (Estilo Apple limpio)
  const getLabelStyle = (code) => {
    switch(code) {
        case 'BF': return 'bg-black text-white';        // Black Friday
        case 'OF': return 'bg-[#e3002b] text-white';    // Oferta (Rojo)
        case 'NW': return 'bg-[#0071e3] text-white';    // Nuevo (Azul)
        case 'LIQ': return 'bg-orange-500 text-white';  // Liquidación
        default: return 'hidden';
    }
  };

  // Nota: Ya no necesitamos la función getImageUrl aquí dentro porque la importamos de config.js

  return (
    <div className="font-sans bg-white">
      
      <Navbar />

      <div className="pt-16">

        {/* --- BARRA DE CATEGORÍAS (INTACTA) --- */}
        <div className="bg-white border-b border-gray-200 w-full h-[48px] flex justify-center items-center sticky top-16 z-40 transition-all duration-300">
            <div className="max-w-5xl px-4 flex items-center justify-center gap-10 overflow-x-auto no-scrollbar">
                
                <Link to="/catalogo" className="hover:opacity-60 transition-opacity flex-shrink-0">
                    <svg className="w-4 h-4 fill-current text-[#1d1d1f]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"/>
                    </svg>
                </Link>

                <div className="flex gap-8 items-center">
                    {categories.length > 0 ? (
                        categories.map((cat) => (
                            <Link 
                                key={cat.id} 
                                to={`/catalogo?category=${cat.id}`} 
                                className="text-[12px] text-[#1d1d1f] hover:text-[#0071e3] transition-colors whitespace-nowrap font-normal tracking-wide"
                            >
                                {cat.name}
                            </Link>
                        ))
                    ) : (
                        <span className="text-[12px] text-gray-400">Cargando...</span>
                    )}
                </div>

                <div className="flex gap-6 items-center pl-4 border-l border-gray-200 h-4">
                    <Link to="/catalogo" className="hover:opacity-60 transition-opacity">
                        <svg className="w-3.5 h-3.5 text-[#1d1d1f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </Link>
                    <Link to="/cart" className="hover:opacity-60 transition-opacity">
                        <svg className="w-3.5 h-3.5 text-[#1d1d1f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                    </Link>
                </div>
            </div>
        </div>

        {/* --- HERO SECTION (Producto Principal) --- */}
        {featuredProduct && (
        <section className="bg-[#f5f5f7] pt-14 pb-16 text-center border-b border-gray-100 relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 flex flex-col items-center relative z-10">
               
               {/* 4. ETIQUETA EN EL HERO (Discreta, arriba del título) */}
               {featuredProduct.label && featuredProduct.label !== 'NONE' && (
                   <span className={`mb-4 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide ${getLabelStyle(featuredProduct.label)}`}>
                       {featuredProduct.label_display || featuredProduct.label}
                   </span>
               )}

               <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-[#1d1d1f] mb-2">
                  {featuredProduct.name}
               </h1>
               
               <p className="text-xl md:text-2xl text-[#1d1d1f] font-normal mb-8 max-w-2xl">
                  {featuredProduct.brand || 'Potencia y belleza.'}
               </p>

               {/* BOTONES HERO */}
               <div className="flex items-center gap-4 mb-14">
                  <Link 
                      to={`/catalogo?category=${featuredProduct.category}`} 
                      className="bg-[#0071e3] text-white px-6 py-2 rounded-full font-normal text-[17px] hover:bg-[#0077ED] transition-colors"
                  >
                      Más información
                  </Link>
                  <Link 
                      to={`/product/${featuredProduct.id}`} 
                      className="text-[#0071e3] bg-transparent border border-[#0071e3] px-6 py-2 rounded-full font-normal text-[17px] hover:bg-[#0071e3] hover:text-white transition-colors"
                  >
                      Comprar
                  </Link>
               </div>

               <div className="w-full max-w-4xl transform hover:scale-[1.01] transition-transform duration-700">
                  <img 
                      src={getImageUrl(featuredProduct.image)}
                      alt={featuredProduct.name} 
                      className="w-full h-auto object-contain max-h-[500px]"
                  />
               </div>
            </div>
        </section>
        )}

        {/* --- GRID SECTION (Productos Secundarios) --- */}
        {secondaryProducts.length > 0 && (
        <section className="bg-white p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {secondaryProducts.map((prod, index) => {
                   const isDark = index % 2 === 0; 
                   const bgColor = isDark ? 'bg-white p-3' : 'bg-[#fbfbfd]';
                   const textColor = 'text-[#1d1d1f]';

                   return (
                   <div key={prod.id} className={`${bgColor} ${textColor} relative h-[650px] flex flex-col items-center pt-14 text-center overflow-hidden group`}>
                      
                      {/* 5. ETIQUETA EN EL GRID (Flotante) */}
                      {prod.label && prod.label !== 'NONE' && (
                          <div className="absolute top-6 left-6 z-20">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase ${getLabelStyle(prod.label)}`}>
                                  {prod.label_display || prod.label}
                              </span>
                          </div>
                      )}

                      <div className="relative z-10 px-4 flex flex-col items-center w-full">
                          <h2 className="text-4xl md:text-5xl font-semibold mb-3 tracking-tight">{prod.brand}</h2>
                          <p className="text-xl font-normal mb-8">{prod.name}</p>
                          
                          <div className="flex gap-4 justify-center">
                              <Link 
                                to={`/catalogo?category=${prod.category}`} 
                                className="bg-[#0071e3] text-white px-5 py-2 rounded-full font-normal text-[15px] hover:bg-[#0077ED] transition-colors min-w-[140px]"
                              >
                                Más información
                              </Link>

                              <Link 
                                to={`/product/${prod.id}`} 
                                className="text-[#0071e3] bg-transparent border border-[#0071e3] px-5 py-2 rounded-full font-normal text-[15px] hover:bg-[#0071e3] hover:text-white transition-colors min-w-[100px]"
                              >
                                Comprar
                              </Link>
                          </div>
                      </div>

                      <img 
                          src={getImageUrl(prod.image)}
                          alt={prod.name}
                          className="absolute bottom-0 w-full max-w-[480px] object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                   </div>
                   )
                })}
            </div>
        </section>
        )}
      
      </div>
    </div>
  );
}

export default Home;