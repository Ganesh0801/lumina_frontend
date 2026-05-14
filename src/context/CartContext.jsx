import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lumina_cart')) || []; } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('lumina_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1, color = '') => {
    setCart(prev => {
      // Use product._id as the unique key
      const existing = prev.find(i => i.product === product._id && i.color === color);
      if (existing) {
        toast.success('Quantity updated!');
        return prev.map(i =>
          i.product === product._id && i.color === color
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      toast.success(`${product.name} added to cart!`);
      return [...prev, {
        product: product._id,       // unique id
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '', // single string — consistent field name
        category: product.category || '',
        quantity,
        color,
        stock: product.stock,
      }];
    });
  };

  // All cart operations use product + color as the key
  const removeFromCart = (productId, color = '') => {
    setCart(prev => prev.filter(i => !(i.product === productId && i.color === color)));
  };

  const updateQuantity = (productId, color = '', quantity) => {
    if (quantity < 1) { removeFromCart(productId, color); return; }
    setCart(prev => prev.map(i =>
      i.product === productId && i.color === color ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((a, i) => a + i.price * i.quantity, 0);
  const cartCount = cart.reduce((a, i) => a + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
