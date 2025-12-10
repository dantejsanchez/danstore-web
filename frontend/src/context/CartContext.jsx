import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // 1. Inicializar desde LocalStorage
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // 2. Guardar cambios automáticamente
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // 3. Agregar al carrito (Sanitizando números)
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

  // 4. Actualizar cantidad directa (+ / -)
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return; 
    setCart(currentCart =>
      currentCart.map(item =>
        item.id === id ? { ...item, quantity: parseInt(newQuantity) } : item
      )
    );
  };

  // 5. Eliminar
  const removeFromCart = (id) => {
    setCart(currentCart => currentCart.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  // 6. Total Calculado
  const total = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity, total }}>
      {children}
    </CartContext.Provider>
  );
};