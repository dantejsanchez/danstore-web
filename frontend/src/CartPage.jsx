import { useState, useEffect } from 'react';
import { useCart } from './context/CartContext'; 
import Navbar from './components/Navbar';
import { Link } from 'react-router-dom';
import { API_URL, getImageUrl } from './config'; 

// --- COMPONENTE RESUMEN (EXTERNO) ---
const OrderSummaryContent = ({ 
    cart, total, finalTotal, discountAmount, formatCurrency, 
    couponCode, setCouponCode, handleApplyCoupon, couponMessage, 
    missingForFreeShipping, isMobile 
}) => {
    return (
        <div className={`${isMobile ? 'pb-4' : 'bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100'}`}>
            {!isMobile && <h3 className="text-lg font-bold text-gray-900 mb-5">Resumen del pedido</h3>}
            
            {/* INPUT DE CUPÓN */}
            <div className="mb-6">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Código de descuento</p>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Ej. DANSHOP10" 
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0071e3] focus:bg-white transition-all uppercase placeholder:normal-case"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button 
                        onClick={handleApplyCoupon}
                        disabled={cart.length === 0} // Deshabilitar si vacío
                        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-gray-200 ${cart.length === 0 ? 'bg-gray-200 text-gray-400' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                    >
                        Aplicar
                    </button>
                </div>
                {couponMessage.text && (
                    <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                        {couponMessage.type === 'success' ? '✔' : '✖'} {couponMessage.text}
                    </p>
                )}
            </div>

            {/* LISTA DE MONTOS */}
            <div className="space-y-3 text-sm mb-2 text-gray-600 border-t border-gray-50 pt-4">
                <div className="flex justify-between">
                    <span>Subtotal ({cart.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                    <span>{formatCurrency(total)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                    <span>Costo de envío</span>
                    {cart.length > 0 && missingForFreeShipping <= 0 ? (
                        <span className="text-green-700 font-bold text-[10px] bg-green-100 px-2 py-0.5 rounded-full">GRATIS</span>
                    ) : (
                        <span className="text-gray-400 text-xs italic">Por calcular</span>
                    )}
                </div>

                {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                        <span>Descuento aplicado</span>
                        <span>- {formatCurrency(discountAmount)}</span>
                    </div>
                )}
            </div>

            {/* Separador solo si no es móvil (en móvil el total está en la barra fija) */}
            {!isMobile && (
                <div className="flex justify-between items-center border-t border-gray-100 pt-5 mb-6">
                    <div className="flex flex-col">
                        <span className="text-base font-bold text-gray-900">Total a Pagar</span>
                        <span className="text-[10px] text-gray-400">Incluye impuestos</span>
                    </div>
                    <span className="text-2xl font-bold text-[#0071e3] tracking-tight">{formatCurrency(finalTotal)}</span>
                </div>
            )}
        </div>
    );
};

function CartPage() {
  const { cart, removeFromCart, updateQuantity, addToCart, total } = useCart();
  
  // ESTADOS
  const [currentStep, setCurrentStep] = useState(1); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // LÓGICA DE CUPONES
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState({ type: '', text: '' });

  // DATOS FORMULARIO
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', dni: '', 
    city: '', address: '', reference: '' 
  });

  const FREE_SHIPPING_THRESHOLD = 100; 

  // EFECTOS
  useEffect(() => {
    fetch(`${API_URL}/api/products/`)
      .then(res => res.json())
      .then(data => {
        const cartIds = cart.map(item => item.id);
        const filtered = data.filter(p => !cartIds.includes(p.id));
        setSuggestedProducts(filtered.slice(0, 4));
      })
      .catch(console.error);
  }, [cart]); 

  useEffect(() => {
     if(cart.length === 0) {
         setDiscountAmount(0); setCouponCode(''); setCouponMessage({ type: '', text: '' });
         if (currentStep !== 1) setCurrentStep(1); // Si vacían el carro en paso 2, volver a paso 1
     }
  }, [cart]);

  // FUNCIONES
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    return (
        formData.name.length > 2 && formData.email.includes('@') &&     
        formData.phone.length >= 6 && formData.dni.length >= 8 &&         
        formData.city.length > 2 && formData.address.length > 4         
    );
  };

  const handleApplyCoupon = () => {
      const code = couponCode.trim().toUpperCase();
      if (code === 'DANSHOP10') {
          const discountValue = total * 0.10; 
          setDiscountAmount(discountValue);
          setCouponMessage({ type: 'success', text: '¡10% OFF aplicado!' });
      } else {
          setDiscountAmount(0);
          setCouponMessage({ type: 'error', text: 'Cupón no válido' });
      }
  };

  const handlePayment = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    const finalOrderData = { 
        items: cart, 
        payer: formData,
        details: { subtotal: total, discount: discountAmount, final_total: total - discountAmount }
    };
    try {
      const response = await fetch(`${API_URL}/api/create_preference/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalOrderData),
      });
      const data = await response.json();
      if (data.init_point) window.location.href = data.init_point; 
      else { alert("Error al generar el pago."); setIsProcessing(false); }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
      setIsProcessing(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(val);
  const missingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const shippingProgress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const finalTotal = Math.max(0, total - discountAmount);

  // Props compartidas
  const summaryProps = {
      cart, total, finalTotal, discountAmount, formatCurrency,
      couponCode, setCouponCode, handleApplyCoupon, couponMessage, missingForFreeShipping
  };

  return (
    <div className="font-sans bg-[#F5F5F7] min-h-screen pb-32 lg:pb-10">
      <Navbar />

      <div className="pt-24 md:pt-32 max-w-[1200px] mx-auto px-4 sm:px-6">
        
        {/* INDICADOR DE PASOS (Siempre visible) */}
        <div className="mb-6 md:mb-10 max-w-sm mx-auto px-4">
            <div className="flex justify-between text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                <span className={currentStep >= 1 ? "text-[#0071e3]" : ""}>Carrito</span>
                <span className={currentStep >= 2 ? "text-[#0071e3]" : ""}>Entrega</span>
                <span className={currentStep >= 3 ? "text-[#0071e3]" : ""}>Pago</span>
            </div>
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#0071e3] transition-all duration-500 shadow-[0_0_10px_rgba(0,113,227,0.4)]" style={{ width: currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%' }}></div>
            </div>
        </div>

        {/* ESTRUCTURA PRINCIPAL (Siempre visible, incluso vacía) */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
            
          {/* ================= ZONA IZQUIERDA (LISTA) ================= */}
          <div className="w-full lg:flex-1 space-y-5">
              
              {currentStep === 1 && (
                <div className="animate-fade-in space-y-5">
                  
                  {/* BARRA ENVÍO GRATIS (Solo si hay items) */}
                  {cart.length > 0 && (
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                        {missingForFreeShipping > 0 ? (
                            <div className="flex flex-col gap-2">
                                <p className="text-sm text-gray-600 flex justify-between">
                                    <span>Faltan <span className="font-bold text-[#0071e3]">{formatCurrency(missingForFreeShipping)}</span> para envío gratis</span>
                                    <span className="font-bold text-xs text-[#0071e3]">{Math.round(shippingProgress)}%</span>
                                </p>
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <div className="bg-[#0071e3] h-1.5 rounded-full transition-all duration-1000" style={{ width: `${shippingProgress}%` }}></div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm font-bold text-green-700">
                                <span className="bg-green-100 p-1 rounded-full text-green-600">✔</span> ¡Envío GRATIS activado!
                            </div>
                        )}
                    </div>
                  )}

                  {/* LISTA PRODUCTOS (O MENSAJE VACÍO) */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        {cart.length > 0 ? (
                            <>
                                <div className="hidden md:flex bg-gray-50 px-6 py-3 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <span className="flex-grow">Producto</span>
                                    <span className="w-32 text-center">Cantidad</span>
                                    <span className="w-24 text-right">Total</span>
                                </div>
                                <div className="divide-y divide-gray-50">
                                {cart.map((item) => (
                                    <div key={item.id} className="p-4 flex gap-4 hover:bg-gray-50/50 transition-colors">
                                        <div className="w-20 h-20 md:w-24 md:h-24 bg-[#F5F5F7] rounded-lg shrink-0 flex items-center justify-center p-1 border border-gray-100">
                                            <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-contain mix-blend-multiply"/>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 text-sm md:text-base leading-tight line-clamp-2">{item.name}</h3>
                                                    <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wide mt-1">{item.brand || 'DanShop'}</p>
                                                </div>
                                                <p className="font-bold text-gray-900 text-sm md:text-base">{formatCurrency(parseFloat(item.price) * item.quantity)}</p>
                                            </div>
                                            <div className="flex justify-between items-end mt-2">
                                                <div className="flex items-center bg-white border border-gray-200 rounded-md h-7 shadow-sm">
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 text-xs">-</button>
                                                    <span className="w-8 text-center text-xs font-semibold text-gray-900">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 text-xs">+</button>
                                                </div>
                                                <button onClick={() => removeFromCart(item.id)} className="text-[10px] font-medium text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded">Quitar</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </>
                        ) : (
                            <div className="p-8 text-center flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                    <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                </div>
                                <p className="text-gray-900 font-bold">Tu bolsa está vacía</p>
                                <p className="text-gray-500 text-sm mt-1">¡Agrega algunos productos de abajo!</p>
                            </div>
                        )}
                  </div>

                  {/* UPSELL MÓVIL (SIEMPRE VISIBLE PARA AGREGAR PRODUCTOS) */}
                  {suggestedProducts.length > 0 && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-3 px-1">
                             <h3 className="font-bold text-gray-900 text-sm">
                                 {cart.length === 0 ? 'Empieza agregando esto:' : 'Completa tu pack'}
                             </h3>
                        </div>
                        <div className="flex overflow-x-auto pb-4 gap-3 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 no-scrollbar snap-x">
                            {suggestedProducts.map(prod => (
                                <div key={prod.id} className="min-w-[130px] w-[130px] md:w-auto snap-center bg-white p-3 rounded-xl border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all">
                                    <div className="mb-2">
                                        <div className="h-24 bg-gray-50 rounded-lg mb-2 p-2 flex items-center justify-center">
                                            <img src={getImageUrl(prod.image)} className="h-full object-contain mix-blend-multiply"/>
                                        </div>
                                        <h4 className="text-xs font-semibold text-gray-900 leading-tight mb-1 truncate">{prod.name}</h4>
                                        <p className="text-[#0071e3] font-bold text-xs">{formatCurrency(prod.price)}</p>
                                    </div>
                                    <button onClick={() => addToCart(prod)} className="w-full py-1.5 rounded-lg border border-gray-200 text-[10px] font-bold text-gray-600 hover:bg-[#0071e3] hover:text-white hover:border-[#0071e3] transition-all uppercase">Agregar</button>
                                </div>
                            ))}
                        </div>
                    </div>
                  )}
                </div>
              )}

              {/* PASO 2: FORMULARIO */}
              {currentStep === 2 && (
                <div className="animate-fade-in-right bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span className="bg-[#0071e3] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                        Datos de Envío
                    </h2>
                    <div className="space-y-4">
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="input-modern" placeholder="Nombre completo" />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" name="dni" value={formData.dni} onChange={handleInputChange} className="input-modern" placeholder="DNI" maxLength={11} />
                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="input-modern" placeholder="Celular" />
                        </div>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-modern" placeholder="Correo" />
                        <div className="grid grid-cols-3 gap-4">
                            <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="input-modern col-span-1" placeholder="Ciudad" />
                            <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="input-modern col-span-2" placeholder="Dirección" />
                        </div>
                    </div>
                </div>
              )}
          </div>

          {/* ================= ZONA DERECHA (DESKTOP STICKY) ================= */}
          <div className="hidden lg:block w-[360px] flex-shrink-0 sticky top-32">
             <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
                <OrderSummaryContent {...summaryProps} isMobile={false} />
                <div className="mt-6">
                    {currentStep === 1 ? (
                        <button 
                            onClick={() => setCurrentStep(2)} 
                            disabled={cart.length === 0}
                            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg flex justify-center items-center gap-2 ${cart.length === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#0071e3] text-white hover:bg-[#0060c2] shadow-blue-500/20'}`}
                        >
                            Continuar compra →
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <button onClick={handlePayment} disabled={isProcessing || !validateForm()} className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg ${isProcessing || !validateForm() ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#0071e3] text-white hover:bg-[#0060c2] shadow-blue-500/20'}`}>{isProcessing ? "Procesando..." : "Pagar Ahora"}</button>
                            <button onClick={() => setCurrentStep(1)} className="w-full py-2 text-xs text-gray-500 hover:text-[#0071e3] font-medium transition-colors">Volver al carrito</button>
                        </div>
                    )}
                </div>
             </div>
          </div>
          
          {/* ================= BARRA FLOTANTE MÓVIL (ISLA FLOTANTE) ================= */}
          
          {/* 1. SOMBRA FONDO */}
          {isDetailsOpen && (
              <div 
                  className="lg:hidden fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 backdrop-blur-sm"
                  onClick={() => setIsDetailsOpen(false)}
              ></div>
          )}

          {/* 2. PANEL DESLIZANTE */}
          <div className={`lg:hidden fixed bottom-0 left-0 w-full bg-white z-50 rounded-t-3xl transition-transform duration-300 ease-out transform ${isDetailsOpen ? 'translate-y-0' : 'translate-y-full'}`}>
               <div className="p-6 pb-32">
                   <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
                   <h3 className="text-lg font-bold text-gray-900 mb-4">Detalle del Pago</h3>
                   <OrderSummaryContent {...summaryProps} isMobile={true} />
               </div>
          </div>

          {/* 3. BARRA FIJA - FLOTANTE (ISLA) */}
          <div className="lg:hidden fixed bottom-4 left-4 right-4 w-auto bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-[60] px-5 py-4">
              
              <div className="flex justify-center -mt-8 mb-3 cursor-pointer" onClick={() => setIsDetailsOpen(!isDetailsOpen)}>
                  <div className="bg-white border border-gray-100 shadow-sm px-3 py-1 rounded-full text-[10px] font-bold text-[#0071e3] flex items-center gap-1">
                      {isDetailsOpen ? 'Ocultar detalle ˅' : 'Ver detalle ˄'}
                  </div>
              </div>

              <div className="flex gap-4 items-center">
                  <div className="flex-1 cursor-pointer flex flex-col justify-center" onClick={() => setIsDetailsOpen(!isDetailsOpen)}>
                      <p className="text-[11px] text-gray-500 font-medium mb-1">Total a pagar</p>
                      <p className="text-xl font-bold text-[#0071e3] leading-none font-sans">
                          {formatCurrency(finalTotal)}
                      </p>
                  </div>
                  
                  <div className="flex-[1.4]">
                    {currentStep === 1 ? (
                        <button 
                            onClick={() => setCurrentStep(2)} 
                            disabled={cart.length === 0}
                            className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg active:scale-[0.98] transition-all ${cart.length === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#0071e3] text-white shadow-blue-500/30'}`}
                        >
                            Continuar
                        </button>
                    ) : (
                        <button onClick={handlePayment} disabled={isProcessing || !validateForm()} className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg ${isProcessing || !validateForm() ? 'bg-gray-100 text-gray-400' : 'bg-[#0071e3] text-white shadow-blue-500/30'}`}>
                            {isProcessing ? "..." : "Pagar Ahora"}
                        </button>
                    )}
                  </div>
              </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        .input-modern {
            width: 100%;
            background-color: #F9FAFB; border: 1px solid #E5E7EB;
            border-radius: 0.5rem; padding: 0.75rem;
            font-size: 0.875rem; color: #111827; outline: none; transition: all 0.2s;
        }
        .input-modern:focus { background-color: white; border-color: #0071e3; box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.1); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>
    </div>
  );
}

export default CartPage;