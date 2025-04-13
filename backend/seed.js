import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/users.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    const adminUser = new User({
      username: 'admin', // Change this username!
      password: 'Admin@123', // userSchema.pre() already using hashing with salt
      role: 'admin',
    });

    await adminUser.save();
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedAdmin();
