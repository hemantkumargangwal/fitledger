const jwt = require('jsonwebtoken');
const Gym = require('../models/Gym');
const User = require('../models/User');
const validator = require('validator');

const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const register = async (req, res) => {
  try {
    const { gymName, ownerName, email, password } = req.body;

    // Validation
    if (!gymName || !ownerName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if gym already exists
    const existingGym = await Gym.findOne({ email });
    if (existingGym) {
      return res.status(400).json({ message: 'Gym with this email already exists' });
    }

    // Create gym
    const gym = new Gym({
      gymName,
      ownerName,
      email
    });
    await gym.save();

    // Create user
    const user = new User({
      gymId: gym._id,
      name: ownerName,
      email,
      password
    });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gymId: gym._id,
        gymName: gym.gymName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email }).populate('gymId');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gymId: user.gymId._id,
        gymName: user.gymId.gymName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('gymId');
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gymId: user.gymId._id,
        gymName: user.gymId.gymName,
        ownerName: user.gymId.ownerName,
        phone: user.gymId.phone || '',
        address: user.gymId.address || ''
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, gymName, ownerName, phone, address, password } = req.body;
    const user = await User.findById(req.user.id).populate('gymId');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const nextEmail = email?.trim().toLowerCase() || user.email;
    if (nextEmail !== user.email) {
      const existingUser = await User.findOne({ email: nextEmail, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      const existingGym = await Gym.findOne({ email: nextEmail, _id: { $ne: user.gymId._id } });
      if (existingGym) {
        return res.status(400).json({ message: 'Gym email already in use' });
      }
    }

    if (name?.trim()) user.name = name.trim();
    if (email?.trim()) user.email = nextEmail;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = password;
    }

    if (gymName?.trim()) user.gymId.gymName = gymName.trim();
    if (ownerName?.trim()) user.gymId.ownerName = ownerName.trim();
    user.gymId.email = nextEmail;
    user.gymId.phone = phone?.trim() || '';
    user.gymId.address = address?.trim() || '';

    await user.save();
    await user.gymId.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gymId: user.gymId._id,
        gymName: user.gymId.gymName,
        ownerName: user.gymId.ownerName,
        phone: user.gymId.phone || '',
        address: user.gymId.address || ''
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
