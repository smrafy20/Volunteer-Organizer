

// components/layout/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          Volunteer Organizer
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            {token && (
              <>
                <Nav.Link as={Link} to="/dashboard" className="px-4">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/profile" className="px-4">Profile</Nav.Link>
                <Nav.Link as={Link} to="/about" className="px-4">About</Nav.Link>
                <Nav.Link as={Link} to="/contact" className="px-4">Contact</Nav.Link> {/* Added Contact link */}
              </>
            )}
          </Nav>
          <Nav>
            {!token ? (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register" className="ms-3">Register</Nav.Link>
              </>
            ) : (
              <Button 
                variant="outline-light" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;