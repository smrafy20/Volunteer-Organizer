

// components/layout/Footer.js
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer py-2 bg-dark text-light">
      <Container>
        <Row className="align-items-center">
          <Col md={4} className="text-center text-md-start">
            <span className="small">Volunteer Organizer © {new Date().getFullYear()}</span>
          </Col>
          <Col md={4} className="text-center">
            <div className="d-flex justify-content-center gap-3">
              <Link to="/" className="text-light small">Home</Link>
              <Link to="/about" className="text-light small">About</Link>
              <Link to="/contact" className="text-light small">Contact</Link>
            </div>
          </Col>
          <Col md={4} className="text-center text-md-end">
            <span className="small">support@travelplanner.com</span>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
