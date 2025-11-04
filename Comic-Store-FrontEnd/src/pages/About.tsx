import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../WebSiteStyles.css";
import { Navbar, Nav, Container, Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

interface Employee {
  id: number;
  name: string;
  position: string;
  photoUrl: string;
}

const employees: Employee[] = [
  { id: 1, name: "Squirrel Girl", position: "Founder & CEO", photoUrl: "https://static0.thegamerimages.com/wordpress/wp-content/uploads/2024/12/squirrel-girl-marvel-rivals.jpg?w=1600&h=1600&fit=crop" },
  { id: 2, name: "Gwen", position: "Brains", photoUrl: "https://m.media-amazon.com/images/I/91Bjk7xvaLL._UF1000,1000_QL80_.jpg" },
  { id: 3, name: "Spidey", position: "Spider", photoUrl: "https://upload.wikimedia.org/wikipedia/en/e/e1/Spider-Man_PS4_cover.jpg" },
];

const About: React.FC = () => {
  return (
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
          This is a project built for a school project. All comics data can be fetched from the Marvel API.
        </p>
        <p>
          This is not an actual store and no purchases can be made. We do not handle credit cards or sell Marvel-owned comics.
        </p>

        <h2 className="mt-5 mb-3">Our Team</h2>
        <Row xs={1} md={3} className="g-4">
          {employees.map(emp => (
            <Col key={emp.id}>
              <Card className="h-100 shadow-sm">
                <Card.Img variant="top" src={emp.photoUrl} alt={emp.name} style={{ objectFit: "cover", height: "250px" }} />
                <Card.Body className="text-center">
                  <Card.Title>{emp.name}</Card.Title>
                  <Card.Text>{emp.position}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default About;
