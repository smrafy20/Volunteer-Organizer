import React, { useState } from "react";
import { Button } from 'react-bootstrap'; // Add this import
import { toast } from 'react-toastify';

const ExpenseList = ({ expenses, onDelete, onUpdate, isOwner }) => {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ 
    _id: null, 
    description: '', 
    amount: '', 
    category: '' 
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = (exp) => {
    if (!isOwner) {
      toast.info("Only the project owner can edit expenses.");
      return;
    }
    setEditingId(exp._id);
    setEditData({
      _id: exp._id,
      description: exp.description,
      amount: exp.amount,
      category: exp.category,
    });
  };

  const handleSave = async () => {
    if (!isOwner) {
      toast.info("Only the project owner can update expenses.");
      return;
    }
    
    if (!editData.description.trim() || 
        editData.amount === undefined || 
        editData.amount === null || 
        parseFloat(editData.amount) <= 0) {
      toast.error("Please ensure description, amount (>0), and category are filled correctly.");
      return;
    }

    setIsLoading(true);
    const success = await onUpdate({
      id: editData._id,
      desc: editData.description.trim(),
      amount: parseFloat(editData.amount),
      category: editData.category,
    });
    setIsLoading(false);

    if (success) {
      setEditingId(null);
      setEditData({ _id: null, description: '', amount: '', category: '' });
    }
  };

  const handleDeleteClick = async (expenseId) => {
    if (!isOwner) {
      toast.info("Only the project owner can delete expenses.");
      return;
    }
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    setIsLoading(true);
    await onDelete(expenseId);
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value
    }));
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover"> {/* Added table-hover for better UX */}
        <thead className="table-light"> {/* Added light header */}
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Amount</th>
            {isOwner && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {(expenses || []).map((exp) => (
            <tr key={exp._id}>
              <td>{exp.date ? new Date(exp.date).toLocaleDateString() : 'N/A'}</td>
              <td>
                {editingId === exp._id && isOwner ? (
                  <select
                    name="category"
                    value={editData.category}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="form-select form-select-sm" // Added Bootstrap classes
                  >
                    <option value="Supplies">Supplies</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Materials">Materials</option>
                    <option value="Other">Other</option>
                  </select>
                ) : exp.category}
              </td>
              <td>
                {editingId === exp._id && isOwner ? (
                  <input
                    name="description"
                    value={editData.description}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="form-control form-control-sm" // Added Bootstrap classes
                  />
                ) : exp.description}
              </td>
              <td>
                {editingId === exp._id && isOwner ? (
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    value={editData.amount}
                    onChange={handleInputChange}
                    min="0.01"
                    disabled={isLoading}
                    className="form-control form-control-sm" // Added Bootstrap classes
                  />
                ) : `$${Number(exp.amount).toFixed(2)}`}
              </td>
              {isOwner && (
                <td>
                  <div className="d-flex gap-1"> {/* Added flex container for buttons */}
                    {editingId === exp._id ? (
                      <>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={handleSave} 
                          disabled={isLoading}
                        >
                          Save
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => setEditingId(null)} 
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          onClick={() => handleEdit(exp)} 
                          disabled={isLoading}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          onClick={() => handleDeleteClick(exp._id)} 
                          disabled={isLoading}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseList;