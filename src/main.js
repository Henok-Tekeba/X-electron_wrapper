const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const iconPath = path.join(__dirname, '../../build/icon.png');
  console.log('Icon path:', iconPath);
  
  const win = new BrowserWindow({
    width: 1300,
    height: 800,
    icon: iconPath,
    title: 'X',
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      partition: 'persist:x-session', // This saves cookies/login
    }
  });

  win.loadURL('https://x.com');
  
  win.setMenuBarVisibility(false);
  
  win.on('page-title-updated', (event) => {
    event.preventDefault();
  });

// I Added this keyboard shortcuts
  win.webContents.on('before-input-event', (event, input) => {
    // Ctrl+R to refresh
    if (input.control && input.key.toLowerCase() === 'r') {
      win.webContents.reload();
      event.preventDefault();
    }
    
    // Ctrl+N for new tweet
    if (input.control && input.key.toLowerCase() === 'n') {
      win.webContents.executeJavaScript(`
        const newTweetButton = document.querySelector('[data-testid="SideNav_NewTweet_Button"]');
        if (newTweetButton) newTweetButton.click();
      `);
      event.preventDefault();
    }
  });
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