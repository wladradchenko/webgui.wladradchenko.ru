const { app, screen, BrowserWindow } = require('electron');
const path = require('node:path');

function createWindow(url) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const options = {
    backgroundColor: '#0d0d0d00',
    width: width,
    height: height,
    title: 'WebGUI',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nativeWindowOpen: true,
      nodeIntegration: true,
    },
  };

  if (process.platform === "linux") {
    options.icon = path.join(`${__dirname}/256x256.png`); // 64x64.png for best look
  }

  const mainWindow = new BrowserWindow(options);

  // Hide the menu
  mainWindow.setMenu(null);

  // Load a remote URL
  mainWindow.loadURL(url);

  // Open the DevTools if needed
  // mainWindow.webContents.openDevTools();

  // Debounce the resize event
  let resizeTimeout;
  mainWindow.on('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      mainWindow.webContents.send('resize'); // Send resize event to renderer process if needed
    }, 500);
  });

  // Memory management
  setInterval(() => {
    const memoryUsage = process.getProcessMemoryInfo();
    if (memoryUsage.privateBytes > 150 * 1024 * 1024) { // Adjust the threshold as needed
      console.log('Memory usage high, triggering garbage collection');
      global.gc(); // Request garbage collection
    }
  }, 60000); // Check every minute

  return mainWindow;
}

// Set a very high memory limit
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=16384');

app.whenReady().then(() => {
  const args = process.argv.slice(2);
  let url = 'http://127.0.0.1:8000';

  args.forEach((arg) => {
    if (arg.startsWith('--app=')) {
      url = arg.split('=')[1];
    }
  });

  createWindow(url);

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(url);
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Enable garbage collection (only in --inspect mode)
if (process.argv.includes('--inspect')) {
  global.gc();
}
