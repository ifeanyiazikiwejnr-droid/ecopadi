import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

function loadCart() {
  try { return JSON.parse(localStorage.getItem('ecopadi_cart')) || []; }
  catch { return []; }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => { localStorage.setItem('ecopadi_cart', JSON.stringify(items)); }, [items]);

  function addItem(product, variant, quantity = 1) {
    setItems((prev) => {
      const key = `${product.id}::${variant?.id || 'default'}`;
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          variantId: variant?.id || null,
          name: product.name,
          variantLabel: variant ? `${variant.name}: ${variant.value}` : null,
          unitPricePence: product.price_pence + (variant?.price_delta_pence || 0),
          quantity,
        },
      ];
    });
    setIsOpen(true);
  }

  function updateQuantity(key, quantity) {
    if (quantity <= 0) return removeItem(key);
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity } : i)));
  }

  function removeItem(key) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function clearCart() {
    setItems([]);
  }

  const subtotalPence = items.reduce((sum, i) => sum + i.unitPricePence * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clearCart, subtotalPence, itemCount, isOpen, setIsOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
