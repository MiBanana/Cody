const { exec } = require('child_process');

// Define commit message (you can change the message or pass it dynamically)
const commitMessage = process.argv[2] || 'Auto-commit';

// Automate git add, commit, and push
exec('git add . && git commit -m "' + commitMessage + '" && git push', (err, stdout, stderr) => {
    if (err) {
        console.error('Error committing changes:', err);
        return;
    }
    console.log(stdout);
    console.log('Changes have been committed and pushed automatically.');
});
