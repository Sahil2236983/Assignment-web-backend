require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected for seeding...');
};

const seed = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Task.deleteMany();
    await Project.deleteMany();
    await User.deleteMany();
    console.log('Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Alice Admin',
      email: 'admin@demo.com',
      password: 'password123',
      role: 'admin',
    });

    const member1 = await User.create({
      name: 'Bob Member',
      email: 'bob@demo.com',
      password: 'password123',
      role: 'member',
    });

    const member2 = await User.create({
      name: 'Carol Member',
      email: 'carol@demo.com',
      password: 'password123',
      role: 'member',
    });

    console.log('Users created');

    // Create projects
    const project1 = await Project.create({
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with new branding.',
      createdBy: admin._id,
      members: [admin._id, member1._id, member2._id],
    });

    const project2 = await Project.create({
      name: 'Mobile App MVP',
      description: 'Build and launch the first version of our mobile application.',
      createdBy: admin._id,
      members: [admin._id, member1._id],
    });

    console.log('Projects created');

    // Create tasks
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 3); // overdue task

    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 7);

    await Task.insertMany([
      {
        title: 'Design new homepage mockup',
        description: 'Create Figma mockup for the homepage redesign.',
        status: 'Done',
        priority: 'High',
        assignedTo: member1._id,
        project: project1._id,
        createdBy: admin._id,
        dueDate: pastDate,
      },
      {
        title: 'Implement responsive navbar',
        description: 'Build mobile-first responsive navigation component.',
        status: 'In Progress',
        priority: 'High',
        assignedTo: member2._id,
        project: project1._id,
        createdBy: admin._id,
        dueDate: futureDate,
      },
      {
        title: 'Write unit tests',
        description: 'Add test coverage for all UI components.',
        status: 'To Do',
        priority: 'Medium',
        assignedTo: member1._id,
        project: project1._id,
        createdBy: admin._id,
        dueDate: futureDate,
      },
      {
        title: 'Set up React Native project',
        description: 'Initialize mobile app with navigation and state management.',
        status: 'Done',
        priority: 'High',
        assignedTo: member1._id,
        project: project2._id,
        createdBy: admin._id,
        dueDate: pastDate,
      },
      {
        title: 'Build login screen',
        description: 'Design and implement the authentication screens.',
        status: 'In Progress',
        priority: 'High',
        assignedTo: member1._id,
        project: project2._id,
        createdBy: admin._id,
        dueDate: pastDate, // overdue
      },
      {
        title: 'Integrate push notifications',
        description: 'Set up Firebase push notifications for the mobile app.',
        status: 'To Do',
        priority: 'Low',
        assignedTo: null,
        project: project2._id,
        createdBy: admin._id,
        dueDate: futureDate,
      },
    ]);

    console.log('Tasks created');
    console.log('\n--- Seed complete ---');
    console.log('Admin:   admin@demo.com  / password123');
    console.log('Member:  bob@demo.com    / password123');
    console.log('Member:  carol@demo.com  / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seed();
