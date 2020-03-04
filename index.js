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

function printHelp() {
  const message = `
  MOVE_UTIL(1)                     Help Manual                    MOVE_UTIL(1)


  NAME
       move_util -- move files from a source to a destination if they contain a specified substring
  
  SYNOPSIS
       move_util sourceFolder=<source path> destinationFolder=<destination path> substring=<substring>
  
  DESCRIPTION
       The three arguments to move_util are mandatory.
  
       The values for each argument MAY or MAY NOT be enclosed in quotes.
  
       The following options are available:
  
       sourceFolder         The full path to the source folder.
  
       destinationFolder    The full path to the destination folder.
  
       substring            The substring this move_util should search for in file paths.
  `;
  console.log();
  console.log(message);
  console.log();
}

function fetchConfig(...args) {
  if (args.length === 0) {
    printHelp();
    process.exit(0);
  }
  try {
    const entries = args.map(i => i.split('='));
    let config = {};
    entries.forEach(pair => config[pair[0]] = pair[1]);
    
    // Just make sure the right kind of slashes were used
    config = cleanupConfigObject(config);

    console.log("Finished parsing config string");
    if (!config.sourceFolder || !config.substring || !config.destinationFolder) {
      console.error("Invalid config input");
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

(async function main() {
  const config = fetchConfig(...process.argv.slice(2));

  run(config);
})();