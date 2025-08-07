const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventmate');
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@eventmate.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return existingAdmin;
    }

    // Create admin user
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@eventmate.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    return adminUser;
  } catch (err) {
    console.error('Error creating admin user:', err.message);
    throw err;
  }
};

const createSampleUser = async () => {
  try {
    // Check if sample user already exists
    const existingUser = await User.findOne({ email: 'user@eventmate.com' });
    if (existingUser) {
      console.log('Sample user already exists');
      return existingUser;
    }

    // Create sample user
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('user123', salt);

    const sampleUser = new User({
      name: 'Sample User',
      email: 'user@eventmate.com',
      password: hashedPassword,
      role: 'user',
      isVerified: true
    });

    await sampleUser.save();
    console.log('Sample user created successfully');
    return sampleUser;
  } catch (err) {
    console.error('Error creating sample user:', err.message);
    throw err;
  }
};

const createSampleEvents = async (adminUser) => {
  try {
    // Check if events already exist
    const existingEvents = await Event.countDocuments();
    if (existingEvents > 0) {
      console.log('Sample events already exist');
      return;
    }

    const sampleEvents = [
      {
        title: 'Tech Conference 2024',
        description: 'Join us for the biggest tech conference of the year featuring industry leaders and cutting-edge innovations.',
        date: new Date('2024-06-15T09:00:00Z'),
        time: '09:00',
        category: 'Technology',
        capacity: 500,
        location: {
          address: '123 Convention Center Blvd',
          city: 'Downtown',
          state: 'CA',
          zipCode: '90210'
        },
        featured: true,
        status: 'published',
        organizer: adminUser._id,
        price: 0,
        isFree: true
      },
      {
        title: 'Web Development Workshop',
        description: 'Learn modern web development techniques including React, Node.js, and MongoDB.',
        date: new Date('2024-05-20T14:00:00Z'),
        time: '14:00',
        category: 'Education',
        capacity: 50,
        location: {
          address: '456 Tech Hub Street',
          city: 'Innovation District',
          state: 'CA',
          zipCode: '90211'
        },
        featured: false,
        status: 'published',
        organizer: adminUser._id,
        price: 0,
        isFree: true
      },
      {
        title: 'Startup Networking Meetup',
        description: 'Connect with fellow entrepreneurs and investors in a casual networking environment.',
        date: new Date('2024-05-25T18:00:00Z'),
        time: '18:00',
        category: 'Business',
        capacity: 100,
        location: {
          address: '789 Co-working Space Ave',
          city: 'Business District',
          state: 'CA',
          zipCode: '90212'
        },
        featured: false,
        status: 'published',
        organizer: adminUser._id,
        price: 0,
        isFree: true
      },
      {
        title: 'AI and Machine Learning Seminar',
        description: 'Explore the latest developments in artificial intelligence and machine learning.',
        date: new Date('2024-06-10T10:00:00Z'),
        time: '10:00',
        category: 'Technology',
        capacity: 200,
        location: {
          address: '321 University Blvd',
          city: 'University District',
          state: 'CA',
          zipCode: '90213'
        },
        featured: true,
        status: 'published',
        organizer: adminUser._id,
        price: 0,
        isFree: true
      },
      {
        title: 'Summer Music Festival',
        description: 'A day filled with live music performances from local and international artists.',
        date: new Date('2024-07-04T16:00:00Z'),
        time: '16:00',
        category: 'Entertainment',
        capacity: 1000,
        location: {
          address: '654 Central Park Way',
          city: 'Downtown',
          state: 'CA',
          zipCode: '90214'
        },
        featured: true,
        status: 'published',
        organizer: adminUser._id,
        price: 0,
        isFree: true
      }
    ];

    await Event.insertMany(sampleEvents);
    console.log('Sample events created successfully');
  } catch (err) {
    console.error('Error creating sample events:', err.message);
    throw err;
  }
};

const setup = async () => {
  try {
    await connectDB();
    
    console.log('Setting up EventMate database...');
    
    const adminUser = await createAdminUser();
    const sampleUser = await createSampleUser();
    await createSampleEvents(adminUser);
    
    console.log('\n=== Setup Complete ===');
    console.log('Admin User:');
    console.log('  Email: admin@eventmate.com');
    console.log('  Password: admin123');
    console.log('  Role: admin');
    console.log('\nSample User:');
    console.log('  Email: user@eventmate.com');
    console.log('  Password: user123');
    console.log('  Role: user');
    console.log('\nSample events have been created for testing.');
    console.log('You can now start the application and test the role-based features.');
    
    process.exit(0);
  } catch (err) {
    console.error('Setup failed:', err.message);
    process.exit(1);
  }
};

setup();
