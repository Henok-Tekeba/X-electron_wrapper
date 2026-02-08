const { app, BrowserWindow, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

let mainWindow = null;
let isQuitting = false;

// Download settings
const downloadPath = path.join(os.homedir(), 'Downloads', 'X-Downloads');

// Create download directory if it doesn't exist
if (!fs.existsSync(downloadPath)) {
  fs.mkdirSync(downloadPath, { recursive: true });
  console.log('Created download directory:', downloadPath);
}

function createWindow() {
  const iconPath = path.join(__dirname, '../../build/icon.png');

  mainWindow = new BrowserWindow({
    width: 1300,
    height: 800,
    icon: iconPath,
    title: 'X',
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      partition: 'persist:x-session',
    }
  });

  mainWindow.loadURL('https://x.com');
  mainWindow.loadURL('https://x.com');

// Enable right-click context menu
mainWindow.webContents.on('context-menu', (event, params) => {
  const { Menu, MenuItem } = require('electron');
  const menu = new Menu();

  // Add "Save Image" if it's an image
  if (params.mediaType === 'image') {
    menu.append(new MenuItem({
      label: 'Save Image',
      click: () => {
        mainWindow.webContents.downloadURL(params.srcURL);
      }
    }));
  }

  // Add "Save Video" if it's a video
  if (params.mediaType === 'video') {
    menu.append(new MenuItem({
      label: 'Save Video',
      click: () => {
        mainWindow.webContents.downloadURL(params.srcURL);
      }
    }));
  }

  // Add "Copy Link" for links
  if (params.linkURL) {
    menu.append(new MenuItem({
      label: 'Copy Link',
      click: () => {
        require('electron').clipboard.writeText(params.linkURL);
      }
    }));
  }

  // Add "Inspect Element" for debugging
  menu.append(new MenuItem({
    label: 'Inspect Element',
    click: () => {
      mainWindow.webContents.inspectElement(params.x, params.y);
    }
  }));

  menu.popup();
});

mainWindow.setMenuBarVisibility(false);
  mainWindow.setMenuBarVisibility(false);

  // Download handler
  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    const fileName = item.getFilename();
    const savePath = path.join(downloadPath, fileName);
    
    item.setSavePath(savePath);
    
    console.log('Download started:', fileName);
    
    item.on('updated', (event, state) => {
      if (state === 'progressing') {
        const progress = item.getReceivedBytes() / item.getTotalBytes() * 100;
        console.log(`Download progress: ${progress.toFixed(1)}%`);
      }
    });
    
    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log('Download completed:', savePath);
        
        // Show notification
        const notification = {
          title: 'Download Complete',
          body: `${fileName} saved to X-Downloads`
        };
        
        new (require('electron').Notification)(notification).show();
      } else {
        console.log('Download failed:', state);
      }
    });
  });

  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault();
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.key.toLowerCase() === 'r') {
      mainWindow.webContents.reload();
      event.preventDefault();
    }

    if (input.control && input.key.toLowerCase() === 'n') {
      mainWindow.webContents.executeJavaScript(`
        const btn = document.querySelector('[data-testid="SideNav_NewTweet_Button"]');
        if (btn) btn.click();
      `);
      event.preventDefault();
    }

    if (input.key.toLowerCase() === 'escape') {
      mainWindow.close();
      event.preventDefault();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});