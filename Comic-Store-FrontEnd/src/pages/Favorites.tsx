import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../WebSiteStyles.css";
import { Navbar, Nav, Container, Card, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useStore } from "../contexts/StoreContext";

const Favorites: React.FC = () => {
  const { favorites, removeFromFavorites, addToCart } = useStore();

  return (
    <div className="Account-Page d-flex flex-column min-vh-100">
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
        <h1 className="page-title">My Favorites</h1>
        {favorites.length === 0 ? (
          <p>You have no favorites yet.</p>
        ) : (
          <Row className="g-4 mt-3">
            {favorites.map((comic) => {
              const imgSrc = comic.img || "https://placedog.net/500/280";
              const safePrice: number =
                typeof comic.price === "number"
                  ? comic.price
                  : comic.price
                  ? parseFloat(String(comic.price).replace("$", "")) || 2.0
                  : 2.0;

              return (
                <Col key={comic.id} xs={12} sm={6} md={4}>
                  <Card className="shadow-sm rounded mb-3">
                    <Card.Img variant="top" src={imgSrc} alt={comic.title} />
                    <Card.Body>
                      <Card.Title>{comic.title}</Card.Title>
                      <p className="mb-2">${safePrice.toFixed(2)}</p>
                      <div className="d-flex gap-2">
                        <Button
                          className="btn btn-danger flex-fill"
                          onClick={() => removeFromFavorites(comic.id)}
                        >
                          Remove
                        </Button>
                        <Button
                          className="btn btn-outline-danger flex-fill"
                          onClick={() =>
                            addToCart({ ...comic, price: safePrice })
                          }
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Favorites;
