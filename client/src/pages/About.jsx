import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const About = () => {
  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="text-center mb-4">About Volunteer Organizer</h1>
          <p className="lead text-center">
            Our mission is to connect passionate volunteers with meaningful opportunities to make a difference.
          </p>
        </Col>
      </Row>
      
      <Row className="mb-5">
        <Col md={8} className="mx-auto">
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="h4 mb-3">Our Story</h2>
              <p>
                Volunteer Organizer was founded in 2024 with a simple goal: make volunteering easier and more 
                accessible for everyone. We believe that everyone has something valuable to contribute to their 
                community, and we're here to help you find the perfect way to share your time and talents.
              </p>
              <p>
                Our platform helps volunteers track their projects, connect with organizations, and measure their 
                impact in communities around the world.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <h2 className="text-center mb-4">What We Offer</h2>
        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <h3 className="h5">Profile Management</h3>
              <p>Create and manage your volunteer profile with all your skills and interests.</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <h3 className="h5">Project Organization</h3>
              <p>Organize your volunteer activities with detailed project tracking.</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <h3 className="h5">Impact Tracking</h3>
              <p>Track your volunteer hours and the impact you're making in your community.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default About; 