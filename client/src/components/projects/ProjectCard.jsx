// components/projects/ProjectCard.js
import React from 'react';
import { Card, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ProjectCard = ({ project, onDelete }) => { 
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await onDelete(project._id); 
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleViewDetails = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    navigate(`/trip/${project._id}`);
  };

  return (
    <Card className="h-100 shadow-sm hover-card">
      <Card.Body>
        <Card.Title className="text-primary">{project.name}</Card.Title> 
        <Card.Text>
          <strong>Cause:</strong> {project.cause}<br /> 
          <strong>Location:</strong> {project.location}<br />
          <strong>Date:</strong> {new Date(project.startDate).toLocaleDateString()} -{' '}
          {new Date(project.endDate).toLocaleDateString()}<br />
          <strong>Budget:</strong> ${project.budget}
        </Card.Text>

        {project.notes && ( 
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="note-tooltip">{project.notes}</Tooltip>}
          >
            <span className="project-notes">See Note</span> 
          </OverlayTrigger>
        )}
        
        {project.sharing?.groupNotes?.[0]?.note && ( 
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="group-note-tooltip">
                {project.sharing.groupNotes[0].note} 
              </Tooltip>
            }
          >
            <span className="project-notes">See Group Note</span> 
          </OverlayTrigger>
        )}

        <div className="d-flex justify-content-between mt-3">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProjectCard;
