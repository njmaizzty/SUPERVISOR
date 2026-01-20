const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const dashboardRoutes = require('./routes/dashboard');
const tasksRoutes = require('./routes/tasks');
const authRoutes = require('./routes/auth');
const workersRoutes = require('./routes/workers');
const assetsRoutes = require('./routes/assets');
const areasRoutes = require('./routes/areas');
const aiChatRoutes = require('./routes/ai-chat');

// Use routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/supervisor', authRoutes);
app.use('/api/workers', workersRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/areas', areasRoutes);
app.use('/api/ai-chat', aiChatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Farm Supervisor Backend running on port ${PORT}`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard`);
  console.log(`📋 Tasks API: http://localhost:${PORT}/api/tasks`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/supervisor`);
  console.log(`👷 Workers API: http://localhost:${PORT}/api/workers`);
  console.log(`🔧 Assets API: http://localhost:${PORT}/api/assets`);
  console.log(`🗺️ Areas API: http://localhost:${PORT}/api/areas`);
  console.log(`🤖 AI Chat API: http://localhost:${PORT}/api/ai-chat`);
});

