import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  contractorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contractor', 
  },
  date: {
    type: Date,
    required: true,
  },
  workingHour: {
    type: Number,
    required: true,
  },
  task: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// Override the default toJSON method
taskSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.date = ret.date.toLocaleDateString('en-GB'); // Format the date as "DD/MM/YYYY"
  },
});

const TaskModel = mongoose.model('Task', taskSchema);

export default TaskModel;
