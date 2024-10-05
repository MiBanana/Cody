const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

let lastActivityTime = new Date();
let isIdle = false;
let backupInterval;
const idleTimeout = 10 * 60 * 1000; // 10 minutes for idle detection
const backupIntervalMinutes = 60; // Set backup interval to 60 minutes

// Get the name of the current project directory
const projectDir = path.join(__dirname);  // Current folder
const projectName = path.basename(projectDir);  // Project name

// Define the backup destination
const backupDir = path.join('C:\\Users\\goyge\\Dev-Projects\\Backups', projectName);  // Backup folder

// Create the backups folder if it doesn't exist
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// Asynchronous function to perform the backup
const performBackup = async () => {
    const startTime = new Date();
    console.log(`Starting backup at: ${startTime.toISOString()}`);

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}`);

    // Ensure the backupPath folder is created before copying files
    if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
    }

    try {
        const files = await fs.promises.readdir(projectDir); // Asynchronous file reading
        for (const file of files) {
            const srcPath = path.join(projectDir, file);
            const destPath = path.join(backupPath, file);

            // Exclude unnecessary directories
            if (srcPath.includes('node_modules') || srcPath.includes('.git') || srcPath.includes('logs') || srcPath.includes('backups')) {
                continue;  // Skip these directories
            }

            console.log(`Copying: ${srcPath}`);

            // Asynchronous file copying
            await fs.promises.copyFile(srcPath, destPath);
        }

        const endTime = new Date();
        console.log(`Backup completed at: ${endTime.toISOString()}`);
        console.log(`Total time: ${(endTime - startTime) / 1000} seconds`);

        // Run the updateReadme.js script to update the README with the last backup time
        exec('node updateReadme.js', (err, stdout, stderr) => {
            if (err) {
                console.error(`Error updating README: ${err.message}`);
                return;
            }
            console.log(`README updated: ${stdout}`);
        });
    } catch (err) {
        console.error('Error during backup:', err);
    }
};

// Function to reset idle timeout on user activity
const resetIdleTimeout = () => {
    lastActivityTime = new Date();
    if (isIdle) {
        console.log("User is active again. Starting the backup timer.");
        startBackupTimer(); // Restart the backup timer
        isIdle = false;
    }
};

// Function to detect if the user is idle
const checkIdle = () => {
    const currentTime = new Date();
    const timeSinceLastActivity = currentTime - lastActivityTime;
    if (timeSinceLastActivity >= idleTimeout) {
        console.log("User has been idle. Stopping backups.");
        clearInterval(backupInterval); // Stop backup timer when idle
        isIdle = true;
    }
};

// Function to start the backup timer
const startBackupTimer = () => {
    backupInterval = setInterval(() => {
        const currentTime = new Date();
        const timeSinceLastActivity = currentTime - lastActivityTime;
        if (timeSinceLastActivity < idleTimeout) {
            performBackup();
        } else {
            console.log("User is idle, backup skipped.");
        }
    }, backupIntervalMinutes * 60 * 1000); // Set backup interval
};

// Monitor file changes to detect activity
fs.watch(projectDir, { recursive: true }, (eventType, filename) => {
    console.log(`Activity detected: ${eventType} on ${filename}`);
    resetIdleTimeout(); // Reset the idle timer on user activity
});

// Start the backup timer when the project is first used
resetIdleTimeout(); // Start with initial activity
startBackupTimer(); // Start the backup process

// Check for idle state every minute
setInterval(checkIdle, 60 * 1000); // Check if user is idle every minute
