import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../WebSiteStyles.css";
import { Navbar, Nav, Container, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const Contact: React.FC = () => {
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
        <h1 className="page-title">Contact Us</h1>
        <Form className="mt-3">
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" placeholder="Enter your name" />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" placeholder="Enter your email" />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Message</Form.Label>
            <Form.Control as="textarea" rows={4} placeholder="Your message" />
          </Form.Group>

          <Button variant="danger" type="submit">Submit</Button>
        </Form>
      </Container>
    </div>
  );
};

export default Contact;
