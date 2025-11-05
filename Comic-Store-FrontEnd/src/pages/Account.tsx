import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../WebSiteStyles.css";
import { Navbar, Nav, Container, Card, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

interface BackendUser {
  auth0_id: string;
  name: string;
  email: string;
  createdAt: string;
}


const Account: React.FC = () => {
  const { user, loginWithRedirect, logout, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [canSeeBatcave, setCanSeeBatcave] = useState(false);

  useEffect(() => {
    const fetchBackendUser = async () => {
      if (isAuthenticated && user) {
        try {
          const token = await getAccessTokenSilently();

          const response = await axios.get(`http://localhost:5000/api/users/${user.sub}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setBackendUser(response.data);

          try {
            await axios.get(`http://localhost:5000/api/batcave/${user.sub}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setCanSeeBatcave(true);
          } catch (err) {
            setCanSeeBatcave(false);
          }
        } catch (err) {
          console.error("Failed to fetch backend user:", err);
        }
      }
    };

    fetchBackendUser();
  }, [isAuthenticated, getAccessTokenSilently, user]);
  

  if (isLoading) return <div>Loading...</div>;

  return (
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
              {canSeeBatcave && (
                <Nav.Link as={Link} to="/batcave" className="text-white fw-bold">
                  Batcave
                </Nav.Link>
              )}
              <Nav.Link as={Link} to="/favorites" className="text-white">Favorites</Nav.Link>
              <Nav.Link as={Link} to="/account" className="text-white">Account</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <h1 className="page-title">My Account</h1>

        {!isAuthenticated ? (
          <>
            <p>Please log in to access your account details.</p>
            <Button variant="danger" onClick={() => loginWithRedirect()}>Log In / Sign Up</Button>
          </>
        ) : (
          <>
            <p>Welcome, {backendUser?.name || user?.name}!</p>
            <Row className="g-4 mt-3">
              <Col xs={12} md={6}>
                <Card className="shadow-sm rounded p-3" style={{ backgroundColor: "#f8f9fa", color: "black" }}>
                  <Card.Title>Profile Information</Card.Title>
                  <Card.Text>
                    Name: {backendUser?.name || user?.name} <br />
                    Email: {backendUser?.email || user?.email}
                  </Card.Text>
                  <Card.Body>
                    <Button
                      variant="danger"
                      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                    >
                      Log Out
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
};

export default Account;
