import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";

import Home from "./pages/Home";
import Comics from "./pages/Comics";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Account from "./pages/Account";
import Favorites from "./pages/Favorites";
import Description from "./pages/Description";
import { StoreProvider } from "./contexts/StoreContext";

const App: React.FC = () => {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN!;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID!;
  const audience = process.env.REACT_APP_AUTH0_AUDIENCE!;

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
      }}
    >
      <StoreProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/comics" element={<Comics />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/account" element={<Account />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/description" element={<Description />} />
          </Routes>
        </Router>
      </StoreProvider>
    </Auth0Provider>
  );
};

export default App;
