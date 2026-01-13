const pool = require('./config');

const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');

    // Create ENUM types
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE task_status AS ENUM ('Pending', 'In Progress', 'Completed', 'Cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE task_priority AS ENUM ('Low', 'Medium', 'High');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE supervisor_status AS ENUM ('Active', 'Inactive', 'Suspended');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create supervisors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS supervisors (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        supervisor_id VARCHAR(50) NOT NULL UNIQUE,
        status supervisor_status DEFAULT 'Active',
        profile_image VARCHAR(255),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );
    `);

    // Create index for faster queries on supervisors
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_supervisors_email ON supervisors(email);
      CREATE INDEX IF NOT EXISTS idx_supervisors_username ON supervisors(username);
      CREATE INDEX IF NOT EXISTS idx_supervisors_supervisor_id ON supervisors(supervisor_id);
    `);

    // Create workers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS workers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        expertise TEXT[] DEFAULT '{}',
        availability VARCHAR(20) DEFAULT 'Available',
        experience INTEGER DEFAULT 0,
        suitability_score INTEGER DEFAULT 80,
        current_tasks TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create areas table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS areas (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create assets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50),
        status VARCHAR(20) DEFAULT 'Available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create tasks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        task_type VARCHAR(50) NOT NULL,
        task_subtype VARCHAR(100),
        status task_status DEFAULT 'Pending',
        priority task_priority DEFAULT 'Medium',
        assigned_to_id INTEGER REFERENCES workers(id),
        assigned_to_name VARCHAR(100),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        progress INTEGER DEFAULT 0,
        area_id INTEGER REFERENCES areas(id),
        area_name VARCHAR(100),
        asset_id INTEGER REFERENCES assets(id),
        asset_name VARCHAR(100),
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
      CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_area ON tasks(area_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_dates ON tasks(start_date, end_date);
    `);

    // Insert default areas
    await pool.query(`
      INSERT INTO areas (name, description)
      VALUES 
        ('Block A', 'Northern section - Apple trees'),
        ('Block B', 'Eastern section - Irrigation zone'),
        ('Block C', 'Southern section - Mixed crops'),
        ('Block D', 'Western section - New plantation')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Insert default assets
    await pool.query(`
      INSERT INTO assets (name, type, status)
      VALUES 
        ('Pruning Shears Set', 'Tool', 'Available'),
        ('Sprayer Machine', 'Equipment', 'Available'),
        ('Fertilizer Spreader', 'Equipment', 'Available'),
        ('Tractor', 'Vehicle', 'Available'),
        ('Harvest Basket', 'Tool', 'Available'),
        ('Irrigation Controller', 'Equipment', 'Available')
      ON CONFLICT DO NOTHING;
    `);

    // Insert default workers
    await pool.query(`
      INSERT INTO workers (name, expertise, availability, experience, suitability_score, current_tasks)
      VALUES 
        ('Ahmad', ARRAY['Harvesting', 'Pruning'], 'Available', 5, 92, ARRAY['Harvesting section A']),
        ('Faiz', ARRAY['Harvesting'], 'Available', 3, 84, ARRAY['Harvesting section B']),
        ('Siti', ARRAY['Spraying', 'Manuring'], 'Busy', 4, 90, ARRAY['Spraying section C']),
        ('Ali', ARRAY['Weeding', 'Pest & Disease'], 'Available', 2, 82, ARRAY['Weeding section D']),
        ('Hana', ARRAY['Mechanisation Fleet'], 'Available', 6, 91, ARRAY['Tractor maintenance']),
        ('Maya', ARRAY['Pruning'], 'Available', 4, 88, ARRAY['Pruning section A']),
        ('Zul', ARRAY['Manuring'], 'Available', 3, 85, ARRAY['Manuring section B']),
        ('Imran', ARRAY['Weeding'], 'Available', 3, 82, ARRAY[]::TEXT[]),
        ('Fauzi', ARRAY['Pest & Disease'], 'Available', 6, 87, ARRAY['Pest inspection section A']),
        ('Razak', ARRAY['General Work'], 'Available', 7, 89, ARRAY['Main gate security']),
        ('Aisyah', ARRAY['General Work'], 'Available', 4, 83, ARRAY['Office area cleaning'])
      ON CONFLICT DO NOTHING;
    `);

    // Insert sample tasks
    await pool.query(`
      INSERT INTO tasks (title, description, task_type, task_subtype, status, priority, assigned_to_id, assigned_to_name, start_date, end_date, progress, area_name, asset_name)
      VALUES 
        ('Tree Pruning - Block A', 'Prune apple trees in the northern section of Block A', 'Harvesting', 'Pruning', 'In Progress', 'High', 1, 'Ahmad', '2024-11-29', '2024-12-01', 65, 'Block A', 'Pruning Shears Set'),
        ('Irrigation System Check', 'Inspect and test all irrigation lines in Block B', 'General Work', 'Mechanical Work', 'Pending', 'Medium', 2, 'Faiz', '2024-12-02', '2024-12-03', 0, 'Block B', 'Irrigation Controller'),
        ('Pest Control - Block C', 'Spray pesticides to control pests in Block C', 'Pest & Disease', 'Pest & Disease Control', 'Pending', 'High', 1, 'Ahmad', '2024-12-04', '2024-12-05', 0, 'Block C', 'Sprayer Machine'),
        ('Fertilizer Application - Block D', 'Apply organic fertilizer to trees in Block D', 'Manuring', 'Fertilizer Application', 'In Progress', 'Medium', 3, 'Siti', '2024-12-05', '2024-12-06', 40, 'Block D', 'Fertilizer Spreader'),
        ('Harvest Loose Fruits - Block B', 'Collect loose fruits from Block B', 'Harvesting', 'Loose Fruit Collection', 'Completed', 'Medium', 2, 'Faiz', '2024-11-25', '2024-11-26', 100, 'Block B', 'Harvest Basket'),
        ('Weeding - Block D', 'Complete weeding of paths in Block D', 'Weeding', 'Circle / Path', 'Completed', 'Low', 8, 'Imran', '2024-11-20', '2024-11-21', 100, 'Block D', NULL)
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Database initialized successfully!');
    console.log('📋 Tables created: workers, areas, assets, tasks');
    
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  } finally {
    await pool.end();
  }
};

initDatabase();

