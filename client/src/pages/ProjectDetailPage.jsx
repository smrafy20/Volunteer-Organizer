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