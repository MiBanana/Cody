const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

let lastActivityTime = new Date();
let isIdle = false;
let backupInterval;
let backupInProgress = false;
const idleTimeout = 10 * 60 * 1000; // 10 minutes for idle detection
const backupIntervalMinutes = 60; // Set backup interval to 60 minutes
const lastBackupFile = path.join(__dirname, 'lastBackup.json'); // Track modified time

// Get the command-line arguments
const args = process.argv.slice(2);

// Get the name of the current project directory
const projectDir = path.join(__dirname); // Current folder
const projectName = path.basename(projectDir); // Project name

// Define the backup destination
const backupDir = path.join('C:\\Users\\goyge\\Dev-Projects\\Backups', projectName); // Backup folder

// Create the backups folder if it doesn't exist
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Read last backup timestamp
const getLastBackupTime = () => {
  if (fs.existsSync(lastBackupFile)) {
    const data = fs.readFileSync(lastBackupFile);
    const parsed = JSON.parse(data);
    return new Date(parsed.timestamp);
  }
  return new Date(0); // No backup yet
};

// Save the timestamp of the latest backup
const saveLastBackupTime = (time) => {
  const data = JSON.stringify({ timestamp: time });
  fs.writeFileSync(lastBackupFile, data);
};

// Asynchronous function to perform the incremental backup
const performBackup = async () => {
  if (backupInProgress) {
    console.log('Backup already in progress. Skipping new backup.');
    return;
  }

  backupInProgress = true;

  const startTime = new Date();
  console.log(`Starting backup at: ${startTime.toISOString()}`);

  const lastBackupTime = getLastBackupTime(); // Get last backup time
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const backupPath = path.join(backupDir, `backup-${timestamp}`);

  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }

  try {
    const files = await fs.promises.readdir(projectDir);
    for (const file of files) {
      const srcPath = path.join(projectDir, file);
      const destPath = path.join(backupPath, file);
      const stats = fs.statSync(srcPath);

      // Exclude unnecessary directories and files
      if (
        srcPath.includes('node_modules') ||
        srcPath.includes('.git') ||
        srcPath.includes('logs') ||
        srcPath.includes('backups')
      ) {
        continue;
      }

      // Check if file has been modified since the last backup
      if (stats.mtime > lastBackupTime) {
        console.log(`Copying modified file: ${srcPath}`);
        await fs.promises.copyFile(srcPath, destPath);
      }
    }

    const endTime = new Date();
    console.log(`Backup completed at: ${endTime.toISOString()}`);
    console.log(`Total time: ${(endTime - startTime) / 1000} seconds`);

    // Save the time of the latest backup
    saveLastBackupTime(startTime);

    // Run the updateReadme.js script to update the README with the last backup time
    exec('node updateReadme.js', (err, stdout, stderr) => {
      if (err) {
        console.error(`Error updating README: ${err.message}`);
        return;
      }
      console.log(`README updated: ${stdout}`);

      // Automatically commit and push changes to GitHub after backup
      exec('git add . && git commit -m "Automated incremental backup" && git push', (err2, stdout2, stderr2) => {
        if (err2) {
          console.error(`Error committing and pushing to GitHub: ${err2.message}`);
          console.error(`stderr: ${stderr2}`);
          return;
        }
        console.log(`Successfully committed and pushed changes: ${stdout2}`);
      });
    });
  } catch (err) {
    console.error('Error during backup:', err);
  } finally {
    backupInProgress = false;
  }
};

// Function to reset idle timeout on user activity
const resetIdleTimeout = () => {
  lastActivityTime = new Date();
  if (isIdle) {
    console.log('User is active again. Starting the backup timer.');
    startBackupTimer();
    isIdle = false;
  }
};

// Function to detect if the user is idle
const checkIdle = () => {
  const currentTime = new Date();
  const timeSinceLastActivity = currentTime - lastActivityTime;
  if (timeSinceLastActivity >= idleTimeout) {
    console.log('User has been idle. Stopping backups.');
    clearInterval(backupInterval);
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
      console.log('User is idle, backup skipped.');
    }
  }, backupIntervalMinutes * 60 * 1000);
};

// Monitor file changes to detect activity
fs.watch(projectDir, { recursive: true }, (eventType, filename) => {
  console.log(`Activity detected: ${eventType} on ${filename}`);
  resetIdleTimeout();
});

// Main Execution Logic
if (args.includes('--manual')) {
  performBackup()
    .then(() => {
      console.log('Manual backup complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error during manual backup:', err);
      process.exit(1);
    });
} else {
  resetIdleTimeout();
  startBackupTimer();
  setInterval(checkIdle, 60 * 1000); // Check if user is idle every minute
};
