import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../WebSiteStyles.css";
import { Navbar, Nav, Container, Form, FormControl, Button, Carousel, Card, Pagination } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../contexts/StoreContext";

interface Comic {
  id: string;
  title: string;
  img: string;
  price: number;
}

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [comics, setComics] = useState<Comic[]>([]);
  const [featuredComics, setFeaturedComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [priceRange, setPriceRange] = useState("all");
  const [category, setCategory] = useState("all");
  const [formatType, setFormatType] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");
  const [year, setYear] = useState("all");
  const { addToCart, addToFavorites } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedComics = async () => {
      try {
        const res = await fetch(`${API_URL}/api/comics/featured`);
        const data = await res.json();
        const safeData = data.map((c: any) => ({
          ...c,
          price: c.price != null && Number(c.price) > 0 ? Number(c.price) : 2.0
        }));
        setFeaturedComics(safeData.slice(0, 5));
      } catch (err) {
        console.error("Error fetching featured comics:", err);
      }
    };
    fetchFeaturedComics();
  }, []);

  const handleSearch = async (e: React.FormEvent, newPage = 1) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/comics?search=${encodeURIComponent(searchQuery)}&page=${newPage}&limit=50&priceRange=${priceRange}&category=${category}&format=${formatType}&sortOrder=${sortOrder}${year !== "all" ? `&year=${year}` : ""}`
      );
      const data = await res.json();
      const safeComics = (data.results ?? []).map((c: any) => ({
        ...c,
        price: c.price != null && Number(c.price) > 0 ? Number(c.price) : 2.0 //with the new filter ability the price correction i was using broke so i had to make it check for nulls and $0.00 and not just nulls
      }));
      setComics(safeComics);
      setPage(data.page ?? 1);
      setTotalPages(data.totalPages ?? 1);
    } catch (error) {
      console.error("Error fetching comics:", error);
    } finally {
      setLoading(false);
    }
  };

  const currencyFormatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  const renderPrice = (price: number) => `Price: ${currencyFormatter.format(price)}`;

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const items = [];
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);
    if (page > 1) items.push(<Pagination.Prev key="prev" onClick={(e) => handleSearch(e, page - 1)} />);
    for (let i = startPage; i <= endPage; i++)
      items.push(
        <Pagination.Item key={i} active={i === page} onClick={(e) => handleSearch(e, i)}>
          {i}
        </Pagination.Item>
      );
    if (page < totalPages) items.push(<Pagination.Next key="next" onClick={(e) => handleSearch(e, page + 1)} />);
    return <Pagination className="justify-content-center mt-4">{items}</Pagination>;
  };

  return (
    <div className="home-background d-flex flex-column min-vh-100">
      <div className="flex-grow-1">
        <Navbar bg="danger" variant="dark" expand="lg" className="marvel-navbar">
          <Container>
            <Navbar.Brand as={Link} to="/" aria-label="ComicStore Home">The Comic Continuum</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/" aria-label="Go to Home page">Home</Nav.Link>
                <Nav.Link as={Link} to="/comics" aria-label="Go to Comics page">Comics</Nav.Link>
                <Nav.Link as={Link} to="/about" aria-label="Go to About page">About</Nav.Link>
                <Nav.Link as={Link} to="/contact" aria-label="Go to Contact page">Contact</Nav.Link>
                <Nav.Link as={Link} to="/cart" aria-label="Go to Cart">Cart</Nav.Link>
              </Nav>
              <Nav className="ms-auto">
                <Nav.Link as={Link} to="/favorites" aria-label="Go to Favorites">Favorites</Nav.Link>
                <Nav.Link as={Link} to="/account" aria-label="Go to Account page">Account</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Carousel className="marvel-carousel mt-3" aria-label="Featured Comics Carousel">
          {featuredComics.map((comic) => (
            <Carousel.Item key={comic.id}>
              <div
                className="featured-carousel-item"
                role="button"
                tabIndex={0}
                onClick={() => navigate("/Description", { state: { comic } })}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate("/Description", { state: { comic } }); }}
              >
                <img src={comic.img} alt={comic.title ? comic.title : "Featured comic cover"} className="featured-carousel-img"/>
                <div className="featured-carousel-overlay">
                  <h5>{comic.title}</h5>
                  <p>{renderPrice(comic.price)}</p>
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>

        <Container className="my-4 d-flex flex-column align-items-center">
          <Form className="d-flex w-75 mb-3" role="search" aria-label="Search comics form" onSubmit={(e) => handleSearch(e, 1)}>
            <FormControl
              type="search"
              placeholder="Search comics by title"
              className="me-2"
              aria-label="Search comics by title"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="warning" style={{ minWidth: "120px" }} type="submit" aria-label="Submit search">
              {loading ? "Searching..." : "Search"}
            </Button>
          </Form>

          <div className="d-flex flex-wrap justify-content-center gap-2 w-75">
            <Form.Select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} style={{ maxWidth: "180px" }}>
              <option value="all">All Prices</option>
              <option value="0-5">$0 - $5</option>
              <option value="5-10">$5 - $10</option>
              <option value="10-20">$10 - $20</option>
              <option value="20+">$20+</option>
            </Form.Select>

            <Form.Select value={category} onChange={(e) => setCategory(e.target.value)} style={{ maxWidth: "180px" }}>
              <option value="all">All Categories</option>
              <option value="Avengers">Avengers</option>
              <option value="X-Men">X-Men</option>
              <option value="Spider-Man">Spider-Man</option>
              <option value="Iron Man">Iron Man</option>
            </Form.Select>

            <Form.Select value={formatType} onChange={(e) => setFormatType(e.target.value)} style={{ maxWidth: "180px" }}>
              <option value="all">All Formats</option>
              <option value="Comic">Comic</option>
              <option value="Trade Paperback">Trade Paperback</option>
              <option value="Hardcover">Hardcover</option>
            </Form.Select>

            <Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={{ maxWidth: "180px" }}>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </Form.Select>

            <Form.Select value={year} onChange={(e) => setYear(e.target.value)} style={{ maxWidth: "120px", marginRight: "8px" }}>
              <option value="all">All Years</option>
              {Array.from({ length: 30 }, (_, i) => 2016 - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </Form.Select>
          </div>
        </Container>

        {comics.length > 0 && (
          <Container className="mt-4" role="region" aria-labelledby="search-results-title">
            <h2 id="search-results-title" className="marvel-section-title">Search Results</h2>
            <div className="d-flex flex-wrap gap-3 justify-content-center">
              {comics.map((comic) => (
                <Card
                  className="marvel-card"
                  key={comic.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate("/Description", { state: { comic } })}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate("/Description", { state: { comic } }); }}
                >
                  <Card.Body className="comic-title-body">
                    <Card.Title className="text-center">{comic.title}</Card.Title>
                  </Card.Body>
                  <Card.Img variant="top" src={comic.img} alt={`Cover of ${comic.title}`} className="comic-img" />
                  <Card.Body className="comic-price-body">
                    <Card.Text className="text-center">{renderPrice(comic.price)}</Card.Text>
                  </Card.Body>
                  <Card.Body className="comic-body d-flex justify-content-center">
                    <Button
                      variant="danger"
                      className="buy-button me-2"
                      aria-label={`Add ${comic.title} to cart`}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart({ id: comic.id, title: comic.title, img: comic.img, price: comic.price });
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
                        addToFavorites({ id: comic.id, title: comic.title, img: comic.img, price: comic.price });
                      }}
                    >
                      ❤
                    </Button>
                  </Card.Body>
                </Card>
              ))}
            </div>
            {totalPages > 1 && renderPagination()}
          </Container>
        )}
      </div>

      <footer className="bg-dark text-white text-center py-3">
        <p>© 2025 ComicStore. All rights reserved. https://github.com/JaShonYel</p>
      </footer>
    </div>
  );
};

export default Home;
