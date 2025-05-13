// components/projects/ProjectForm.js
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const ProjectForm = ({ onSubmit }) => {
  const [projectData, setProjectData] = useState({
    name: '',
    cause: '', 
    location: '',
    startDate: '',
    endDate: '',
    notes: '',
    budget: '' 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...projectData,
      budget: Number(projectData.budget) || 0 
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Project Name</Form.Label>
        <Form.Control
          type="text"
          value={projectData.name}
          onChange={(e) => setProjectData({...projectData, name: e.target.value})}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Cause</Form.Label> 
        <Form.Control
          type="text"
          value={projectData.cause}
          onChange={(e) => setProjectData({...projectData, cause: e.target.value})}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Location</Form.Label> 
        <Form.Control
          type="text"
          value={projectData.location} 
          onChange={(e) => setProjectData({...projectData, location: e.target.value})}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Start Date</Form.Label>
        <Form.Control
          type="date"
          value={projectData.startDate}
          onChange={(e) => setProjectData({...projectData, startDate: e.target.value})}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>End Date</Form.Label>
        <Form.Control
          type="date"
          value={projectData.endDate}
          onChange={(e) => setProjectData({...projectData, endDate: e.target.value})}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Budget ($)</Form.Label>
        <Form.Control
          type="number"
          value={projectData.budget}
          onChange={(e) => setProjectData({...projectData, budget: e.target.value})}
          placeholder="Enter project budget"
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Notes</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={projectData.notes}
          onChange={(e) => setProjectData({...projectData, notes: e.target.value})}
        />
      </Form.Group>
      <Button variant="primary" type="submit">
        Create Project 
      </Button>
    </Form>
  );
};

export default ProjectForm;
