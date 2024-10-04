const fs = require('fs-extra');  // Ensure fs-extra is installed
const path = require('path');
const { exec } = require('child_process');  // For executing Git commands

// Define the path to your template and where to copy the new project
const templatePath = path.join(__dirname, 'Cody');  // Adjust the path to where your Cody template is stored

// Get the new project name from the command line arguments
const projectName = process.argv[2];

if (!projectName) {
    console.log('Please provide a project name.');
    process.exit(1);
}

const newProjectPath = path.join(__dirname, projectName);

// Check if the project already exists
if (fs.existsSync(newProjectPath)) {
    console.log('A project with this name already exists.');
    process.exit(1);
}

// Copy the Cody template folder to the new project folder
fs.copy(templatePath, newProjectPath)
    .then(() => {
        console.log(`Project ${projectName} created successfully!`);

        // Initialize Git in the new project
        exec(`cd ${newProjectPath} && git init`, (err, stdout, stderr) => {
            if (err) {
                console.error('Error initializing Git:', err);
                return;
            }
            console.log(stdout);
            console.log('Git initialized successfully in', projectName);
        });
    })
    .catch(err => {
        console.error('Error creating the project:', err);
    });
