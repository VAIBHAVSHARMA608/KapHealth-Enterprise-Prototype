import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import api from "../services/api.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user || user.role !== "patient") {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/store/cart");
      setCart(data.cart);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const itemCount = useMemo(
    () => (cart?.items ? cart.items.reduce((sum, i) => sum + i.quantity, 0) : 0),
    [cart]
  );

  const value = useMemo(
    () => ({ cart, itemCount, loading, refreshCart }),
    [cart, itemCount, loading, refreshCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
