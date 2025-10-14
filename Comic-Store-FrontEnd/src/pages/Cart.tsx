import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../WebSiteStyles.css";
import { Navbar, Nav, Container, Button, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useStore } from "../contexts/StoreContext";

const Cart: React.FC = () => {
  const { cartItems, removeFromCart } = useStore();

  const subtotal = cartItems.reduce((total, item) => {
    const priceNum =
      typeof item.price === "number"
        ? item.price
        : parseFloat(String(item.price).replace("$", "")) || 0;
    return total + priceNum;
  }, 0);

  const taxRate = 0.06;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <>
      <Navbar bg="danger" variant="dark" expand="lg" className="marvel-navbar">
        <Container>
          <Navbar.Brand as={Link} to="/">The Comic Continuum</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/comics">Comics</Nav.Link>
              <Nav.Link as={Link} to="/about">About</Nav.Link>
              <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
              <Nav.Link as={Link} to="/cart">Cart</Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link as={Link} to="/favorites">Favorites</Nav.Link>
              <Nav.Link as={Link} to="/account">Account</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <h1 className="page-title">Your Cart</h1>

        {cartItems.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <div className="d-flex flex-wrap gap-4">
            {/* Cart Items */}
            <div className="cart-items-container flex-fill" style={{ minWidth: "300px" }}>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="d-flex align-items-center justify-content-between mb-3 p-2"
                  style={{
                    border: "2px solid #000",
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <Image
                      src={item.img}
                      alt={`Cover of ${item.title}`}
                      className="cart-thumbnail me-3"
                    />
                    <span className="fw-bold">{item.title}</span>
                  </div>
                  <div className="d-flex flex-column align-items-end">
                    <span className="mb-2">
                      {typeof item.price === "number"
                        ? `$${item.price.toFixed(2)}`
                        : item.price ?? "N/A"}
                    </span>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remove ${item.title} from cart`}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div
              className="cart-summary-container p-3"
              style={{
                border: "2px solid #000",
                borderRadius: "8px",
                backgroundColor: "#f8f9fa",
                minWidth: "250px",
                height: "fit-content",
              }}
            >
              <h5 style={{ fontWeight: "bold" }}>Price Summary</h5>
              <hr />
              <p>Subtotal: ${subtotal.toFixed(2)}</p>
              <p>Sales Tax (6%): ${tax.toFixed(2)}</p>
              <h5>Total: ${total.toFixed(2)}</h5>
              <Button
                className="buy-button buy-button-small mt-3 w-100"
                aria-label="Proceed to Checkout"
              >
                Checkout
              </Button>
            </div>
          </div>
        )}
      </Container>
    </>
  );
};

export default Cart;
