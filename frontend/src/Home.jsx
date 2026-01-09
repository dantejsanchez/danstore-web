import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import { API_URL, getImageUrl } from './config';

function Home() {
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [secondaryProducts, setSecondaryProducts] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/products/`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
            setFeaturedProduct(data[0]); 
            setSecondaryProducts(data.slice(1)); 
        }
      })
      .catch(err => console.error("Error productos:", err));
  }, []);

  const getLabelStyle = (code) => {
    switch(code) {
        case 'BF': return 'bg-black text-white';        
        case 'OF': return 'bg-[#e3002b] text-white';    
        case 'NW': return 'bg-[#0071e3] text-white';    
        case 'LIQ': return 'bg-orange-500 text-white';  
        default: return 'hidden';
    }
  };

  return (
    <div className="font-sans bg-white">
      
      <Navbar />

      {/* ESPACIO SUPERIOR (PADDING) AJUSTADO:
         - Mobile: 160px (Para cubrir Navbar + Buscador + Categorías)
         - PC: 112px (Para cubrir Navbar + Categorías)
      */}
      <div className="pt-[160px] md:pt-[112px]">

        {/* NOTA: He eliminado el <div> de categorías de aquí porque ya está en el Navbar */}

        {/* --- HERO SECTION --- */}
        {featuredProduct && (
        <section className="bg-[#f5f5f7] pt-10 pb-16 text-center border-b border-gray-100 relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 flex flex-col items-center relative z-10">
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
               <div className="flex items-center gap-4 mb-14">
                  <Link to={`/catalogo?category=${featuredProduct.category}`} className="bg-[#0071e3] text-white px-6 py-2 rounded-full font-normal text-[17px] hover:bg-[#0077ED] transition-colors">Más información</Link>
                  <Link to={`/product/${featuredProduct.id}`} className="text-[#0071e3] bg-transparent border border-[#0071e3] px-6 py-2 rounded-full font-normal text-[17px] hover:bg-[#0071e3] hover:text-white transition-colors">Comprar</Link>
               </div>
               <div className="w-full max-w-4xl transform hover:scale-[1.01] transition-transform duration-700">
                  <img src={getImageUrl(featuredProduct.image)} alt={featuredProduct.name} className="w-full h-auto object-contain max-h-[500px]"/>
               </div>
            </div>
        </section>
        )}

        {/* --- GRID SECTION --- */}
        {secondaryProducts.length > 0 && (
        <section className="bg-white p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {secondaryProducts.map((prod, index) => {
                   const isDark = index % 2 === 0; 
                   const bgColor = isDark ? 'bg-white p-3' : 'bg-[#fbfbfd]';
                   const textColor = 'text-[#1d1d1f]';

                   return (
                   <div key={prod.id} className={`${bgColor} ${textColor} relative h-[650px] flex flex-col items-center pt-14 text-center overflow-hidden group`}>
                      {prod.label && prod.label !== 'NONE' && (
                          <div className="absolute top-6 left-6 z-20">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase ${getLabelStyle(prod.label)}`}>{prod.label_display || prod.label}</span>
                          </div>
                      )}
                      <div className="relative z-10 px-4 flex flex-col items-center w-full">
                          <h2 className="text-4xl md:text-5xl font-semibold mb-3 tracking-tight">{prod.brand}</h2>
                          <p className="text-xl font-normal mb-8">{prod.name}</p>
                          <div className="flex gap-4 justify-center">
                              <Link to={`/catalogo?category=${prod.category}`} className="bg-[#0071e3] text-white px-5 py-2 rounded-full font-normal text-[15px] hover:bg-[#0077ED] transition-colors min-w-[140px]">Más información</Link>
                              <Link to={`/product/${prod.id}`} className="text-[#0071e3] bg-transparent border border-[#0071e3] px-5 py-2 rounded-full font-normal text-[15px] hover:bg-[#0071e3] hover:text-white transition-colors min-w-[100px]">Comprar</Link>
                          </div>
                      </div>
                      <img src={getImageUrl(prod.image)} alt={prod.name} className="absolute bottom-0 w-full max-w-[480px] object-contain transition-transform duration-700 ease-out group-hover:scale-105"/>
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