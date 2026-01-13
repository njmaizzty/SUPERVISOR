const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Try to import pool, but use mock data if PostgreSQL is not available
let pool;
let useDatabase = false;

// Disable database for now - use mock data only
// To enable database, set USE_DATABASE=true in environment
if (process.env.USE_DATABASE === 'true') {
  try {
    pool = require('../db/config');
    useDatabase = true;
    console.log('✅ Using PostgreSQL database for auth');
  } catch (error) {
    console.log('⚠️ PostgreSQL not configured, using mock data for auth');
    useDatabase = false;
  }
} else {
  console.log('📦 Using mock data for auth (set USE_DATABASE=true to use PostgreSQL)');
}

// Mock supervisors data (for development without PostgreSQL)
const mockSupervisors = [
  {
    id: 1,
    full_name: 'John Doe',
    email: 'john@example.com',
    username: 'johndoe',
    password_hash: hashPassword('password123'),
    supervisor_id: 'SUP-001',
    status: 'Active',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    full_name: 'Admin User',
    email: 'admin@farm.com',
    username: 'admin',
    password_hash: hashPassword('admin123'),
    supervisor_id: 'SUP-ADMIN',
    status: 'Active',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    full_name: 'Test Supervisor',
    email: 'test@farm.com',
    username: 'test',
    password_hash: hashPassword('test123'),
    supervisor_id: 'SUP-TEST',
    status: 'Active',
    created_at: new Date().toISOString()
  }
];

// Simple password hashing (use bcrypt in production)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Verify password
function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

// Generate simple token (use JWT in production)
function generateToken(userId) {
  const payload = {
    userId,
    timestamp: Date.now(),
    random: crypto.randomBytes(16).toString('hex')
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// ============================================
// SIGNUP - Create new supervisor account
// ============================================
router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, username, password, supervisorId } = req.body;

    // Validation
    if (!fullName || !email || !username || !password || !supervisorId) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    if (useDatabase && pool) {
      // Check if email already exists
      const emailCheck = await pool.query(
        'SELECT id FROM supervisors WHERE email = $1',
        [email.toLowerCase()]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Check if username already exists
      const usernameCheck = await pool.query(
        'SELECT id FROM supervisors WHERE username = $1',
        [username.toLowerCase()]
      );

      if (usernameCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Username already taken'
        });
      }

      // Check if supervisor ID already exists
      const supervisorIdCheck = await pool.query(
        'SELECT id FROM supervisors WHERE supervisor_id = $1',
        [supervisorId.toUpperCase()]
      );

      if (supervisorIdCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Supervisor ID already registered'
        });
      }

      // Hash password
      const passwordHash = hashPassword(password);

      // Insert new supervisor
      const result = await pool.query(
        `INSERT INTO supervisors (full_name, email, username, password_hash, supervisor_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, full_name, email, username, supervisor_id, status, created_at`,
        [fullName, email.toLowerCase(), username.toLowerCase(), passwordHash, supervisorId.toUpperCase()]
      );

      const newSupervisor = result.rows[0];

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        user: {
          id: newSupervisor.id,
          fullName: newSupervisor.full_name,
          email: newSupervisor.email,
          username: newSupervisor.username,
          supervisorId: newSupervisor.supervisor_id,
          status: newSupervisor.status
        }
      });
    } else {
      // Mock implementation
      const existingEmail = mockSupervisors.find(s => s.email === email.toLowerCase());
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }

      const existingUsername = mockSupervisors.find(s => s.username === username.toLowerCase());
      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: 'Username already taken'
        });
      }

      const existingSupervisorId = mockSupervisors.find(s => s.supervisor_id === supervisorId.toUpperCase());
      if (existingSupervisorId) {
        return res.status(409).json({
          success: false,
          message: 'Supervisor ID already registered'
        });
      }

      const newSupervisor = {
        id: mockSupervisors.length + 1,
        full_name: fullName,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password_hash: hashPassword(password),
        supervisor_id: supervisorId.toUpperCase(),
        status: 'Active',
        created_at: new Date().toISOString()
      };

      mockSupervisors.push(newSupervisor);

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        user: {
          id: newSupervisor.id,
          fullName: newSupervisor.full_name,
          email: newSupervisor.email,
          username: newSupervisor.username,
          supervisorId: newSupervisor.supervisor_id,
          status: newSupervisor.status
        }
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create account. Please try again.'
    });
  }
});

// ============================================
// LOGIN - Authenticate supervisor
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    if (useDatabase && pool) {
      // Find supervisor by username or email
      const result = await pool.query(
        `SELECT id, full_name, email, username, password_hash, supervisor_id, status, profile_image
         FROM supervisors 
         WHERE username = $1 OR email = $1`,
        [username.toLowerCase()]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      const supervisor = result.rows[0];

      // Check if account is active
      if (supervisor.status !== 'Active') {
        return res.status(403).json({
          success: false,
          message: 'Account is not active. Please contact administrator.'
        });
      }

      // Verify password
      if (!verifyPassword(password, supervisor.password_hash)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Update last login
      await pool.query(
        'UPDATE supervisors SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [supervisor.id]
      );

      // Generate token
      const token = generateToken(supervisor.id);

      res.json({
        success: true,
        message: 'Login successful',
        token,
        refreshToken: generateToken(supervisor.id + '_refresh'),
        user: {
          id: supervisor.id,
          fullName: supervisor.full_name,
          email: supervisor.email,
          username: supervisor.username,
          supervisorId: supervisor.supervisor_id,
          status: supervisor.status,
          profileImage: supervisor.profile_image
        }
      });
    } else {
      // Mock implementation
      const supervisor = mockSupervisors.find(
        s => s.username === username.toLowerCase() || s.email === username.toLowerCase()
      );

      if (!supervisor) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      if (!verifyPassword(password, supervisor.password_hash)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      const token = generateToken(supervisor.id);

      res.json({
        success: true,
        message: 'Login successful',
        token,
        refreshToken: generateToken(supervisor.id + '_refresh'),
        user: {
          id: supervisor.id,
          fullName: supervisor.full_name,
          email: supervisor.email,
          username: supervisor.username,
          supervisorId: supervisor.supervisor_id,
          status: supervisor.status
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// ============================================
// LOGOUT - End session
// ============================================
router.post('/logout', async (req, res) => {
  // In a real app, you'd invalidate the token here
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// ============================================
// GET PROFILE - Get current supervisor profile
// ============================================
router.get('/profile', async (req, res) => {
  try {
    // In a real app, you'd extract user ID from the token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization required'
      });
    }

    // For demo, return first supervisor
    if (useDatabase && pool) {
      const result = await pool.query(
        `SELECT id, full_name, email, username, supervisor_id, status, profile_image, phone, created_at, last_login
         FROM supervisors LIMIT 1`
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Supervisor not found'
        });
      }

      const supervisor = result.rows[0];
      res.json({
        success: true,
        user: {
          id: supervisor.id,
          fullName: supervisor.full_name,
          email: supervisor.email,
          username: supervisor.username,
          supervisorId: supervisor.supervisor_id,
          status: supervisor.status,
          profileImage: supervisor.profile_image,
          phone: supervisor.phone,
          createdAt: supervisor.created_at,
          lastLogin: supervisor.last_login
        }
      });
    } else {
      const supervisor = mockSupervisors[0];
      res.json({
        success: true,
        user: {
          id: supervisor.id,
          fullName: supervisor.full_name,
          email: supervisor.email,
          username: supervisor.username,
          supervisorId: supervisor.supervisor_id,
          status: supervisor.status
        }
      });
    }
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// ============================================
// CHECK EMAIL - Check if email is available
// ============================================
router.get('/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params;

    if (useDatabase && pool) {
      const result = await pool.query(
        'SELECT id FROM supervisors WHERE email = $1',
        [email.toLowerCase()]
      );

      res.json({
        success: true,
        available: result.rows.length === 0
      });
    } else {
      const exists = mockSupervisors.find(s => s.email === email.toLowerCase());
      res.json({
        success: true,
        available: !exists
      });
    }
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check email'
    });
  }
});

// ============================================
// CHECK USERNAME - Check if username is available
// ============================================
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;

    if (useDatabase && pool) {
      const result = await pool.query(
        'SELECT id FROM supervisors WHERE username = $1',
        [username.toLowerCase()]
      );

      res.json({
        success: true,
        available: result.rows.length === 0
      });
    } else {
      const exists = mockSupervisors.find(s => s.username === username.toLowerCase());
      res.json({
        success: true,
        available: !exists
      });
    }
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check username'
    });
  }
});

// ============================================
// UPDATE PROFILE - Update supervisor profile
// ============================================
router.put('/profile', async (req, res) => {
  try {
    const { id, fullName, email, phone, profileImage } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (useDatabase && pool) {
      // Check if email is taken by another user
      if (email) {
        const emailCheck = await pool.query(
          'SELECT id FROM supervisors WHERE email = $1 AND id != $2',
          [email.toLowerCase(), id]
        );

        if (emailCheck.rows.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'Email already in use by another account'
          });
        }
      }

      // Update supervisor
      const result = await pool.query(
        `UPDATE supervisors 
         SET full_name = COALESCE($1, full_name),
             email = COALESCE($2, email),
             phone = COALESCE($3, phone),
             profile_image = COALESCE($4, profile_image),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING id, full_name, email, username, supervisor_id, status, profile_image, phone`,
        [fullName, email?.toLowerCase(), phone, profileImage, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Supervisor not found'
        });
      }

      const supervisor = result.rows[0];
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: supervisor.id,
          fullName: supervisor.full_name,
          email: supervisor.email,
          username: supervisor.username,
          supervisorId: supervisor.supervisor_id,
          status: supervisor.status,
          profileImage: supervisor.profile_image,
          phone: supervisor.phone
        }
      });
    } else {
      // Mock implementation
      const supervisorIndex = mockSupervisors.findIndex(s => s.id === id);

      if (supervisorIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Supervisor not found'
        });
      }

      // Check if email is taken by another user
      if (email) {
        const emailTaken = mockSupervisors.find(
          s => s.email === email.toLowerCase() && s.id !== id
        );
        if (emailTaken) {
          return res.status(409).json({
            success: false,
            message: 'Email already in use by another account'
          });
        }
      }

      // Update mock data
      if (fullName) mockSupervisors[supervisorIndex].full_name = fullName;
      if (email) mockSupervisors[supervisorIndex].email = email.toLowerCase();
      if (phone) mockSupervisors[supervisorIndex].phone = phone;
      if (profileImage) mockSupervisors[supervisorIndex].profile_image = profileImage;

      const supervisor = mockSupervisors[supervisorIndex];
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: supervisor.id,
          fullName: supervisor.full_name,
          email: supervisor.email,
          username: supervisor.username,
          supervisorId: supervisor.supervisor_id,
          status: supervisor.status,
          profileImage: supervisor.profile_image,
          phone: supervisor.phone
        }
      });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// ============================================
// CHANGE PASSWORD - Update supervisor password
// ============================================
router.put('/change-password', async (req, res) => {
  try {
    const { id, currentPassword, newPassword } = req.body;

    if (!id || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    if (useDatabase && pool) {
      // Get current password hash
      const result = await pool.query(
        'SELECT password_hash FROM supervisors WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Supervisor not found'
        });
      }

      // Verify current password
      if (!verifyPassword(currentPassword, result.rows[0].password_hash)) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      const newPasswordHash = hashPassword(newPassword);
      await pool.query(
        'UPDATE supervisors SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newPasswordHash, id]
      );

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } else {
      // Mock implementation
      const supervisor = mockSupervisors.find(s => s.id === id);

      if (!supervisor) {
        return res.status(404).json({
          success: false,
          message: 'Supervisor not found'
        });
      }

      if (!verifyPassword(currentPassword, supervisor.password_hash)) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      supervisor.password_hash = hashPassword(newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    }
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// ============================================
// GET PROFILE BY ID - Get specific supervisor profile
// ============================================
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (useDatabase && pool) {
      const result = await pool.query(
        `SELECT id, full_name, email, username, supervisor_id, status, profile_image, phone, created_at, last_login
         FROM supervisors WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Supervisor not found'
        });
      }

      const supervisor = result.rows[0];
      res.json({
        success: true,
        user: {
          id: supervisor.id,
          fullName: supervisor.full_name,
          email: supervisor.email,
          username: supervisor.username,
          supervisorId: supervisor.supervisor_id,
          status: supervisor.status,
          profileImage: supervisor.profile_image,
          phone: supervisor.phone,
          createdAt: supervisor.created_at,
          lastLogin: supervisor.last_login
        }
      });
    } else {
      const supervisor = mockSupervisors.find(s => s.id === parseInt(id));

      if (!supervisor) {
        return res.status(404).json({
          success: false,
          message: 'Supervisor not found'
        });
      }

      res.json({
        success: true,
        user: {
          id: supervisor.id,
          fullName: supervisor.full_name,
          email: supervisor.email,
          username: supervisor.username,
          supervisorId: supervisor.supervisor_id,
          status: supervisor.status,
          profileImage: supervisor.profile_image,
          phone: supervisor.phone
        }
      });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

module.exports = router;

