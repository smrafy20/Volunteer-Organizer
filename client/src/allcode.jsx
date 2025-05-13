src / assets / all-bg.jpg  
src / assets / hero.jpg  

src / components / layout / Footer.jsx  


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

src / components / layout / Navbar.jsx  


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
src / components / packing / PackingList.jsx 
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, ProgressBar, ListGroup, InputGroup, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import packingListService from '../../services/packingListService';

const PackingList = ({ tripId, initialItems = [] }) => {
  const [items, setItems] = useState(initialItems);
  const [newItem, setNewItem] = useState('');
  const [progress, setProgress] = useState(0);
  const [packedCount, setPackedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Calculate progress whenever items change
    if (items.length > 0) {
      const packedItems = items.filter(item => item.isPacked).length;
      setPackedCount(packedItems);
      setProgress(Math.round((packedItems / items.length) * 100));
    } else {
      setPackedCount(0);
      setProgress(0);
    }
  }, [items]);

  // Load initial packing list from the server
  useEffect(() => {
    if (initialItems.length === 0 && tripId) {
      const fetchPackingList = async () => {
        try {
          console.log('Fetching packing list for trip:', tripId);
          const data = await packingListService.getPackingList(tripId);
          console.log('Received packing list data:', data);
          if (data && Array.isArray(data)) {
            setItems(data);
          }
        } catch (error) {
          console.error('Error fetching packing list:', error.response?.data || error.message);
        }
      };
      
      fetchPackingList();
    } else {
      // If we have initial items, use them
      console.log('Using initial items:', initialItems);
      setItems(initialItems);
    }
  }, [tripId, initialItems]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    setIsLoading(true);
    try {
      console.log('Adding new item to trip:', tripId);
      const newItemObj = { 
        item: newItem.trim(), 
        isPacked: false
        // Note: _id will be generated by the server
      };
      
      const updatedItems = [...items, newItemObj];
      console.log('Sending updated list to server:', updatedItems);
      
      // Update the server
      const response = await packingListService.updatePackingList(tripId, updatedItems);
      
      // Use the server's response which includes proper _id values
      setItems(response);
      setNewItem('');
      toast.success('Item added successfully');
    } catch (err) {
      console.error('Error details:', err.response?.data || err.message);
      toast.error('Failed to add item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleItem = async (id) => {
    setIsLoading(true);
    try {
      console.log('Toggling item:', id);
      const updatedItems = items.map(item => 
        (item._id && item._id.toString()) === id.toString() ? { ...item, isPacked: !item.isPacked } : item
      );
      
      // Update the server
      const response = await packingListService.updatePackingList(tripId, updatedItems);
      
      // Use the server's response
      setItems(response);
    } catch (err) {
      console.error('Error details:', err.response?.data || err.message);
      toast.error('Failed to update item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (id) => {
    setIsLoading(true);
    try {
      console.log('Removing item:', id);
      const updatedItems = items.filter(item => 
        !item._id || (item._id.toString() !== id.toString())
      );
      
      // Update the server
      const response = await packingListService.updatePackingList(tripId, updatedItems);
      
      // Use the server's response
      setItems(response);
      toast.success('Item removed successfully');
    } catch (err) {
      console.error('Error details:', err.response?.data || err.message);
      toast.error('Failed to remove item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-sm mb-4">
      <Card.Header as="h5">Packing Checklist</Card.Header>
      <Card.Body>
        <Form onSubmit={handleAddItem}>
          <InputGroup className="mb-3">
            <Form.Control
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add an item..."
              aria-label="Add an item"
              disabled={isLoading}
            />
            <Button variant="primary" type="submit" disabled={isLoading}>
              Add
            </Button>
          </InputGroup>
        </Form>

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="d-flex align-items-center">
              <span className="me-2">Packing Progress:</span>
              <Badge bg={progress === 100 ? 'success' : 'primary'}>
                {packedCount} of {items.length} items packed
              </Badge>
            </div>
            <span className="fw-bold">{progress}%</span>
          </div>
          <ProgressBar 
            now={progress} 
            variant={progress === 100 ? 'success' : 'primary'} 
            striped={progress < 100}
            animated={progress < 100}
          />
        </div>

        {items.length > 0 ? (
          <ListGroup variant="flush">
            {items.map((item, index) => (
              <ListGroup.Item 
                key={item._id || `temp-${index}`}
                className="d-flex justify-content-between align-items-center"
              >
                <Form.Check
                  type="checkbox"
                  id={`item-${item._id || index}`}
                  label={item.item}
                  checked={item.isPacked}
                  onChange={() => handleToggleItem(item._id || `temp-${index}`)}
                  className={item.isPacked ? 'text-decoration-line-through text-muted' : ''}
                  disabled={isLoading}
                />
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => handleRemoveItem(item._id || `temp-${index}`)}
                  disabled={isLoading}
                >
                  ×
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p className="text-muted text-center">No items added yet. Add items you need to pack!</p>
        )}
      </Card.Body>
    </Card>
  );
};

export default PackingList;  
src / components / projects / ProjectCard.jsx  
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

src / components / projects / ProjectForm.jsx  
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

src / components / routing / PrivateRoute.jsx  
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default PrivateRoute;

src / components / ExpenseForm.jsx  
// src/components/ExpenseForm.jsx
import React, { useState } from "react";
// Removed: import { API_BASE_URL } from '../config'; // Remove config import

const ExpenseForm = ({ onAdd }) => { // Expects onAdd prop
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Supplies");
  // Set default date to today's date in YYYY-MM-DD format
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!desc.trim() || !amount || !category || !date || parseFloat(amount) <= 0) {
      alert("Please fill all fields correctly (amount > 0)."); // Use toast instead of alert for better UX
      // toast.error("Please fill all fields correctly (amount > 0).");
      return;
    }

    setIsLoading(true); // Start loading

    const newExpenseData = {
      desc: desc.trim(), // Trim description
      amount: parseFloat(amount),
      category,
      date, // Keep date as YYYY-MM-DD for sending
    };

    // Call the parent handler
    const success = await onAdd(newExpenseData);

    setIsLoading(false); // End loading

    if (success) {
      setDesc("");
      setAmount("");
      // setDate(new Date().toISOString().split("T")[0]); // Optionally reset date or keep it
      setCategory("Supplies"); // Reset category to default
    }
     // onAdd handler in parent should show toast messages
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      {/* Added disabled state */}
      <input
        placeholder="Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        required
        disabled={isLoading}
      />

       {/* Added disabled state and min/step attributes */}
      <input
        placeholder="Amount"
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        min="0.01"
        disabled={isLoading}
      />

       {/* Added disabled state */}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        disabled={isLoading}
      />

       {/* Added disabled state */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
        disabled={isLoading}
      >
        <option value="Supplies">Supplies</option>
        <option value="Transportation">Transportation</option>
        <option value="Materials">Materials</option>
        <option value="Other">Other</option>
      </select>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add Expense'} {/* Loading text */}
      </button>
    </form>
  );
};

export default ExpenseForm;
src / components / ExpenseList.jsx  
// src/components/ExpenseList.jsx
import React, { useState } from "react";
// Removed: import { API_BASE_URL } from '../config'; // Remove config import
import { toast } from 'react-toastify'; // Assuming toastify is used for errors

// Expects expenses prop where each expense has _id, description, amount, category, date
const ExpenseList = ({ expenses, onDelete, onUpdate }) => {
  const [editingId, setEditingId] = useState(null);
  // editData should store data using keys that match the original expense object for clarity
  const [editData, setEditData] = useState({ _id: null, description: '', amount: '', category: '' });
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleEdit = (exp) => {
    setEditingId(exp._id); // Use _id
    // Initialize editData with all relevant fields from the expense
    setEditData({
      _id: exp._id,
      description: exp.description, // Use description
      amount: exp.amount, // Keep as number
      category: exp.category,
      // date is not edited in this form, skip it
    });
  };

  const handleSave = async () => {
    // Basic client-side validation
    if (!editData.description.trim() || editData.amount === undefined || editData.amount === null || parseFloat(editData.amount) <= 0) {
        toast.error("Please ensure description, amount (>0), and category are filled correctly.");
        return;
    }

    setIsLoading(true); // Start loading

    // onUpdate prop is expected to be an async function
    // Pass _id as 'id' to the parent handler as it expects { id, desc, ... }
    const success = await onUpdate({
         id: editData._id,
         desc: editData.description.trim(), // Pass description as 'desc' to match handler expecting 'desc'
         amount: parseFloat(editData.amount),
         category: editData.category,
         // date is not being updated
    });

    setIsLoading(false); // End loading

    if (success) {
      setEditingId(null); // Exit editing mode on success
      setEditData({ _id: null, description: '', amount: '', category: '' }); // Reset edit data
    }
     // onUpdate handler in parent should show toast messages
  };

  // onDelete prop is expected to be an async function that takes expenseId (_id)
  const handleDeleteClick = async (expenseId) => {
       if (!window.confirm('Are you sure you want to delete this expense?')) {
           return; // Do nothing if user cancels
       }
      setIsLoading(true); // Start loading (might disable all delete buttons while one is processing)

      // await onDelete(expenseId); // Parent handler already handles async

      // Call parent handler which is async
      await onDelete(expenseId);

      setIsLoading(false); // End loading
       // onDelete handler in parent should show toast messages
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
        ...prev,
        [name]: name === 'amount' ? parseFloat(value) : value // Parse amount to number
    }));
  };

  if (!expenses || expenses.length === 0) {
      // This message is now handled in TripDetail, but can keep as fallback
      // return <p className="text-muted text-center">No expenses added yet.</p>;
      return null; // Return null if expenses are empty, parent component handles the message
  }


  return (
    <table className="expense-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Category</th>
          <th>Description</th>
          <th>Amount</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {(expenses || []).map((exp) => ( // Ensure expenses is iterable
          <tr key={exp._id}> {/* Use exp._id */}
            <td>{exp.date ? new Date(exp.date).toLocaleDateString() : 'N/A'}</td> {/* Use exp.date */}
            <td>
              {editingId === exp._id ? ( // Use exp._id
                <select
                  name="category"
                  value={editData.category}
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  <option value="Supplies">Supplies</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Materials">Materials</option>
                  <option value="Other">Other</option>
                </select>
              ) : (exp.category)} {/* Use exp.category */}
            </td>
            <td>
              {editingId === exp._id ? ( // Use exp._id
                <input
                  name="description" // Use description
                  value={editData.description} // Use description
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              ) : (exp.description)} {/* Use exp.description */}
            </td>
            <td>
              {editingId === exp._id ? ( // Use exp._id
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  value={editData.amount}
                  onChange={handleInputChange}
                  min="0.01"
                  disabled={isLoading}
                />
              ) : (
                `$${Number(exp.amount).toFixed(2)}` // Use exp.amount
              )}
            </td>
            <td>
              {editingId === exp._id ? ( // Use exp._id
                <>
                   {/* Added disabled state */}
                  <button onClick={handleSave} disabled={isLoading}>Save</button>
                   {/* Added disabled state */}
                  <button onClick={() => setEditingId(null)} disabled={isLoading}>Cancel</button>
                </>
              ) : (
                 // Added disabled state for edit/delete buttons
                <>
                  <button onClick={() => handleEdit(exp)} disabled={isLoading}>Edit</button> {/* Pass exp object */}
                  <button onClick={() => handleDeleteClick(exp._id)} disabled={isLoading}>Delete</button> {/* Pass exp._id */}
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ExpenseList;
src / components / SummaryChart.jsx  
// src/components/SummaryChart.jsx
import React from "react";

const SummaryChart = ({ expenses }) => {
    // Ensure expenses is an array and amounts are numbers before reducing
    const summary = (expenses || []).reduce((acc, expense) => { // Ensure expenses is array
        // Use expense.category and expense.amount as per updated schema/data
        acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount); // Use Number() to be safe
        return acc;
    }, {});

    return (
        <div className="summary">
            <h3>Summary by Category</h3>
            {(!expenses || expenses.length === 0) ? ( // Check if expenses is null/empty array
                 <p>No expenses added yet.</p>
            ) : (
                 <ul>
                    {Object.entries(summary).map(([cat, amt]) => (
                        <li key={cat}>
                            {cat}: ${amt.toFixed(2)} {/* Format for display */}
                        </li>
                    ))}
                </ul>
            )}

        </div>
    );
};

export default SummaryChart;

src / context / AuthContext.jsx  
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 

src / pages / About.jsx  
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

src / pages / Contact.jsx  
import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const { name, email, subject, message } = formData;
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !email || !message) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Here you would normally send the data to your backend
    console.log('Contact form data:', formData);
    
    // Simulate successful submission
    setIsSubmitted(true);
    setError('');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center mb-4">
        <Col md={8}>
          <h1 className="text-center mb-4">Contact Us</h1>
          <p className="text-center lead">
            Have questions or suggestions? We'd love to hear from you!
          </p>
        </Col>
      </Row>
      
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              {isSubmitted && (
                <Alert variant="success" className="mb-4">
                  Thank you for your message! We'll get back to you soon.
                </Alert>
              )}
              
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    type="text"
                    name="subject"
                    value={subject}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Message *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="message"
                    value={message}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                
                <div className="d-grid">
                  <Button variant="primary" type="submit">
                    Send Message
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact; 
src / pages / Dashboard.jsx  
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
src / pages / Home.jsx  
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
src / pages / Login.jsx  
// pages/Login.js
import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/users/login', formData);
      // Store the token in localStorage
      localStorage.setItem('token', res.data.token);
      // Redirect to dashboard after successful login
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col md={6}>
          <div className="text-center mb-4">
            <h2>Welcome Back!</h2>
            <p className="text-muted">Please login to access your travel plans</p>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <div className="p-4 border rounded shadow-sm bg-white">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </Form.Group>

              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 mb-3"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <div className="text-center">
                <p className="mb-0">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-decoration-none">
                    Register here
                  </Link>
                </p>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;

src / pages / Profile.jsx 
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import allBg from '../assets/all-bg.jpg'; // Import the background image

const Profile = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    contactNumber: '',
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/users/me', {
          headers: { 'x-auth-token': token },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/users/me',
        {
          name: user.name,
          contactNumber: user.contactNumber,
        },
        {
          headers: { 'x-auth-token': token },
        }
      );
      setUser(response.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'danger', text: 'Error updating profile.' });
    }
  };

  return (
    <Container
      className="py-4"
      style={{
        position: 'relative',
        minHeight: '100vh',
        color: '#fff',
        zIndex: 1, // Ensure content remains above the background
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
          filter: 'blur(75px)', // Apply blur effect
          zIndex: -1, // Place background behind the content
        }}
      ></div>

      <h1>Profile</h1>
      {message && (
        <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
          {message.text}
        </Alert>
      )}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={user.email} disabled />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Contact Number</Form.Label>
          <Form.Control
            type="tel"
            value={user.contactNumber}
            onChange={(e) => setUser({ ...user, contactNumber: e.target.value })}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Update Profile
        </Button>
      </Form>
    </Container>
  );
};

export default Profile;

src / pages / ProjectDetailPage.jsx  
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ExpenseForm from "../components/ExpenseForm"; // Corrected path
import SummaryChart from "../components/SummaryChart"; // Corrected path
import ExpenseList from "../components/ExpenseList";   // Corrected path
import { API_BASE_URL } from "../config"; // Import from config

const ProjectDetail = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch both expenses and project data
        // The expense routes now return project details alongside expenses
        const expensesRes = await fetch(`${API_BASE_URL}/projects/${projectId}/expenses`);
        // We might not need a separate project call if /expenses returns enough project data, 
        // or if your main project endpoint is different, adjust accordingly.
        // For now, assuming /projects/:projectId/expenses gives us what we need for project summary display.
        
        if (!expensesRes.ok) {
          const errorData = await expensesRes.json().catch(() => ({})); // Try to get error msg
          throw new Error(errorData.msg || 'Failed to fetch project expenses data');
        }

        const data = await expensesRes.json();
        
        // The new expense routes return project details in data.project and expenses in data.expenses
        setProject(data.project); 
        setExpenses(data.expenses.map(exp => ({
          ...exp,
          amount: parseFloat(exp.amount)
        })));

      } catch (err) {
        console.error("Failed to fetch project data:", err);
        setError(err.message || "Failed to load project data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  const addExpense = async (expenseData) => {
    try {
      if (!expenseData.desc || !expenseData.amount || !expenseData.category || !expenseData.date) {
        setError("Please fill all fields before adding.");
        return false;
      }
      if (expenseData.amount <= 0) {
        setError("Amount must be positive.");
        return false;
      }

      const res = await fetch(`${API_BASE_URL}/projects/${projectId}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.msg || "Failed to add expense.";
        setError(errorMsg);
        console.error("API Error:", data);
        return false;
      }

      const addedExpense = { ...data, amount: parseFloat(data.amount) };
      setExpenses([addedExpense, ...expenses]);

      // Update project totals locally by refetching or calculating
      // For simplicity, re-fetch or calculate based on the change.
      // The project state (budget, totalSpent, remaining) should be updated.
      // The GET /:projectId/expenses route already returns the project with updated totals if we want to re-fetch.
      // Or, we can adjust locally:
      setProject(prev => {
        if (!prev) return null; // Should not happen if an expense is added
        const newTotalSpent = (prev.totalSpent || 0) + addedExpense.amount;
        return {
          ...prev,
          totalSpent: newTotalSpent,
          remaining: (prev.budget || 0) - newTotalSpent
        };
      });
      
      setError(null);
      return true;
    } catch (err) {
      console.error("Failed to add expense:", err);
      setError("Failed to add expense. Server error.");
      return false;
    }
  };

  const deleteExpense = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${projectId}/expenses/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.msg || "Failed to delete expense.";
        setError(errorMsg);
        console.error("API Error:", data);
        return;
      }

      const deletedExpense = expenses.find(e => e.id === id);
      if (deletedExpense) {
        setExpenses(expenses.filter((e) => e.id !== id));
        
        setProject(prev => {
          if (!prev) return null;
          const newTotalSpent = (prev.totalSpent || 0) - deletedExpense.amount;
          return {
            ...prev,
            totalSpent: newTotalSpent,
            remaining: (prev.budget || 0) - newTotalSpent
          };
        });
      }

      setError(null);
    } catch (err) {
      console.error("Failed to delete expense:", err);
      setError("Failed to delete expense. Server error.");
    }
  };

  const updateExpense = async (updatedExpense) => {
    try {
      if (!updatedExpense.desc || !updatedExpense.amount || !updatedExpense.category) {
        setError("Please fill all fields before updating.");
        return false;
      }
      if (updatedExpense.amount <= 0) {
        setError("Amount must be positive.");
        return false;
      }

      const originalExpense = expenses.find(e => e.id === updatedExpense.id);
      if (!originalExpense) {
        setError("Expense not found.");
        return false;
      }

      const res = await fetch(`${API_BASE_URL}/projects/${projectId}/expenses/${updatedExpense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          desc: updatedExpense.desc,
          amount: updatedExpense.amount,
          category: updatedExpense.category,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.msg || "Failed to update expense.";
        setError(errorMsg);
        console.error("API Error:", data);
        return false;
      }

      const updated = { ...data, amount: parseFloat(data.amount) };
      setExpenses(expenses.map((e) => (e.id === updated.id ? updated : e)));

      if (originalExpense.amount !== updated.amount) {
        const amountDiff = updated.amount - originalExpense.amount;
        setProject(prev => {
          if (!prev) return null;
          const newTotalSpent = (prev.totalSpent || 0) + amountDiff;
          return {
            ...prev,
            totalSpent: newTotalSpent,
            remaining: (prev.budget || 0) - newTotalSpent
          };
        });
      }

      setError(null);
      return true;
    } catch (err) {
      console.error("Failed to update expense:", err);
      setError("Failed to update expense. Server error.");
      return false;
    }
  };

  if (isLoading) {
    return <p>Loading project details...</p>;
  }

  if (error && !project) { // Show error more prominently if project fails to load
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div style={{ background: '#fff', padding: '2rem 3rem', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#314646' }}>Error</h1>
          <p style={{ fontSize: '1.2rem', color: '#d9534f' }}>
            {error}
          </p>
          <Link to="/projects" style={{ marginTop: '1.5rem', display: 'inline-block', color: '#314646', textDecoration: 'underline' }}>← Back to Projects</Link>
        </div>
      </div>
    );
  }
  
  if (!project) { // Fallback if no error but project is null (e.g. bad projectId not caught by API)
     return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div style={{ background: '#fff', padding: '2rem 3rem', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#314646' }}>Project Not Found</h1>
           <Link to="/projects" style={{ marginTop: '1.5rem', display: 'inline-block', color: '#314646', textDecoration: 'underline' }}>← Back to Projects</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link to="/projects" className="back-link">← Back to Projects</Link>

      <h2>{project.name}</h2>

      <div className="budget-summary">
        <div>
          <strong>Budget:</strong> ${project.budget ? project.budget.toFixed(2) : 'N/A'}
        </div>
        <div>
          <strong>Total Spent:</strong> ${project.totalSpent ? project.totalSpent.toFixed(2) : (0).toFixed(2)}
        </div>
        <div>
          <strong>Remaining:</strong> ${project.remaining ? project.remaining.toFixed(2) : (project.budget || 0).toFixed(2)}
        </div>
      </div>

      {error && <div className="error-message" style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}

      <ExpenseForm onAdd={addExpense} />

      <SummaryChart expenses={expenses} />

      <ExpenseList 
        expenses={expenses} 
        onDelete={deleteExpense} 
        onUpdate={updateExpense} 
      />
    </div>
  );
};

export default ProjectDetail; 
src / pages / ProjectListPage.jsx  
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
src / pages / Register.jsx  
import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import allBg from '../assets/all-bg.jpg'; // Import the background image

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/users/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        contactNumber: formData.contactNumber
      });

      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
      }}
    >
      {/* Background Image */}
      <img
        src={allBg}
        alt="Background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(5px)',
          zIndex: -1,
        }}
      />

      <Container>
        <Row className="justify-content-md-center mt-5">
          <Col md={6}>
            <div className="text-center mb-4">
              <h2>Create Account</h2>
              <p className="text-muted">Join us to start planning your trips</p>
            </div>

            {error && (
              <Alert variant="danger" className="mb-4">
                {error}
              </Alert>
            )}

            <div className="p-4 border rounded shadow-sm bg-white">
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Contact Number</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter your contact number"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <Form.Text className="text-muted">
                    Must be at least 6 characters long
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Register'}
                </Button>

                <div className="text-center">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-decoration-none">
                      Login here
                    </Link>
                  </p>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;

src / pages / TripDetail.jsx  
// src/pages/TripDetail.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Tab, Tabs } from 'react-bootstrap'; // Import Tab, Tabs
import { format } from 'date-fns';
import axios from 'axios';
import PackingList from '../components/packing/PackingList';
import ExpenseForm from '../components/ExpenseForm'; // Corrected path relative to pages/
import SummaryChart from '../components/SummaryChart'; // Corrected path relative to pages/
import ExpenseList from '../components/ExpenseList'; // Corrected path relative to pages/
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config'; // Import API_BASE_URL

const TripDetail = () => {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details'); // State for active tab
  const { id } = useParams();
  const navigate = useNavigate();

  // Use useCallback for fetch function to prevent infinite loop in useEffect
  const fetchTripDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors

      // Get the auth token
      const token = localStorage.getItem('token');
      if (!token) {
        // If no token, PrivateRoute should handle redirect, but good practice to check
        navigate('/login');
        return;
      }

      // Fetch the project from the API (includes expenses and packingList now)
      const res = await axios.get(`${API_BASE_URL}/projects/${id}`, {
        headers: {
          'x-auth-token': token
        }
      });

      // Sort expenses by date descending for display
      if (res.data.expenses && Array.isArray(res.data.expenses)) {
           res.data.expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
      }

      setTrip(res.data);
      setLoading(false);

    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to load trip details';
      setError(errorMsg);
      setLoading(false);
      console.error('Error fetching trip details:', err);
      toast.error(errorMsg); // Show toast notification for fetch error
    }
  }, [id, navigate]); // Dependencies for useCallback

  useEffect(() => {
    fetchTripDetails();
  }, [fetchTripDetails]); // useEffect depends on the memoized fetch function

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        const token = localStorage.getItem('token');

        await axios.delete(`${API_BASE_URL}/projects/${id}`, {
          headers: {
            'x-auth-token': token
          }
        });

        toast.success('Project deleted successfully');
        navigate('/dashboard'); // Redirect back to dashboard after deletion
      } catch (err) {
        const errorMsg = err.response?.data?.msg || 'Failed to delete project';
        setError(errorMsg); // Set error state
        toast.error(errorMsg);
        console.error('Error deleting trip:', err);
      }
    }
  };

   // --- Expense Management Handlers ---

  const handleAddExpense = async (expenseData) => {
      try {
          const token = localStorage.getItem('token');
          if (!token) {
              navigate('/login');
              // Indicate failure by returning false or throwing
              return false;
          }

          // Prepare payload to match backend POST route's expected body ({ desc, amount, category, date })
          const payload = {
              desc: expenseData.desc.trim(), // Use 'desc' key for the payload to match backend route
              amount: parseFloat(expenseData.amount), // Ensure amount is number
              date: expenseData.date || new Date().toISOString().split('T')[0], // Add date if not present (should be provided by form)
              category: expenseData.category
          };

           // Basic client-side validation before sending
           if (!payload.desc || !payload.amount || !payload.category || !payload.date || payload.amount <= 0 || isNaN(payload.amount)) { // Added isNaN check
               toast.error("Please fill all expense fields correctly (amount > 0, valid date).");
               return false;
           }
           if (isNaN(new Date(payload.date).getTime())) {
                toast.error("Invalid expense date.");
                return false;
           }


          const res = await axios.post(`${API_BASE_URL}/projects/${id}/expenses`, payload, {
              headers: { 'x-auth-token': token }
          });

          const newExpense = res.data; // Backend returns the created expense subdocument

          setTrip(prevTrip => {
              // Create a new expenses array with the new expense and sort
              // Ensure expenses is an array before spreading
              const currentExpenses = Array.isArray(prevTrip?.expenses) ? prevTrip.expenses : [];
              const updatedExpenses = [newExpense, ...currentExpenses].sort((a, b) => new Date(b.date) - new Date(a.date));

              // Calculate new total spent and remaining based on the addition
              // Use Number() conversion just in case, although backend should return numbers
              const prevTotalSpent = Number(prevTrip?.totalSpent) || 0;
              const prevBudget = Number(prevTrip?.budget) || 0;
              const addedAmount = Number(newExpense?.amount) || 0;

              const newTotalSpent = prevTotalSpent + addedAmount;
              const newRemaining = prevBudget - newTotalSpent;


              return {
                  ...prevTrip,
                  expenses: updatedExpenses,
                  totalSpent: newTotalSpent,
                  remaining: newRemaining
              };
          });

          toast.success('Expense added successfully');
          return true; // Indicate success
      } catch (err) {
          const errorMsg = err.response?.data?.msg || 'Failed to add expense';
          console.error('Error adding expense:', err.response?.data || err.message);
          toast.error(errorMsg);
          // Set error state if you want to display it in the component
          // setError(errorMsg);
          return false; // Indicate failure
      }
  };

  const handleDeleteExpense = async (expenseId) => {
       if (!window.confirm('Are you sure you want to delete this expense?')) {
           return; // Do nothing if user cancels
       }
      try {
          const token = localStorage.getItem('token');
           if (!token) {
              navigate('/login');
              return;
          }

           // Find the expense to remove *before* deleting from state
          const currentExpenses = Array.isArray(trip?.expenses) ? trip.expenses : [];
          const expenseToRemove = currentExpenses.find(exp => exp._id === expenseId);
          if (!expenseToRemove) {
               toast.error("Expense not found locally."); // Should not happen if ID is valid
               return;
          }

          await axios.delete(`${API_BASE_URL}/projects/${id}/expenses/${expenseId}`, {
              headers: { 'x-auth-token': token }
          });

          setTrip(prevTrip => {
               // Filter out the deleted expense
              const prevExpenses = Array.isArray(prevTrip?.expenses) ? prevTrip.expenses : [];
              const updatedExpenses = prevExpenses.filter(exp => exp._id !== expenseId);

               // Calculate new total spent and remaining based on the deletion
              const prevTotalSpent = Number(prevTrip?.totalSpent) || 0;
              const prevBudget = Number(prevTrip?.budget) || 0;
              const removedAmount = Number(expenseToRemove.amount) || 0;

               const newTotalSpent = prevTotalSpent - removedAmount;
               const newRemaining = prevBudget - newTotalSpent;


              return {
                  ...prevTrip,
                  expenses: updatedExpenses,
                  totalSpent: newTotalSpent,
                  remaining: newRemaining
              };
          });

          toast.success('Expense deleted successfully');
      } catch (err) {
          const errorMsg = err.response?.data?.msg || 'Failed to delete expense';
          console.error('Error deleting expense:', err.response?.data || err.message);
          toast.error(errorMsg);
           // setError(errorMsg);
      }
  };

  const handleUpdateExpense = async (updatedExpenseData) => {
      try {
          const token = localStorage.getItem('token');
           if (!token) {
              navigate('/login');
              return false;
          }

           // Find the original expense to calculate the difference for budget update
           // ExpenseList passes { id: _id, desc, amount, category }
            const currentExpenses = Array.isArray(trip?.expenses) ? trip.expenses : [];
           const originalExpense = currentExpenses.find(exp => exp._id === updatedExpenseData.id);
           if (!originalExpense) {
                toast.error("Expense not found locally.");
                return false;
           }
           const originalAmount = Number(originalExpense.amount) || 0;
           const updatedAmount = parseFloat(updatedExpenseData.amount);

          // Prepare payload to match backend update logic ({ desc, amount, category })
          const payload = {
               desc: updatedExpenseData.desc.trim(), // Map 'desc' from ExpenseList to 'desc' for backend update route
               amount: updatedAmount, // Ensure number
               category: updatedExpenseData.category,
              // Date is not updatable via this route based on backend code
          };

           // Basic client-side validation before sending
           if (!payload.desc || !payload.amount || !payload.category || payload.amount <= 0 || isNaN(payload.amount)) { // Added isNaN
                toast.error("Please fill all fields correctly (amount > 0).");
               return false;
           }


          const res = await axios.put(`${API_BASE_URL}/projects/${id}/expenses/${updatedExpenseData.id}`, payload, {
              headers: { 'x-auth-token': token }
          });

          const updatedExpense = res.data; // Backend returns the updated expense subdocument

          setTrip(prevTrip => {
               const prevExpenses = Array.isArray(prevTrip?.expenses) ? prevTrip.expenses : [];
               // Find the index and replace the old expense with the updated one
               const updatedExpenses = prevExpenses.map(exp =>
                   // Match by _id, replace with updated object
                   exp._id === updatedExpense._id ? { ...exp, ...updatedExpense } : exp
               ).sort((a, b) => new Date(b.date) - new Date(a.date)); // Re-sort


               // Calculate new total spent based on the amount difference
               const prevTotalSpent = Number(prevTrip?.totalSpent) || 0;
               const prevBudget = Number(prevTrip?.budget) || 0;
               const amountDifference = (Number(updatedExpense.amount) || 0) - originalAmount;
               const newTotalSpent = prevTotalSpent + amountDifference;
               const newRemaining = prevBudget - newTotalSpent;


               return {
                   ...prevTrip,
                   expenses: updatedExpenses,
                   totalSpent: newTotalSpent,
                   remaining: newRemaining
               };
          });


          toast.success('Expense updated successfully');
          return true; // Indicate success
      } catch (err) {
          const errorMsg = err.response?.data?.msg || 'Failed to update expense';
          console.error('Error updating expense:', err.response?.data || err.message);
          toast.error(errorMsg);
           // setError(errorMsg);
          return false; // Indicate failure
      }
  };


  // Format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Use 'P' or 'PPP' from date-fns format for standard date format
      return format(new Date(dateString), 'P'); // e.g., 10/25/2024
      // Or 'MMM dd, yyyy' if you prefer that exact format
      // return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </Container>
    );
  }

   // If trip is null after loading and no error, means project was not found
  if (!trip) {
       return (
         <Container className="py-5">
           <Alert variant="warning">Project not found.</Alert>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
         </Container>
       );
  }


  return (
    <Container className="py-5">
       {/* Back button */}
       <div className="mb-3">
            <Button variant="outline-secondary" size="sm" onClick={() => navigate('/dashboard')}>
               ← Back to Dashboard
            </Button>
       </div>


      <Row className="mb-4">
        <Col>
          <h1 className="mb-0">{trip.name}</h1>
          <p className="text-muted mb-0">
            {trip.location} • {trip.cause}
          </p>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          <Button
            variant="outline-primary"
            className="me-2"
            // Add edit functionality if you have an Edit Trip page
            // onClick={() => navigate(`/trip/edit/${trip._id}`)}
             disabled // Disable for now as edit page doesn't exist
          >
            Edit
          </Button>
          <Button
            variant="outline-danger"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Col>
      </Row>

      {/* Budget Summary */}
       <Card className="shadow-sm mb-4">
           <Card.Body>
               <h5 className="mb-3">Budget Summary</h5>
               <Row>
                   <Col>
                        <strong>Budget:</strong> ${trip.budget ? Number(trip.budget).toFixed(2) : '0.00'}
                   </Col>
                   <Col>
                        <strong>Total Spent:</strong> ${trip.totalSpent ? Number(trip.totalSpent).toFixed(2) : '0.00'}
                   </Col>
                   <Col>
                        <strong>Remaining:</strong> ${trip.remaining ? Number(trip.remaining).toFixed(2) : Number(trip.budget || 0).toFixed(2)} {/* Use budget if totalSpent is 0 */}
                   </Col>
               </Row>
           </Card.Body>
       </Card>


      {/* Tabs for Details, Packing List, Expenses */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        id="project-detail-tabs"
        className="mb-3"
      >
        <Tab eventKey="details" title="Details">
          <Card className="shadow-sm mb-4"> {/* Keep card structure inside tab */}
            <Card.Body>
              <Row className="mb-3">
                <Col sm={3} className="fw-bold">Dates:</Col>
                <Col>
                  {formatDate(trip.startDate)}
                  {trip.endDate && trip.startDate !== trip.endDate &&
                    ` - ${formatDate(trip.endDate)}`}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col sm={3} className="fw-bold">Status:</Col>
                <Col>
                  <span className={`badge bg-${new Date(trip.endDate) < new Date() ? 'success' : (new Date(trip.startDate) > new Date() ? 'primary' : 'info')}`}> {/* Added 'info' for current */}
                    {new Date(trip.endDate) < new Date() ? 'Completed' : (new Date(trip.startDate) > new Date() ? 'Upcoming' : 'Ongoing')}
                  </span>
                </Col>
              </Row>
              {/* Budget moved to summary card above */}
              {/* Participants removed as it wasn't part of the main schema/form */}
              <Row className="mb-3">
                <Col sm={3} className="fw-bold">Notes:</Col>
                <Col>{trip.notes || 'No notes available'}</Col>
              </Row>
              {/* Optional: Display sharing info, group notes, itinerary here */}
              {/* Example: Display basic sharing status */}
              <Row>
                   <Col sm={3} className="fw-bold">Sharing:</Col>
                   <Col>{trip.sharing?.isShared ? `Shared with ${trip.sharing.sharedWith.length} user(s)` : 'Not Shared'}</Col>
              </Row>

            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="packing" title="Packing List">
            {/* PackingList component */}
             <PackingList tripId={trip._id} initialItems={trip.packingList || []} /> {/* Ensure initialItems is an array */}
        </Tab>

        <Tab eventKey="expenses" title="Expenses">
            {/* Expense tracking components */}
            <Card className="shadow-sm mb-4">
                <Card.Header as="h5">Add New Expense</Card.Header>
                <Card.Body>
                     {/* Pass handler to ExpenseForm */}
                     <ExpenseForm onAdd={handleAddExpense} />
                </Card.Body>
            </Card>

            <Card className="shadow-sm mb-4">
                <Card.Header as="h5">Expense Summary</Card.Header>
                <Card.Body>
                     {/* Pass expenses to SummaryChart */}
                     <SummaryChart expenses={trip.expenses || []} /> {/* Ensure expenses is array */}
                </Card.Body>
            </Card>

             <Card className="shadow-sm mb-4">
                <Card.Header as="h5">All Expenses</Card.Header>
                <Card.Body>
                     {/* Pass expenses and handlers to ExpenseList */}
                    {/* Pass the expenses array directly, ExpenseList expects objects with _id, description, amount, category, date */}
                    <ExpenseList
                        expenses={trip.expenses || []}
                        onDelete={handleDeleteExpense}
                        onUpdate={handleUpdateExpense}
                    />
                     {(!trip.expenses || trip.expenses.length === 0) && ( // Use check on expenses array
                        <p className="text-muted text-center">No expenses added yet.</p>
                     )}
                </Card.Body>
            </Card>
        </Tab>

         {/* Optional: Add more tabs like "Team" or "Itinerary" */}

      </Tabs>

    </Container>
  );
};

export default TripDetail;

src / services /  packingListService.jsx
import axios from 'axios';

// Get the base URL from environment variables or default to localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('No authentication token found in localStorage');
  }
  return {
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token || ''
    }
  };
};

// Fetch the packing list for a specific trip
export const getPackingList = async (tripId) => {
  try {
    console.log(`Fetching packing list for trip ${tripId} from ${API_URL}/projects/${tripId}/packing-list`);
    const headers = getAuthHeaders();
    console.log('Using headers:', headers);
    
    const response = await axios.get(
      `${API_URL}/projects/${tripId}/packing-list`, 
      headers
    );
    console.log('Packing list API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error details:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
    throw error;
  }
};

// Update the packing list for a specific trip
export const updatePackingList = async (tripId, packingList) => {
  try {
    console.log(`Updating packing list for trip ${tripId}`);
    console.log('Payload:', packingList);
    
    const headers = getAuthHeaders();
    console.log('Using headers:', headers);
    
    const response = await axios.put(
      `${API_URL}/projects/${tripId}/packing-list`, 
      packingList,
      headers
    );
    console.log('Update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating packing list:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
    throw error;
  }
};

// Add a new item to the packing list
export const addPackingItem = async (tripId, item) => {
  try {
    console.log(`Adding item to packing list for trip ${tripId}:`, item);
    const currentList = await getPackingList(tripId);
    const updatedList = [...currentList, item];
    return updatePackingList(tripId, updatedList);
  } catch (error) {
    console.error('Error adding packing item:', error.response?.data || error.message);
    throw error;
  }
};

// Toggle an item's packed status
export const togglePackingItem = async (tripId, itemId) => {
  try {
    console.log(`Toggling packed status for item ${itemId} in trip ${tripId}`);
    const currentList = await getPackingList(tripId);
    const updatedList = currentList.map(item => 
      item._id === itemId ? { ...item, isPacked: !item.isPacked } : item
    );
    return updatePackingList(tripId, updatedList);
  } catch (error) {
    console.error('Error toggling packing item:', error.response?.data || error.message);
    throw error;
  }
};

// Remove an item from the packing list
export const removePackingItem = async (tripId, itemId) => {
  try {
    console.log(`Removing item ${itemId} from packing list for trip ${tripId}`);
    const currentList = await getPackingList(tripId);
    const updatedList = currentList.filter(item => item._id !== itemId);
    return updatePackingList(tripId, updatedList);
  } catch (error) {
    console.error('Error removing packing item:', error.response?.data || error.message);
    throw error;
  }
};

const packingListService = {
  getPackingList,
  updatePackingList,
  addPackingItem,
  togglePackingItem,
  removePackingItem
};

export default packingListService; 


body {
  font-family: "Segoe UI", sans-serif;
  background: #f8f8f4;
  color: #333;
  margin: 0;
  /* height: 100vh; // May conflict with existing App layout, review if needed */
  /* display: flex; // May conflict with existing App layout */
  /* justify-content: center; // May conflict with existing App layout */
  /* align-items: center; // May conflict with existing App layout */
}

.container {
  max-width: 960px;
  margin: auto; /* This will center the .container block */
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  margin-bottom: 24px;
  color: #2f4f4f;
}

.form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.form input,
.form select {
  padding: 8px;
  flex: 1;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.form button {
  padding: 8px 16px;
  background: #2f4f4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.budget-summary { /* Renamed from .budget for clarity */
  margin-bottom: 20px;
  font-size: 1.0em; /* Adjusted for consistency */
  display: flex; /* For horizontal layout of summary items */
  gap: 20px; /* Space between summary items */
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.budget-summary div {
  flex: 1; /* Distribute space among items */
}

.summary {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #eef1f1;
  border-radius: 8px;
}

.summary h3 {
  margin-top: 0;
  color: #2f4f4f;
}

.summary ul {
  list-style-type: none;
  padding: 0;
}

.summary li {
  padding: 5px 0;
  border-bottom: 1px solid #dde0e0;
}
.summary li:last-child {
  border-bottom: none;
}

.expense-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px; /* Added margin */
}

.expense-table th,
.expense-table td {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  text-align: left; /* Explicitly set text alignment */
}

.expense-table th {
  background-color: #f0f4f4;
  color: #314646;
}

.expense-table button {
  margin-right: 5px;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #5a8f8f; /* Button color */
  color: white;
}

.expense-table button:hover {
  background-color: #4a7f7f;
}

.expense-table button:last-child {
  margin-right: 0;
}

/* General link styling for back links etc. */
.back-link {
  display: inline-block;
  margin-bottom: 15px;
  color: #2f4f4f;
  text-decoration: none;
}
.back-link:hover {
  text-decoration: underline;
}

.error-message {
  color: #d9534f; /* Bootstrap danger color */
  background-color: #f2dede; /* Light red background */
  border: 1px solid #ebccd1;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

/* Keep existing styles if needed, or integrate them. For example, your footer styles: */
.footer {
  /* position: fixed; // Consider if fixed footer is desired with new layout */
  /* bottom: 0; */
  width: 100%;
  padding: 10px 0; /* Adjusted padding */
  background-color: #343a40;
  color: white; /* Added text color for footer */
  text-align: center; /* Center footer text */
  margin-top: auto; /* Pushes footer to bottom if main content is short */
  z-index: 1000;
}

/* Ensure App div allows footer to be at the bottom */
/* Your App.js already has d-flex flex-column min-vh-100 on the main div */

/* Styles from your old App.css that might be useful */
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  opacity: 0.8;
}

.shadow-sm {
  transition: all 0.3s ease;
}

.shadow-sm:hover {
  transform: translateY(-5px);
}

/* Remove default CRA styles if no longer needed */
/*
.App {
  text-align: center;
}
.App-logo { ... }
.App-header { ... }
.App-link { ... }
@keyframes App-logo-spin { ... }
*/
 
src / App.css
body {
  font-family: "Segoe UI", sans-serif;
  background: #f8f8f4;
  color: #333;
  margin: 0;
  /* height: 100vh; // May conflict with existing App layout, review if needed */
  /* display: flex; // May conflict with existing App layout */
  /* justify-content: center; // May conflict with existing App layout */
  /* align-items: center; // May conflict with existing App layout */
}

.container {
  max-width: 960px;
  margin: auto; /* This will center the .container block */
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  margin-bottom: 24px;
  color: #2f4f4f;
}

.form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.form input,
.form select {
  padding: 8px;
  flex: 1;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.form button {
  padding: 8px 16px;
  background: #2f4f4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.budget-summary { /* Renamed from .budget for clarity */
  margin-bottom: 20px;
  font-size: 1.0em; /* Adjusted for consistency */
  display: flex; /* For horizontal layout of summary items */
  gap: 20px; /* Space between summary items */
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.budget-summary div {
  flex: 1; /* Distribute space among items */
}

.summary {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #eef1f1;
  border-radius: 8px;
}

.summary h3 {
  margin-top: 0;
  color: #2f4f4f;
}

.summary ul {
  list-style-type: none;
  padding: 0;
}

.summary li {
  padding: 5px 0;
  border-bottom: 1px solid #dde0e0;
}
.summary li:last-child {
  border-bottom: none;
}

.expense-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px; /* Added margin */
}

.expense-table th,
.expense-table td {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  text-align: left; /* Explicitly set text alignment */
}

.expense-table th {
  background-color: #f0f4f4;
  color: #314646;
}

.expense-table button {
  margin-right: 5px;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #5a8f8f; /* Button color */
  color: white;
}

.expense-table button:hover {
  background-color: #4a7f7f;
}

.expense-table button:last-child {
  margin-right: 0;
}

/* General link styling for back links etc. */
.back-link {
  display: inline-block;
  margin-bottom: 15px;
  color: #2f4f4f;
  text-decoration: none;
}
.back-link:hover {
  text-decoration: underline;
}

.error-message {
  color: #d9534f; /* Bootstrap danger color */
  background-color: #f2dede; /* Light red background */
  border: 1px solid #ebccd1;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

/* Keep existing styles if needed, or integrate them. For example, your footer styles: */
.footer {
  /* position: fixed; // Consider if fixed footer is desired with new layout */
  /* bottom: 0; */
  width: 100%;
  padding: 10px 0; /* Adjusted padding */
  background-color: #343a40;
  color: white; /* Added text color for footer */
  text-align: center; /* Center footer text */
  margin-top: auto; /* Pushes footer to bottom if main content is short */
  z-index: 1000;
}

/* Ensure App div allows footer to be at the bottom */
/* Your App.js already has d-flex flex-column min-vh-100 on the main div */

/* Styles from your old App.css that might be useful */
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  opacity: 0.8;
}

.shadow-sm {
  transition: all 0.3s ease;
}

.shadow-sm:hover {
  transform: translateY(-5px);
}

/* Remove default CRA styles if no longer needed */
/*
.App {
  text-align: center;
}
.App-logo { ... }
.App-header { ... }
.App-link { ... }
@keyframes App-logo-spin { ... }
*/

src / App.jsx  
// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import TripDetail from './pages/TripDetail'; // This page will now include expenses
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivateRoute from './components/routing/PrivateRoute';

// Removed imports for ProjectListPage and ProjectDetailPage

const App = () => {
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Navbar />
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover /> {/* Added toast config */}
        <main className="flex-grow-1 container py-3"> {/* Keep container/padding for consistent spacing */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Removed routes for /projects and /projects/:projectId */}

            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/trip/:id" // Use this route for detailed view including expenses
              element={
                <PrivateRoute>
                  <TripDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
src / config.jsx  
export const API_BASE_URL = 'http://localhost:5000/api'; 
src / index.css  
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
/* Add hover effect to cards */
.hover-effect {
  transition: transform 0.3s ease;
}

.hover-effect:hover {
  transform: translateY(-5px);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Smooth transitions */
* {
  transition: all 0.3s ease;
}
/* About page styles */
.accent-line {
  width: 100px;
  height: 4px;
  background: linear-gradient(90deg, #007bff, #00ff88);
  margin: 2rem auto;
  border-radius: 2px;
}

.hover-card {
  transition: all 0.3s ease;
  border-radius: 10px;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
}

.feature-title {
  color: #333;
  margin-bottom: 1rem;
}

.feature-list {
  list-style: none;
  padding: 0;
}

.feature-list li {
  padding: 1rem;
  margin-bottom: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 5px;
  position: relative;
  padding-left: 2.5rem;
}

.feature-list li:before {
  content: "✓";
  color: #007bff;
  position: absolute;
  left: 1rem;
  font-weight: bold;
}

.cta-section {
  background-color: #f8f9fa;
  border-radius: 10px;
  margin-top: 2rem;
}

.text-primary {
  color: #007bff !important;
}

.text-muted {
  color: #6c757d !important;
}

/* TripDetail page styles */
.trip-header {
  background: linear-gradient(to right, #f8f9fa, #e9ecef);
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.trip-title {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.trip-date {
  color: #6c757d;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.trip-destination {
  color: #495057;
  font-size: 1.1rem;
}

/* Custom tab styling */
.nav-tabs {
  border-bottom: 2px solid #dee2e6;
}

.nav-tabs .nav-link {
  border: none;
  color: #6c757d;
  font-weight: 500;
  padding: 1rem 1.5rem;
  transition: all 0.3s ease;
}

.nav-tabs .nav-link:hover {
  border: none;
  color: #007bff;
}

.nav-tabs .nav-link.active {
  border: none;
  color: #007bff;
  position: relative;
}

.nav-tabs .nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #007bff;
}

/* Tab content area */
.tab-content {
  background: #ffffff;
  padding: 2rem;
  border-radius: 0 0 10px 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* Loading spinner enhancement */
.spinner-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  color: #007bff;
}

/* Alert styling */
.alert {
  border-radius: 10px;
  padding: 1.5rem;
  margin: 2rem 0;
}
index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // This will need to be updated to App.jsx later
import { AuthProvider } from './context/AuthContext'; // This will need to be updated later
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
); 

server / config / db.js  
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Ensure .env variables are loaded

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI); // Using MONGODB_URI
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error connecting to MongoDB: ${err.message}`);
        process.exit(1);
    }
}
export default connectDB; 
server / middleware / auth.js  
import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

export default auth;

server / models / expense.js  

import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project', // This should refer to your existing Project model
    required: true
  },
  desc: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please add a positive amount'],
    validate: {
      validator: function(v) {
        return v > 0;
      },
      message: props => `${props.value} is not a positive number!`
    }
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Supplies', 'Transportation', 'Materials', 'Other'],
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  }
}, {
  timestamps: true
});

export default mongoose.model('Expense', ExpenseSchema); 
server / models / Project.js  

// // server/models/Project.js
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  cause: {
    type: String,
    required: true
  }, // e.g., environmental cleanup, food drive
  location: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    // Removed the start date validation here, as it can sometimes be complex
    // depending on timezones and exact requirements. Basic required is fine.
    // If strict validation is needed, handle it in routes or a pre-save hook.
  },
  endDate: {
    type: Date,
    required: true
  },
  notes: {
    type: String
  },
  itinerary: [{ // Keep this as is, although not used in provided frontend
    day: {
      type: Number,
      required: true
    },
    activities: [{
      time: String,
      description: String,
      location: String
    }]
  }],
  // Keep the nested expenses array - this is what we will use
  expenses: [{
    _id: { // Explicitly define _id for nested documents if needed, Mongoose adds it by default
       type: mongoose.Schema.Types.ObjectId,
       default: () => new mongoose.Types.ObjectId() // Ensure new _id on creation
    },
    category: {
      type: String,
      required: [true, 'Expense category is required'],
      enum: ['Supplies', 'Transportation', 'Materials', 'Other'],
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      validate: {
        validator: function(v) {
          return v > 0;
        },
        message: props => `${props.value} is not a positive number!`
      }
    },
    description: { // Renamed from 'desc' for consistency if needed, but matching frontend is fine
      type: String,
      required: [true, 'Expense description is required']
    },
    date: {
      type: Date,
      required: [true, 'Expense date is required'],
      default: Date.now // Default not ideal for expense date, remove default or handle in client/route
    }
  }],
  budget: {
    type: Number,
    default: 0 // Default budget to 0
  },
  packingList: [{ // Keep packing list as is
    _id: { // Explicitly define _id
       type: mongoose.Schema.Types.ObjectId,
       default: () => new mongoose.Types.ObjectId()
    },
    item: { type: String, required: true }, // Added required
    isPacked: {
      type: Boolean,
      default: false
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  sharing: { // Keep sharing as is
    isShared: {
      type: Boolean,
      default: false
    },
    shareLink: {
      type: String,
      default: generateShareLink // This should probably be generated *when* shared
    },
    sharedWith: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  groupNotes: [{ // Keep group notes as is
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true, // Adds createdAt and updatedAt to the main document
  toJSON: { virtuals: true }, // Include virtuals when converting to JSON
  toObject: { virtuals: true } // Include virtuals when converting to Object
});

// Virtual for total spent
projectSchema.virtual('totalSpent').get(function() {
  // Ensure expenses array exists and is iterable
  if (!this.expenses || !Array.isArray(this.expenses)) {
    return 0;
  }
  // Sum the amounts, ensuring amounts are treated as numbers
  return this.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
});

// Virtual for remaining budget
projectSchema.virtual('remaining').get(function() {
   // Ensure budget exists and is treated as number
   const budget = this.budget || 0;
   // Ensure totalSpent is calculated (virtual will be accessed)
   const totalSpent = this.totalSpent; // This accesses the virtual above
   return budget - totalSpent;
});


// This generateShareLink function is called only once when the schema is defined.
// It should probably be moved to a route handler or helper function
// to generate a unique link *when* sharing is enabled or requested.
// For now, leaving it as is but noting it's likely not intended behavior.
function generateShareLink() {
  return 'https://example.com/share/' + Math.random().toString(36).substring(2, 15);
}

projectSchema.index({ userId: 1 });
projectSchema.index({ cause: 1 });

export default mongoose.model('Project', projectSchema);

server / models / User.js  
// User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contactNumber: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);


server / routes / expense.js  
import express from 'express';
import Expense from '../models/expense.js';
import Project from '../models/Project.js'; // Assuming your existing Project model is here

const router = express.Router();

// Middleware to validate project ID
const validateProject = async (req, res, next) => {
  try {
    // req.params.projectId will be available if router is mounted like app.use('/api/projects', expenseRoutes)
    // and the route is defined as '/:projectId/expenses'
    const projectId = req.params.projectId || req.params.id; // Adjust if projectId name varies
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }
    req.project = project; // Attach project to request object
    req.projectId = projectId; // Standardize projectId access
    next();
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found (Invalid ID)' });
    }
    res.status(500).send('Server Error');
  }
};

// @route   GET /:projectId/expenses
// @desc    Get all expenses for a project
// @access  Public (modify with auth middleware if needed)
router.get('/:projectId/expenses', validateProject, async (req, res) => {
  try {
    const expenses = await Expense.find({ project: req.projectId }).sort({ date: -1 });
    
    const formattedExpenses = expenses.map(exp => ({
      id: exp._id.toString(),
      desc: exp.desc,
      amount: exp.amount,
      category: exp.category,
      date: exp.date ? new Date(exp.date).toISOString().split('T')[0] : '',
      createdAt: exp.createdAt,
      updatedAt: exp.updatedAt
    }));
    
    res.json({
      project: {
        id: req.project._id.toString(),
        name: req.project.name,
        budget: req.project.budget
      },
      expenses: formattedExpenses
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /:projectId/expenses
// @desc    Add new expense to a project
// @access  Public (modify with auth middleware if needed)
router.post('/:projectId/expenses', validateProject, async (req, res) => {
  const { desc, amount, category, date } = req.body;

  if (!desc || amount === undefined || amount === null || !category || !date) {
    return res.status(400).json({ msg: 'Please include all fields' });
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ msg: 'Amount must be a positive number' });
  }

  try {
    const newExpense = new Expense({
      project: req.projectId,
      desc,
      amount,
      category,
      date: new Date(date)
    });

    const expense = await newExpense.save();

    const formattedExpense = {
      id: expense._id.toString(),
      desc: expense.desc,
      amount: expense.amount,
      category: expense.category,
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt
    };

    res.status(201).json(formattedExpense);
  } catch (err) {
    console.error(err.message);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ msg: messages.join(', ') });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /:projectId/expenses/:expenseId
// @desc    Update an expense in a project
// @access  Public (modify with auth middleware if needed)
router.put('/:projectId/expenses/:expenseId', validateProject, async (req, res) => {
  const { desc, amount, category } = req.body;

  const expenseFields = {};
  if (desc !== undefined) expenseFields.desc = desc;
  if (category !== undefined) expenseFields.category = category;
  if (amount !== undefined && amount !== null) {
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ msg: 'Amount must be a positive number if provided' });
    }
    expenseFields.amount = amount;
  }

  try {
    let expense = await Expense.findOne({
      _id: req.params.expenseId,
      project: req.projectId
    });

    if (!expense) {
      return res.status(404).json({ msg: 'Expense not found in this project' });
    }

    expense = await Expense.findByIdAndUpdate(
      req.params.expenseId,
      { $set: expenseFields },
      { new: true, runValidators: true }
    );

    const formattedExpense = {
      id: expense._id.toString(),
      desc: expense.desc,
      amount: expense.amount,
      category: expense.category,
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt
    };

    res.json(formattedExpense);
  } catch (err) {
    console.error(err.message);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ msg: messages.join(', ') });
    }
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Expense not found (Invalid ID)' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /:projectId/expenses/:expenseId
// @desc    Delete an expense from a project
// @access  Public (modify with auth middleware if needed)
router.delete('/:projectId/expenses/:expenseId', validateProject, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.expenseId,
      project: req.projectId
    });

    if (!expense) {
      return res.status(404).json({ msg: 'Expense not found in this project' });
    }

    res.json({ msg: 'Expense removed successfully', id: req.params.expenseId });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Expense not found (Invalid ID)' });
    }
    res.status(500).send('Server Error');
  }
});

export default router; 
server / routes / projects.js  

// server/routes/projects.js
import express from 'express';
import Project from '../models/Project.js';
import auth from '../middleware/auth.js';
// Removed nodemailer/dotenv imports if not used elsewhere in this file
// Keep mongoose if used for new ObjectId

import mongoose from 'mongoose'; // Keep if generating ObjectId manually

const router = express.Router();

// @route   GET api/projects
// @desc    Get all user's projects
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // .lean() can improve performance if you don't need Mongoose document methods/virtuals
    // but we added virtuals for totalSpent/remaining, so don't use .lean() here if you want them.
    const projects = await Project.find({ userId: req.user.id }).sort({ startDate: 1 }); // Sort by date
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/projects/:id
// @desc    Get a single project by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    // Select explicitly includes fields, including the nested expenses array
    const project = await Project.findById(req.params.id).select('+expenses +packingList');

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check if user owns the project or project is shared with user
    // Note: Sharing logic requires actual sharing implementation
    // For now, just check ownership for simplicity based on current auth
    if (project.userId.toString() !== req.user.id) {
       // Basic check if user is in sharedWith array (assuming User model ID is string)
      const isShared = project.sharing && project.sharing.sharedWith.map(id => id.toString()).includes(req.user.id);
      if (!isShared) {
          return res.status(401).json({ msg: 'Not authorized' });
      }
    }


    res.json(project);
  } catch (err) {
    console.error(err.message);
     // Check if it's a CastError (invalid ID format)
    if (err.kind === 'ObjectId') {
         return res.status(404).json({ msg: 'Project not found (Invalid ID format)' });
    }
    res.status(500).send('Server Error');
  }
});


// @route   POST api/projects
// @desc    Create a new project
// @access  Private
router.post('/', auth, async (req, res) => {
  // Basic validation
  const { name, cause, location, startDate, endDate } = req.body;
  if (!name || !cause || !location || !startDate || !endDate) {
      return res.status(400).json({ msg: 'Name, cause, location, start date, and end date are required' });
  }
   if (new Date(startDate) > new Date(endDate)) {
       return res.status(400).json({ msg: 'Start date cannot be after end date' });
   }


  try {
    console.log("Data received:", req.body); // Log incoming data

    const newProject = new Project({
      userId: req.user.id,
      ...req.body,
      // Ensure dates are Date objects
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      // Initialize expenses and packingList arrays explicitly if needed, though schema defaults handle it
      expenses: [],
      packingList: [],
      // Sharing should perhaps be initiated later, or generate link only when shared becomes true
      sharing: { isShared: false, shareLink: '', sharedWith: [] }
    });

    const project = await newProject.save();
     // Respond with the full project including the newly created document structure
    res.status(201).json(project); // Use 201 for resource creation

  } catch (err) {
    console.error("Error creating project:", err);  // Log detailed error
     if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ msg: messages.join(', ') });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/projects/:id
// @desc    Update an existing project
// @access  Private
router.put('/:id', auth, async (req, res) => {
     // Basic validation for update might be less strict,
    // but still check crucial fields if they are being updated
    const { startDate, endDate } = req.body;
     if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
       return res.status(400).json({ msg: 'Start date cannot be after end date' });
     }

  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    if (project.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

     // Prepare updates, ensure dates are converted if present
     const updateFields = { ...req.body };
     if (updateFields.startDate) updateFields.startDate = new Date(updateFields.startDate);
     if (updateFields.endDate) updateFields.endDate = new Date(updateFields.endDate);


    project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields }, // Use $set to update specified fields
      { new: true, runValidators: true } // return new doc, run schema validators
    ).select('+expenses +packingList'); // Select expenses/packingList to return them

    res.json(project);
  } catch (err) {
    console.error(err.message);
     if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ msg: messages.join(', ') });
    }
     if (err.kind === 'ObjectId') {
         return res.status(404).json({ msg: 'Project not found (Invalid ID format)' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/projects/:id
// @desc    Delete a project
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Use findById to check ownership first
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    if (project.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Delete the project using the ID
    await Project.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Project deleted' });
  } catch (err) {
    console.error(err.message);
     if (err.kind === 'ObjectId') {
         return res.status(404).json({ msg: 'Project not found (Invalid ID format)' });
    }
    res.status(500).send('Server Error');
  }
});


// --- Nested Expense Routes ---

// @route   POST api/projects/:id/expenses
// @desc    Add a new expense to a project's nested expenses array
// @access  Private
router.post('/:id/expenses', auth, async (req, res) => {
    const { desc, amount, category, date } = req.body;

    // Server-side validation
    if (!desc || !amount || !category || !date) {
        return res.status(400).json({ msg: 'Please include description, amount, category, and date' });
    }
    const numAmount = parseFloat(amount);
     if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ msg: 'Amount must be a positive number' });
    }
     if (!['Supplies', 'Transportation', 'Materials', 'Other'].includes(category)) {
         return res.status(400).json({ msg: 'Invalid expense category' });
     }
     if (isNaN(new Date(date).getTime())) {
         return res.status(400).json({ msg: 'Invalid date format' });
     }


    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        // Check ownership
        if (project.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const newExpense = {
            // Mongoose will automatically generate _id when pushing
            description: desc, // Match schema field name
            amount: numAmount,
            category: category,
            date: new Date(date)
        };

        project.expenses.push(newExpense); // Add to the nested array
        await project.save(); // Save the parent document

        // Find the newly added expense in the array to return it with _id
        const addedExpense = project.expenses[project.expenses.length - 1];

        res.status(201).json(addedExpense); // Return the newly created expense object
    } catch (err) {
        console.error(err.message);
         if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: messages.join(', ') });
        }
         if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Project not found (Invalid ID format)' });
         }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/projects/:id/expenses/:expenseId
// @desc    Update a specific expense in a project's nested expenses array
// @access  Private
router.put('/:id/expenses/:expenseId', auth, async (req, res) => {
    const { desc, amount, category, date } = req.body; // Include date if allowing date updates

    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        // Check ownership
        if (project.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // Find the expense within the nested array by its _id
        const expenseToUpdate = project.expenses.id(req.params.expenseId);

        if (!expenseToUpdate) {
            return res.status(404).json({ msg: 'Expense not found in this project' });
        }

        // Update fields if provided in the request body
        if (desc !== undefined) expenseToUpdate.description = desc;
        if (amount !== undefined && amount !== null) {
             const numAmount = parseFloat(amount);
             if (isNaN(numAmount) || numAmount <= 0) {
                 return res.status(400).json({ msg: 'Amount must be a positive number' });
             }
             expenseToUpdate.amount = numAmount;
        }
        if (category !== undefined) {
             if (!['Supplies', 'Transportation', 'Materials', 'Other'].includes(category)) {
                 return res.status(400).json({ msg: 'Invalid expense category' });
             }
             expenseToUpdate.category = category;
         }
        if (date !== undefined) {
             if (isNaN(new Date(date).getTime())) {
                 return res.status(400).json({ msg: 'Invalid date format' });
             }
             expenseToUpdate.date = new Date(date);
        }


        await project.save(); // Save the parent document

        res.json(expenseToUpdate); // Return the updated expense object

    } catch (err) {
        console.error(err.message);
         if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: messages.join(', ') });
        }
         if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Project or Expense not found (Invalid ID format)' });
         }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/projects/:id/expenses/:expenseId
// @desc    Delete a specific expense from a project's nested expenses array
// @access  Private
router.delete('/:id/expenses/:expenseId', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        // Check ownership
        if (project.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // Find the expense within the nested array by its _id
        const expenseToRemove = project.expenses.id(req.params.expenseId);

        if (!expenseToRemove) {
            return res.status(404).json({ msg: 'Expense not found in this project' });
        }

        // Use Mongoose's remove method on the subdocument
        expenseToRemove.deleteOne(); // Or .remove() depending on Mongoose version

        await project.save(); // Save the parent document

        res.json({ msg: 'Expense removed successfully', expenseId: req.params.expenseId }); // Return the removed expense ID
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Project or Expense not found (Invalid ID format)' });
         }
        res.status(500).send('Server Error');
    }
});

// --- Packing List Routes (Already existed, keeping them) ---

// @route   PUT api/projects/:id/packing-list
// @desc    Update packing list for a project
// @access  Private
router.put('/:id/packing-list', auth, async (req, res) => {
  try {
    console.log('Received packing list update request for project:', req.params.id);
    console.log('Payload:', req.body); // Log payload

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    if (project.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Ensure each item has an _id and required fields
    const packingList = req.body.map(item => {
      if (!item.item) { // Basic validation for packing item name
          throw new Error('Packing list item requires a name');
      }
      return {
        ...item,
        // If item doesn't have an _id, create one (or rely on Mongoose push)
        // Using Mongoose's .push() and .id() is safer/idiomatic
        // Let's simplify: the client sends the desired *final* list.
        // Mongoose handles adding _id for new subdocuments on save.
        // We just need to make sure the items have the structure.
        isPacked: item.isPacked || false, // Ensure boolean
        // No need to manually add _id here, Mongoose handles it.
        // updated at could be set on save, but schema default works too.
      };
    });

    // Replace the packing list array
    project.packingList = packingList; // Mongoose handles subdocument _id generation/matching on save

    // Save the updated project
    await project.save();

    console.log('Successfully updated packing list');
    res.json(project.packingList); // Return the updated list
  } catch (err) {
    console.error('Error updating packing list:', err.message);
     if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ msg: messages.join(', ') });
     }
     if (err.kind === 'ObjectId') {
         return res.status(404).json({ msg: 'Project not found (Invalid ID format)' });
     }
    res.status(500).send('Server Error: ' + err.message); // Include error message
  }
});

// @route   GET api/projects/:id/packing-list
// @desc    Get packing list for a project
// @access  Private
router.get('/:id/packing-list', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    if (project.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(project.packingList || []); // Return the packing list or an empty array
  } catch (err) {
    console.error('Error fetching packing list:', err.message);
     if (err.kind === 'ObjectId') {
         return res.status(404).json({ msg: 'Project not found (Invalid ID format)' });
     }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/projects/:id/invite
// @desc    Invite collaborators (needs nodemailer setup/config)
// @access  Private
// NOTE: This route requires proper email service setup (process.env.EMAIL_USER, etc.)
// and potentially adding the invited user to the project's sharedWith array.
// Keeping the original code as the core issue is expenses, but mark it as potentially non-functional
// without email config.
router.post('/:projectId/invite', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { to } = req.body; // 'to' should be the email address

    // Basic email format validation
    if (!to || !/\S+@\S+\.\S+/.test(to)) {
         return res.status(400).json({ msg: 'Valid recipient email is required.' });
     }


    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    if (project.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Find the user being invited by email to get their ID
    const invitedUser = await mongoose.model('User').findOne({ email: to });

    // Optional: If you require the invited user to have an account before sharing
    // if (!invitedUser) {
    //     return res.status(404).json({ msg: 'Invited user not found. They must register first.' });
    // }
    // Optional: Prevent inviting the owner
    // if (invitedUser && invitedUser._id.toString() === req.user.id) {
    //      return res.status(400).json({ msg: 'Cannot invite yourself.' });
    // }
     // Optional: Prevent inviting someone already shared with
    // if (invitedUser && project.sharing.sharedWith.includes(invitedUser._id)) {
    //     return res.status(400).json({ msg: 'User is already invited or collaborating.' });
    // }


    // Add the invited user's ID to the sharedWith array if they exist
    if (invitedUser && !project.sharing.sharedWith.includes(invitedUser._id)) {
         project.sharing.sharedWith.push(invitedUser._id);
         project.sharing.isShared = true; // Mark as shared
         // You might want to generate or use a specific share link here if needed
         await project.save();
    }


    // --- Email Sending Logic (Requires configuration) ---
    // This part needs your specific email provider details in .env (EMAIL_USER, EMAIL_PASSWORD)
    // and potentially allowing "less secure apps" or using app passwords if using Gmail etc.
    // If you don't have an email service set up, this will fail.

    // Uncomment and configure this section if email sending is enabled
    /*
    const transporter = nodemailer.createTransport({
       service: process.env.EMAIL_SERVICE, // e.g., 'gmail', 'sendgrid'
       auth: {
         user: process.env.EMAIL_USER,
         pass: process.env.EMAIL_PASSWORD,
       },
       // Optional: Add tls/requireTLS if needed by your service
       // tls: {
       //     rejectUnauthorized: false
       // }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to, // Use the recipient email from body
      subject: `Project Collaboration Invitation: ${project.name}`,
      html: `
        <p>Hello,</p>
        <p>You've been invited by ${req.user.name} to collaborate on the project "${project.name}" on Volunteer Organizer.</p>
        <p>Project Location: ${project.location}</p>
        <p>Project Dates: ${new Date(project.startDate).toLocaleDateString()} - ${new Date(project.endDate).toLocaleDateString()}</p>
        <p>To view the project details and collaborate, please log in to your Volunteer Organizer account.</p>
        ${invitedUser ?
          `<p>If you don't see the project on your dashboard after logging in, please contact ${req.user.name}.</p>` :
          `<p>If you don't have an account, please register first.</p>`
         }
        <p>
          <a href="${process.env.FRONTEND_URL}/login" target="_blank">Login or Register on Volunteer Organizer</a>
        </p>
        <p>Thank you!</p>
        <p>The Volunteer Organizer Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Invitation email sent to:', to);
    */
     // --- End Email Sending Logic ---

     // Regardless of email success (or if email is disabled), respond based on saving the invited user ID
    res.status(200).json({ msg: `Invitation processed. Email sent to ${to} (if configured).` });

  } catch (err) {
    console.error('Error sending invitation:', err);
     // Check specific error types if possible (e.g., nodemailer errors)
    res.status(500).json({ msg: 'Failed to process invitation. Check server logs for email configuration errors.' });
  }
});


export default router;
server / routes / users.js  
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, contactNumber } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      contactNumber,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;

        // Log the generated token to the console
        console.log('Generated Token:', token);

        // Send the token to the client
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get User Profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update User Profile
router.put('/me', auth, async (req, res) => {
  try {
    const { name, contactNumber } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (contactNumber) user.contactNumber = contactNumber;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;


.env  
PORT=5000
MONGODB_URI=mongodb://localhost:27017/volunteerOrganizerDB # Renamed DB for clarity
JWT_SECRET=your_super_secret_jwt_key # Replace with a strong, unique key
FRONTEND_URL=http://localhost:3000 # Add frontend URL

# Optional: Email config for invitations (if using nodemailer)
EMAIL_SERVICE=gmail # e.g., 'gmail', 'sendgrid', 'mailgun'
EMAIL_USER=your_email@example.com # Your email address
EMAIL_PASSWORD=your_email_password # Your email password or app password
package-lock.json  
package.json  
server.js  
import express from 'express';
// import mongoose from 'mongoose'; // No longer needed here
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js'; // Import the new DB connection function
import userRoutes from './routes/users.js';
import projectRoutes from './routes/projects.js';
import expenseRoutes from './routes/expense.js'; // Import the new expense routes

dotenv.config();
const app = express();

// Middleware
// Consolidated CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from your frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token']
}));
app.use(express.json()); // For parsing application/json

// Connect to Database
connectDB(); // Call the function to connect to MongoDB

// MongoDB connection (This block is replaced by connectDB())
/*
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));
*/

// Routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects', expenseRoutes); // Mount expense routes under /api/projects
                                      // This means routes in expense.js like /:projectId/expenses
                                      // will become /api/projects/:projectId/expenses

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


