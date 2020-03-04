const fs = require('fs');
const path = require('path');
const fsx = require('fs-extra');
const { EventEmitter } = require('events');
class FileTransferEmitter extends EventEmitter {}

const ft = new FileTransferEmitter();


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
    ft.emit('start', `Copied ${filename} from ${sourceFolder} to ${destinationFolder}`);
  } catch (error) {
    ft.emit('error', `Error while copying ${filename} from ${sourceFolder} to ${destinationFolder}`);
    ft.emit('message', `Removing ${filename} copy from ${destinationFolder}`);
    await fsx.remove(destinationPath).catch();
    ft.emit('end', `Removed ${filename} copy from ${destinationFolder}`);
  }
  ft.emit('message', `Removing old ${filename} from ${sourceFolder}`);
  await fsx.remove(sourcePath).catch();
  ft.emit('end', `Removed old ${filename} from ${sourceFolder}`);
}

async function run(config) {
  const folderExists = fs.existsSync(config.sourceFolder);
  if (!folderExists) {
    console.error("Cannot find source folder");
    process.exit(1);
  }

  const dirs = await fetchSubfolders(config.sourceFolder);

  const dirsToMove = dirs.filter(dir => dir.includes(config.substring));
  const promises = dirsToMove.map(dir => moveFile(dir, config.sourceFolder, config.destinationFolder));
  // Emit event for start of transfer
  ft.emit('message', 'Transfers started...');
  Promise.all(promises).then(() => {
    ft.emit('message', `Finished moving files`);
  }).catch(e => {
    ft.emit('error', 'Some errors were encountered:');
    ft.emit('error', e);
  })
};

module.exports = {
  run: run,
  fetchConfigFromUI: fetchConfigFromUI,
  ft: ft,
}
