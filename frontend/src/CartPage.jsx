import { useState } from 'react';
import { useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import { Link } from 'react-router-dom';

function CartPage() {
  // Traemos las funciones, incluyendo la nueva updateQuantity
  const { cart, removeFromCart, updateQuantity, total } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  // --- LÓGICA DE MERCADO PAGO (INTACTA) ---
  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('https://danstore-backend.onrender.com/api/create_preference/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });

      const data = await response.json();

      if (data.init_point) {
        window.location.href = data.init_point; 
      } else {
        console.error("Error Mercado Pago:", data);
        alert("No se pudo generar el pago. Revisa la consola.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("Error de conexión");
      setIsProcessing(false);
    }
  };

  // Helper para imágenes
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/150';
    if (imagePath.startsWith('http')) return imagePath;
    return `https://danstore-backend.onrender.com${imagePath}`;
  };

  // Formateador de moneda S/
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
  };

  return (
    <div className="font-sans bg-[#f5f5f7] min-h-screen">
      <Navbar />

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Título */}
        <div className="flex justify-between items-baseline mb-6">
            <h1 className="text-3xl font-semibold text-[#1d1d1f]">
            Mi carrito ({cart.reduce((acc, item) => acc + item.quantity, 0)} productos)
            </h1>
        </div>

        {cart.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-200">
              <p className="text-xl text-gray-500 mb-4">Tu bolsa está vacía.</p>
              <Link to="/catalogo" className="text-[#0071e3] hover:underline font-medium">
                  Ir al catálogo
              </Link>
           </div>
        ) : (
        
        <div className="flex flex-col lg:flex-row gap-8 relative">
            
          {/* --- COLUMNA IZQUIERDA: LISTA DE PRODUCTOS --- */}
          <div className="w-full lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                      <span className="text-sm text-gray-600">Vendido por <strong>DanStore</strong></span>
                  </div>

                  <div className="p-6">
                    {cart.map((item) => (
                        <div key={item.id} className="flex flex-col md:flex-row gap-6 border-b border-gray-100 last:border-0 pb-6 mb-6 last:pb-0 last:mb-0">
                            
                            {/* IMAGEN */}
                            <div className="w-full md:w-32 h-32 flex-shrink-0 bg-gray-50 rounded-md p-2 flex items-center justify-center border border-gray-100">
                                <img 
                                    src={getImageUrl(item.image)} 
                                    alt={item.name} 
                                    className="max-w-full max-h-full object-contain mix-blend-multiply"
                                />
                            </div>

                            {/* DETALLES */}
                            <div className="flex-grow flex flex-col justify-between">
                                <div>
                                    <p className="text-[11px] font-bold text-gray-500 mb-1 uppercase">{item.brand || 'Producto'}</p>
                                    <h3 className="text-[15px] text-[#1d1d1f] font-medium leading-snug mb-3">
                                        <Link to={`/product/${item.id}`} className="hover:text-[#0071e3]">
                                            {item.name}
                                        </Link>
                                    </h3>
                                </div>
                                {/* BOTÓN ELIMINAR (Corregido) */}
                                <button 
                                    onClick={() => removeFromCart(item.id)} 
                                    className="text-[#0071e3] hover:underline text-sm font-normal text-left w-fit"
                                >
                                    Eliminar
                                </button>
                            </div>

                            {/* CANTIDAD Y PRECIO */}
                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 min-w-[140px]">
                                
                                {/* SELECTOR DE CANTIDAD (+ / -) */}
                                <div className="flex items-center border border-gray-300 rounded-[4px] h-[32px] w-[100px] bg-white">
                                    <button 
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                                        disabled={item.quantity <= 1}
                                    >
                                        −
                                    </button>
                                    <div className="flex-1 h-full flex items-center justify-center text-[#1d1d1f] font-medium border-l border-r border-gray-300 text-sm">
                                        {item.quantity}
                                    </div>
                                    <button 
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* PRECIO TOTAL DEL ITEM */}
                                <div className="text-right">
                                    <span className="text-xl font-bold text-[#1d1d1f] tracking-tight">
                                        {formatCurrency(parseFloat(item.price) * item.quantity)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                  </div>
              </div>
          </div>

          {/* --- COLUMNA DERECHA: RESUMEN --- */}
          <div className="w-full lg:w-1/3 h-fit lg:sticky lg:top-24">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-[#1d1d1f] mb-6 border-b border-gray-100 pb-4">Resumen de compra</h2>
                  
                  <div className="flex justify-between items-center mb-3 text-[#1d1d1f] text-sm">
                      <span>Subtotal</span>
                      <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-6 text-[#1d1d1f] text-sm">
                      <span>Envío</span>
                      <span className="text-green-600 font-medium">Gratis</span>
                  </div>
                  
                  <div className="flex justify-between items-end mb-6 pt-4 border-t border-gray-100">
                      <span className="text-lg font-semibold text-[#1d1d1f]">Total</span>
                      <div className="text-right">
                          <span className="block text-2xl font-bold text-[#e3002b]">
                              {formatCurrency(total)}
                          </span>
                          <span className="text-[10px] text-gray-400">Incluye IGV</span>
                      </div>
                  </div>
                  
                  <button 
                      onClick={handlePayment} 
                      disabled={isProcessing}
                      className={`w-full text-white py-3.5 rounded-lg font-semibold text-[15px] transition-all shadow-sm 
                        ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#e3002b] hover:bg-[#cc0027] hover:shadow active:scale-[0.99]'}
                      `}
                  >
                      {isProcessing ? "Procesando pago..." : "Ir a comprar"}
                  </button>
                  
                  <div className="mt-4 text-xs text-gray-400 text-center">
                      Transacción segura con Mercado Pago
                  </div>
              </div>
          </div>

        </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;