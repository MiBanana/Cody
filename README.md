Cody Project - README
Table of Contents:
Project Overview
Setup and Installation
Backup System
Manual Backup
Automated Backup
Using PM2 for Background Processes
Restoring from Backup
Error Handling
Contributing
Project Overview
Cody is a Node.js project that includes a backup system to ensure that all important project files are regularly saved. The backup script is designed to exclude unnecessary directories like node_modules, .git, logs, and backups.

Setup and Installation
Clone the repository:

bash
Copy code
git clone https://github.com/MiBanana/Cody.git
cd Cody
Install dependencies (if using fs-extra):

bash
Copy code
npm install fs-extra
If using only the native fs module, no additional installation is required.

Backup System
Last Backup:
Last Backup: [Placeholder] <!-- This will be automatically updated -->

Manual Backup
The backup system is designed to copy essential project files to a separate Backups directory. Excluded directories are:

node_modules
.git
logs
backups
To run the backup manually, use the following command in your Cody project directory:

bash
Copy code
node backup.js
Backups are saved in the C:\Users\goyge\Dev-Projects\Backups\Cody directory, with each backup placed in a timestamped folder.

Automated Backup with PM2
The backup system can also run automatically every 60 minutes using pm2, a process manager for Node.js.

Install pm2 globally:

bash
Copy code
npm install -g pm2
Start the backup script with pm2:

bash
Copy code
pm2 start backup.js
Check the status of running processes:

bash
Copy code
pm2 list
Stop the backup process (if needed):

bash
Copy code
pm2 stop backup.js
Force restart the backup script (if necessary):

bash
Copy code
pm2 start backup.js -f
With pm2, the backup script will continue running in the background, and backups will be created automatically every 60 minutes.

Using PM2 for Background Processes
To ensure the backup script runs in the background without blocking the terminal, pm2 is used to manage the process.

Install pm2: Install it globally as described above.
Run the backup script with pm2:
bash
Copy code
pm2 start backup.js
This keeps the script running continuously, allowing it to create backups every 60 minutes without requiring manual input.

Restoring from Backup
To restore files from a backup:

Navigate to the C:\Users\goyge\Dev-Projects\Backups\Cody directory.
Find the desired backup folder, which will have a timestamp in its name (e.g., backup-2024-10-04T22-59-09).
Copy the necessary files back into the main Cody project directory.
Error Handling
If errors occur during the backup process, they will be logged in the terminal. Some common errors include:

Permission Errors (EPERM): These usually occur when trying to copy protected directories like .git or node_modules. The backup script automatically skips these directories, so no further action is required.
File Not Found Errors (ENOENT): If files are moved or deleted during the backup process, an error may occur. This is logged for review but does not stop the backup of other files.
Contributing
To contribute to Cody, follow these steps:

Fork the repository.
Create a new branch for your changes:
bash
Copy code
git checkout -b feature-branch
Commit your changes:
bash
Copy code
git commit -m "Description of changes"
Push to your branch:
bash
Copy code
git push origin feature-branch
Submit a pull request for review.
Automated README Updates (New Feature)
The README.md file now includes an automatically updated section that logs the last backup time. After each backup, the updateReadme.js script will update the "Last Backup" field in the README.md with the most recent backup timestamp.

To run the updateReadme.js script manually:

bash
Copy code
node updateReadme.js
Alternatively, this script will automatically run at the end of each backup to update the README.md file.
