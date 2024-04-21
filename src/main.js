const { app, BrowserWindow, ipcMain } = require('electron');
const os = require('os');
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const path = require('node:path');
const pcsclite = require('pcsclite');
const { spawn } = require('child_process');

// Get the parent directory of __dirname
// Set user data directory to the parent directory
app.isPackaged
    ? app.setPath('userData', path.resolve(__dirname, '..', '..', '..'))
    : app.setPath('userData', path.resolve(__dirname));

// Define the paths
const configFolder = path.join(app.getPath('userData'), 'config');
const configFile = path.join(configFolder, 'my-config.json');

// Define the default configuration object
const config = {
    "pms_url": "http://localhost",
    "link": "node",
    "key": "your-valid-api-key"
};

// Convert the configuration object to JSON
const configJSON = JSON.stringify(config, null, 2);

// Function to check if a directory exists
const directoryExists = async (directoryPath) => {
    try {
        await fs.access(directoryPath, fs.constants.F_OK); // Check if the directory exists
        return true; // Directory exists
    } catch (err) {
        return false; // Directory doesn't exist
    }
};

const setupInfo = {
    _working_dir: "C:\\MyKad Wedge",
    _execFilename: "Reading.exe",
    _arguments: ['-read'],
    _result_file: "mykadresult.txt",
}

const result_file_f_path = path.join(setupInfo._working_dir, setupInfo._result_file);

const findConfig = async () => {
    const interfaces = os.networkInterfaces();
    let ipAddress = '';

    // Loop through network interfaces
    Object.keys(interfaces).forEach((interfaceName) => {
        interfaces[interfaceName].forEach((iface) => {
            // Skip over internal and non-IPv4 addresses
            if (iface.internal || iface.family !== 'IPv4') {
                return;
            }
            ipAddress = iface.address;
        });
    });

    // console.log('Start read and reverse file contents.. ');
    // console.log(configFile);

    // Load my-config.json file
    return new Promise((resolve, reject) => {
        fs.readFile(configFile, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                reject(err);
                return;
            }

            // Check if data is not empty
            if (!data) {
                console.error('Empty data received from file:', configFile);
                reject(new Error('Empty data received from file'));
                return;
            }

            try {
                const jsonData = JSON.parse(data);
                jsonData.ipAddress = ipAddress;
                resolve(jsonData);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                reject(parseError);
            }
        });
    });
};

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = () => {

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

    createWindow();

    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on('read-mykad', async (event) => {
    let cardInserted = false;
    const pcsc = pcsclite();

    pcsc.on('reader', (reader) => {

        if (!reader.name) {
            reader.close();
            reader.on('end', () => { });
        }

        reader.on('status', async (status) => {
            const readerStatus = !!(status.state & reader.SCARD_STATE_PRESENT);

            try {
                if (readerStatus !== cardInserted && !cardInserted) {
                    cardInserted = true;

                    if (status.atr == 0) {
                        cardInserted = false;
                        event.sender.send('mykad-content', { msg: 'Failed to generate records', data: null });
                    }

                    const childProcess = spawn(setupInfo._execFilename, setupInfo._arguments, {
                        cwd: setupInfo._working_dir,
                        stdio: 'inherit',
                        shell: false,
                    });

                    await new Promise((resolve, reject) => {
                        fs.watch(result_file_f_path, (curr, prev) => {
                            if (curr.mtime > prev.mtime) {
                                resolve();
                            }
                        });

                        // Handle process exit
                        childProcess.on('exit', (code) => {
                            if (code === 0) {
                                // Process exited successfully
                                resolve();
                            } else {
                                // Process exited with an error
                                reject();
                            };
                        });
                    });

                    // Now the file exists, read its content
                    const mykadContent = await readFileAsync(result_file_f_path, 'utf-8');
                    const jsonMykadContent = JSON.parse(mykadContent);
                    event.sender.send('mykad-content', { msg: 'ok', data: jsonMykadContent });
                }
            } catch (error) {
                event.sender.send('mykad-content', { msg: error });
            }
        });
    });

    pcsc.on('error', function (err) {
    });
});

ipcMain.on('add-guest-mykad', async (event) => {
    let cardInserted = false;
    const pcsc = pcsclite();

    pcsc.on('reader', (reader) => {

        if (!reader.name) {
            reader.close();
            reader.on('end', () => { });
        }

        reader.on('status', async (status) => {
            const readerStatus = !!(status.state & reader.SCARD_STATE_PRESENT);

            try {
                if (readerStatus !== cardInserted && !cardInserted) {
                    cardInserted = true;

                    if (status.atr == 0) {
                        cardInserted = false;
                        event.sender.send('another-mykad-content', { msg: 'Failed to generate records', data: null });
                    }

                    const childProcess = spawn(setupInfo._execFilename, setupInfo._arguments, {
                        cwd: setupInfo._working_dir,
                        stdio: 'inherit',
                        shell: true,
                    });

                    await new Promise((resolve, reject) => {
                        fs.watch(result_file_f_path, (curr, prev) => {
                            if (curr.mtime > prev.mtime) {
                                resolve();
                            }
                        });

                        // Handle process exit
                        childProcess.on('exit', (code) => {
                            if (code === 0) {
                                // Process exited successfully
                                resolve();
                            } else {
                                // Process exited with an error
                                reject();
                            };
                        });
                    });

                    // Now the file exists, read its content
                    const mykadContent = await readFileAsync(result_file_f_path, 'utf-8');
                    const jsonMykadContent = JSON.parse(mykadContent);
                    event.sender.send('another-mykad-content', { msg: 'ok', data: jsonMykadContent });
                }
            } catch (error) {
                event.sender.send('another-mykad-content', { error: error });
            }
        });
    });

    pcsc.on('error', function (err) {
    });
});

ipcMain.on('find-config', async (event) => {
    try {
        // Call findConfig and handle the returned promise
        const jsonData = await findConfig();
        // console.log('Config data:', jsonData);
        
        event.sender.send('result', { msg: 'ok', data: jsonData });
    } catch (error) {
        console.error('Error in findConfig:', error);
        event.sender.send('result', { msg: 'error', error: error.message });
    }
});