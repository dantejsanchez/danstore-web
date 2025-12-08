import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // Inicializamos el carrito leyendo de localStorage para no perder datos al recargar
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Cada vez que el carrito cambie, actualizamos localStorage y calculamos total
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // 🛡️ BLINDAJE 2: Función para agregar sanitizando datos
  const addToCart = (product, quantity = 1) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id);
      
      // Aseguramos que el precio sea un número limpio
      const cleanPrice = parseFloat(product.price); 

      if (existingItem) {
        return currentCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + parseInt(quantity), price: cleanPrice }
            : item
        );
      } else {
        return [...currentCart, { ...product, quantity: parseInt(quantity), price: cleanPrice }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCart(currentCart => currentCart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculamos el total asegurándonos de que sean números
  const total = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};