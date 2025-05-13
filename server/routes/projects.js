// server/routes/projects.js
import express from 'express';
import Project from '../models/Project.js';
import User from '../models/User.js'; // Import User model to find users by email
import auth from '../middleware/auth.js';
import mongoose from 'mongoose'; // Keep if generating ObjectId manually or using mongoose.Types.ObjectId

const router = express.Router();

// Helper middleware to check if user is owner or shared collaborator
const checkProjectAccess = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        // Check if user is the owner
        if (project.userId.toString() === req.user.id) {
            req.project = project; // Attach project to request
            req.isOwner = true; // Mark as owner
            return next();
        }

        // Check if user is in sharedWith array
        const isShared = project.sharing && project.sharing.sharedWith.some(sharedUserId => sharedUserId.toString() === req.user.id);

        if (isShared) {
            req.project = project; // Attach project to request
            req.isOwner = false; // Not the owner
            return next();
        }

        // If neither owner nor shared
        return res.status(401).json({ msg: 'Not authorized to access this project' });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
             return res.status(404).json({ msg: 'Project not found (Invalid ID format)' });
        }
        res.status(500).send('Server Error');
    }
};


// @route   GET api/projects
// @desc    Get all user's projects (owned + shared)
// @access  Private
// Modified to also include projects shared *with* the user
router.get('/', auth, async (req, res) => {
  try {
    // Find projects where the user is the owner OR the user is in the sharedWith array
    const projects = await Project.find({
      $or: [
        { userId: req.user.id },
        { 'sharing.sharedWith': req.user.id }
      ]
    }).sort({ startDate: 1 }); // Sort by date

    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/projects/:id
// @desc    Get a single project by ID (includes nested data)
// @access  Private (Owner or Shared User)
// Use checkProjectAccess middleware
router.get('/:id', auth, checkProjectAccess, async (req, res) => {
  // req.project is available from checkProjectAccess
  // No need to select '+expenses +packingList' explicitly if they are part of the default schema path
  // If they were selected: false by default, you would need .select('+expenses +packingList') in checkProjectAccess or here.
  // Assuming default inclusion, just return req.project
  res.json(req.project);
});


// @route   POST api/projects
// @desc    Create a new project
// @access  Private (Owner only)
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
      userId: req.user.id, // Assign current user as owner
      ...req.body,
      // Ensure dates are Date objects
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      // Initialize expenses and packingList arrays explicitly if needed, though schema defaults handle it
      expenses: [],
      packingList: [],
      groupNotes: [], // Initialize group notes array
      sharing: { isShared: false, shareLink: '', sharedWith: [] } // Initialize sharing
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
// @access  Private (Owner only)
// Use checkProjectAccess middleware, but require isOwner = true
router.put('/:id', auth, checkProjectAccess, async (req, res) => {
    if (!req.isOwner) {
        return res.status(403).json({ msg: 'Not authorized to edit this project' });
    }

     // Basic validation for update might be less strict,
    // but still check crucial fields if they are being updated
    const { startDate, endDate } = req.body;
     if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
       return res.status(400).json({ msg: 'Start date cannot be after end date' });
     }

  try {
     // req.project is available from checkProjectAccess

     // Prepare updates, ensure dates are converted if present
     // Filter out fields that should not be updated via this route (like userId, sharing, expenses, packingList, groupNotes)
     const updateFields = { ...req.body };
     delete updateFields.userId;
     delete updateFields.sharing;
     delete updateFields.expenses;
     delete updateFields.packingList;
     delete updateFields.groupNotes; // Don't update nested arrays via the main PUT route

     if (updateFields.startDate) updateFields.startDate = new Date(updateFields.startDate);
     if (updateFields.endDate) updateFields.endDate = new Date(updateFields.endDate);


    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields }, // Use $set to update specified fields
      { new: true, runValidators: true } // return new doc, run schema validators
    ).select('+expenses +packingList +groupNotes +sharing'); // Select nested arrays and sharing to return them

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
// @access  Private (Owner only)
// Use checkProjectAccess middleware, but require isOwner = true
router.delete('/:id', auth, checkProjectAccess, async (req, res) => {
    if (!req.isOwner) {
        return res.status(403).json({ msg: 'Not authorized to delete this project' });
    }

  try {
    // req.project is available from checkProjectAccess
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

// Note: GET /:id already fetches expenses. Separate GET expenses route is not needed for nested array approach.
// If you *needed* a separate GET route just for expenses, it would look similar to the one removed from expense.js,
// but query req.project.expenses instead of a separate Expense model.

// @route   POST api/projects/:id/expenses
// @desc    Add a new expense to a project's nested expenses array
// @access  Private (Owner only)
router.post('/:id/expenses', auth, checkProjectAccess, async (req, res) => {
    if (!req.isOwner) {
        return res.status(403).json({ msg: 'Not authorized to add expenses' });
    }

    const { desc, amount, category, date } = req.body;

    // Server-side validation
    if (!desc || amount === undefined || amount === null || !category || !date) {
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
        // req.project is available from checkProjectAccess

        const newExpense = {
            // Mongoose will automatically generate _id when pushing
            description: desc, // Match schema field name
            amount: numAmount,
            category: category,
            date: new Date(date)
        };

        req.project.expenses.push(newExpense); // Add to the nested array
        await req.project.save(); // Save the parent document

        // Find the newly added expense in the array to return it with _id
        // The last item added has the latest _id if added sequentially like this
        const addedExpense = req.project.expenses[req.project.expenses.length - 1];

        res.status(201).json(addedExpense); // Return the newly created expense object
    } catch (err) {
        console.error(err.message);
         if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: messages.join(', ') });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/projects/:id/expenses/:expenseId
// @desc    Update a specific expense in a project's nested expenses array
// @access  Private (Owner only)
router.put('/:id/expenses/:expenseId', auth, checkProjectAccess, async (req, res) => {
     if (!req.isOwner) {
        return res.status(403).json({ msg: 'Not authorized to update expenses' });
    }
    const { desc, amount, category, date } = req.body; // Include date if allowing date updates

    try {
        // req.project is available from checkProjectAccess

        // Find the expense within the nested array by its _id
        const expenseToUpdate = req.project.expenses.id(req.params.expenseId);

        if (!expenseToUpdate) {
            return res.status(404).json({ msg: 'Expense not found in this project' });
        }

        // Update fields if provided in the request body
        if (desc !== undefined) expenseToUpdate.set({ description: desc }); // Use set on subdocument
        if (amount !== undefined && amount !== null) {
             const numAmount = parseFloat(amount);
             if (isNaN(numAmount) || numAmount <= 0) {
                 return res.status(400).json({ msg: 'Amount must be a positive number' });
             }
             expenseToUpdate.set({ amount: numAmount });
        }
        if (category !== undefined) {
             if (!['Supplies', 'Transportation', 'Materials', 'Other'].includes(category)) {
                 return res.status(400).json({ msg: 'Invalid expense category' });
             }
             expenseToUpdate.set({ category: category });
         }
        if (date !== undefined) {
             if (isNaN(new Date(date).getTime())) {
                 return res.status(400).json({ msg: 'Invalid date format' });
             }
             expenseToUpdate.set({ date: new Date(date) });
        }

        await req.project.save(); // Save the parent document

        res.json(expenseToUpdate); // Return the updated expense object

    } catch (err) {
        console.error(err.message);
         if (err.name === 'ValidationError') {
            // Mongoose validation errors on subdocuments can be tricky.
            // Check for nested errors if runValidators was used on save.
            // For simplicity, often easier to validate payload before .set()/.push().
            // Or rely on global error handler if you have one.
             const messages = Object.values(err.errors).map(val => val.message);
             return res.status(400).json({ msg: messages.join(', ') });
         }
         if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Expense not found (Invalid ID format)' });
         }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/projects/:id/expenses/:expenseId
// @desc    Delete a specific expense from a project's nested expenses array
// @access  Private (Owner only)
router.delete('/:id/expenses/:expenseId', auth, checkProjectAccess, async (req, res) => {
     if (!req.isOwner) {
        return res.status(403).json({ msg: 'Not authorized to delete expenses' });
    }
    try {
        // req.project is available from checkProjectAccess

        // Find the expense within the nested array by its _id
        const expenseToRemove = req.project.expenses.id(req.params.expenseId);

        if (!expenseToRemove) {
            return res.status(404).json({ msg: 'Expense not found in this project' });
        }

        // Use Mongoose's remove method on the subdocument
        expenseToRemove.deleteOne(); // Use deleteOne() for Mongoose v5+, remove() for older

        await req.project.save(); // Save the parent document

        res.json({ msg: 'Expense removed successfully', expenseId: req.params.expenseId }); // Return the removed expense ID
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Expense not found (Invalid ID format)' });
         }
        res.status(500).send('Server Error');
    }
});


// --- Nested Packing List Routes ---

// @route   GET api/projects/:id/packing-list
// @desc    Get packing list for a project
// @access  Private (Owner or Shared User)
router.get('/:id/packing-list', auth, checkProjectAccess, async (req, res) => {
  // req.project is available from checkProjectAccess
  res.json(req.project.packingList || []); // Return the packing list or an empty array
});


// @route   PUT api/projects/:id/packing-list
// @desc    Update packing list for a project (Replace the entire list)
// @access  Private (Owner only)
router.put('/:id/packing-list', auth, checkProjectAccess, async (req, res) => {
     if (!req.isOwner) {
        return res.status(403).json({ msg: 'Not authorized to update packing list' });
    }
  try {
    console.log('Received packing list update request for project:', req.params.id);
    console.log('Payload:', req.body); // Log payload

    // req.project is available from checkProjectAccess

    // Validate incoming list structure (basic check)
    if (!Array.isArray(req.body)) {
        return res.status(400).json({ msg: 'Request body must be an array of packing items' });
    }
     // Optional: More detailed validation loop if needed


    // Replace the packing list array with the incoming data
    // Mongoose handles identifying existing subdocuments by _id and adding new ones
    req.project.packingList = req.body;

    // Save the updated project
    await req.project.save();

    console.log('Successfully updated packing list');
    res.json(req.project.packingList); // Return the updated list
  } catch (err) {
    console.error('Error updating packing list:', err.message);
     if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ msg: messages.join(', ') });
     }
    res.status(500).send('Server Error: ' + err.message); // Include error message
  }
});

// --- Nested Group Notes Routes ---

// Note: GET /:id already fetches group notes as they are part of the main project document.

// @route   POST api/projects/:id/group-notes
// @desc    Add a new group note to a project
// @access  Private (Owner or Shared User)
router.post('/:id/group-notes', auth, checkProjectAccess, async (req, res) => {
     // Owner or Shared user can add notes - permission granted by checkProjectAccess

    const { note } = req.body;

    if (!note || !note.trim()) {
        return res.status(400).json({ msg: 'Note content is required' });
    }

    try {
        // req.project is available from checkProjectAccess

        const newNote = {
            // Mongoose will automatically generate _id
            userId: req.user.id, // Associate note with the current user
            note: note.trim(),
            createdAt: new Date() // Explicitly set creation date
        };

        req.project.groupNotes.push(newNote);
        await req.project.save();

        // Find the newly added note to return it with its _id
        const addedNote = req.project.groupNotes[req.project.groupNotes.length - 1];

        // Optionally populate the user name for the added note before sending
        // Note: This requires another query or careful handling. For simplicity,
        // the frontend can fetch user names separately or rely on having a user list.
        // Let's just return the raw note object for now.

        res.status(201).json(addedNote);

    } catch (err) {
        console.error(err.message);
         if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: messages.join(', ') });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/projects/:id/group-notes/:noteId
// @desc    Delete a specific group note from a project
// @access  Private (Owner or Note Author)
router.delete('/:id/group-notes/:noteId', auth, checkProjectAccess, async (req, res) => {
    try {
        // req.project is available from checkProjectAccess

        // Find the note within the nested array by its _id
        const noteToRemove = req.project.groupNotes.id(req.params.noteId);

        if (!noteToRemove) {
            return res.status(404).json({ msg: 'Group note not found' });
        }

        // Check if user is the owner OR the author of the note
        if (!req.isOwner && noteToRemove.userId.toString() !== req.user.id) {
             return res.status(403).json({ msg: 'Not authorized to delete this note' });
        }


        // Use Mongoose's remove method on the subdocument
        noteToRemove.deleteOne(); // Or .remove()

        await req.project.save(); // Save the parent document

        res.json({ msg: 'Group note removed successfully', noteId: req.params.noteId }); // Return the removed note ID
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Note not found (Invalid ID format)' });
         }
        res.status(500).send('Server Error');
    }
});


// --- Invite User Route ---

// @route   POST api/projects/:id/invite-user
// @desc    Invite a user to a project by email
// @access  Private (Owner only)
router.post('/:id/invite-user', auth, checkProjectAccess, async (req, res) => {
    if (!req.isOwner) {
        return res.status(403).json({ msg: 'Not authorized to invite users to this project' });
    }

    const { email } = req.body;

    // Basic email format validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
         return res.status(400).json({ msg: 'Valid recipient email is required.' });
     }

    try {
        // req.project is available from checkProjectAccess

        // Find the user being invited by email
        const invitedUser = await User.findOne({ email });

        if (!invitedUser) {
            // Decide policy: Do users need an account first?
            // For now, let's assume they do.
            return res.status(404).json({ msg: 'User not found. They must register on Volunteer Organizer first.' });
        }

        // Prevent inviting the owner
        if (invitedUser._id.toString() === req.user.id) {
             return res.status(400).json({ msg: 'Cannot invite yourself.' });
        }
         // Prevent inviting someone already shared with
        if (req.project.sharing.sharedWith.map(id => id.toString()).includes(invitedUser._id.toString())) {
            return res.status(400).json({ msg: 'User is already invited or collaborating.' });
        }

        // Add the invited user's ID to the sharedWith array
        req.project.sharing.sharedWith.push(invitedUser._id);
        req.project.sharing.isShared = true; // Mark as shared

        await req.project.save();

        // --- Email Sending Logic (Still needs configuration in .env and server.js) ---
        // This part is left commented out as it requires external setup.
        // If enabled, you'd use nodemailer here.
        /*
        const transporter = nodemailer.createTransport({ ... });
        const mailOptions = { ... };
        await transporter.sendMail(mailOptions);
        console.log('Invitation email sent to:', email);
        */
        // --- End Email Sending Logic ---


        // Respond with success message and the added user's info (optional)
        res.status(200).json({ msg: `Invitation sent to ${email}.`, invitedUserId: invitedUser._id, invitedUserEmail: invitedUser.email });

    } catch (err) {
        console.error('Error inviting user:', err);
        res.status(500).json({ msg: 'Failed to process invitation. Server error.' });
    }
});


export default router;