const fs = require('fs');
const os = require('os');
const path = require('path');

function createProjectFolder(folderName: string) {
  // Path to the new folder
  // const folderPath = path.join(__dirname, folderName);
  const folderPath = path.resolve(folderName);

  // Create the folder
  try {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`Project Folder '${folderName}' created successfully...`);
  } catch (err) {
    console.error('Error: Failed to create the folder:', err);
  }
    
    // Content for Main.simas
    const simasContent = `@ To learn more, visit https://github.com/turrnut/simas ;\n\nPRINTC Hello World!;\n`;
    
    // Write the Main.simas file
      try {
        fs.writeFileSync(path.join(folderPath, 'Main.simas'), simasContent);
        console.log('Main.simas created successfully...');
      } catch (err) {
          console.error('Error: Failed to create Main.simas:', err);
      }

    // Data for config.json
    const configData = {
      name: folderName,
      author: os.userInfo().username,
      version: "1.0.0",
      description: ""
    };
    
    try {
        fs.writeFileSync(path.join(folderPath, 'simasconfig.json'), JSON.stringify(configData, null, 2));
        console.log('simasconfig.json created successfully...');
    } catch (err) {
        console.error('Error: Failed to create simasconfig.json:', err);
    }

    console.log();
    console.log(`Your project ${folderName} has been created successfully!`);
}

module.exports = {createProjectFolder};
