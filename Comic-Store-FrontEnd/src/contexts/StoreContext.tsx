import React, { createContext, useContext, useState, ReactNode } from "react";

export type Comic = {
  id: string;
  title: string;
  img: string;
  price: number | string | any;
};

export type CartItem = {
  id: string;
  title: string;
  price: number | string;
  img: string;
};

type StoreContextType = {
  cartItems: CartItem[];
  favorites: Comic[];
  addToCart: (c: Comic) => boolean; // returns false if duplicate
  removeFromCart: (id: string) => void;
  addToFavorites: (c: Comic) => boolean; // returns false if duplicate
  removeFromFavorites: (id: string) => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Comic[]>([]);

  const addToCart = (c: Comic): boolean => {
    const id = String(c.id);
    let added = false;
    setCartItems((prev) => {
      if (prev.some((item) => String(item.id) === id)) return prev; // duplicate, do not add
      added = true;
      return [...prev, { id, title: c.title, price: c.price, img: c.img }];
    });
    return added;
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => String(item.id) !== String(id)));
  };

  const addToFavorites = (c: Comic): boolean => {
    const id = String(c.id);
    let added = false;
    setFavorites((prev) => {
      if (prev.some((item) => String(item.id) === id)) return prev; // duplicate, do not add
      added = true;
      return [...prev, c];
    });
    return added;
  };

  const removeFromFavorites = (id: string) => {
    setFavorites((prev) => prev.filter((item) => String(item.id) !== String(id)));
  };

  return (
    <StoreContext.Provider
      value={{ cartItems, favorites, addToCart, removeFromCart, addToFavorites, removeFromFavorites }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
};

export default StoreContext;
