import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../WebSiteStyles.css";
import { Navbar, Nav, Container, Form, Button, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

const ContactForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email address so we can reply.");
      return;
    }

    const recipient = "comiccontinuumproject@gmail.com";
    const subject = encodeURIComponent(`Contact from ${name || email}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    const mailto = `mailto:${recipient}?subject=${subject}&body=${body}`;

    window.location.href = mailto;
  };

  return (
    <Form className="contact-form" onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Message</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          placeholder="Your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </Form.Group>

      <Button variant="danger" type="submit">Submit</Button>
    </Form>
  );
};

const Contact: React.FC = () => {
  return (
    <div className="Account-Page d-flex flex-column min-vh-100">
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

      <Container className="mt-4">
        <h1 className="page-title">Contact Us</h1>

        <Row className="mt-3">
          <Col md={6} sm={12} className="mb-4">
            <ContactForm />
          </Col>
              
          <Col md={6} sm={12}>
            <div className="store-info p-3" style={{ background: "#fff5f5", borderRadius: 6 }}>
              <h1>Comic Continuum</h1>
              <p className="mb-1"><strong>Address:</strong> Remember how i said i would throw it in the ocean at random? i meant it!</p>
              
              <h2 className="mt-3">Hours</h2>
              <ul className="list-unstyled mb-3">
                <li>Mon–Fri: 10:00 AM – 7:00 PM</li>
                <li>Sat: 11:00 AM – 6:00 PM</li>
                <li>Sun: Closed</li>
              </ul>

              <h3>Contact</h3>
              <p className="mb-1"><strong>Phone:</strong> (555) 123-4567</p>
              <p className="mb-2"><strong>Email:</strong> comiccontinuumproject@gmail.com</p>

              <div>
                <h4 className="mb-2">Map</h4>
                <div className="map-responsive" style={{ width: "100%", height: 300, overflow: "hidden" }}>
                  <iframe
                    title="Store Location"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    src="https://www.google.com/maps?q=25,-40&z=5&output=embed"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
    //The map creation is copy and pasted from my old project and modified to fit here
  );
};

export default Contact;
