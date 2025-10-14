import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Comics from "./pages/Comics";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Account from "./pages/Account";
import Favorites from "./pages/Favorites";
import Description from "./pages/Description";
import { StoreProvider } from "./contexts/StoreContext";
// Just routing the pages here. Each page handles its own logic and state. so this file is pretty simple. deligation is key.
// i used put everything here at first in my mobile app class but that was trash, and poor practice.
// this way each page is responsible for its own data and logic, making it easier to manage and scale.
function App() {
  return (
    <Router>
      <StoreProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/comics" element={<Comics />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/account" element={<Account />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/Description" element={<Description />} />
        </Routes>
      </StoreProvider>
    </Router>
  );
}

export default App;
