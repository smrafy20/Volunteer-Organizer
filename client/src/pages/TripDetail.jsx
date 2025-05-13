// src/pages/TripDetail.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Tab, Tabs, Form, ListGroup, Badge, InputGroup, FormControl } from 'react-bootstrap'; // Import Tab, Tabs, Form, ListGroup etc.
import { format } from 'date-fns';
import axios from 'axios';
import PackingList from '../components/packing/PackingList';
import ExpenseForm from '../components/ExpenseForm';
import SummaryChart from '../components/SummaryChart';
import ExpenseList from '../components/ExpenseList';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config'; // Import API_BASE_URL
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode to get user ID from token


const TripDetail = () => {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details'); // State for active tab
  const [isOwner, setIsOwner] = useState(false); // State to track if current user is owner
  const [isShared, setIsShared] = useState(false); // State to track if current user is a shared user
  const [currentUserId, setCurrentUserId] = useState(null); // State to store current user's ID

  // State for Group Notes
  const [newGroupNote, setNewGroupNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteError, setNoteError] = useState(null);

  // State for Sharing
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [sharedUsers, setSharedUsers] = useState([]); // State to store shared users (optional, might need separate fetch)


  const { id } = useParams();
  const navigate = useNavigate();

   // Get current user ID from token on mount
   useEffect(() => {
       const token = localStorage.getItem('token');
       if (token) {
           try {
               const decoded = jwtDecode(token);
               setCurrentUserId(decoded.user.id);
           } catch (err) {
               console.error('Failed to decode token:', err);
               setCurrentUserId(null); // Invalid token
               // Optionally redirect to login if token is invalid
               // navigate('/login');
           }
       }
   }, []); // Run only once on component mount


  // Use useCallback for fetch function to prevent infinite loop in useEffect
  const fetchTripDetails = useCallback(async () => {
    if (!id || currentUserId === null) return; // Don't fetch if no trip ID or user ID not determined yet

    try {
      setLoading(true);
      setError(''); // Clear previous errors

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login'); // Should be handled by PrivateRoute, but safety check
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/projects/${id}`, {
        headers: {
          'x-auth-token': token
        }
      });

      const projectData = res.data;

       // Determine ownership and shared status
       const ownerStatus = projectData.userId === currentUserId;
       const sharedStatus = projectData.sharing?.sharedWith.some(sharedUserId => sharedUserId === currentUserId);

       setIsOwner(ownerStatus);
       setIsShared(sharedStatus);

      // Sort expenses by date descending for display
      if (projectData.expenses && Array.isArray(projectData.expenses)) {
           projectData.expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
      }

       // Sort group notes by date ascending (oldest first)
       if (projectData.groupNotes && Array.isArray(projectData.groupNotes)) {
            projectData.groupNotes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
       }


      setTrip(projectData);
      setLoading(false);

      // Optional: Fetch details of shared users if needed for display
      // This would require a new backend endpoint, e.g., /api/users/list-by-ids
      // For now, we'll just show their IDs or a count.

    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to load trip details';
      setError(errorMsg);
      setLoading(false);
      console.error('Error fetching trip details:', err.response?.data || err.message);
      toast.error(errorMsg); // Show toast notification for fetch error
      // If 404 or 401/403, might navigate away
       if (err.response?.status === 404 || err.response?.status === 401 || err.response?.status === 403) {
            // Give user a moment to read the toast/error, then redirect
            setTimeout(() => {
                 navigate('/dashboard'); // Redirect to dashboard
            }, 3000);
       }
    }
  }, [id, navigate, currentUserId]); // Dependencies: id, navigate, currentUserId

  useEffect(() => {
    // Only fetch once currentUserId is set
    if (currentUserId !== null) {
        fetchTripDetails();
    }
  }, [fetchTripDetails, currentUserId]); // useEffect depends on the memoized fetch function and currentUserId

  const handleDelete = async () => {
      if (!isOwner) {
           toast.info("Only the project owner can delete the project.");
           return;
       }
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
        console.error('Error deleting trip:', err.response?.data || err.message);
      }
    }
  };

   // --- Expense Management Handlers ---
   // These now interact with the nested array via projects routes
  const handleAddExpense = async (expenseData) => {
       if (!isOwner) { // Double-check permission (UI should be disabled too)
            toast.info("Only the project owner can add expenses.");
            return false;
        }
      try {
          const token = localStorage.getItem('token');
          // Axios automatically handles JSON stringification

          const res = await axios.post(`${API_BASE_URL}/projects/${id}/expenses`, expenseData, {
              headers: { 'x-auth-token': token }
          });

          const newExpense = res.data; // Backend returns the created expense subdocument

          setTrip(prevTrip => {
              // Create a new expenses array with the new expense and sort
              // Ensure expenses is an array before spreading
              const currentExpenses = Array.isArray(prevTrip?.expenses) ? prevTrip.expenses : [];
              // Mongoose adds _id to the nested object upon save, use that _id
              const updatedExpenses = [{ ...newExpense, amount: parseFloat(newExpense.amount) }, ...currentExpenses]
                                        .sort((a, b) => new Date(b.date) - new Date(a.date));

              // Calculate new total spent and remaining based on the addition
              const prevTotalSpent = Number(prevTrip?.totalSpent) || 0;
              const prevBudget = Number(prevTrip?.budget) || 0;
              const addedAmount = Number(newExpense?.amount) || 0; // Use amount from response

              const newTotalSpent = prevTotalSpent + addedAmount;
              const newRemaining = prevBudget - newTotalSpent;


              return {
                  ...prevTrip,
                  expenses: updatedExpenses,
                  totalSpent: newTotalSpent, // Update totalSpent
                  remaining: newRemaining // Update remaining
              };
          });

          // toast.success('Expense added successfully'); // Toast handled by ExpenseForm parent call
          return true; // Indicate success
      } catch (err) {
          const errorMsg = err.response?.data?.msg || 'Failed to add expense';
          console.error('Error adding expense:', err.response?.data || err.message);
          // toast.error(errorMsg); // Toast handled by ExpenseForm parent call
          // Set error state if you want to display it in the component
           setError(errorMsg); // Display error above the form or list
          return false; // Indicate failure
      }
  };

  const handleDeleteExpense = async (expenseId) => {
      if (!isOwner) { // Double-check permission
           toast.info("Only the project owner can delete expenses.");
           return;
       }
       // Confirmation handled in ExpenseList now
      try {
          const token = localStorage.getItem('token');

           // Find the expense to remove *before* deleting from state
          const currentExpenses = Array.isArray(trip?.expenses) ? trip.expenses : [];
          const expenseToRemove = currentExpenses.find(exp => exp._id === expenseId);
          if (!expenseToRemove) {
               toast.error("Expense not found locally."); // Should not happen if ID is valid
               return; // Stop execution
          }

          await axios.delete(`${API_BASE_URL}/projects/${id}/expenses/${expenseId}`, {
              headers: { 'x-auth-token': token }
          });

          setTrip(prevTrip => {
               const prevExpenses = Array.isArray(prevTrip?.expenses) ? prevTrip.expenses : [];
               // Filter out the deleted expense by its _id
               const updatedExpenses = prevExpenses.filter(exp => exp._id !== expenseId);

               // Calculate new total spent and remaining based on the deletion
              const prevTotalSpent = Number(prevTrip?.totalSpent) || 0;
              const prevBudget = Number(prevTrip?.budget) || 0;
              const removedAmount = Number(expenseToRemove.amount) || 0; // Use amount from the expense being removed

               const newTotalSpent = prevTotalSpent - removedAmount;
               const newRemaining = prevBudget - newTotalSpent;


              return {
                  ...prevTrip,
                  expenses: updatedExpenses,
                  totalSpent: newTotalSpent, // Update totalSpent
                  remaining: newRemaining // Update remaining
              };
          });

          toast.success('Expense deleted successfully');
          setError(null); // Clear any previous expense errors
      } catch (err) {
          const errorMsg = err.response?.data?.msg || 'Failed to delete expense';
          console.error('Error deleting expense:', err.response?.data || err.message);
          toast.error(errorMsg);
           setError(errorMsg); // Display error above the form or list
      }
  };

   // updatedExpenseData shape: { id: _id, desc, amount, category }
  const handleUpdateExpense = async (updatedExpenseData) => {
       if (!isOwner) { // Double-check permission
           toast.info("Only the project owner can update expenses.");
           return false;
        }
      try {
          const token = localStorage.getItem('token');

           // Find the original expense *before* sending update to calculate the difference for budget update
            const currentExpenses = Array.isArray(trip?.expenses) ? trip.expenses : [];
           const originalExpense = currentExpenses.find(exp => exp._id === updatedExpenseData.id);
           if (!originalExpense) {
                toast.error("Expense not found locally for update.");
                return false; // Stop execution
           }
           const originalAmount = Number(originalExpense.amount) || 0;
           const updatedAmount = parseFloat(updatedExpenseData.amount);


          // Prepare payload to match backend update logic ({ desc, amount, category, date? })
          const payload = {
               description: updatedExpenseData.desc.trim(), // Match backend schema field name 'description'
               amount: updatedAmount, // Ensure number
               category: updatedExpenseData.category,
              // Date is not updatable via this route based on backend code, so don't send it
          };


          const res = await axios.put(`${API_BASE_URL}/projects/${id}/expenses/${updatedExpenseData.id}`, payload, {
              headers: { 'x-auth-token': token }
          });

          const updatedExpenseResponse = res.data; // Backend returns the updated expense subdocument

          setTrip(prevTrip => {
               const prevExpenses = Array.isArray(prevTrip?.expenses) ? prevTrip.expenses : [];
               // Find the index and replace the old expense with the updated one
               const updatedExpenses = prevExpenses.map(exp =>
                   // Match by _id, replace with updated object from response
                   exp._id === updatedExpenseResponse._id ? { ...exp, ...updatedExpenseResponse, amount: parseFloat(updatedExpenseResponse.amount) } : exp // Ensure amount is parsed to number
               ).sort((a, b) => new Date(b.date) - new Date(a.date)); // Re-sort


               // Calculate new total spent based on the amount difference
               const prevTotalSpent = Number(prevTrip?.totalSpent) || 0;
               const prevBudget = Number(prevTrip?.budget) || 0;
               const amountDifference = (Number(updatedExpenseResponse.amount) || 0) - originalAmount; // Difference between new and old amount
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
          setError(null); // Clear any previous expense errors
          return true; // Indicate success
      } catch (err) {
          const errorMsg = err.response?.data?.msg || 'Failed to update expense';
          console.error('Error updating expense:', err.response?.data || err.message);
          toast.error(errorMsg);
           setError(errorMsg); // Display error above the form or list
          return false; // Indicate failure
      }
  };


   // --- Group Notes Handlers ---

    const handleAddGroupNote = async (e) => {
        e.preventDefault();
        if (!newGroupNote.trim()) {
             toast.info("Note cannot be empty.");
            return;
        }
         // Owner or Shared user can add notes - permission check happens on backend

        setIsAddingNote(true);
        setNoteError(null); // Clear previous note errors
        try {
            const token = localStorage.getItem('token');

             const res = await axios.post(`${API_BASE_URL}/projects/${id}/group-notes`, { note: newGroupNote.trim() }, {
                 headers: { 'x-auth-token': token }
             });

            const addedNote = res.data; // Backend returns the created note subdocument

            setTrip(prevTrip => {
                const currentNotes = Array.isArray(prevTrip?.groupNotes) ? prevTrip.groupNotes : [];
                // Add the new note and re-sort by date
                const updatedNotes = [...currentNotes, addedNote].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                return {
                    ...prevTrip,
                    groupNotes: updatedNotes
                };
            });

            setNewGroupNote(''); // Clear input
            toast.success('Note added successfully');

        } catch (err) {
            const errorMsg = err.response?.data?.msg || 'Failed to add note';
            console.error('Error adding note:', err.response?.data || err.message);
            setNoteError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsAddingNote(false);
        }
    };

    const handleDeleteGroupNote = async (noteId) => {
         // Owner or Note Author can delete - permission check happens on backend
         if (!window.confirm('Are you sure you want to delete this note?')) {
             return;
         }
        setIsAddingNote(true); // Use note loading state for deletion too
        setNoteError(null);
        try {
            const token = localStorage.getItem('token');

             await axios.delete(`${API_BASE_URL}/projects/${id}/group-notes/${noteId}`, {
                 headers: { 'x-auth-token': token }
             });

            setTrip(prevTrip => {
                 const prevNotes = Array.isArray(prevTrip?.groupNotes) ? prevTrip.groupNotes : [];
                 // Filter out the deleted note by its _id
                 const updatedNotes = prevNotes.filter(note => note._id !== noteId);
                 return {
                     ...prevTrip,
                     groupNotes: updatedNotes
                 };
             });

            toast.success('Note deleted');

        } catch (err) {
            const errorMsg = err.response?.data?.msg || 'Failed to delete note';
            console.error('Error deleting note:', err.response?.data || err.message);
             setNoteError(errorMsg);
            toast.error(errorMsg);
        } finally {
             setIsAddingNote(false);
        }
    };


   // --- Sharing Handlers ---

   const handleInviteUser = async (e) => {
       e.preventDefault();
       if (!inviteEmail.trim()) {
           toast.info("Please enter an email address.");
           return;
       }
       if (!isOwner) { // Double-check permission
           toast.info("Only the project owner can invite users.");
           return;
       }

       setIsInviting(true);
       setInviteError(null); // Clear previous invite errors
       try {
           const token = localStorage.getItem('token');

           const res = await axios.post(`${API_BASE_URL}/projects/${id}/invite-user`, { email: inviteEmail.trim() }, {
               headers: { 'x-auth-token': token }
           });

           // Backend returns msg, invitedUserId, invitedUserEmail
           console.log('Invite response:', res.data);
           toast.success(res.data.msg);
           setInviteEmail(''); // Clear input

           // Optionally update shared users list - requires fetching user details,
           // or assuming backend returns enough info (currently returns ID/email).
           // Simple approach: re-fetch trip details after successful invite to update sharedWith array.
           // Or, just add the invited user's ID to the local sharedWith array if we have their ID from response.
           if (res.data.invitedUserId) {
               setTrip(prevTrip => ({
                   ...prevTrip,
                   sharing: {
                       ...prevTrip.sharing,
                       isShared: true, // Ensure isShared is true
                       sharedWith: [...(prevTrip.sharing?.sharedWith || []), res.data.invitedUserId] // Add the new ID
                   }
               }));
           }


       } catch (err) {
           const errorMsg = err.response?.data?.msg || 'Failed to send invitation';
           console.error('Error inviting user:', err.response?.data || err.message);
           setInviteError(errorMsg);
           toast.error(errorMsg);
       } finally {
           setIsInviting(false);
       }
   };

   // Format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Use 'P' or 'PPP' from date-fns format for standard date format
      // Need to check if dateString is a valid date representation
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'P'); // e.g., 10/25/2024
      // Or 'MMM dd, yyyy' if you prefer that exact format
      // return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  if (loading || currentUserId === null) { // Wait for currentUserId to be set
    return (
      <Container className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error && !trip) { // Show error more prominently if trip fails to load initially
    return (
      <Container className="py-5">
         <Alert variant="danger">{error}</Alert>
         <Button variant="secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </Container>
    );
  }

   // If trip is null after loading and no error, means project was not found (handled by backend 404/401/403)
  if (!trip) {
       return (
         <Container className="py-5">
           <Alert variant="warning">Project not found or you do not have access.</Alert>
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
           {(isOwner || isShared) && ( // Indicate ownership/shared status
               <Badge bg={isOwner ? 'primary' : 'info'} className="mt-2">
                   {isOwner ? 'Project Owner' : 'Shared Project'}
               </Badge>
           )}
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          {isOwner && ( // Only show edit/delete buttons if owner
            <>
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
             </>
           )}
        </Col>
      </Row>

      {/* Budget Summary */}
       <Card className="shadow-sm mb-4">
           <Card.Body>
               <h5 className="mb-3">Budget Summary</h5>
               <Row>
                   <Col xs={12} sm={4} className="mb-2 mb-sm-0">
                        <strong>Budget:</strong> ${trip.budget ? Number(trip.budget).toFixed(2) : '0.00'}
                   </Col>
                   <Col xs={12} sm={4} className="mb-2 mb-sm-0">
                        <strong>Total Spent:</strong> ${trip.totalSpent ? Number(trip.totalSpent).toFixed(2) : '0.00'}
                   </Col>
                   <Col xs={12} sm={4}>
                        <strong>Remaining:</strong> ${trip.remaining ? Number(trip.remaining).toFixed(2) : Number(trip.budget || 0).toFixed(2)} {/* Use budget if totalSpent is 0 */}
                   </Col>
               </Row>
           </Card.Body>
       </Card>


      {/* Tabs for Details, Packing List, Expenses, Sharing, Group Notes */}
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
                  <Badge bg={new Date(trip.endDate) < new Date() ? 'success' : (new Date(trip.startDate) > new Date() ? 'primary' : 'info')}> {/* Added 'info' for current */}
                    {new Date(trip.endDate) < new Date() ? 'Completed' : (new Date(trip.startDate) > new Date() ? 'Upcoming' : 'Ongoing')}
                  </Badge>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col sm={3} className="fw-bold">Notes:</Col>
                <Col>{trip.notes || 'No notes available'}</Col>
              </Row>
               {/* Basic Sharing status display - detailed sharing options in separate tab */}
               <Row>
                    <Col sm={3} className="fw-bold">Sharing:</Col>
                    <Col>{trip.sharing?.isShared ? `Shared with ${trip.sharing.sharedWith.length} user(s)` : 'Not Shared'}</Col>
               </Row>

            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="packing" title="Packing List">
            {/* PackingList component */}
             <PackingList
                 tripId={trip._id}
                 initialItems={trip.packingList || []}
                 isOwner={isOwner} // Pass isOwner prop
             /> {/* Ensure initialItems is an array */}
        </Tab>

        <Tab eventKey="expenses" title="Expenses">
             {error && <Alert variant="danger">{error}</Alert>} {/* Display expense errors */}
            {/* Expense tracking components */}
            {isOwner && ( // Only show Add Expense form if owner
                <Card className="shadow-sm mb-4">
                    <Card.Header as="h5">Add New Expense</Card.Header>
                    <Card.Body>
                         {/* Pass handler and isOwner to ExpenseForm */}
                         <ExpenseForm onAdd={handleAddExpense} isOwner={isOwner} />
                    </Card.Body>
                </Card>
            )}


            <Card className="shadow-sm mb-4">
                <Card.Header as="h5">Expense Summary</Card.Header>
                <Card.Body>
                     {/* Pass expenses to SummaryChart */}
                     <SummaryChart expenses={trip.expenses || []} /> {/* Ensure expenses is array */}
                     {(!trip.expenses || trip.expenses.length === 0) && (
                         <p className="text-muted text-center">No expenses added yet.</p>
                     )}
                </Card.Body>
            </Card>

             <Card className="shadow-sm mb-4">
                <Card.Header as="h5">All Expenses</Card.Header>
                <Card.Body>
                     {/* Pass expenses and handlers, and isOwner to ExpenseList */}
                    <ExpenseList
                        expenses={trip.expenses || []}
                        onDelete={handleDeleteExpense}
                        onUpdate={handleUpdateExpense}
                        isOwner={isOwner} // Pass isOwner prop
                    />
                     {/* ExpenseList itself doesn't show "No expenses", parent does */}
                </Card.Body>
            </Card>
        </Tab>

         {/* New Tab for Sharing */}
         {isOwner && ( // Only show Sharing tab to the owner
             <Tab eventKey="sharing" title="Sharing">
                 <Card className="shadow-sm mb-4">
                     <Card.Header as="h5">Share Project</Card.Header>
                     <Card.Body>
                         <p>Invite other registered users to view and add group notes to this project.</p>
                         {inviteError && <Alert variant="danger">{inviteError}</Alert>}
                         <Form onSubmit={handleInviteUser}>
                             <InputGroup className="mb-3">
                                 <FormControl
                                     type="email"
                                     placeholder="Enter user's email to invite"
                                     value={inviteEmail}
                                     onChange={(e) => setInviteEmail(e.target.value)}
                                     required
                                     disabled={isInviting}
                                 />
                                 <Button type="submit" disabled={isInviting || !inviteEmail.trim()}>
                                     {isInviting ? 'Sending...' : 'Invite User'}
                                 </Button>
                             </InputGroup>
                         </Form>

                         <h5>Shared With ({trip.sharing?.sharedWith?.length || 0})</h5>
                         {trip.sharing?.sharedWith && trip.sharing.sharedWith.length > 0 ? (
                             <ListGroup variant="flush">
                                  {/* Note: This only shows user IDs. To show names/emails, you need
                                     to fetch user details based on these IDs, ideally on the backend
                                     when fetching the project or via a separate API call.
                                     For simplicity, displaying IDs here. */}
                                 {trip.sharing.sharedWith.map(userId => (
                                     <ListGroup.Item key={userId}>
                                         User ID: {userId} {/* Replace with username/email if fetched */}
                                     </ListGroup.Item>
                                 ))}
                             </ListGroup>
                         ) : (
                             <p className="text-muted">No users currently shared with.</p>
                         )}

                          {/* Optional: Read-only share link section (if you implement public links) */}
                           {/*
                            <h5 className="mt-4">Read-Only Link (Optional)</h5>
                            <p>Share this link for read-only access (if enabled):</p>
                           */}


                     </Card.Body>
                 </Card>
             </Tab>
         )}

         {/* New Tab for Group Notes (visible to owner and shared users) */}
          {(isOwner || isShared) && (
              <Tab eventKey="groupNotes" title="Group Notes">
                 <Card className="shadow-sm mb-4">
                     <Card.Header as="h5">Group Discussion</Card.Header>
                     <Card.Body>
                         {noteError && <Alert variant="danger">{noteError}</Alert>}

                         {/* Add Note Form */}
                         <Form onSubmit={handleAddGroupNote} className="mb-4">
                             <Form.Group className="mb-2">
                                 <Form.Label>Add a Note</Form.Label>
                                 <Form.Control
                                     as="textarea"
                                     rows={3}
                                     value={newGroupNote}
                                     onChange={(e) => setNewGroupNote(e.target.value)}
                                     placeholder="Enter your note here..."
                                     disabled={isAddingNote}
                                 />
                             </Form.Group>
                             <Button type="submit" disabled={isAddingNote || !newGroupNote.trim()} size="sm">
                                 {isAddingNote ? 'Posting...' : 'Post Note'}
                             </Button>
                         </Form>

                         {/* Notes List */}
                         <h5>Notes ({trip.groupNotes?.length || 0})</h5>
                         {isAddingNote && !noteError && <div className="text-center"><Spinner animation="border" size="sm" /> Loading notes...</div>} {/* Indicate loading/deleting notes */}
                         {trip.groupNotes && trip.groupNotes.length > 0 ? (
                             <ListGroup variant="flush">
                                 {/* Note: User ID is stored, but you need to fetch user details (like name)
                                     to display who posted the note. For now, just show the note content.
                                     A better approach would be to populate user details on the backend. */}
                                 {trip.groupNotes.map(note => (
                                     <ListGroup.Item key={note._id} className="d-flex justify-content-between align-items-start">
                                         <div>
                                              <p className="mb-1">{note.note}</p>
                                             {/* Displaying user ID for now, ideally display username */}
                                             <small className="text-muted">
                                                  By User ID: {note.userId} - {new Date(note.createdAt).toLocaleString()}
                                             </small>
                                         </div>
                                          {/* Show delete button if owner OR author of the note */}
                                         {(isOwner || note.userId === currentUserId) && (
                                              <Button
                                                  variant="outline-danger"
                                                  size="sm"
                                                  onClick={() => handleDeleteGroupNote(note._id)}
                                                  disabled={isAddingNote}
                                              >
                                                  ×
                                              </Button>
                                          )}
                                     </ListGroup.Item>
                                 ))}
                             </ListGroup>
                         ) : (
                             <p className="text-muted text-center">No group notes yet. Be the first to add one!</p>
                         )}

                     </Card.Body>
                 </Card>
              </Tab>
           )}


      </Tabs>

    </Container>
  );
};

export default TripDetail;