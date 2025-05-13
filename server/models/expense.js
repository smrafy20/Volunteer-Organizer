// import mongoose from 'mongoose';

// const ExpenseSchema = new mongoose.Schema({
//   project: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Project', // This should refer to your existing Project model
//     required: true
//   },
//   desc: {
//     type: String,
//     required: [true, 'Please add a description'],
//     trim: true,
//   },
//   amount: {
//     type: Number,
//     required: [true, 'Please add a positive amount'],
//     validate: {
//       validator: function(v) {
//         return v > 0;
//       },
//       message: props => `${props.value} is not a positive number!`
//     }
//   },
//   category: {
//     type: String,
//     required: [true, 'Please select a category'],
//     enum: ['Supplies', 'Transportation', 'Materials', 'Other'],
//   },
//   date: {
//     type: Date,
//     required: true,
//     default: Date.now,
//   }
// }, {
//   timestamps: true
// });

// export default mongoose.model('Expense', ExpenseSchema); 