import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../WebSiteStyles.css";
import { Navbar, Nav, Container, Card, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useStore } from "../contexts/StoreContext";

const Favorites: React.FC = () => {
  const { favorites, removeFromFavorites } = useStore();

  return (
    <div className="Account-Page d-flex flex-column min-vh-100">
      {/* Navbar */}
      <Navbar bg="danger" variant="dark" expand="lg" className="marvel-navbar">
        <Container>
          <Navbar.Brand as={Link} to="/">The Comic Continuum</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/" className="text-white">Home</Nav.Link>
              <Nav.Link as={Link} to="/comics" className="text-white">Comics</Nav.Link>
              <Nav.Link as={Link} to="/about" className="text-white">About</Nav.Link>
              <Nav.Link as={Link} to="/contact" className="text-white">Contact</Nav.Link>
              <Nav.Link as={Link} to="/cart" className="text-white">Cart</Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link as={Link} to="/favorites" className="text-white">Favorites</Nav.Link>
              <Nav.Link as={Link} to="/account" className="text-white">Account</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Page Content */}
      <Container className="mt-4">
        <h1 className="page-title">My Favorites</h1>
        <Row className="g-4 mt-3">
          {favorites.length === 0 ? (
            <p>You have no favorites yet.</p>
          ) : (
            favorites.map((comic) => (
              <Col key={comic.id} xs={12} sm={6} md={4}>
                <Card className="shadow-sm rounded mb-3">
                  {comic.img && <Card.Img variant="top" src={comic.img} alt={comic.title} />}
                  <Card.Body>
                    <Card.Title>{comic.title}</Card.Title>
                    <button
                      className="btn btn-danger text-white"
                      onClick={() => removeFromFavorites(String(comic.id))}
                    >
                      Remove
                    </button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Container>
    </div>
  );
};

export default Favorites;
