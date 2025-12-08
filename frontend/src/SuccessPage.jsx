import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './context/CartContext';
import Navbar from './components/Navbar';

function SuccessPage() {
  const { cart, removeFromCart } = useCart();

  // Al cargar la página, simulamos que vaciamos el carrito visualmente 
  // (En una app real, aquí guardarías la orden en la base de datos)
  useEffect(() => {
    // Opcional: Podrías llamar a una API para confirmar la orden aquí
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-40 pb-20 max-w-2xl mx-auto px-4 text-center">
        {/* Icono de Check Animado */}
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-8">
          <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">¡Pago Exitoso!</h1>
        <p className="text-xl text-gray-500 mb-12">
          Gracias por tu compra. Hemos enviado el recibo a tu correo.
          Aquí tienes tus archivos para descarga inmediata.
        </p>

        {/* Zona de Descargas */}
        <div className="bg-gray-50 rounded-2xl p-8 shadow-sm border border-gray-100 text-left">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Tus Descargas:</h3>
          
          <div className="space-y-4">
            {/* Si el carrito aún tiene items en memoria, los mostramos, sino mensaje genérico */}
            {cart.length > 0 ? cart.map((item) => (
               <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                        📁
                    </span>
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                  <a 
                    href="#" 
                    className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                    onClick={(e) => {
                        e.preventDefault();
                        alert("Iniciando descarga del archivo... (Aquí iría el link real)");
                    }}
                  >
                    Descargar
                  </a>
               </div>
            )) : (
                <p className="text-sm text-gray-500">
                    Los links de descarga también fueron enviados a tu email.
                </p>
            )}
          </div>
        </div>

        <div className="mt-12">
            <Link to="/" className="text-[#0071e3] font-medium hover:underline">
                Volver a la tienda
            </Link>
        </div>
      </div>
    </div>
  );
}

export default SuccessPage;