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