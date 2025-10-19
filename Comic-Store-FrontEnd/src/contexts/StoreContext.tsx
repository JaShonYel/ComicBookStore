import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

export type Comic = {
  id: string;
  title: string;
  img: string;
  price: number;
};

export type CartItem = {
  id: string;
  title: string;
  img: string;
  price: number;
};

type StoreContextType = {
  cartItems: CartItem[];
  favorites: Comic[];
  addToCart: (c: Comic) => void;
  removeFromCart: (id: string) => void;
  addToFavorites: (c: Comic) => void;
  removeFromFavorites: (id: string) => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Comic[]>([]);

  const userId = user?.sub;

  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const fetchUserData = async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await axios.get(`${API_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const safeCart = (res.data.cart || []).map((c: any) => ({
          id: String(c.id),
          title: c.title,
          img: c.img,
          price: Number(c.price ?? 2.0),
        }));

        const safeFavs = (res.data.favorites || []).map((c: any) => ({
          id: String(c.id),
          title: c.title,
          img: c.img,
          price: Number(c.price ?? 2.0),
        }));

        setCartItems(safeCart);
        setFavorites(safeFavs);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };

    fetchUserData();
  }, [isAuthenticated, getAccessTokenSilently, userId]);

  const updateBackend = async (field: "cart" | "favorites", data: any[]) => {
    if (!isAuthenticated || !userId) return;
    try {
      const token = await getAccessTokenSilently();
      await axios.put(`${API_URL}/api/users/${userId}/${field}`, { [field]: data }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
    }
  };

  const addToCart = (comic: Comic) => {
    if (cartItems.find((item) => item.id === comic.id)) return;
    const newCart = [...cartItems, comic];
    setCartItems(newCart);
    updateBackend("cart", newCart);
  };

  const removeFromCart = (id: string) => {
    const newCart = cartItems.filter((item) => item.id !== id);
    setCartItems(newCart);
    updateBackend("cart", newCart);
  };

  const addToFavorites = (comic: Comic) => {
    if (favorites.find((item) => item.id === comic.id)) return;
    const newFavs = [...favorites, comic];
    setFavorites(newFavs);
    updateBackend("favorites", newFavs);
  };

  const removeFromFavorites = (id: string) => {
    const newFavs = favorites.filter((item) => item.id !== id);
    setFavorites(newFavs);
    updateBackend("favorites", newFavs);
  };

  return (
    <StoreContext.Provider
      value={{
        cartItems,
        favorites,
        addToCart,
        removeFromCart,
        addToFavorites,
        removeFromFavorites,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
};

export default StoreContext;
