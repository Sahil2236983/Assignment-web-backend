const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

// Ensure the creator is always in the members list
projectSchema.pre('save', function (next) {
  const creatorId = this.createdBy.toString();
  const alreadyMember = this.members.some((m) => m.toString() === creatorId);
  if (!alreadyMember) {
    this.members.push(this.createdBy);
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
