const fs = require('fs-extra');
const path = require('path');

// Get the project and timestamp from command-line arguments
const projectName = process.argv[2];
const timestamp = process.argv[3];

if (!projectName || !timestamp) {
    console.log('Please provide the project name and timestamp of the backup.');
    process.exit(1);
}

// Define the backup path and project path
const backupPath = path.join('C:\\Users\\goyge\\Dev-Projects\\Backups', projectName, `backup-${timestamp}`);
const projectDir = path.join('C:\\Users\\goyge\\Dev-Projects', projectName);

// Restore the backup (copy files back to the original project directory)
fs.copy(backupPath, projectDir, { overwrite: true })
    .then(() => {
        console.log(`Backup restored successfully from ${backupPath} to ${projectDir}`);
    })
    .catch(err => {
        console.error('Error during restore:', err);
    });
