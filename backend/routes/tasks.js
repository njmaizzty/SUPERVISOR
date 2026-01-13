const express = require('express');
const router = express.Router();

// Try to connect to PostgreSQL, fallback to mock data if not available
let pool = null;
let useDatabase = false;

try {
  pool = require('../db/config');
  // Test connection
  pool.query('SELECT 1').then(() => {
    useDatabase = true;
    console.log('✅ Using PostgreSQL database');
  }).catch(() => {
    useDatabase = false;
    console.log('⚠️ PostgreSQL not available, using mock data');
  });
} catch (error) {
  console.log('⚠️ PostgreSQL not configured, using mock data');
}

// ============ MOCK DATA ============
let mockTasks = [
  {
    id: 1,
    title: 'Tree Pruning - Block A',
    description: 'Prune apple trees in the northern section of Block A',
    task_type: 'Harvesting',
    task_subtype: 'Pruning',
    status: 'In Progress',
    priority: 'High',
    assigned_to_id: 1,
    assigned_to_name: 'Ahmad',
    start_date: '2024-11-29',
    end_date: '2024-12-01',
    progress: 65,
    area_id: 1,
    area_name: 'Block A',
    asset_id: 1,
    asset_name: 'Pruning Shears Set',
    created_by: 'Supervisor',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Irrigation System Check',
    description: 'Inspect and test all irrigation lines in Block B',
    task_type: 'General Work',
    task_subtype: 'Mechanical Work',
    status: 'Pending',
    priority: 'Medium',
    assigned_to_id: 2,
    assigned_to_name: 'Faiz',
    start_date: '2024-12-02',
    end_date: '2024-12-03',
    progress: 0,
    area_id: 2,
    area_name: 'Block B',
    asset_id: 6,
    asset_name: 'Irrigation Controller',
    created_by: 'Supervisor',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Pest Control - Block C',
    description: 'Spray pesticides to control pests in Block C',
    task_type: 'Pest & Disease',
    task_subtype: 'Pest & Disease Control',
    status: 'Pending',
    priority: 'High',
    assigned_to_id: 4,
    assigned_to_name: 'Ali',
    start_date: '2024-12-04',
    end_date: '2024-12-05',
    progress: 0,
    area_id: 3,
    area_name: 'Block C',
    asset_id: 2,
    asset_name: 'Sprayer Machine',
    created_by: 'Supervisor',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    title: 'Fertilizer Application - Block D',
    description: 'Apply organic fertilizer to trees in Block D',
    task_type: 'Manuring',
    task_subtype: 'Fertilizer Application',
    status: 'In Progress',
    priority: 'Medium',
    assigned_to_id: 3,
    assigned_to_name: 'Siti',
    start_date: '2024-12-05',
    end_date: '2024-12-06',
    progress: 40,
    area_id: 4,
    area_name: 'Block D',
    asset_id: 3,
    asset_name: 'Fertilizer Spreader',
    created_by: 'Supervisor',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    title: 'Harvest Loose Fruits - Block B',
    description: 'Collect loose fruits from Block B',
    task_type: 'Harvesting',
    task_subtype: 'Loose Fruit Collection',
    status: 'Completed',
    priority: 'Medium',
    assigned_to_id: 2,
    assigned_to_name: 'Faiz',
    start_date: '2024-11-25',
    end_date: '2024-11-26',
    progress: 100,
    area_id: 2,
    area_name: 'Block B',
    asset_id: 5,
    asset_name: 'Harvest Basket',
    created_by: 'Supervisor',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockWorkers = [
  { id: 1, name: 'Ahmad', expertise: ['Harvesting', 'Pruning'], availability: 'Available', experience: 5, suitability_score: 92, current_tasks: ['Harvesting section A'] },
  { id: 2, name: 'Faiz', expertise: ['Harvesting'], availability: 'Available', experience: 3, suitability_score: 84, current_tasks: ['Harvesting section B'] },
  { id: 3, name: 'Siti', expertise: ['Spraying', 'Manuring'], availability: 'Busy', experience: 4, suitability_score: 90, current_tasks: ['Spraying section C'] },
  { id: 4, name: 'Ali', expertise: ['Weeding', 'Pest & Disease'], availability: 'Available', experience: 2, suitability_score: 82, current_tasks: ['Weeding section D'] },
  { id: 5, name: 'Hana', expertise: ['Mechanisation Fleet'], availability: 'Available', experience: 6, suitability_score: 91, current_tasks: ['Tractor maintenance'] },
  { id: 6, name: 'Maya', expertise: ['Pruning', 'Harvesting'], availability: 'Available', experience: 4, suitability_score: 88, current_tasks: ['Pruning section A'] },
  { id: 7, name: 'Zul', expertise: ['Manuring'], availability: 'Available', experience: 3, suitability_score: 85, current_tasks: ['Manuring section B'] },
  { id: 8, name: 'Imran', expertise: ['Weeding'], availability: 'Available', experience: 3, suitability_score: 82, current_tasks: [] },
  { id: 9, name: 'Fauzi', expertise: ['Pest & Disease'], availability: 'Available', experience: 6, suitability_score: 87, current_tasks: ['Pest inspection section A'] },
  { id: 10, name: 'Razak', expertise: ['General Work'], availability: 'Available', experience: 7, suitability_score: 89, current_tasks: ['Main gate security'] },
  { id: 11, name: 'Aisyah', expertise: ['General Work'], availability: 'Available', experience: 4, suitability_score: 83, current_tasks: ['Office area cleaning'] },
];

const mockAreas = [
  { id: 1, name: 'Block A', description: 'Northern section - Apple trees' },
  { id: 2, name: 'Block B', description: 'Eastern section - Irrigation zone' },
  { id: 3, name: 'Block C', description: 'Southern section - Mixed crops' },
  { id: 4, name: 'Block D', description: 'Western section - New plantation' },
];

const mockAssets = [
  { id: 1, name: 'Pruning Shears Set', type: 'Tool', status: 'Available' },
  { id: 2, name: 'Sprayer Machine', type: 'Equipment', status: 'Available' },
  { id: 3, name: 'Fertilizer Spreader', type: 'Equipment', status: 'Available' },
  { id: 4, name: 'Tractor', type: 'Vehicle', status: 'Available' },
  { id: 5, name: 'Harvest Basket', type: 'Tool', status: 'Available' },
  { id: 6, name: 'Irrigation Controller', type: 'Equipment', status: 'Available' },
];

// ============ STATIC ROUTES (MUST BE BEFORE /:id) ============

// GET /api/tasks/workers/recommend - Get recommended workers by task type
router.get('/workers/recommend', async (req, res) => {
  try {
    const { taskType } = req.query;

    if (useDatabase && pool) {
      let query = 'SELECT * FROM workers';
      const params = [];
      if (taskType) {
        query += ' WHERE $1 = ANY(expertise)';
        params.push(taskType);
      }
      query += ' ORDER BY suitability_score DESC';
      const result = await pool.query(query, params);
      return res.json({ success: true, data: result.rows });
    }

    // Mock data
    let workers = [...mockWorkers];
    if (taskType) {
      workers = workers.filter(w => w.expertise.includes(taskType));
    }
    workers.sort((a, b) => b.suitability_score - a.suitability_score);
    res.json({ success: true, data: workers });
  } catch (error) {
    console.error('Error fetching workers:', error);
    // Fallback to mock
    let workers = [...mockWorkers];
    if (req.query.taskType) {
      workers = workers.filter(w => w.expertise.includes(req.query.taskType));
    }
    res.json({ success: true, data: workers });
  }
});

// GET /api/tasks/data/workers - Get all workers
router.get('/data/workers', async (req, res) => {
  try {
    if (useDatabase && pool) {
      const result = await pool.query('SELECT * FROM workers ORDER BY suitability_score DESC');
      return res.json({ success: true, data: result.rows });
    }
    res.json({ success: true, data: mockWorkers });
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.json({ success: true, data: mockWorkers });
  }
});

// GET /api/tasks/data/areas - Get all areas
router.get('/data/areas', async (req, res) => {
  try {
    if (useDatabase && pool) {
      const result = await pool.query('SELECT * FROM areas ORDER BY name');
      return res.json({ success: true, data: result.rows });
    }
    res.json({ success: true, data: mockAreas });
  } catch (error) {
    console.error('Error fetching areas:', error);
    res.json({ success: true, data: mockAreas });
  }
});

// GET /api/tasks/data/assets - Get all assets
router.get('/data/assets', async (req, res) => {
  try {
    if (useDatabase && pool) {
      const result = await pool.query('SELECT * FROM assets ORDER BY name');
      return res.json({ success: true, data: result.rows });
    }
    res.json({ success: true, data: mockAssets });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.json({ success: true, data: mockAssets });
  }
});

// ============ GET ALL TASKS ============
router.get('/', async (req, res) => {
  try {
    const { status, priority, area, search } = req.query;

    if (useDatabase && pool) {
      let query = 'SELECT * FROM tasks WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      if (status && status !== 'All') {
        query += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }
      if (priority) {
        query += ` AND priority = $${paramIndex}`;
        params.push(priority);
        paramIndex++;
      }
      if (area) {
        query += ` AND area_name = $${paramIndex}`;
        params.push(area);
        paramIndex++;
      }
      if (search) {
        query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR assigned_to_name ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }
      query += ' ORDER BY created_at DESC';
      const result = await pool.query(query, params);
      return res.json({ success: true, data: result.rows });
    }

    // Mock data filtering
    let tasks = [...mockTasks];
    if (status && status !== 'All') {
      tasks = tasks.filter(t => t.status === status);
    }
    if (search) {
      const s = search.toLowerCase();
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(s) ||
        t.description.toLowerCase().includes(s) ||
        (t.assigned_to_name && t.assigned_to_name.toLowerCase().includes(s))
      );
    }
    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.json({ success: true, data: mockTasks });
  }
});

// ============ CREATE TASK ============
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      taskType,
      taskSubtype,
      priority,
      assignedToId,
      assignedToName,
      startDate,
      endDate,
      areaId,
      areaName,
      assetId,
      assetName,
      createdBy,
    } = req.body;

    // Validation
    if (!title || !taskType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, taskType, startDate, endDate',
      });
    }

    if (useDatabase && pool) {
      const result = await pool.query(
        `INSERT INTO tasks (
          title, description, task_type, task_subtype, priority,
          assigned_to_id, assigned_to_name, start_date, end_date,
          area_id, area_name, asset_id, asset_name, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          title, description || '', taskType, taskSubtype || null,
          priority || 'Medium', assignedToId || null, assignedToName || null,
          startDate, endDate, areaId || null, areaName || null,
          assetId || null, assetName || null, createdBy || 'Supervisor',
        ]
      );
      return res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Task created successfully',
      });
    }

    // Mock data creation
    const newTask = {
      id: Date.now(),
      title,
      description: description || '',
      task_type: taskType,
      task_subtype: taskSubtype || null,
      status: 'Pending',
      priority: priority || 'Medium',
      assigned_to_id: assignedToId || null,
      assigned_to_name: assignedToName || null,
      start_date: startDate,
      end_date: endDate,
      progress: 0,
      area_id: areaId || null,
      area_name: areaName || null,
      asset_id: assetId || null,
      asset_name: assetName || null,
      created_by: createdBy || 'Supervisor',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockTasks.unshift(newTask);

    res.status(201).json({
      success: true,
      data: newTask,
      message: 'Task created successfully',
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create task',
    });
  }
});

// ============ GET SINGLE TASK (MUST BE AFTER STATIC ROUTES) ============
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (useDatabase && pool) {
      const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }
      return res.json({ success: true, data: result.rows[0] });
    }

    const task = mockTasks.find(t => t.id === parseInt(id));
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch task' });
  }
});

// ============ UPDATE TASK ============
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (useDatabase && pool) {
      const result = await pool.query(
        `UPDATE tasks SET
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          task_type = COALESCE($3, task_type),
          task_subtype = COALESCE($4, task_subtype),
          status = COALESCE($5, status),
          priority = COALESCE($6, priority),
          assigned_to_id = COALESCE($7, assigned_to_id),
          assigned_to_name = COALESCE($8, assigned_to_name),
          start_date = COALESCE($9, start_date),
          end_date = COALESCE($10, end_date),
          progress = COALESCE($11, progress),
          area_id = COALESCE($12, area_id),
          area_name = COALESCE($13, area_name),
          asset_id = COALESCE($14, asset_id),
          asset_name = COALESCE($15, asset_name),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $16
        RETURNING *`,
        [
          updates.title, updates.description, updates.taskType, updates.taskSubtype,
          updates.status, updates.priority, updates.assignedToId, updates.assignedToName,
          updates.startDate, updates.endDate, updates.progress, updates.areaId,
          updates.areaName, updates.assetId, updates.assetName, id
        ]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }
      return res.json({ success: true, data: result.rows[0], message: 'Task updated' });
    }

    // Mock update
    const taskIndex = mockTasks.findIndex(t => t.id === parseInt(id));
    if (taskIndex === -1) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    mockTasks[taskIndex] = { ...mockTasks[taskIndex], ...updates, updated_at: new Date().toISOString() };
    res.json({ success: true, data: mockTasks[taskIndex], message: 'Task updated' });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, error: 'Failed to update task' });
  }
});

// ============ DELETE TASK ============
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (useDatabase && pool) {
      const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }
      return res.json({ success: true, message: 'Task deleted' });
    }

    const taskIndex = mockTasks.findIndex(t => t.id === parseInt(id));
    if (taskIndex === -1) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    mockTasks.splice(taskIndex, 1);
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, error: 'Failed to delete task' });
  }
});

// ============ ASSIGN TASK TO WORKER ============
router.post('/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { workerId, workerName } = req.body;

    if (!workerId || !workerName) {
      return res.status(400).json({ success: false, error: 'Worker ID and name are required' });
    }

    if (useDatabase && pool) {
      const result = await pool.query(
        `UPDATE tasks SET assigned_to_id = $1, assigned_to_name = $2, status = 'Pending', updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
        [workerId, workerName, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }
      return res.json({ success: true, data: result.rows[0], message: `Task assigned to ${workerName}` });
    }

    const taskIndex = mockTasks.findIndex(t => t.id === parseInt(id));
    if (taskIndex === -1) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    mockTasks[taskIndex].assigned_to_id = workerId;
    mockTasks[taskIndex].assigned_to_name = workerName;
    res.json({ success: true, data: mockTasks[taskIndex], message: `Task assigned to ${workerName}` });
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ success: false, error: 'Failed to assign task' });
  }
});

// ============ UPDATE TASK STATUS ============
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, progress } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    let progressValue = progress;
    if (status === 'Completed') progressValue = 100;
    if (status === 'Pending') progressValue = 0;

    if (useDatabase && pool) {
      const result = await pool.query(
        `UPDATE tasks SET status = $1, progress = COALESCE($2, progress), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
        [status, progressValue, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }
      return res.json({ success: true, data: result.rows[0], message: `Status updated to ${status}` });
    }

    const taskIndex = mockTasks.findIndex(t => t.id === parseInt(id));
    if (taskIndex === -1) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    mockTasks[taskIndex].status = status;
    if (progressValue !== undefined) mockTasks[taskIndex].progress = progressValue;
    res.json({ success: true, data: mockTasks[taskIndex], message: `Status updated to ${status}` });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

module.exports = router;
