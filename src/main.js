const { app, BrowserWindow, ipcMain } = require("electron");
const os = require("os");
const fs = require("fs");
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile);
const path = require("node:path");
const pcsclite = require("pcsclite");
const { spawn } = require("child_process");
const net = require("net");
const moment = require("moment");
const lrc = require("lrc-calculator");
const now = moment();

// Get the parent directory of __dirname
// Set user data directory to the parent directory
app.isPackaged
  ? app.setPath("userData", path.resolve(__dirname, "..", "..", ".."))
  : app.setPath("userData", path.resolve(__dirname));

// Define the paths
const configFolder = path.join(app.getPath("userData"), "config");
const configFile = path.join(configFolder, "my-config.json");

const connectedSockets = [];
let tcpConnection, sysConfig, defaultConfig, resultFilePath;

const findConfig = async () => {
  const interfaces = os.networkInterfaces();
  let ipAddress = "";

  // Loop through network interfaces
  Object.keys(interfaces).forEach((interfaceName) => {
    interfaces[interfaceName].forEach((iface) => {
      // Skip over internal and non-IPv4 addresses
      if (iface.internal || iface.family !== "IPv4") {
        return;
      }
      ipAddress = iface.address;
    });
  });

  try {
    const stat = await fs.promises.stat(configFile);

    // If the file exists, load its content
    if (stat.isFile()) {
      const data = await fs.promises.readFile(configFile, "utf8");
      if (!data) {
        throw new Error("Empty data received from file: " + configFile);
      }
      const jsonData = JSON.parse(data);
      jsonData.ip_address = ipAddress;
      defaultConfig = jsonData;
      resultFilePath = path.join(
        defaultConfig.mykad_working_dir,
        defaultConfig.mykad_result_file
      );
      return jsonData;
    }
  } catch (err) {
    // If the file doesn't exist, create it
    if (err.code === "ENOENT") {
      console.log("Create config file...");

      const defaultConfig = {
        pms_url: "https://phklmt-pms.tegapp.com",
        link: "node",
        key: "551A7227F4A14F1BBA6DD9ACB46EF4E0",
        ipAddress: "127.0.0.1",
        port: 2887,
        issuerid: 1,
        wsid: 1,
        card_cnt: 1,
        ckout_time: "12:00",
        mykad_working_dir: "C:\\MyKad Wedge",
        mykad_exe: "Reading.exe",
        mykad_result_file: "mykadresult.txt",
        input_phone: 0,
        input_email: 0,
      };

      try {
        await fs.promises.mkdir(configFolder, { recursive: true });
        console.log("Created directory, cont...");
        await fs.promises.writeFile(
          configFile,
          JSON.stringify(defaultConfig, null, 2)
        );
        console.log("Created files, ok.");

        defaultConfig.ip_address = ipAddress;

        resultFilePath = path.join(
          defaultConfig.mykad_working_dir,
          defaultConfig.mykad_result_file
        );

        return defaultConfig;
      } catch (writeErr) {
        console.error("Error writing file:", writeErr);
        throw writeErr;
      }
    } else {
      console.error("Error accessing file:", err);
      throw err;
    }
  }
};

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    kiosk: true,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  sysConfig = await findConfig();

  tcpConnection = net.createServer((socket) => {
    // Add the new socket to the array
    connectedSockets.push(socket);

    let writeCard = {
      cmd: [],
      msg: null,
    };

    ipcMain.on("issue-card", async (event, d) => {
      writeCard.cmd = [];

      // NOTES: Follow SDK seq..
      // NOTES: When CS run, found parameter incorrect with SDK doc..
      // Follow this: CR;RIIC;FLI#IDCTRNWSDADTR#ADDDGGTI;

      writeCard.cmd.push("IC");
      writeCard.cmd.push(";I#" + sysConfig.card_cnt);
      writeCard.cmd.push(";ID" + sysConfig.issuerid);
      writeCard.cmd.push(";CTN");
      writeCard.cmd.push(";RN" + d.room);
      writeCard.cmd.push(";WS" + sysConfig.wsid);

      // static value (refers to page 14 in the sdk).
      writeCard.cmd.push(";$21000278100011122");

      writeCard.cmd.push(";DA" + now.format("YYMMDD"));
      writeCard.cmd.push(";DT" + sysConfig.ckout_time);

      writeCard.cmd.push(";GN" + d.resv.cust_name);
      writeCard.cmd.push(";R#" + d.resv.resv_no.split("-")[1]);
      writeCard.cmd.push(";AD" + moment(d.resv.check_in_dt).format("YYMMDD"));
      writeCard.cmd.push(";DD" + moment(d.resv.check_out_dt).format("YYMMDD"));
      writeCard.cmd.push(";GG");

      // writeCard.cmd.push(';A1');
      writeCard.cmd.push(";TI" + now.add(1, "second").format("HHmmss"));
      writeCard.cmd.push(";");

      const writeCardString = Buffer.from(
        lrc.asStxEtx(writeCard.cmd.join(""))
      ).toString();

      try {
        socket.write(writeCardString);

        // Attach the single listener
        socket.on("data", (data) => {
          const message = data.toString().trim();
          console.log(message);

          if (message.includes("ASOK")) {
            event.sender.send("issue-card-result", { msg: "ok", room: d.room });
          } else if (message.includes("ASRY")) {
            event.sender.send("issue-card-result", { msg: "retry" });
          } else {
            event.sender.send("issue-card-result", { msg: "unknown", message });
          }

        });
      } catch (error) {
        event.sender.send("issue-card-result", {
          msg: "error",
          error: error.message,
        });
      }
    });

    // Handle client disconnection
    socket.on("end", () => {
      console.log("Client disconnected");

      // Remove the disconnected socket from the array
      connectedSockets.splice(connectedSockets.indexOf(socket), 1);
    });
  });

  // Listen for errors
  tcpConnection.on("error", (err) => {
    console.error("TCP server error:", err);
  });

  // Start listening on port 2887
  tcpConnection.listen(sysConfig.port, sysConfig.ipAddress, () => {
    console.log(`TCP server is listening on port ${sysConfig.port}`);
  });

  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on("read-mykad", async (event) => {
  let cardInserted = false;
  const pcsc = pcsclite();

  pcsc.on("reader", (reader) => {
    if (!reader.name) {
      reader.close();
      reader.on("end", () => {});
    }

    reader.on("status", async (status) => {
      const readerStatus = !!(status.state & reader.SCARD_STATE_PRESENT);

      try {
        if (readerStatus !== cardInserted && !cardInserted) {
          cardInserted = true;

          if (status.atr == 0) {
            cardInserted = false;
            event.sender.send("mykad-content", {
              msg: "Failed to generate records",
              data: null,
            });
          }

          const childProcess = spawn(sysConfig.mykad_exe, ["-read"], {
            cwd: sysConfig.mykad_working_dir,
            stdio: "inherit",
            shell: false,
          });

          await new Promise((resolve, reject) => {
            fs.watch(resultFilePath, (curr, prev) => {
              if (curr.mtime > prev.mtime) {
                resolve();
              }
            });

            // Handle process exit
            childProcess.on("exit", (code) => {
              if (code === 0) {
                // Process exited successfully
                resolve();
              } else {
                // Process exited with an error
                reject();
              }
            });
          });

          // Now the file exists, read its content
          const mykadContent = await readFileAsync(resultFilePath, "utf-8");
          const jsonMykadContent = JSON.parse(mykadContent);
          event.sender.send("mykad-content", {
            msg: "ok",
            data: jsonMykadContent,
          });
        }
      } catch (error) {
        event.sender.send("mykad-content", { msg: error });
      }
    });
  });

  pcsc.on("error", function (err) {});
});

ipcMain.on("add-guest-mykad", async (event) => {
  let cardInserted = false;
  const pcsc = pcsclite();

  pcsc.on("reader", (reader) => {
    if (!reader.name) {
      reader.close();
      reader.on("end", () => {});
    }

    reader.on("status", async (status) => {
      const readerStatus = !!(status.state & reader.SCARD_STATE_PRESENT);

      try {
        if (readerStatus !== cardInserted && !cardInserted) {
          cardInserted = true;

          if (status.atr == 0) {
            cardInserted = false;
            event.sender.send("another-mykad-content", {
              msg: "Failed to generate records",
              data: null,
            });
          }

          const childProcess = spawn(sysConfig.mykad_exe, ["-read"], {
            cwd: sysConfig.mykad_working_dir,
            stdio: "inherit",
            shell: false,
          });

          await new Promise((resolve, reject) => {
            fs.watch(resultFilePath, (curr, prev) => {
              if (curr.mtime > prev.mtime) {
                resolve();
              }
            });

            // Handle process exit
            childProcess.on("exit", (code) => {
              if (code === 0) {
                // Process exited successfully
                resolve();
              } else {
                // Process exited with an error
                reject();
              }
            });
          });

          // Now the file exists, read its content
          const mykadContent = await readFileAsync(resultFilePath, "utf-8");
          const jsonMykadContent = JSON.parse(mykadContent);
          event.sender.send("another-mykad-content", {
            msg: "ok",
            data: jsonMykadContent,
          });
        }
      } catch (error) {
        event.sender.send("another-mykad-content", { error: error });
      }
    });
  });

  pcsc.on("error", function (err) {});
});

ipcMain.on("find-config", async (event) => {
  try {
    // Call findConfig and handle the returned promise

    event.sender.send("result", { msg: "ok", data: sysConfig });
  } catch (error) {
    console.error("Error in findConfig:", error);
    event.sender.send("result", { msg: "error", error: error.message });
  }
});
