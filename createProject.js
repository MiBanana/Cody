const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');
const { exec } = require('child_process');

// Define paths
const templatePath = path.join(__dirname, 'Cody');  // Your Cody template
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

// Function to prompt for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Copy the Cody template to the new project folder
fs.copy(templatePath, newProjectPath)
    .then(() => {
        console.log(`Project ${projectName} created successfully!`);

        // Prompt for GitHub repository URL
        rl.question('Enter the GitHub repository URL for this project: ', (repoUrl) => {
            if (!repoUrl) {
                console.log('No GitHub URL provided. Skipping Git setup.');
                rl.close();
                return;
            }

            // Initialize Git and add the remote repository
            exec(`cd ${newProjectPath} && git init && git remote add origin ${repoUrl}`, (err, stdout, stderr) => {
                if (err) {
                    console.error('Error initializing Git or adding remote:', err);
                    rl.close();
                    return;
                }
                console.log(stdout);
                console.log(`Git initialized and remote set to ${repoUrl} for project ${projectName}`);

                // Optionally, push the initial commit
                exec(`cd ${newProjectPath} && git add . && git commit -m "Initial commit" && git push -u origin main`, (pushErr, pushStdout, pushStderr) => {
                    if (pushErr) {
                        console.error('Error during the initial push:', pushErr);
                    } else {
                        console.log(pushStdout);
                        console.log(`Project ${projectName} pushed to ${repoUrl}`);
                    }
                    rl.close();
                });
            });
        });
    })
    .catch(err => {
        console.error('Error creating the project:', err);
        rl.close();
    });
