const fs = require('fs');
const path = require('path');

// Code Logging Function
function logCode() {
    const projectDir = path.join(__dirname);
    
    fs.readdir(projectDir, (err, files) => {
        if (err) throw err;

        let codeLog = '';

        files.forEach(file => {
            const filePath = path.join(projectDir, file);
            if (fs.lstatSync(filePath).isFile() && file !== 'app.js') { // Ignore the logging script itself
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                codeLog += `\n--- ${file} ---\n${fileContent}`;
            }
        });

        // Write the code to a log file with a timestamp
        const logFileName = path.join(__dirname, 'logs', `code-log-${Date.now()}.txt`);
        fs.writeFileSync(logFileName, codeLog, 'utf-8');
        console.log('Code has been logged successfully.');
    });
}

// Global Error Logging Setup
process.on('uncaughtException', (err, origin) => {
    const errorMessage = `${new Date().toISOString()} - Caught exception: ${err.message}\nStack: ${err.stack}\nOrigin: ${origin}\n\n`;
    fs.appendFileSync('error.log', errorMessage, 'utf-8');
    console.error('An error occurred. Check error.log for details.');
    process.exit(1); // Optional, exits the process on uncaught exceptions
});

process.on('unhandledRejection', (reason, promise) => {
    const errorMessage = `${new Date().toISOString()} - Unhandled Rejection at: ${promise}\nReason: ${reason}\n\n`;
    fs.appendFileSync('error.log', errorMessage, 'utf-8');
    console.error('An unhandled rejection occurred. Check error.log for details.');
});

// Function to map the folder and file structure of the project
function mapProjectStructure(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const fileStat = fs.statSync(filePath);

        if (fileStat.isDirectory()) {
            fileList = mapProjectStructure(filePath, fileList); // Recurse for directories
        } else {
            fileList.push({ file: filePath, size: fileStat.size, modified: fileStat.mtime });
        }
    });
    return fileList;
}

// Save the project structure to a JSON file
function saveProjectStructure() {
    const projectStructure = mapProjectStructure(__dirname);
    const logFileName = path.join(__dirname, 'logs', `project-structure-${Date.now()}.json`);
    
    fs.writeFileSync(logFileName, JSON.stringify(projectStructure, null, 2), 'utf-8');
    console.log('Project structure has been logged successfully.');
}

// Call the logCode and saveProjectStructure functions
logCode();
saveProjectStructure();
