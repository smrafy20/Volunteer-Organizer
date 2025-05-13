// client/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import ProjectForm from '../components/projects/ProjectForm'; 
import ProjectCard from '../components/projects/ProjectCard'; 
import allBg from '../assets/all-bg.jpg';

const Dashboard = () => {
  const [projects, setProjects] = useState([]); 
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects(); 
  }, []);

  const fetchProjects = async () => { 
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/projects', { 
        headers: {
          'x-auth-token': token,
        },
      });
      setProjects(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch projects'); // Update error message
      setLoading(false);
      console.error('Error fetching projects:', err);
    }
  };

  const handleCreateProject = async (projectData) => { 
    try {
      const token = localStorage.getItem('token');
      
      // Format dates properly
      const formattedProjectData = { 
        ...projectData,
        startDate: new Date(projectData.startDate).toISOString(),
        endDate: new Date(projectData.endDate).toISOString()
      };

      const response = await axios.post('http://localhost:5000/api/projects', formattedProjectData, { // Update route
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
      });
      setProjects([...projects, response.data]); 
      setShowAddModal(false);
    } catch (err) {
      console.error('Error details:', err.response?.data || err.message);
      setError(err.response?.data?.msg || 'Failed to create project'); // 
    }
  };

  const handleDeleteProject = async (projectId) => { 
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/projects/${projectId}`, { 
        headers: {
          'x-auth-token': token,
        },
      });
      setProjects((prevProjects) => prevProjects.filter((project) => project._id !== projectId)); 
    } catch (err) {
      setError('Failed to delete project'); 
      console.error('Error deleting project:', err); 
    }
  };

  const upcomingProjects = projects.filter((project) => new Date(project.startDate) >= new Date()); 
  const pastProjects = projects.filter((project) => new Date(project.startDate) < new Date()); 

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-5 text-danger">{error}</div>;
  }

  return (
    <Container
      className="py-4"
      style={{
        position: 'relative',
        minHeight: '100vh',
        padding: '2rem',
        color: '#fff',
      }}
    >
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
          filter: 'blur(2px)',
          zIndex: -1,
        }}
      ></div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Projects</h1> 
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          Add New Project  
        </Button>
      </div>

      <section className="mb-5">
        <h2>Upcoming Projects</h2> 
        <Row>
          {upcomingProjects.length === 0 ? ( 
            <Col>
              <p className="text-muted">No upcoming projects planned.</p> 
            </Col>
          ) : (
            upcomingProjects.map((project) => ( 
              <Col key={project._id} md={4} className="mb-3"> 
                <ProjectCard project={project} onDelete={handleDeleteProject} /> 
              </Col>
            ))
          )}
        </Row>
      </section>

      <section>
        <h2>Past Projects</h2>
        <Row>
          {pastProjects.length === 0 ? ( 
            <Col>
              <p className="text-muted">No past projects.</p>
            </Col>
          ) : (
            pastProjects.map((project) => ( 
              <Col key={project._id} md={4} className="mb-3">
                <ProjectCard project={project} onDelete={handleDeleteProject} />
              </Col>
            ))
          )}
        </Row>
      </section>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Project</Modal.Title> 
        </Modal.Header>
        <Modal.Body>
          <ProjectForm onSubmit={handleCreateProject} /> 
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Dashboard; 