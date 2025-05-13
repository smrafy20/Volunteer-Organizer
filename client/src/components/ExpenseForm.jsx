// src/components/ExpenseForm.jsx
import React, { useState } from "react";
import { Form, Button, InputGroup, FormControl } from 'react-bootstrap'; // Use react-bootstrap components
import { toast } from 'react-toastify';

// Expects onAdd prop and isOwner prop
const ExpenseForm = ({ onAdd, isOwner }) => { // Accept isOwner prop
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Supplies");
  // Set default date to today's date in YYYY-MM-DD format
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleSubmit = async (e) => {
    e.preventDefault();

     if (!isOwner) { // Prevent submitting if not owner
         toast.info("Only the project owner can add expenses.");
         return;
     }

    // Basic client-side validation
    if (!desc.trim() || !amount || !category || !date || parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) { // Added isNaN check
      toast.error("Please fill all fields correctly (amount > 0, valid date).");
      return;
    }
     if (isNaN(new Date(date).getTime())) { // Validate date format
        toast.error("Invalid expense date.");
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
    <Form onSubmit={handleSubmit}> {/* Use react-bootstrap Form */}
       <InputGroup className="mb-3">
           {/* Added disabled state */}
           <FormControl
             placeholder="Description"
             value={desc}
             onChange={(e) => setDesc(e.target.value)}
             required
             disabled={isLoading || !isOwner} // Disable if loading or not owner
           />
       </InputGroup>

       <InputGroup className="mb-3">
          {/* Added disabled state and min/step attributes */}
         <FormControl
           placeholder="Amount"
           type="number"
           step="0.01"
           value={amount}
           onChange={(e) => setAmount(e.target.value)}
           required
           min="0.01"
           disabled={isLoading || !isOwner} // Disable if loading or not owner
         />
       </InputGroup>

        <InputGroup className="mb-3">
          {/* Added disabled state */}
         <FormControl
           type="date"
           value={date}
           onChange={(e) => setDate(e.target.value)}
           required
           disabled={isLoading || !isOwner} // Disable if loading or not owner
         />
       </InputGroup>

        <InputGroup className="mb-3">
          {/* Added disabled state */}
         <Form.Select // Use Form.Select for dropdown
           value={category}
           onChange={(e) => setCategory(e.target.value)}
           required
           disabled={isLoading || !isOwner} // Disable if loading or not owner
         >
           <option value="Supplies">Supplies</option>
           <option value="Transportation">Transportation</option>
           <option value="Materials">Materials</option>
           <option value="Other">Other</option>
         </Form.Select>
       </InputGroup>

       <div className="d-grid"> {/* Use d-grid for full-width button */}
         <Button type="submit" disabled={isLoading || !isOwner}> {/* Disable if loading or not owner */}
           {isLoading ? 'Adding...' : 'Add Expense'} {/* Loading text */}
         </Button>
       </div>
        {!isOwner && <p className="text-muted small mt-2">Only the project owner can add expenses.</p>} {/* Message for non-owners */}
     </Form>
  );
};

export default ExpenseForm;