import { useState, useEffect } from 'react';
import { useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import { Link } from 'react-router-dom';
import { API_URL, getImageUrl } from './config'; // <--- CONEXIÓN INTELIGENTE (No borrar)

function CartPage() {
  const { cart, removeFromCart, updateQuantity, addToCart, total } = useCart();
  
  // ESTADOS DEL FLUJO
  const [currentStep, setCurrentStep] = useState(1); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  
  // DATOS DE ENTREGA
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dni: '',
    city: '',     
    address: '',  
    reference: '' 
  });

  const FREE_SHIPPING_THRESHOLD = 20;

  // =====================================================================
  // 🎨 GUÍA DE COLORES
  // Color Principal: #0071e3
  // Busca los comentarios "<--- CAMBIA EL COLOR AQUÍ"
  // =====================================================================

  useEffect(() => {
    // Usamos API_URL para que funcione en tu PC y en Render
    fetch(`${API_URL}/api/products/`)
      .then(res => res.json())
      .then(data => {
        setSuggestedProducts(data.slice(0, 3));
      })
      .catch(console.error);
  }, []); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    return (
        formData.name.length > 2 &&        
        formData.email.includes('@') &&    
        formData.phone.length >= 6 &&      
        formData.dni.length >= 8 &&        
        formData.city.length > 2 &&        
        formData.address.length > 4        
    );
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    const orderData = {
        items: cart,
        payer: formData
    };

    try {
      const response = await fetch(`${API_URL}/api/create_preference/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const data = await response.json();
      
      if (data.init_point) {
        window.location.href = data.init_point; 
      } else {
        alert("Error al generar el pago.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
      setIsProcessing(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(val);
  
  const missingForFreeShipping = FREE_SHIPPING_THRESHOLD - total;
  const shippingProgress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);

  // CLASES DE COLOR PARA LOS CÍRCULOS DE PASOS
  // 👇 CAMBIA EL COLOR AQUÍ (#0071e3)
  const activeColorClass = "bg-[#0071e3] border-[#0071e3] text-white"; 
  const inactiveColorClass = "bg-white border-gray-300 text-gray-400";

  return (
    <div className="font-sans bg-[#F5F5F7] min-h-screen pb-20">
      <Navbar />

      <div className="pt-28 max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* --- BARRA DE PASOS --- */}
        <div className="flex items-center justify-center mb-12 select-none">
            
            {/* Paso 1 */}
            <div className={`flex flex-col items-center gap-2 transition-all duration-500`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-500 ease-in-out z-10 shadow-lg
                    ${currentStep >= 1 ? `${activeColorClass} scale-110 shadow-blue-100` : inactiveColorClass}`}>
                    1
                </div>
                {/* 👇 CAMBIA EL COLOR DEL TEXTO "CARRITO" (#0071e3) */}
                <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${currentStep >= 1 ? 'text-[#0071e3]' : 'text-gray-400'}`}>Carrito</span>
            </div>
            
            {/* Línea conectora */}
            {/* 👇 CAMBIA EL COLOR DE LA LÍNEA (#0071e3) */}
            <div className={`w-12 md:w-24 h-[2px] rounded-full transition-all duration-700 -mx-2 mb-6 ${currentStep >= 2 ? 'bg-[#0071e3]' : 'bg-gray-300'}`}></div>

            {/* Paso 2 */}
            <div className={`flex flex-col items-center gap-2 transition-all duration-500`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-500 ease-in-out z-10 shadow-lg
                    ${currentStep === 2 ? `${activeColorClass} scale-110 shadow-blue-100` : currentStep > 2 ? activeColorClass : `${inactiveColorClass} scale-100`}`}>
                    2
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${currentStep >= 2 ? 'text-[#0071e3]' : 'text-gray-400'}`}>Entrega</span>
            </div>
            
            {/* Línea conectora */}
            <div className={`w-12 md:w-24 h-[2px] rounded-full transition-all duration-700 -mx-2 mb-6 ${currentStep >= 3 ? 'bg-[#0071e3]' : 'bg-gray-300'}`}></div>

            {/* Paso 3 */}
            <div className={`flex flex-col items-center gap-2 transition-all duration-500`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 border-gray-300 bg-white z-10 transition-all duration-500`}>
                    3
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Pago</span>
            </div>
        </div>

        {cart.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100 text-center px-4 animate-fade-in-up">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu bolsa está vacía</h2>
              <p className="text-gray-500 mb-6">Explora nuestra colección tecnológica.</p>
              
              {/* 👇 CAMBIA EL COLOR DEL BOTÓN "IR AL CATÁLOGO" (#0071e3) */}
              <Link to="/catalogo" className="bg-[#0071e3] text-white px-8 py-3 rounded-full font-bold hover:brightness-90 hover:shadow-lg transition-all">
                  Ir al catálogo
              </Link>
           </div>
        ) : (
        
        <div className="flex flex-col lg:flex-row gap-8">
            
          {/* IZQUIERDA */}
          <div className="w-full lg:w-2/3 space-y-6">
              
              {/* VISTA 1: LISTA CARRITO */}
              {currentStep === 1 && (
                <div className="animate-fade-in">
                  {/* Barra Envío Gratis */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                      {missingForFreeShipping > 0 ? (
                          <div>
                              <p className="text-sm text-gray-600 mb-2 flex justify-between">
                                  {/* 👇 CAMBIA EL COLOR DEL PRECIO FALTANTE (#0071e3) */}
                                  <span>Te faltan <span className="font-bold text-[#0071e3]">{formatCurrency(missingForFreeShipping)}</span> para envío gratis</span>
                                  <span className="font-bold text-xs text-gray-400">{Math.round(shippingProgress)}%</span>
                              </p>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                  {/* 👇 CAMBIA EL COLOR DE LA BARRA DE PROGRESO (#0071e3) */}
                                  <div className="bg-[#0071e3] h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${shippingProgress}%` }}></div>
                              </div>
                          </div>
                      ) : (
                          <div className="flex items-center gap-2 text-[#0071e3] font-bold bg-blue-50 p-2 rounded-lg text-sm">
                              <span>🎉 ¡Envío GRATIS aplicado!</span>
                          </div>
                      )}
                  </div>

                  {/* Productos */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                      <div className="p-6 space-y-8">
                        {cart.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row gap-4 items-center border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                                <div className="w-20 h-20 bg-gray-50 rounded-xl p-2 flex items-center justify-center border">
                                    <img src={getImageUrl(item.image)} alt={item.name} className="max-h-full max-w-full object-contain mix-blend-multiply"/>
                                </div>
                                <div className="flex-grow w-full text-center sm:text-left">
                                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{item.name}</h3>
                                    <p className="text-xs text-gray-500 uppercase mb-2">{item.brand}</p>
                                    <div className="flex items-center justify-center sm:justify-start border rounded-lg h-8 w-fit mx-auto sm:mx-0">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="w-8 h-full text-gray-500 hover:bg-gray-50 disabled:opacity-30">−</button>
                                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-full text-gray-500 hover:bg-gray-50">+</button>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 min-w-[100px]">
                                    <p className="text-lg font-bold text-gray-900">{formatCurrency(parseFloat(item.price) * item.quantity)}</p>
                                    <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 hover:underline">Eliminar</button>
                                </div>
                            </div>
                        ))}
                      </div>
                  </div>

                  {/* Upsell */}
                  {suggestedProducts.length > 0 && (
                    <div className="bg-white rounded-2xl p-5 border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 text-sm flex items-center gap-2">
                            {/* 👇 CAMBIA EL COLOR DE LA ETIQUETA "RECOMENDADO" (#0071e3) */}
                            <span className="bg-[#0071e3] text-white px-2 py-0.5 rounded text-[10px]">RECOMENDADO</span>
                            Completa tu compra
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {suggestedProducts.map(prod => (
                            <div key={prod.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col items-center text-center hover:bg-white hover:shadow-md transition-all">
                                <img src={getImageUrl(prod.image)} className="h-14 object-contain mb-2 mix-blend-multiply"/>
                                <p className="text-xs font-medium line-clamp-1 text-gray-600">{prod.name}</p>
                                <p className="text-sm font-bold my-1 text-gray-900">{formatCurrency(prod.price)}</p>
                                {/* 👇 CAMBIA EL COLOR DEL BOTÓN "AGREGAR" AL PASAR EL MOUSE (hover:bg-[#0071e3]) */}
                                <button onClick={() => addToCart(prod)} className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-full hover:bg-[#0071e3] hover:text-white hover:border-[#0071e3] transition-colors font-bold w-full">Agregar</button>
                            </div>
                            ))}
                        </div>
                    </div>
                  )}
                </div>
              )}

              {/* VISTA 2: FORMULARIO */}
              {currentStep === 2 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-right">
                    <div className="bg-[#F8FAFC] px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                        {/* 👇 CAMBIA EL COLOR DEL TÍTULO "DATOS DE ENTREGA" (#0071e3) */}
                        <h2 className="text-lg font-bold text-[#0071e3]">Datos de Entrega</h2>
                    </div>
                    
                    <div className="p-6 md:p-8 space-y-8">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">1. Contacto</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="input-custom" placeholder="Nombre completo *" />
                                <input type="text" name="dni" value={formData.dni} onChange={handleInputChange} className="input-custom" placeholder="DNI / RUC *" maxLength={11} />
                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="input-custom" placeholder="Celular *" />
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-custom" placeholder="Correo electrónico *" />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">2. Dirección</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="input-custom md:col-span-1" placeholder="Ciudad *" />
                                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="input-custom md:col-span-2" placeholder="Dirección exacta *" />
                                </div>
                                <textarea name="reference" value={formData.reference} onChange={handleInputChange} rows="2" className="input-custom resize-none" placeholder="Referencia (Opcional)"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
              )}
          </div>

          {/* DERECHA (RESUMEN) */}
          <div className="w-full lg:w-1/3 h-fit lg:sticky lg:top-28">
              <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
                  
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Resumen</h2>
                  
                  {currentStep === 2 && (
                    <div className="mb-4 max-h-32 overflow-y-auto space-y-2 pr-2 border-b border-gray-100 pb-4 scrollbar-thin">
                        {cart.map(item => (
                            <div key={item.id} className="flex justify-between text-xs items-center">
                                <div className="flex items-center gap-2">
                                    <span className="bg-gray-100 text-gray-600 font-bold px-1.5 rounded-md">{item.quantity}x</span>
                                    <span className="text-gray-600 truncate max-w-[150px]">{item.name}</span>
                                </div>
                                <span className="font-medium">{formatCurrency(parseFloat(item.price) * item.quantity)}</span>
                            </div>
                        ))}
                    </div>
                  )}

                  <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-gray-500 text-sm">
                          <span>Subtotal</span>
                          <span>{formatCurrency(total)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500 text-sm items-center">
                          <span>Envío</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${missingForFreeShipping <= 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                              {missingForFreeShipping <= 0 ? "GRATIS" : "Por calcular"}
                          </span>
                      </div>
                  </div>
                  
                  <div className="flex justify-between items-end border-t border-gray-100 pt-4 mb-6">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <div className="text-right">
                        {/* 👇 CAMBIA EL COLOR DEL TOTAL AQUÍ (#0071e3) */}
                        <span className="text-3xl font-bold text-[#0071e3] tracking-tight">{formatCurrency(total)}</span>
                        <span className="text-[10px] text-gray-400 block -mt-1">Incluye IGV</span>
                      </div>
                  </div>
                  
                  {currentStep === 1 ? (
                      <button 
                        onClick={() => setCurrentStep(2)}
                        // 👇 CAMBIA EL COLOR DEL BOTÓN "CONTINUAR" AQUÍ (#0071e3)
                        className="w-full bg-[#0071e3] text-white py-4 rounded-xl font-bold text-lg hover:brightness-90 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        Continuar
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                      </button>
                  ) : (
                      <div className="space-y-3">
                          {/* BOTÓN DE PAGAR (Mercado Pago / Azul Similar) */}
                          <button 
                            onClick={handlePayment}
                            disabled={isProcessing || !validateForm()}
                            // Usamos el mismo color #0071e3 para uniformidad (o el de MP #009EE3)
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2
                                ${isProcessing || !validateForm() 
                                    ? 'bg-gray-200 cursor-not-allowed text-gray-400 shadow-none' 
                                    : 'bg-[#0071e3] hover:brightness-90 text-white shadow-blue-500/20'
                                }
                            `}
                          >
                            {isProcessing ? "Procesando..." : "Ir a Pagar"}
                          </button>
                          
                          <button 
                            onClick={() => setCurrentStep(1)}
                            // 👇 CAMBIA EL COLOR DEL TEXTO "VOLVER" (hover:text-[#0071e3])
                            className="w-full py-2 text-sm text-gray-500 hover:text-[#0071e3] font-medium transition-colors"
                          >
                            Volver al carrito
                          </button>
                      </div>
                  )}

                  {currentStep === 2 && !validateForm() && (
                    <div className="mt-4 text-center text-xs text-orange-500 animate-pulse">
                        * Completa todos los campos para continuar
                    </div>
                  )}
              </div>
          </div>

        </div>
        )}
      </div>

      <style jsx>{`
        /* ESTILOS DE LOS INPUTS */
        .input-custom {
            width: 100%;
            background-color: #F8FAFC; 
            border: 1px solid #E2E8F0; 
            border-radius: 0.75rem; 
            padding: 0.75rem 1rem; 
            outline: none;
            transition: all 0.2s;
            font-size: 0.875rem; 
            color: #1e293b;
        }
        /* 👇 CAMBIA EL COLOR DEL BORDE AL SELECCIONAR (border-color: #0071e3) */
        .input-custom:focus {
            border-color: #0071e3; 
            background-color: #FFFFFF;
            box-shadow: 0 0 0 2px rgba(0, 113, 227, 0.2);
        }
        .input-custom::placeholder {
            color: #94A3B8; 
        }
      `}</style>
    </div>
  );
}

export default CartPage;