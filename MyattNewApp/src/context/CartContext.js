import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItem = prevItems.find(cartItem => 
        cartItem.id === item.id && 
        cartItem.name === item.name && 
        cartItem.grade === item.grade
      );

      if (existingItem) {
        return prevItems; // Item already in cart
      }

      // Add new item to cart
      return [...prevItems, {
        ...item,
        quantity: 1,
        addedAt: new Date().toISOString()
      }];
    });
  };

  const removeFromCart = (itemToRemove) => {
    setCartItems(prevItems => 
      prevItems.filter(item => 
        !(item.id === itemToRemove.id && 
          item.name === itemToRemove.name && 
          item.grade === itemToRemove.grade)
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      getCartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 