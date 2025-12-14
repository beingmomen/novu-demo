const express = require('express');
const router = express.Router();
const novu = require('../config/novu');
const User = require('../models/User');

// Send test notification to a user
router.post('/test', async (req, res) => {
  try {
    const { userId, message } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await novu.trigger({
      name: 'order-status-update',
      to: { subscriberId: user.novuSubscriberId },
      payload: {
        orderId: 'TEST-001',
        status: 'Test Notification',
        message: message || 'This is a test notification from Novu!'
      }
    });

    res.json({ message: 'Test notification sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get notification feed for a subscriber (proxy to Novu)
router.get('/feed/:subscriberId', async (req, res) => {
  try {
    const { subscriberId } = req.params;

    const response = await novu.subscribers.notifications.feed(subscriberId, {
      limit: 20
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
