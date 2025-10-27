import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@rapid-response.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@rapid-response.com',
      phone: '9999999999',
      password: 'admin@123', // Will be hashed automatically
      role: 'admin',
      isActive: true,
      isVerified: true
    });

    console.log('✅ Admin user created successfully');
    console.log('Email: admin@rapid-response.com');
    console.log('Password: admin@123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();