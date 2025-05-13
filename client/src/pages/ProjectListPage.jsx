import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config"; // Import from config

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    budget: ''
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL}/projects`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError("Failed to load projects. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject({
      ...newProject,
      [name]: name === 'budget' ? parseFloat(value) || '' : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newProject.name || !newProject.budget) {
      setError("Please fill all fields");
      return;
    }

    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProject.name,
          budget: parseFloat(newProject.budget)
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.msg || "Failed to add project.";
        setError(errorMsg);
        return;
      }

      setProjects([data, ...projects]);
      setNewProject({ name: '', budget: '' });
    } catch (err) {
      console.error("Failed to add project:", err);
      setError("Failed to add project. Server error.");
    }
  };

  return (
    <div>
      <h2>Projects</h2>
      
      {/* Add Project Form */}
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          name="name"
          placeholder="Project Name"
          value={newProject.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="budget"
          placeholder="Budget"
          step="0.01"
          min="0.01"
          value={newProject.budget}
          onChange={handleInputChange}
          required
        />
        <button type="submit">Add Project</button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {isLoading ? (
        <p>Loading projects...</p>
      ) : (
        <table className="project-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Budget</th>
              <th>Total Spent</th>
              <th>Remaining</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>{project.name}</td>
                <td>${(project.budget || 0).toFixed(2)}</td>
                <td>${(project.totalSpent || 0).toFixed(2)}</td>
                <td>${((project.budget || 0) - (project.totalSpent || 0)).toFixed(2)}</td>
                <td>
                  <Link to={`/projects/${project.id}`}>
                    <button>View Details</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProjectList; 