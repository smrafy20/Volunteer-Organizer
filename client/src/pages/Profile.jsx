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
