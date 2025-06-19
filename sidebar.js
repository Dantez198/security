// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');


const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '0473',
    multipleStatements: 'true',
    dateStrings: 'true',
    database: 'qwetu_qejani'
});

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Make sure 'uploads/' folder exists
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  // Init upload
  const upload = multer({ storage: storage });

function formatMySQLDateTime(date) {
    const d = new Date(date);
    return d.getFullYear() + '-' + 
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0') + ' ' +
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0') + ':' +
        String(d.getSeconds()).padStart(2, '0');
}

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
});

// Database initialization queries
const initDb = `
    CREATE DATABASE IF NOT EXISTS qwetu_qejani;
    USE qwetu_qejani;

    CREATE TABLE IF NOT EXISTS key_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        residentNames VARCHAR(255) NOT NULL,
        roomNo VARCHAR(50) NOT NULL,
        telNumber VARCHAR(15) NOT NULL,
        block VARCHAR(100) NOT NULL,
        keyType VARCHAR(100) NOT NULL,
        dateIssued DATETIME NOT NULL,
        securityIssued VARCHAR(255) NOT NULL,
        dateReturned DATETIME,
        securityReceived VARCHAR(255),
        status ENUM('Issued', 'Returned', 'Damaged', 'Lost', 'Not Returned') DEFAULT 'Issued',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS master_cards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        staffName VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        masterCardType VARCHAR(100) NOT NULL,
        dateIssued DATETIME NOT NULL,
        securityIssued VARCHAR(255) NOT NULL,
        dateReturned DATETIME,
        securityReceived VARCHAR(255),
        status ENUM('Issued', 'Returned', 'Damaged', 'Lost', 'Not Returned') DEFAULT 'Issued',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS remote_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        residentNames VARCHAR(255) NOT NULL,
        roomNumber VARCHAR(50) NOT NULL,
        telNumber VARCHAR(15) NOT NULL,
        blockName VARCHAR(100) NOT NULL,
        remoteType VARCHAR(100) NOT NULL,
        dateIssued DATETIME NOT NULL,
        securityIssued VARCHAR(255) NOT NULL,
        dateReturned DATETIME,
        securityReceived VARCHAR(255),
        status ENUM('Issued', 'Returned', 'Damaged', 'Lost', 'Not Returned') DEFAULT 'Issued',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS gaming_item_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        residentNames VARCHAR(255) NOT NULL,
        roomNumber VARCHAR(50) NOT NULL,
        telNumber VARCHAR(15) NOT NULL,
        blockName VARCHAR(100) NOT NULL,
        gameItem VARCHAR(100) NOT NULL,
        statusOut VARCHAR(100) NOT NULL,
        dateIssued DATETIME NOT NULL,
        securityIssued VARCHAR(255) NOT NULL,
        dateReturned DATETIME,
        securityReceived VARCHAR(255),
        status ENUM('Issued', 'Returned', 'Damaged', 'Lost', 'Not Returned') DEFAULT 'Issued',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Generator monitoring tables
    CREATE TABLE IF NOT EXISTS fire_alarms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        time TIME NOT NULL,
        room_number VARCHAR(50) NOT NULL,
        floor VARCHAR(50) NOT NULL,
        triggered_by VARCHAR(255) NOT NULL,
        alarm_level VARCHAR(50) NOT NULL,
        action_taken TEXT NOT NULL,
        security_assistant VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS power_blackouts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        generator_start_time TIME NOT NULL,
        fuel_level_before INT NOT NULL,
        generator_stop_time TIME NOT NULL,
        fuel_level_after INT NOT NULL,
        run_duration VARCHAR(20) NOT NULL,
        security_assistant_name VARCHAR(255) NOT NULL,
        fuel_status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fuel_deliveries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        delivery_date DATE NOT NULL,
        driver_name VARCHAR(255) NOT NULL,
        fuel_delivered INT NOT NULL,
        delivery_time TIME NOT NULL,
        security_assistant_name VARCHAR(255) NOT NULL,
        generator_running_status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS daily_fuel_levels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        time TIME NOT NULL,
        fuel_level INT NOT NULL,
        security_assistant VARCHAR(255) NOT NULL,
        fuel_status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fuel_top_ups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        time TIME NOT NULL,
        initial_fuel_level INT NOT NULL,
        fuel_added INT NOT NULL,
        final_fuel_level INT NOT NULL,
        security_assistant VARCHAR(255) NOT NULL,
        fuel_status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

   
`;

// Initialize database tables
db.query(initDb, (err) => {
    if (err) {
        console.error('Error initializing database:', err);
        return;
    }
    console.log('Database initialized');
});

// Alter existing tables to ensure they have the updated status options
const alterTables = `
    ALTER TABLE key_records MODIFY COLUMN status ENUM('Issued', 'Returned', 'Damaged', 'Lost', 'Not Returned') DEFAULT 'Issued';
    ALTER TABLE master_cards MODIFY COLUMN status ENUM('Issued', 'Returned', 'Damaged', 'Lost', 'Not Returned') DEFAULT 'Issued';
    ALTER TABLE remote_records MODIFY COLUMN status ENUM('Issued', 'Returned', 'Damaged', 'Lost', 'Not Returned') DEFAULT 'Issued';
    ALTER TABLE gaming_item_records MODIFY COLUMN status ENUM('Issued', 'Returned', 'Damaged', 'Lost', 'Not Returned') DEFAULT 'Issued';
`;

// Execute the alter table queries
db.query(alterTables, (err) => {
    if (err) {
        console.error('Error updating table schemas:', err);
        // This error is not critical, as it might fail if the columns already have the correct ENUM values
        console.log('Tables may already have the correct schema');
    } else {
        console.log('Table schemas updated to include Not Returned status');
    }
});

//=================================
// KEY MANAGEMENT SYSTEM API ROUTES
//=================================

// API Routes for Key Records
app.post('/api/key-records', (req, res) => {
    const { residentNames, roomNo, telNumber, block, keyType, securityIssued, dateIssued, status } = req.body;
    
    const query = `
        INSERT INTO key_records 
        (residentNames, roomNo, telNumber, block, keyType, securityIssued, dateIssued, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(
        query,
        [residentNames, roomNo, telNumber, block, keyType, securityIssued, dateIssued, status],
        (err, results) => {
            if (err) {
                console.error('Error issuing key:', err);
                res.status(500).json({ error: 'Failed to issue key' });
                return;
            }
            res.status(201).json({ message: 'Key issued successfully', id: results.insertId });
        }
    );
});

app.get('/api/key-records', (req, res) => {
    const query = 'SELECT * FROM key_records ORDER BY dateIssued DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching key records:', err);
            res.status(500).json({ error: 'Failed to fetch key records' });
            return;
        }
        res.json(results);
    });
});

app.put('/api/key-records/:id/return', (req, res) => {
    const { id } = req.params;
    const { securityReceived, status, dateReturned } = req.body;
    
    // Validate status
    const validStatuses = ['Returned', 'Damaged', 'Lost', 'Not Returned'];
    if (!validStatuses.includes(status)) {
        console.error('Invalid status:', status);
        res.status(400).json({ error: 'Invalid status value' });
        return;
    }
    
    const formattedDate = formatMySQLDateTime(dateReturned);
    const query = `
        UPDATE key_records 
        SET securityReceived = ?, status = ?, dateReturned = ?
        WHERE id = ?
    `;
    
    db.query(
        query,
        [securityReceived, status, formattedDate, id],
        (err, results) => {
            if (err) {
                console.error('Error updating key return status:', err);
                res.status(500).json({ error: 'Failed to update key return status' });
                return;
            }
            res.json({ message: 'Key return status updated successfully' });
        }
    );
});

// API Routes for Master Cards
app.post('/api/mastercards', (req, res) => {
    const { staffName, department, masterCardType, securityIssued, dateIssued, status } = req.body;
    
    const query = `
        INSERT INTO master_cards 
        (staffName, department, masterCardType, securityIssued, dateIssued, status)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.query(
        query,
        [staffName, department, masterCardType, securityIssued, dateIssued, status],
        (err, results) => {
            if (err) {
                console.error('Error issuing mastercard:', err);
                res.status(500).json({ error: 'Failed to issue mastercard' });
                return;
            }
            res.status(201).json({ message: 'Mastercard issued successfully', id: results.insertId });
        }
    );
});

app.get('/api/mastercards', (req, res) => {
    const query = 'SELECT * FROM master_cards ORDER BY dateIssued DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching mastercards:', err);
            res.status(500).json({ error: 'Failed to fetch mastercards' });
            return;
        }
        res.json(results);
    });
});

app.put('/api/mastercards/:id/return', (req, res) => {
    const { id } = req.params;
    const { securityReceived, status, dateReturned } = req.body;
    
    // Validate status
    const validStatuses = ['Returned', 'Damaged', 'Lost', 'Not Returned'];
    if (!validStatuses.includes(status)) {
        console.error('Invalid status:', status);
        res.status(400).json({ error: 'Invalid status value' });
        return;
    }
    
    const formattedDate = formatMySQLDateTime(dateReturned);
    const query = `
        UPDATE master_cards 
        SET securityReceived = ?, status = ?, dateReturned = ?
        WHERE id = ?
    `;
    
    db.query(
        query,
        [securityReceived, status, formattedDate, id],
        (err, results) => {
            if (err) {
                console.error('Error updating mastercard return status:', err);
                res.status(500).json({ error: 'Failed to update mastercard return status' });
                return;
            }
            res.json({ message: 'Mastercard return status updated successfully' });
        }
    );
});

// Remote Records API Routes
app.post('/api/remote-records', (req, res) => {
    const {
        residentNames,
        roomNumber,
        telNumber,
        blockName,
        remoteType,
        securityIssued,
        dateIssued,
        status
    } = req.body;
    
    const query = `
        INSERT INTO remote_records 
        (residentNames, roomNumber, telNumber, blockName, remoteType, securityIssued, dateIssued, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(
        query,
        [residentNames, roomNumber, telNumber, blockName, remoteType, securityIssued, dateIssued, status],
        (err, results) => {
            if (err) {
                console.error('Error issuing remote:', err);
                res.status(500).json({ error: 'Failed to issue remote' });
                return;
            }
            res.status(201).json({ message: 'Remote issued successfully', id: results.insertId });
        }
    );
});

app.get('/api/remote-records', (req, res) => {
    const query = 'SELECT * FROM remote_records ORDER BY dateIssued DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching remote records:', err);
            res.status(500).json({ error: 'Failed to fetch remote records' });
            return;
        }
        res.json(results);
    });
});

app.put('/api/remote-records/:id/return', (req, res) => {
    const { id } = req.params;
    const { securityReceived, status, dateReturned } = req.body;
    
    // Validate status
    const validStatuses = ['Returned', 'Damaged', 'Lost', 'Not Returned'];
    if (!validStatuses.includes(status)) {
        console.error('Invalid status:', status);
        res.status(400).json({ error: 'Invalid status value' });
        return;
    }
    
    const formattedDate = formatMySQLDateTime(dateReturned);
    const query = `
        UPDATE remote_records 
        SET securityReceived = ?, status = ?, dateReturned = ?
        WHERE id = ?
    `;
    
    db.query(
        query,
        [securityReceived, status, formattedDate, id],
        (err, results) => {
            if (err) {
                console.error('Error updating remote return status:', err);
                res.status(500).json({ error: 'Failed to update remote return status' });
                return;
            }
            res.json({ message: 'Remote return status updated successfully' });
        }
    );
});

// Gaming Item Records API Routes
app.post('/api/gaming-item-records', (req, res) => {
    const {
        residentNames,
        roomNumber,
        telNumber,
        blockName,
        gameItem,
        statusOut,
        securityIssued,
        dateIssued,
        status
    } = req.body;
    
    const query = `
        INSERT INTO gaming_item_records 
        (residentNames, roomNumber, telNumber, blockName, gameItem, statusOut, securityIssued, dateIssued, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(
        query,
        [residentNames, roomNumber, telNumber, blockName, gameItem, statusOut, securityIssued, dateIssued, status],
        (err, results) => {
            if (err) {
                console.error('Error issuing game item:', err);
                res.status(500).json({ error: 'Failed to issue game item' });
                return;
            }
            res.status(201).json({ message: 'Game item issued successfully', id: results.insertId });
        }
    );
});

app.get('/api/gaming-item-records', (req, res) => {
    const query = 'SELECT * FROM gaming_item_records ORDER BY dateIssued DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching gaming item records:', err);
            res.status(500).json({ error: 'Failed to fetch gaming item records' });
            return;
        }
        res.json(results);
    });
});

app.put('/api/gaming-item-records/:id/return', (req, res) => {
    const { id } = req.params;
    const { securityReceived, status, dateReturned } = req.body;
    
    // Validate status
    const validStatuses = ['Returned', 'Damaged', 'Lost', 'Not Returned'];
    if (!validStatuses.includes(status)) {
        console.error('Invalid status:', status);
        res.status(400).json({ error: 'Invalid status value' });
        return;
    }
    
    const formattedDate = formatMySQLDateTime(dateReturned);
    const query = `
        UPDATE gaming_item_records 
        SET securityReceived = ?, status = ?, dateReturned = ?
        WHERE id = ?
    `;
    
    db.query(
        query,
        [securityReceived, status, formattedDate, id],
        (err, results) => {
            if (err) {
                console.error('Error updating gaming item return status:', err);
                res.status(500).json({ error: 'Failed to update gaming item return status' });
                return;
            }
            res.json({ message: 'Gaming item return status updated successfully' });
        }
    );
});

//=================================
// GENERATOR MONITORING API ROUTES
//=================================

// 1. Fire Alarms API routes
app.post('/api/fire-alarms', (req, res) => {
    const {
        date,
        time,
        room_number,
        floor,
        triggered_by,
        alarm_level,
        action_taken,
        security_assistant
    } = req.body;
    
    const query = `
        INSERT INTO fire_alarms 
        (date, time, room_number, floor, triggered_by, alarm_level, action_taken, security_assistant)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(
        query,
        [date, time, room_number, floor, triggered_by, alarm_level, action_taken, security_assistant],
        (err, results) => {
            if (err) {
                console.error('Error adding fire alarm record:', err);
                res.status(500).json({ error: 'Failed to add fire alarm record' });
                return;
            }
            res.status(201).json({ message: 'Fire alarm record added successfully', id: results.insertId });
        }
    );
});

app.get('/api/fire-alarms', (req, res) => {
    const query = 'SELECT * FROM fire_alarms ORDER BY date DESC, time DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching fire alarm records:', err);
            res.status(500).json({ error: 'Failed to fetch fire alarm records' });
            return;
        }
        res.json(results);
    });
});

// 2. Power Blackouts API routes
app.post('/api/power-blackouts', (req, res) => {
    const {
        date,
        generator_start_time,
        fuel_level_before,
        generator_stop_time,
        fuel_level_after,
        run_duration,
        security_assistant_name,
        fuel_status
    } = req.body;
    
    const query = `
        INSERT INTO power_blackouts 
        (date, generator_start_time, fuel_level_before, generator_stop_time, fuel_level_after, run_duration, security_assistant_name, fuel_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(
        query,
        [date, generator_start_time, fuel_level_before, generator_stop_time, fuel_level_after, run_duration, security_assistant_name, fuel_status],
        (err, results) => {
            if (err) {
                console.error('Error adding power blackout record:', err);
                res.status(500).json({ error: 'Failed to add power blackout record' });
                return;
            }
            res.status(201).json({ message: 'Power blackout record added successfully', id: results.insertId });
        }
    );
});

app.get('/api/power-blackouts', (req, res) => {
    const query = 'SELECT * FROM power_blackouts ORDER BY date DESC, generator_start_time DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching power blackout records:', err);
            res.status(500).json({ error: 'Failed to fetch power blackout records' });
            return;
        }
        res.json(results);
    });
});

// 3. Fuel Deliveries API routes
app.post('/api/fuel-deliveries', (req, res) => {
    const {
        delivery_date,
        driver_name,
        fuel_delivered,
        delivery_time,
        security_assistant_name,
        generator_running_status
    } = req.body;
    
    const query = `
        INSERT INTO fuel_deliveries 
        (delivery_date, driver_name, fuel_delivered, delivery_time, security_assistant_name, generator_running_status)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.query(
        query,
        [delivery_date, driver_name, fuel_delivered, delivery_time, security_assistant_name, generator_running_status],
        (err, results) => {
            if (err) {
                console.error('Error adding fuel delivery record:', err);
                res.status(500).json({ error: 'Failed to add fuel delivery record' });
                return;
            }
            res.status(201).json({ message: 'Fuel delivery record added successfully', id: results.insertId });
        }
    );
});

app.get('/api/fuel-deliveries', (req, res) => {
    const query = 'SELECT * FROM fuel_deliveries ORDER BY delivery_date DESC, delivery_time DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching fuel delivery records:', err);
            res.status(500).json({ error: 'Failed to fetch fuel delivery records' });
            return;
        }
        res.json(results);
    });
});

// 4. Daily Fuel Levels API routes
app.post('/api/daily-fuel-levels', (req, res) => {
    const {
        date,
        time,
        fuel_level,
        security_assistant,
        fuel_status
    } = req.body;
    
    const query = `
        INSERT INTO daily_fuel_levels 
        (date, time, fuel_level, security_assistant, fuel_status)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.query(
        query,
        [date, time, fuel_level, security_assistant, fuel_status],
        (err, results) => {
            if (err) {
                console.error('Error adding daily fuel level record:', err);
                res.status(500).json({ error: 'Failed to add daily fuel level record' });
                return;
            }
            res.status(201).json({ message: 'Daily fuel level record added successfully', id: results.insertId });
        }
    );
});

app.get('/api/daily-fuel-levels', (req, res) => {
    const query = 'SELECT * FROM daily_fuel_levels ORDER BY date DESC, time DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching daily fuel level records:', err);
            res.status(500).json({ error: 'Failed to fetch daily fuel level records' });
            return;
        }
        res.json(results);
    });
});

// 5. Fuel Top-Ups API routes
app.post('/api/fuel-top-ups', (req, res) => {
    const {
        date,
        time,
        initial_fuel_level,
        fuel_added,
        final_fuel_level,
        security_assistant, // Match this field name with the client-side
        fuel_status
    } = req.body;
    
    console.log('Received fuel top-up data:', req.body);
    console.log('Security assistant value:', security_assistant);
    
    // Validate that security_assistant is a string
    if (!security_assistant || typeof security_assistant !== 'string') {
        console.error('Invalid security assistant value:', security_assistant);
        return res.status(400).json({ error: 'Security assistant name is required' });
    }
    
    const query = `
        INSERT INTO fuel_top_ups 
        (date, time, initial_fuel_level, fuel_added, final_fuel_level, security_assistant, fuel_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(
        query,
        [date, time, initial_fuel_level, fuel_added, final_fuel_level, security_assistant, fuel_status],
        (err, results) => {
            if (err) {
                console.error('Error adding fuel top-up record:', err);
                res.status(500).json({ error: 'Failed to add fuel top-up record' });
                return;
            }
            res.status(201).json({ message: 'Fuel top-up record added successfully', id: results.insertId });
        }
    );
});
app.get('/api/fuel-top-ups', (req, res) => {
    const query = 'SELECT * FROM fuel_top_ups ORDER BY date DESC, time DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching fuel top-up records:', err);
            res.status(500).json({ error: 'Failed to fetch fuel top-up records' });
            return;
        }
        res.json(results);
    });
});

// GET: Fetch all statements
app.get('/api/statements', (req, res) => {
    const query = 'SELECT * FROM statements ORDER BY id DESC';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching statements:', err);
        return res.status(500).json({ error: 'Failed to fetch statements' });
      }
      res.json(results);
    });
  });
  
  

// Start server
const PORT = process.env.PORT || 4022;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});