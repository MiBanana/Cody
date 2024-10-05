const fs = require('fs-extra');
const path = require('path');
const exec = require('child_process').execSync;

const projectDir = path.join(__dirname, 'Cody');
const backupDir = path.join('C:\\Users\\goyge\\Dev-Projects\\Backups', 'Cody');

// Helper function to execute the backup or restore command
const runCommand = (command) => {
    try {
        exec(command);
    } catch (err) {
        throw new Error(`Command failed: ${command}`);
    }
};

describe('Backup and Restore Automation', () => {
    // Before each test, make sure we have a clean backup directory
    beforeAll(() => {
        if (fs.existsSync(backupDir)) {
            fs.removeSync(backupDir); // Clear existing backups
        }
    });

    test('Should create a backup successfully', () => {
        // Simulate a backup
        runCommand('node backup.js');
        
        // Check if the backup folder was created
        const backups = fs.readdirSync(backupDir);
        expect(backups.length).toBeGreaterThan(0);
    });

    test('Should restore a backup successfully', () => {
        // Introduce a simulated break in the project
        const testFile = path.join(projectDir, 'testFile.txt');
        fs.writeFileSync(testFile, 'This is a broken project state');

        // Perform a restore (using a known timestamp)
        const backups = fs.readdirSync(backupDir);
        const lastBackup = backups[backups.length - 1];  // Use the last backup
        runCommand(`node restore.js Cody ${lastBackup}`);

        // Check if the project has been restored (testFile should no longer exist)
        expect(fs.existsSync(testFile)).toBe(false);
    });
});
