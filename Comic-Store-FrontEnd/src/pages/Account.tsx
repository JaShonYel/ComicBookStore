import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../WebSiteStyles.css";
import { Navbar, Nav, Container, Card, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

const Account: React.FC = () => {
  return (
    <>
      <div className="Account-Page d-flex flex-column min-vh-100" style={{ backgroundColor: "white", color: "black" }}>
        <Navbar bg="danger" variant="dark" expand="lg" className="marvel-navbar">
          <Container>
            <Navbar.Brand as={Link} to="/">
              The Comic Continuum
            </Navbar.Brand>
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

        <Container className="mt-4">
          <h1 className="page-title">My Account</h1>
          <p>
            Welcome! Here you can manage your account details, orders, and preferences.
          </p>

          <Row className="g-4 mt-3">
            <Col xs={12} md={6}>
              <Card className="shadow-sm rounded p-3" style={{ backgroundColor: "#f8f9fa", color: "black" }}>
                <Card.Title>Profile Information</Card.Title>
                <Card.Text>
                  Name: Patrick Star
                  <br />
                  Email: NoThisIsPatrick@gmail.com
                </Card.Text>
                <Card.Body>
                  <button className="btn btn-danger text-white">Edit Profile</button>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} md={6}>
              <Card className="shadow-sm rounded p-3" style={{ backgroundColor: "#f8f9fa", color: "black" }}>
                <Card.Title>Account Settings</Card.Title>
                <Card.Text>Settings</Card.Text>
                <Card.Body>
                  <button className="btn btn-danger text-white">Manage Settings</button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Account;
