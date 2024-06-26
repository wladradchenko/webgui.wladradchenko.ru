// Modules to control application life and create native browser window
const { app, screen, BrowserWindow } = require('electron')
const path = require('node:path')

function createWindow (url) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  // Create the browser window.
  const options = {
    backgroundColor: '#0d0d0d00',
    width: width,
    height: height,
    title: 'WebGUI',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nativeWindowOpen: true,
      nodeIntegration: true
    }
  }

  if (process.platform === "linux") {
    options.icon = path.join(`${__dirname}/64x64.png`);
  }
  
  const mainWindow = new BrowserWindow(options);

  // Hide the menu
  mainWindow.setMenu(null);

  // Load a remote URL
  mainWindow.loadURL(url)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Extract command line arguments
  const args = process.argv.slice(2);
  // Constants
  url = 'http://127.0.0.1:8000'
  // Parse args
  args.forEach((arg) => {
    if (arg.startsWith('--app=')) {
      url = arg.split('=')[1];
    }
  });

  createWindow(url)

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow(url)
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
