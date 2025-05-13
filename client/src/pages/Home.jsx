import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import allBg from '../assets/hero.jpg'; // Maintain the same background image

const Home = () => {
  return (
    <div
      className="landing-page"
      style={{
        position: 'relative',
        minHeight: 'calc(100vh - 1px)', // Prevents scrollbar from appearing
        color: '#fff',
        zIndex: 1,
        overflow: 'hidden' // Prevents any potential scrolling
      }}
    >
      {/* Background Image */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${allBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(5px)',
          zIndex: -1,
        }}
      ></div>
      
      {/* Dark overlay for better text visibility */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: -1,
        }}
      ></div>

      <Container style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <Row className="align-items-center" style={{ minHeight: '70vh' }}>
          <Col md={6} className="text-center text-md-start">
            <h1 className="display-4 mb-4" style={{ fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              Organize Your Volunteer Projects
            </h1>
            <p className="lead mb-4" style={{ fontSize: '1.25rem', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              Plan community service projects, track expenses, and coordinate with team members.
              All in one place.
            </p>
            <div className="d-flex gap-3 justify-content-center justify-content-md-start">
              <Link to="/register">
                <Button variant="primary" size="lg">Get Started</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline-light" size="lg">Login</Button>
              </Link>
            </div>
          </Col>
          <Col md={6} className="d-none d-md-block">
            <img
              src={allBg}
              alt="Volunteer Planning"
              className="img-fluid"
              style={{
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                maxHeight: '70vh',
                objectFit: 'cover'
              }}
            />
          </Col>
        </Row>

        <Row className="py-4">
          <h2 className="text-center mb-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Key Features</h2>
          <Col md={3} className="text-center mb-4">
            <div className="feature-card p-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', height: '100%' }}>
              <i className="bi bi-calendar-check fs-1 mb-3" style={{ color: '#fff' }}></i>
              <h4 style={{ fontWeight: '600' }}>Project Planning</h4>
              <p>Create detailed itineraries for your volunteer projects</p>
            </div>
          </Col>
          <Col md={3} className="text-center mb-4">
            <div className="feature-card p-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', height: '100%' }}>
              <i className="bi bi-cash-stack fs-1 mb-3" style={{ color: '#fff' }}></i>
              <h4 style={{ fontWeight: '600' }}>Expense Tracking</h4>
              <p>Keep track of all your project expenses</p>
            </div>
          </Col>
          <Col md={3} className="text-center mb-4">
            <div className="feature-card p-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', height: '100%' }}>
              <i className="bi bi-list-check fs-1 mb-3" style={{ color: '#fff' }}></i>
              <h4 style={{ fontWeight: '600' }}>Packing Checklists</h4>
              <p>Never forget essential supplies again</p>
            </div>
          </Col>
          <Col md={3} className="text-center mb-4">
            <div className="feature-card p-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', height: '100%' }}>
              <i className="bi bi-share fs-1 mb-3" style={{ color: '#fff' }}></i>
              <h4 style={{ fontWeight: '600' }}>Project Sharing</h4>
              <p>Share your plans with team members and organizers</p>
            </div>
          </Col>
        </Row>

        <Row className="py-4">
          <Col md={12} className="text-center">
            <h2 className="mb-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              Start Planning Your Next Community Service Project
            </h2>
            <Link to="/register">
              <Button variant="primary" size="lg">Create Free Account</Button>
            </Link>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;