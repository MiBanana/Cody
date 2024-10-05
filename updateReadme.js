const fs = require('fs');
const path = require('path');

// Path to the README.md file
const readmePath = path.join(__dirname, 'README.md');

// Function to update the README with dynamic content
const updateReadme = (backupTime) => {
    const content = fs.readFileSync(readmePath, 'utf8');
    
    // Replace the placeholder for the last backup time
    const updatedContent = content.replace(/Last Backup:.*\n/, `Last Backup: ${backupTime}\n`);
    
    // Write the updated content back to README.md
    fs.writeFileSync(readmePath, updatedContent, 'utf8');
    console.log("README.md updated successfully with the last backup time.");
};

// Get the current time and update the README
const currentTime = new Date().toISOString();
updateReadme(currentTime);
