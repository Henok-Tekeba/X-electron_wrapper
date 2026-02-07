const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const iconPath = path.join(__dirname, '../../build/icon.png');
  console.log('Icon path:', iconPath);
  
  const win = new BrowserWindow({
    width: 1300,
    height: 800,
    icon: iconPath,
    frame: false, 
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  win.loadURL('https://x.com');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});