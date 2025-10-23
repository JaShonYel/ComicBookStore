import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Navbar, Nav, Button, Container, Image } from "react-bootstrap";
import { useStore } from "../contexts/StoreContext";
import { sanitizeDescription } from "../lib/textUtils";

type LocationState = {
  comic: {
    id: string;
    title: string;
    img: string;
    description: string;
    price: number | string;
  };
};

const Description: React.FC = () => {
  const { state } = useLocation() as { state: LocationState };
  const navigate = useNavigate();
  const { addToCart, addToFavorites } = useStore();

  const comic = state.comic;

  if (!comic) {
    return (
      <Container className="mt-4">
        <h2>Comic not found</h2>
        <Button onClick={() => navigate(-1)} aria-label="Go back">Go Back</Button>
      </Container>
    );
  }

  const safePrice =
    typeof comic.price === "number"
      ? comic.price
      : comic.price
      ? parseFloat(String(comic.price).replace("$", "")) || 2.0
      : 2.0;

  const priceDisplay =
    typeof safePrice === "number" ? `$${safePrice.toFixed(2)}` : String(safePrice);

  return (
    <>
      <Navbar bg="danger" variant="dark" expand="lg" className="marvel-navbar">
        <Container>
          <Navbar.Brand as={Link} to="/" aria-label="ComicStore Home">
            The Comic Continuum
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/" aria-label="Go to Home page">
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/comics" aria-label="Go to Comics page">
                Comics
              </Nav.Link>
              <Nav.Link as={Link} to="/about" aria-label="Go to About page">
                About
              </Nav.Link>
              <Nav.Link as={Link} to="/contact" aria-label="Go to Contact page">
                Contact
              </Nav.Link>
              <Nav.Link as={Link} to="/cart" aria-label="Go to Cart">
                Cart
              </Nav.Link>
            </Nav>
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/favorites" aria-label="Go to Favorites">
                Favorites
              </Nav.Link>
              <Nav.Link as={Link} to="/account" aria-label="Go to Account page">
                Account
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <div className="d-flex flex-column flex-md-row gap-4">
          <div>
            <Image src={comic.img} alt={comic.title} fluid className="detail-img" />
          </div>
          <div>
            <h2>{comic.title}</h2>
            <p style={{ whiteSpace: "pre-wrap" }}>
              {sanitizeDescription(comic.description || "No description available.")}
            </p>
            <h4>{priceDisplay}</h4>
            <div className="mt-3 d-flex gap-2 flex-wrap">
              <Button
                variant="danger"
                onClick={() => addToCart({ ...comic, price: safePrice })}
                aria-label={`Add ${comic.title} to cart`}
              >
                Add to Cart
              </Button>
              <Button
                variant="outline-danger"
                onClick={() => addToFavorites({ ...comic, price: safePrice })}
                aria-label={`Add ${comic.title} to favorites`}
              >
                ❤ Favorite
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

export default Description;
