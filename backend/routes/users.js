const express = require('express');
const router = express.Router();
const User = require('../models/User');
const novu = require('../config/novu');

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find()
      .populate('managerId', 'name email')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('managerId', 'name email');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user and register as Novu subscriber
router.post('/', async (req, res) => {
  try {
    const { name, email, managerId } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Generate subscriber ID
    const novuSubscriberId = `user-${Date.now()}`;

    // Create user in database
    const user = new User({
      name,
      email,
      novuSubscriberId,
      managerId: managerId || null
    });
    await user.save();

    // Register subscriber with Novu
    try {
      await novu.subscribers.identify(novuSubscriberId, {
        email,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || undefined
      });
    } catch (novuError) {
      console.error('Novu subscriber registration error:', novuError.message);
    }

    const populatedUser = await User.findById(user._id)
      .populate('managerId', 'name email');

    res.status(201).json(populatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign manager to user
router.patch('/:id/assign-manager', async (req, res) => {
  try {
    const { managerId } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate manager exists (if provided)
    if (managerId) {
      const manager = await User.findById(managerId);
      if (!manager) {
        return res.status(404).json({ error: 'Manager not found' });
      }
      // Prevent self-assignment
      if (managerId === req.params.id) {
        return res.status(400).json({ error: 'User cannot be their own manager' });
      }
    }

    user.managerId = managerId || null;
    await user.save();

    const populatedUser = await User.findById(user._id)
      .populate('managerId', 'name email');

    res.json(populatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove this user as manager from other users
    await User.updateMany({ managerId: req.params.id }, { managerId: null });

    // Optionally remove from Novu
    try {
      await novu.subscribers.delete(user.novuSubscriberId);
    } catch (novuError) {
      console.error('Novu subscriber deletion error:', novuError.message);
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
