import { useState } from 'react';
import { useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import { Link } from 'react-router-dom';

function CartPage() {
  const { cart, removeFromCart, total } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

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
        // ✅ ÉXITO: Nos vamos a Mercado Pago
        window.location.href = data.init_point; 
      } else {
        // ❌ ERROR: Mostramos mensaje y no hacemos nada más
        console.error("Error Mercado Pago:", data);
        alert("No se pudo generar el pago. Revisa la consola del servidor.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("Error de conexión");
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) return (
    <div className="min-h-screen bg-[#F5F5F7]">
        <Navbar /><div className="pt-40 text-center"><p>Tu bolsa está vacía.</p><Link to="/" className="font-bold">Volver</Link></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Navbar />
      <div className="pt-32 pb-12 max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Tu Bolsa</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
                {cart.map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl flex gap-4">
                        <img src={`https://danstore-backend.onrender.com${item.image}`} className="w-20 h-20 object-cover rounded"/>
                        <div>
                            <h3 className="font-bold">{item.name}</h3>
                            <p>S/ {item.price}</p>
                            <button onClick={() => removeFromCart(item.cartId)} className="text-red-500 text-sm">Eliminar</button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="lg:col-span-1">
                <div className="bg-white p-8 rounded-xl shadow sticky top-28">
                    <div className="flex justify-between mb-8 text-2xl font-bold">
                        <span>Total</span><span>S/ {total.toFixed(2)}</span>
                    </div>
                    <button onClick={handlePayment} disabled={isProcessing} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition">
                        {isProcessing ? "Cargando..." : "PAGAR AHORA"}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;