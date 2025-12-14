const express = require('express');
const router = express.Router();
const VacationRequest = require('../models/VacationRequest');
const User = require('../models/User');
const novu = require('../config/novu');

// Get all vacation requests (filtered by role)
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let requests;
    
    // If user has a manager, they are an employee - show their own requests
    // If user has no manager, they might be a manager - show requests from their employees
    if (user.managerId) {
      // Employee: show their own requests
      requests = await VacationRequest.find({ employeeId: userId })
        .populate('employeeId', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // Manager: show requests from employees who have this user as manager
      const employees = await User.find({ managerId: userId });
      const employeeIds = employees.map(e => e._id);
      
      requests = await VacationRequest.find({ employeeId: { $in: employeeIds } })
        .populate('employeeId', 'name email')
        .sort({ createdAt: -1 });
    }

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create vacation request (employee)
router.post('/', async (req, res) => {
  try {
    const { employeeId, startDate, endDate, reason } = req.body;

    const employee = await User.findById(employeeId).populate('managerId');
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    if (!employee.managerId) {
      return res.status(400).json({ error: 'Employee does not have a manager assigned' });
    }

    const request = new VacationRequest({
      employeeId,
      startDate,
      endDate,
      reason
    });
    await request.save();

    // Send notification to manager
    try {
      await novu.trigger({
        workflowId: 'vacation-request-submitted',
        to: employee.managerId.novuSubscriberId,
        payload: {
          employeeName: employee.name,
          startDate: new Date(startDate).toLocaleDateString(),
          endDate: new Date(endDate).toLocaleDateString(),
          reason: reason
        }
      });
      console.log('Notification sent to manager:', employee.managerId.name);
    } catch (novuError) {
      console.error('Novu trigger error:', novuError.message);
    }

    const populatedRequest = await VacationRequest.findById(request._id)
      .populate('employeeId', 'name email');

    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve vacation request (manager)
router.patch('/:id/approve', async (req, res) => {
  try {
    const { managerNotes } = req.body;

    const request = await VacationRequest.findById(req.params.id)
      .populate('employeeId');
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    request.status = 'approved';
    request.managerNotes = managerNotes || '';
    await request.save();

    // Send notification to employee
    try {
      await novu.trigger({
        workflowId: 'vacation-request-approved',
        to: request.employeeId.novuSubscriberId,
        payload: {
          startDate: new Date(request.startDate).toLocaleDateString(),
          endDate: new Date(request.endDate).toLocaleDateString(),
          managerNotes: managerNotes || 'No additional notes'
        }
      });
      console.log('Approval notification sent to employee:', request.employeeId.name);
    } catch (novuError) {
      console.error('Novu trigger error:', novuError.message);
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject vacation request (manager)
router.patch('/:id/reject', async (req, res) => {
  try {
    const { managerNotes } = req.body;

    const request = await VacationRequest.findById(req.params.id)
      .populate('employeeId');
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    request.status = 'rejected';
    request.managerNotes = managerNotes || '';
    await request.save();

    // Send notification to employee
    try {
      await novu.trigger({
        workflowId: 'vacation-request-rejected',
        to: request.employeeId.novuSubscriberId,
        payload: {
          startDate: new Date(request.startDate).toLocaleDateString(),
          endDate: new Date(request.endDate).toLocaleDateString(),
          managerNotes: managerNotes || 'No reason provided'
        }
      });
      console.log('Rejection notification sent to employee:', request.employeeId.name);
    } catch (novuError) {
      console.error('Novu trigger error:', novuError.message);
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
