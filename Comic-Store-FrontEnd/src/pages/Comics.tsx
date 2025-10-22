import React, { useState, useEffect } from "react";
import { Container, Card, Button, Carousel, Navbar, Nav } from "react-bootstrap";
import { useStore } from "../contexts/StoreContext";
import { Link, useNavigate } from "react-router-dom";

interface Comic {
  id: string;
  title: string;
  img: string;
  description: string;
  price: number;
}

interface SeriesData {
  series: string;
  comics: Comic[];
}

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Comics: React.FC = () => {
  const { addToCart, addToFavorites } = useStore();
  const navigate = useNavigate();
  const [featuredComics, setFeaturedComics] = useState<Comic[]>([]);
  const [seriesComics, setSeriesComics] = useState<SeriesData[]>([]);

  const fetchFeaturedComics = async () => {
    try {
      const res = await fetch(`${API_URL}/api/comics/featured`);
      const data = await res.json();
      const comicsArray: Comic[] = (Array.isArray(data) ? data : data.results || data.comics || []).map((c: any) => ({
        id: String(c.id),
        title: c.title,
        img: c.img,
        description: c.description || "",
        price: c.price ?? 2.0,
      }));
      setFeaturedComics(comicsArray);
    } catch (err) {
      console.error("Error fetching featured comics:", err);
    }
  };

  const fetchSeriesComics = async () => {
    const seriesList = ["Spider-Man", "X-Men", "Avengers"];
    try {
      const results = await Promise.all(
        seriesList.map(async (series) => {
          const res = await fetch(`${API_URL}/api/comics?search=${series}`);
          const data = await res.json();
          const comicsArray: Comic[] = (Array.isArray(data) ? data : data.results || data.comics || []).map((c: any) => ({
            id: String(c.id),
            title: c.title,
            img: c.img,
            description: c.description || "",
            price: c.price ?? 2.0,
          }));
          return { series, comics: comicsArray.slice(0, 10) };
        })
      );
      setSeriesComics(results);
    } catch (err) {
      console.error("Error fetching series comics:", err);
    }
  };

  useEffect(() => {
    fetchFeaturedComics();
    fetchSeriesComics();
  }, []);

  const renderPrice = (price: number) => `$${price.toFixed(2)}`;

  const chunkComics = (comics: Comic[], size: number): Comic[][] => {
    const result: Comic[][] = [];
    for (let i = 0; i < comics.length; i += size) {
      result.push(comics.slice(i, i + size));
    }
    return result;
  };

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

      <Container className="mt-3 marvel-carousel">
        <Carousel>
          {featuredComics.map((comic) => (
            <Carousel.Item key={comic.id}>
              <div
                className="featured-carousel-item"
                role="button"
                tabIndex={0}
                onClick={() => navigate("/Description", { state: { comic } })}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate("/Description", { state: { comic } }); }}
              >
                <img src={comic.img} alt={comic.title} className="featured-carousel-img" />
                <div className="featured-carousel-overlay">
                  <h5>{comic.title}</h5>
                  <p>{renderPrice(comic.price)}</p>
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>

        {seriesComics.map(({ series, comics }) => {
          const slides = chunkComics(comics, 5);
          return (
            <div key={series} className="mt-5">
              <h3 className="marvel-section-title">{series}</h3>
              <Carousel indicators={false} interval={null}>
                {slides.map((slide, idx) => (
                  <Carousel.Item key={idx}>
                    <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
                      {slide.map((comic) => (
                        <Card
                          key={comic.id}
                          style={{ width: "200px", cursor: "pointer" }}
                          onClick={() => navigate("/Description", { state: { comic } })}
                        >
                          <Card.Img variant="top" src={comic.img} />
                          <Card.Body>
                            <Card.Title>{comic.title}</Card.Title>
                            <p>{renderPrice(comic.price)}</p>
                            <Button
                              variant="danger"
                              className="buy-button me-2"
                              aria-label={`Add ${comic.title} to cart`}
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(comic);
                              }}
                            >
                              Add to Cart
                            </Button>
                            <Button
                              variant="outline-danger"
                              className="favorite-button"
                              aria-label={`Favorite ${comic.title}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                addToFavorites(comic);
                              }}
                            >
                              ❤
                            </Button>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  </Carousel.Item>
                ))}
              </Carousel>
            </div>
          );
        })}
      </Container>
    </div>
  );
};

export default Comics;
