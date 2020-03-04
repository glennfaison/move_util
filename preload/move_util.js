const fs = require('fs');
const path = require('path');
const fsx = require('fs-extra');


function cleanupConfigObject(config) {
  // Just make sure the right kind of slashes were used
  config.sourceFolder = config.sourceFolder.replace(/\\+|\/+/g, '/');
  config.substring = config.substring.replace(/\\+|\/+/g, '/');
  config.destinationFolder = config.destinationFolder.replace(/\\+|\/+/g, '/');
  return config;
}

function fetchConfigFromUI(config) {
  try {
    // Just make sure the right kind of slashes were used
    config = cleanupConfigObject(config);

    console.log("Finished parsing config string");
    if (!config.sourceFolder || !config.substring || !config.destinationFolder) {
      console.error("Invalid config file");
      process.exit(1);
    }

    console.dir(config, { colors: true });
    return config;
  } catch (e) {
    console.error("Error while reading config input");
    process.exit(1);
  }
}

async function fetchSubfolders(folderName) {
  try {
    const data = fs.readdirSync(folderName);
    return data;
  } catch (e) { return []; }
}

async function moveFile(filename, sourceFolder, destinationFolder) {
  const sourcePath = path.join(sourceFolder, filename);
  const destinationPath = path.join(destinationFolder, filename);
  try {
    await fsx.copy(sourcePath, destinationPath);
    fsx.remove(sourcePath);
  } catch (error) {
    fsx.remove(destinationPath);
  }
}

async function run(config) {
  const folderExists = fs.existsSync(config.sourceFolder);
  if (!folderExists) {
    console.error("Cannot find source folder");
    process.exit(1);
  }

  const dirs = await fetchSubfolders(config.sourceFolder);
  dirs.forEach(dir => {
    if (dir.includes(config.substring)) {
      moveFile(dir, config.sourceFolder, config.destinationFolder);
    }
  });
};

module.exports = {
  run: run,
  fetchConfigFromUI: fetchConfigFromUI,
}
