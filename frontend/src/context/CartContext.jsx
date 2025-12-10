import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // Inicializamos el carrito leyendo de localStorage
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Efecto para guardar en localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // 🛡️ TU FUNCIÓN ORIGINAL (Agrega o suma)
  const addToCart = (product, quantity = 1) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id);
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

  // ✅ NUEVA FUNCIÓN NECESARIA (Para los botones + y - del carrito)
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return; // Evita cantidades negativas
    setCart(currentCart =>
      currentCart.map(item =>
        item.id === id ? { ...item, quantity: parseInt(newQuantity) } : item
      )
    );
  };

  // TU FUNCIÓN ORIGINAL
  const removeFromCart = (id) => {
    setCart(currentCart => currentCart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  // TU CÁLCULO DE TOTAL
  const total = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);

  return (
    // Agregamos updateQuantity al value
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity, total }}>
      {children}
    </CartContext.Provider>
  );
};