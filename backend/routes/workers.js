const express = require('express');
const router = express.Router();

// Mock workers data
let mockWorkers = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@farm.com',
    phone: '+60 12-176 4532',
    position: 'Field Worker',
    skills: ['Pruning', 'Harvesting', 'Weeding'],
    location: 'Block A',
    remarks: 'Experienced worker, good with machinery',
    status: 'Active',
    availability: 'Available',
    hoursWorked: 42,
    tasksCompleted: 15,
    currentTasks: 2,
    joinDate: '2023-01-15',
    rating: 4.8,
  },
  {
    id: 2,
    name: 'Maria Garcia',
    email: 'maria.garcia@farm.com',
    phone: '+60 16-893 625',
    position: 'Field Worker',
    skills: ['Harvesting', 'Spraying'],
    location: 'Block B',
    remarks: 'Quick learner, reliable',
    status: 'Active',
    availability: 'Busy',
    hoursWorked: 38,
    tasksCompleted: 12,
    currentTasks: 3,
    joinDate: '2023-03-20',
    rating: 4.9,
  },
  {
    id: 3,
    name: 'Carlos Rodriguez',
    email: 'carlos.rodriguez@farm.com',
    phone: '+60 17-577 145',
    position: 'Technician',
    skills: ['Pest & Disease', 'Manuring', 'Equipment Maintenance'],
    location: 'Block A',
    remarks: 'Specialist in pest control',
    status: 'Active',
    availability: 'Available',
    hoursWorked: 45,
    tasksCompleted: 18,
    currentTasks: 1,
    joinDate: '2022-11-10',
    rating: 4.7,
  },
];

// GET all workers
router.get('/', (req, res) => {
  try {
    const { status, availability, location } = req.query;
    let filteredWorkers = [...mockWorkers];

    if (status) {
      filteredWorkers = filteredWorkers.filter(w => w.status === status);
    }
    if (availability) {
      filteredWorkers = filteredWorkers.filter(w => w.availability === availability);
    }
    if (location) {
      filteredWorkers = filteredWorkers.filter(w => w.location === location);
    }

    res.json({
      success: true,
      data: filteredWorkers,
      total: filteredWorkers.length,
    });
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch workers' });
  }
});

// GET worker by ID
router.get('/:id', (req, res) => {
  try {
    const worker = mockWorkers.find(w => w.id === parseInt(req.params.id));
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    res.json({ success: true, data: worker });
  } catch (error) {
    console.error('Error fetching worker:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch worker' });
  }
});

// POST create new worker
router.post('/', (req, res) => {
  try {
    const { name, email, phone, position, skills, location, remarks } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const newWorker = {
      id: mockWorkers.length + 1,
      name,
      email,
      phone: phone || '',
      position: position || 'Field Worker',
      skills: skills ? skills.split(',').map(s => s.trim()) : [],
      location: location || 'Block A',
      remarks: remarks || '',
      status: 'Active',
      availability: 'Available',
      hoursWorked: 0,
      tasksCompleted: 0,
      currentTasks: 0,
      joinDate: new Date().toISOString().split('T')[0],
      rating: 0,
    };

    mockWorkers.push(newWorker);

    res.status(201).json({
      success: true,
      message: 'Worker created successfully',
      data: newWorker,
    });
  } catch (error) {
    console.error('Error creating worker:', error);
    res.status(500).json({ success: false, message: 'Failed to create worker' });
  }
});

// PUT update worker
router.put('/:id', (req, res) => {
  try {
    const index = mockWorkers.findIndex(w => w.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    mockWorkers[index] = { ...mockWorkers[index], ...req.body };
    res.json({
      success: true,
      message: 'Worker updated successfully',
      data: mockWorkers[index],
    });
  } catch (error) {
    console.error('Error updating worker:', error);
    res.status(500).json({ success: false, message: 'Failed to update worker' });
  }
});

// DELETE worker
router.delete('/:id', (req, res) => {
  try {
    const index = mockWorkers.findIndex(w => w.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    mockWorkers.splice(index, 1);
    res.json({ success: true, message: 'Worker deleted successfully' });
  } catch (error) {
    console.error('Error deleting worker:', error);
    res.status(500).json({ success: false, message: 'Failed to delete worker' });
  }
});

module.exports = router;

