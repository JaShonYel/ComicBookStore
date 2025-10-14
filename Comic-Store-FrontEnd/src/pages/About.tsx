import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../WebSiteStyles.css";
import { Navbar, Nav, Container } from "react-bootstrap";
import {Link} from "react-router-dom";

const About: React.FC = () => {
  return (
    <>
    <div className="home-background d-flex flex-column min-vh-100">
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
    
      <Container className="mt-4 text-black">
        <h1 className="page-title">About Us</h1>
        <p>
          Welcome to ComicStore! We are passionate about bringing you the best comics from all universes.
          Our mission is to provide an easy way to browse, discover, and collect your favorite comics.
        </p>
        <p>
          This a project built for a school project. All comics data can be fetched from the Marvel API.
        </p>
        <p>
          This is not an actual store and no purchases can be made.<br />
          I do not want the liability of handling credit cards, or the selling of comics owned my Marvel.
        </p>
      </Container>
  </div>
    </>
  );
};

export default About;
