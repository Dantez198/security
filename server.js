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

    
CREATE TABLE IF NOT EXISTS statements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    secondName VARCHAR(100) NOT NULL,
    phoneNumber VARCHAR(20) NOT NULL,
    dateOfIncident DATE NOT NULL,
    timeOfIncident TIME NOT NULL,
    roomNumber VARCHAR(50) NOT NULL,
    placeOfIncident VARCHAR(255) NOT NULL,
    securityName VARCHAR(100) NOT NULL,
    obNumber VARCHAR(50) NOT NULL,
    incidentDescription TEXT NOT NULL,
    designation VARCHAR(100) NOT NULL,
    incidentCategory VARCHAR(100) NOT NULL,
    filePath VARCHAR(255),
    fileName VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gatepasses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    time TIME NOT NULL,
    driversName VARCHAR(255) NOT NULL,
    driversPhone VARCHAR(20) NOT NULL,
    carRegNo VARCHAR(50),
    relationToHostel VARCHAR(100) NOT NULL,
    itemsFrom VARCHAR(255) NOT NULL,
    itemsTo VARCHAR(255) NOT NULL,
    transferReason TEXT NOT NULL,
    itemsList TEXT NOT NULL,
    securityName VARCHAR(255) NOT NULL,
    uploadedGatepass VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
   
`;


// Configure storage for gatepass file uploads
const gatepassStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        // Create uploads/gatepasses directory if it doesn't exist
        const dir = './uploads/gatepasses';
        if (!fs.existsSync('./uploads')) {
            fs.mkdirSync('./uploads');
        }
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function(req, file, cb) {
        // Create unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'gatepass-' + uniqueSuffix + extension);
    }
});

// Initialize gatepass file upload middleware
const gatepassUpload = multer({ 
    storage: gatepassStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    },
    fileFilter: function(req, file, cb) {
        // Accept common document and image formats
        const allowedTypes = [
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/jpg',
            'image/png'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, Word documents, JPG, and PNG are allowed.'));
        }
    }
});

// POST: Create a new gatepass
app.post('/api/gatepass', gatepassUpload.single('uploadedGatepass'), (req, res) => {
    try {
        // Parse JSON data
        const gatepassData = JSON.parse(req.body.data);
        
        // Handle file path
        let uploadedGatepassPath = null;
        if (req.file) {
            uploadedGatepassPath = `/uploads/gatepasses/${req.file.filename}`;
        }
        
        // Ensure itemsList is stored as a JSON string
        const itemsList = Array.isArray(gatepassData.itemsList) 
            ? JSON.stringify(gatepassData.itemsList) 
            : gatepassData.itemsList;
        
        const query = `
            INSERT INTO gatepasses 
            (date, time, driversName, driversPhone, carRegNo, relationToHostel, 
            itemsFrom, itemsTo, transferReason, itemsList, securityName, uploadedGatepass)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.query(
            query,
            [
                gatepassData.date,
                gatepassData.time,
                gatepassData.driversName,
                gatepassData.driversPhone,
                gatepassData.carRegNo || 'N/A',
                gatepassData.relationToHostel,
                gatepassData.itemsFrom,
                gatepassData.itemsTo,
                gatepassData.transferReason,
                itemsList,
                gatepassData.securityName,
                uploadedGatepassPath
            ],
            (err, results) => {
                if (err) {
                    console.error('Error creating gatepass record:', err);
                    return res.status(500).json({ error: 'Failed to create gatepass record' });
                }
                
                // Return the created gatepass with the ID
                const createdGatepass = {
                    id: results.insertId,
                    ...gatepassData,
                    uploadedGatepass: uploadedGatepassPath
                };
                
                res.status(201).json(createdGatepass);
            }
        );
    } catch (error) {
        console.error('Error processing gatepass data:', error);
        res.status(400).json({ error: 'Invalid data format' });
    }
});

// GET: Fetch all gatepasses
app.get('/api/gatepass', (req, res) => {
    const query = 'SELECT * FROM gatepasses ORDER BY date DESC, time DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching gatepasses:', err);
            return res.status(500).json({ error: 'Failed to fetch gatepasses' });
        }
        
        // Parse itemsList back to arrays
        const gatepasses = results.map(gatepass => {
            try {
                gatepass.itemsList = JSON.parse(gatepass.itemsList);
            } catch (error) {
                console.error('Error parsing itemsList:', error);
                gatepass.itemsList = [];
            }
            return gatepass;
        });
        
        res.json(gatepasses);
    });
});

// GET: Fetch a specific gatepass
app.get('/api/gatepass/:id', (req, res) => {
    const gatepassId = req.params.id;
    const query = 'SELECT * FROM gatepasses WHERE id = ?';
    
    db.query(query, [gatepassId], (err, results) => {
        if (err) {
            console.error('Error fetching gatepass:', err);
            return res.status(500).json({ error: 'Failed to fetch gatepass' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Gatepass not found' });
        }
        
        // Parse itemsList
        try {
            results[0].itemsList = JSON.parse(results[0].itemsList);
        } catch (error) {
            console.error('Error parsing itemsList:', error);
            results[0].itemsList = [];
        }
        
        res.json(results[0]);
    });
});

// PUT: Update a gatepass
app.put('/api/gatepass/:id', gatepassUpload.single('uploadedGatepass'), (req, res) => {
    const gatepassId = req.params.id;
    
    try {
        // Parse JSON data
        const gatepassData = JSON.parse(req.body.data);
        
        // Get the current gatepass to check if there's an existing file
        db.query('SELECT uploadedGatepass FROM gatepasses WHERE id = ?', [gatepassId], (err, results) => {
            if (err) {
                console.error('Error fetching gatepass for update:', err);
                return res.status(500).json({ error: 'Failed to update gatepass' });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ error: 'Gatepass not found' });
            }
            
            const existingGatepass = results[0];
            
            // Handle file path
            let uploadedGatepassPath = existingGatepass.uploadedGatepass;
            
            // If a new file was uploaded
            if (req.file) {
                uploadedGatepassPath = `/uploads/gatepasses/${req.file.filename}`;
                
                // Delete the old file if it exists
                if (existingGatepass.uploadedGatepass) {
                    const oldFilePath = path.join(__dirname, existingGatepass.uploadedGatepass);
                    if (fs.existsSync(oldFilePath)) {
                        try {
                            fs.unlinkSync(oldFilePath);
                        } catch (unlinkErr) {
                            console.error('Error deleting old gatepass file:', unlinkErr);
                            // Continue with update even if file deletion fails
                        }
                    }
                }
            }
            
            // Ensure itemsList is stored as a JSON string
            const itemsList = Array.isArray(gatepassData.itemsList) 
                ? JSON.stringify(gatepassData.itemsList) 
                : gatepassData.itemsList;
            
            const query = `
                UPDATE gatepasses 
                SET date = ?, time = ?, driversName = ?, driversPhone = ?, carRegNo = ?,
                    relationToHostel = ?, itemsFrom = ?, itemsTo = ?, transferReason = ?,
                    itemsList = ?, securityName = ?, uploadedGatepass = ?
                WHERE id = ?
            `;
            
            db.query(
                query,
                [
                    gatepassData.date,
                    gatepassData.time,
                    gatepassData.driversName,
                    gatepassData.driversPhone,
                    gatepassData.carRegNo || 'N/A',
                    gatepassData.relationToHostel,
                    gatepassData.itemsFrom,
                    gatepassData.itemsTo,
                    gatepassData.transferReason,
                    itemsList,
                    gatepassData.securityName,
                    uploadedGatepassPath,
                    gatepassId
                ],
                (updateErr, updateResults) => {
                    if (updateErr) {
                        console.error('Error updating gatepass:', updateErr);
                        return res.status(500).json({ error: 'Failed to update gatepass' });
                    }
                    
                    if (updateResults.affectedRows === 0) {
                        return res.status(404).json({ error: 'Gatepass not found' });
                    }
                    
                    // Return the updated gatepass
                    const updatedGatepass = {
                        id: gatepassId,
                        ...gatepassData,
                        uploadedGatepass: uploadedGatepassPath
                    };
                    
                    res.json({ message: 'Gatepass updated successfully', gatepass: updatedGatepass });
                }
            );
        });
    } catch (error) {
        console.error('Error processing gatepass data for update:', error);
        res.status(400).json({ error: 'Invalid data format' });
    }
});

// DELETE: Remove a gatepass
app.delete('/api/gatepass/:id', (req, res) => {
    const gatepassId = req.params.id;
    
    // First, get the gatepass to find any associated file
    db.query('SELECT uploadedGatepass FROM gatepasses WHERE id = ?', [gatepassId], (err, results) => {
        if (err) {
            console.error('Error fetching gatepass for deletion:', err);
            return res.status(500).json({ error: 'Failed to delete gatepass' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Gatepass not found' });
        }
        
        // If there's a file, delete it from the filesystem
        const gatepass = results[0];
        if (gatepass.uploadedGatepass) {
            const filePath = path.join(__dirname, gatepass.uploadedGatepass);
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (unlinkErr) {
                    console.error('Error deleting gatepass file:', unlinkErr);
                    // Continue with gatepass deletion even if file deletion fails
                }
            }
        }
        
        // Delete the gatepass record
        db.query('DELETE FROM gatepasses WHERE id = ?', [gatepassId], (deleteErr, deleteResults) => {
            if (deleteErr) {
                console.error('Error deleting gatepass record:', deleteErr);
                return res.status(500).json({ error: 'Failed to delete gatepass record' });
            }
            
            res.json({ message: 'Gatepass deleted successfully' });
        });
    });
});

// GET: Export gatepasses to CSV
app.get('/api/gatepass/export/csv', (req, res) => {
    const query = 'SELECT * FROM gatepasses ORDER BY date DESC, time DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching gatepasses for export:', err);
            return res.status(500).json({ error: 'Failed to export gatepasses' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'No gatepasses found to export' });
        }
        
        // Create CSV header based on columns
        const columns = [
            'ID', 'Date', 'Time', 'Driver\'s Name', 'Driver\'s Phone', 'Car Reg. No.',
            'Relation to Hostel', 'Items From', 'Items To', 'Transfer Reason',
            'Items List', 'Security Name', 'File Available', 'Created At'
        ];
        
        let csvContent = columns.join(',') + '\n';
        
        // Add rows to CSV content
        results.forEach(row => {
            // Format date fields
            const date = new Date(row.date).toISOString().split('T')[0];
            const createdAt = new Date(row.created_at).toISOString().replace('T', ' ').substr(0, 19);
            
            // Clean text fields to avoid CSV issues
            const cleanField = (field) => {
                if (field === null || field === undefined) return '';
                return `"${String(field).replace(/"/g, '""')}"`;
            };
            
            // Parse and format items list
            let itemsListFormatted = '';
            try {
                const parsedItemsList = JSON.parse(row.itemsList);
                itemsListFormatted = Array.isArray(parsedItemsList) 
                    ? parsedItemsList.join(', ')
                    : '';
            } catch (error) {
                console.error('Error parsing itemsList for CSV:', error);
                itemsListFormatted = '';
            }
            
            const csvRow = [
                row.id,
                date,
                row.time,
                cleanField(row.driversName),
                cleanField(row.driversPhone),
                cleanField(row.carRegNo),
                cleanField(row.relationToHostel),
                cleanField(row.itemsFrom),
                cleanField(row.itemsTo),
                cleanField(row.transferReason),
                cleanField(itemsListFormatted),
                cleanField(row.securityName),
                row.uploadedGatepass ? 'Yes' : 'No',
                createdAt
            ];
            
            csvContent += csvRow.join(',') + '\n';
        });
        
        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=gatepasses_export_${new Date().toISOString().split('T')[0]}.csv`);
        
        // Send CSV data
        res.send(csvContent);
    });
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



// Configure storage for statement file uploads
const statementStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        // Create uploads/statements directory if it doesn't exist
        const dir = './uploads/statements';
        if (!fs.existsSync('./uploads')) {
            fs.mkdirSync('./uploads');
        }
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function(req, file, cb) {
        // Create unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'statement-' + uniqueSuffix + extension);
    }
});

// Initialize statement file upload middleware
const statementUpload = multer({ 
    storage: statementStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    },
    fileFilter: function(req, file, cb) {
        // Accept common document formats
        const allowedTypes = [
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, Word documents, JPG, and PNG are allowed.'));
        }
    }
});

// Ensure we have fs module available
const fs = require('fs');

// POST: Create a new statement
app.post('/api/statements', (req, res) => {
    const {
        firstName,
        secondName,
        phoneNumber,
        dateOfIncident,
        timeOfIncident,
        roomNumber,
        placeOfIncident,
        securityName,
        obNumber,
        incidentDescription,
        designation,
        incidentCategory
    } = req.body;
    
    const query = `
        INSERT INTO statements 
        (firstName, secondName, phoneNumber, dateOfIncident, timeOfIncident, roomNumber, 
        placeOfIncident, securityName, obNumber, incidentDescription, designation, incidentCategory)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(
        query,
        [
            firstName,
            secondName,
            phoneNumber,
            dateOfIncident,
            timeOfIncident,
            roomNumber,
            placeOfIncident,
            securityName,
            obNumber,
            incidentDescription,
            designation,
            incidentCategory
        ],
        (err, results) => {
            if (err) {
                console.error('Error creating statement record:', err);
                return res.status(500).json({ error: 'Failed to create statement record' });
            }
            
            res.status(201).json({ 
                message: 'Statement created successfully', 
                id: results.insertId 
            });
        }
    );
});

// POST: Upload statement file
app.post('/api/statements/upload', statementUpload.single('statementFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const statementId = req.body.statementId;
    if (!statementId) {
        // Remove the uploaded file if no statement ID provided
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Statement ID is required' });
    }
    
    // Update the statement record with the file information
    const filePath = `/uploads/statements/${req.file.filename}`;
    const query = `
        UPDATE statements 
        SET filePath = ?, fileName = ?
        WHERE id = ?
    `;
    
    db.query(
        query,
        [filePath, req.file.originalname, statementId],
        (err, results) => {
            if (err) {
                console.error('Error updating statement with file info:', err);
                // Remove the uploaded file if update fails
                fs.unlinkSync(req.file.path);
                return res.status(500).json({ error: 'Failed to update statement with file information' });
            }
            
            if (results.affectedRows === 0) {
                // No statement found with the provided ID
                fs.unlinkSync(req.file.path);
                return res.status(404).json({ error: 'Statement not found' });
            }
            
            res.status(200).json({ 
                message: 'File uploaded successfully',
                filePath: filePath,
                fileName: req.file.originalname
            });
        }
    );
});

// GET: Export statements to CSV
app.get('/api/statements/export', (req, res) => {
    const query = 'SELECT * FROM statements ORDER BY dateOfIncident DESC, timeOfIncident DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching statements for export:', err);
            return res.status(500).json({ error: 'Failed to export statements' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'No statements found to export' });
        }
        
        // Create CSV header based on columns
        const columns = [
            'ID', 'First Name', 'Second Name', 'Phone Number', 'Date of Incident', 
            'Time of Incident', 'Room Number', 'Place of Incident', 'Security Name', 
            'OB Number', 'Incident Description', 'Designation', 'Incident Category',
            'File Available', 'Created At'
        ];
        
        let csvContent = columns.join(',') + '\n';
        
        // Add rows to CSV content
        results.forEach(row => {
            // Format date fields
            const dateOfIncident = new Date(row.dateOfIncident).toISOString().split('T')[0];
            const createdAt = new Date(row.created_at).toISOString().replace('T', ' ').substr(0, 19);
            
            // Clean text fields to avoid CSV issues (replace commas, quotes, etc.)
            const cleanField = (field) => {
                if (field === null || field === undefined) return '';
                return `"${String(field).replace(/"/g, '""')}"`;
            };
            
            const csvRow = [
                row.id,
                cleanField(row.firstName),
                cleanField(row.secondName),
                cleanField(row.phoneNumber),
                dateOfIncident,
                row.timeOfIncident,
                cleanField(row.roomNumber),
                cleanField(row.placeOfIncident),
                cleanField(row.securityName),
                cleanField(row.obNumber),
                cleanField(row.incidentDescription),
                cleanField(row.designation),
                cleanField(row.incidentCategory),
                row.filePath ? 'Yes' : 'No',
                createdAt
            ];
            
            csvContent += csvRow.join(',') + '\n';
        });
        
        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=statements_export_${new Date().toISOString().split('T')[0]}.csv`);
        
        // Send CSV data
        res.send(csvContent);
    });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// GET: Fetch a specific statement by ID
app.get('/api/statements/:id', (req, res) => {
    const statementId = req.params.id;
    const query = 'SELECT * FROM statements WHERE id = ?';
    
    db.query(query, [statementId], (err, results) => {
        if (err) {
            console.error('Error fetching statement:', err);
            return res.status(500).json({ error: 'Failed to fetch statement' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Statement not found' });
        }
        
        res.json(results[0]);
    });
});

// PUT: Update a statement
app.put('/api/statements/:id', (req, res) => {
    const statementId = req.params.id;
    const {
        firstName,
        secondName,
        phoneNumber,
        dateOfIncident,
        timeOfIncident,
        roomNumber,
        placeOfIncident,
        securityName,
        obNumber,
        incidentDescription,
        designation,
        incidentCategory
    } = req.body;
    
    const query = `
        UPDATE statements 
        SET firstName = ?, secondName = ?, phoneNumber = ?, dateOfIncident = ?,
            timeOfIncident = ?, roomNumber = ?, placeOfIncident = ?, securityName = ?,
            obNumber = ?, incidentDescription = ?, designation = ?, incidentCategory = ?
        WHERE id = ?
    `;
    
    db.query(
        query,
        [
            firstName,
            secondName,
            phoneNumber,
            dateOfIncident,
            timeOfIncident,
            roomNumber,
            placeOfIncident,
            securityName,
            obNumber,
            incidentDescription,
            designation,
            incidentCategory,
            statementId
        ],
        (err, results) => {
            if (err) {
                console.error('Error updating statement:', err);
                return res.status(500).json({ error: 'Failed to update statement' });
            }
            
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Statement not found' });
            }
            
            res.json({ message: 'Statement updated successfully' });
        }
    );
});

// DELETE: Remove a statement
app.delete('/api/statements/:id', (req, res) => {
    const statementId = req.params.id;
    
    // First, get the statement to find any associated file
    db.query('SELECT filePath FROM statements WHERE id = ?', [statementId], (err, results) => {
        if (err) {
            console.error('Error fetching statement for deletion:', err);
            return res.status(500).json({ error: 'Failed to delete statement' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Statement not found' });
        }
        
        // If there's a file, delete it from the filesystem
        const statement = results[0];
        if (statement.filePath) {
            const filePath = path.join(__dirname, statement.filePath);
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (unlinkErr) {
                    console.error('Error deleting statement file:', unlinkErr);
                    // Continue with statement deletion even if file deletion fails
                }
            }
        }
        
        // Delete the statement record
        db.query('DELETE FROM statements WHERE id = ?', [statementId], (deleteErr, deleteResults) => {
            if (deleteErr) {
                console.error('Error deleting statement record:', deleteErr);
                return res.status(500).json({ error: 'Failed to delete statement record' });
            }
            
            res.json({ message: 'Statement deleted successfully' });
        });
    });
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
const PORT = process.env.PORT || 4053;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});