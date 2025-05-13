// import express from 'express';
// import Expense from '../models/expense.js';
// import Project from '../models/Project.js'; // Assuming your existing Project model is here

// const router = express.Router();

// // Middleware to validate project ID
// const validateProject = async (req, res, next) => {
//   try {
//     // req.params.projectId will be available if router is mounted like app.use('/api/projects', expenseRoutes)
//     // and the route is defined as '/:projectId/expenses'
//     const projectId = req.params.projectId || req.params.id; // Adjust if projectId name varies
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ msg: 'Project not found' });
//     }
//     req.project = project; // Attach project to request object
//     req.projectId = projectId; // Standardize projectId access
//     next();
//   } catch (err) {
//     console.error(err.message);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ msg: 'Project not found (Invalid ID)' });
//     }
//     res.status(500).send('Server Error');
//   }
// };

// // @route   GET /:projectId/expenses
// // @desc    Get all expenses for a project
// // @access  Public (modify with auth middleware if needed)
// router.get('/:projectId/expenses', validateProject, async (req, res) => {
//   try {
//     const expenses = await Expense.find({ project: req.projectId }).sort({ date: -1 });
    
//     const formattedExpenses = expenses.map(exp => ({
//       id: exp._id.toString(),
//       desc: exp.desc,
//       amount: exp.amount,
//       category: exp.category,
//       date: exp.date ? new Date(exp.date).toISOString().split('T')[0] : '',
//       createdAt: exp.createdAt,
//       updatedAt: exp.updatedAt
//     }));
    
//     res.json({
//       project: {
//         id: req.project._id.toString(),
//         name: req.project.name,
//         budget: req.project.budget
//       },
//       expenses: formattedExpenses
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });

// // @route   POST /:projectId/expenses
// // @desc    Add new expense to a project
// // @access  Public (modify with auth middleware if needed)
// router.post('/:projectId/expenses', validateProject, async (req, res) => {
//   const { desc, amount, category, date } = req.body;

//   if (!desc || amount === undefined || amount === null || !category || !date) {
//     return res.status(400).json({ msg: 'Please include all fields' });
//   }
//   if (typeof amount !== 'number' || amount <= 0) {
//     return res.status(400).json({ msg: 'Amount must be a positive number' });
//   }

//   try {
//     const newExpense = new Expense({
//       project: req.projectId,
//       desc,
//       amount,
//       category,
//       date: new Date(date)
//     });

//     const expense = await newExpense.save();

//     const formattedExpense = {
//       id: expense._id.toString(),
//       desc: expense.desc,
//       amount: expense.amount,
//       category: expense.category,
//       date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
//       createdAt: expense.createdAt,
//       updatedAt: expense.updatedAt
//     };

//     res.status(201).json(formattedExpense);
//   } catch (err) {
//     console.error(err.message);
//     if (err.name === 'ValidationError') {
//       const messages = Object.values(err.errors).map(val => val.message);
//       return res.status(400).json({ msg: messages.join(', ') });
//     }
//     res.status(500).send('Server Error');
//   }
// });

// // @route   PUT /:projectId/expenses/:expenseId
// // @desc    Update an expense in a project
// // @access  Public (modify with auth middleware if needed)
// router.put('/:projectId/expenses/:expenseId', validateProject, async (req, res) => {
//   const { desc, amount, category } = req.body;

//   const expenseFields = {};
//   if (desc !== undefined) expenseFields.desc = desc;
//   if (category !== undefined) expenseFields.category = category;
//   if (amount !== undefined && amount !== null) {
//     if (typeof amount !== 'number' || amount <= 0) {
//       return res.status(400).json({ msg: 'Amount must be a positive number if provided' });
//     }
//     expenseFields.amount = amount;
//   }

//   try {
//     let expense = await Expense.findOne({
//       _id: req.params.expenseId,
//       project: req.projectId
//     });

//     if (!expense) {
//       return res.status(404).json({ msg: 'Expense not found in this project' });
//     }

//     expense = await Expense.findByIdAndUpdate(
//       req.params.expenseId,
//       { $set: expenseFields },
//       { new: true, runValidators: true }
//     );

//     const formattedExpense = {
//       id: expense._id.toString(),
//       desc: expense.desc,
//       amount: expense.amount,
//       category: expense.category,
//       date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
//       createdAt: expense.createdAt,
//       updatedAt: expense.updatedAt
//     };

//     res.json(formattedExpense);
//   } catch (err) {
//     console.error(err.message);
//     if (err.name === 'ValidationError') {
//       const messages = Object.values(err.errors).map(val => val.message);
//       return res.status(400).json({ msg: messages.join(', ') });
//     }
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ msg: 'Expense not found (Invalid ID)' });
//     }
//     res.status(500).send('Server Error');
//   }
// });

// // @route   DELETE /:projectId/expenses/:expenseId
// // @desc    Delete an expense from a project
// // @access  Public (modify with auth middleware if needed)
// router.delete('/:projectId/expenses/:expenseId', validateProject, async (req, res) => {
//   try {
//     const expense = await Expense.findOneAndDelete({
//       _id: req.params.expenseId,
//       project: req.projectId
//     });

//     if (!expense) {
//       return res.status(404).json({ msg: 'Expense not found in this project' });
//     }

//     res.json({ msg: 'Expense removed successfully', id: req.params.expenseId });
//   } catch (err) {
//     console.error(err.message);
//     if (err.kind === 'ObjectId') {
//       return res.status(404).json({ msg: 'Expense not found (Invalid ID)' });
//     }
//     res.status(500).send('Server Error');
//   }
// });

// export default router; 