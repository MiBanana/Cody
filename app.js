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

// Error Logging Setup
process.on('uncaughtException', (err) => {
    const errorMessage = `${new Date().toISOString()} - ${err.message}\n${err.stack}\n\n`;
    fs.appendFileSync('error.log', errorMessage, 'utf-8');
    console.error('An error occurred. Check error.log for details.');
    process.exit(1);
});

// Call the logCode function when the script is run
logCode();
