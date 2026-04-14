const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

const isDev = !app.isPackaged;
const DEV_URL = 'http://localhost:3000';
const PROD_PORT = 3000;

let mainWindow = null;
let serverProcess = null;

function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'DevFlow',
    icon: path.join(__dirname, '..', 'public', 'icons', 'icon-512x512.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  mainWindow.loadURL(url);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in the default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function buildAppMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'GitHub Repository',
          click: () => shell.openExternal('https://github.com/Tobbe96/DevFlow'),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function startNextServer() {
  return new Promise((resolve, reject) => {
    const standaloneDir = path.join(__dirname, '..', '.next', 'standalone');
    const serverPath = path.join(standaloneDir, 'server.js');

    serverProcess = spawn(process.execPath, [serverPath], {
      cwd: standaloneDir,
      env: {
        ...process.env,
        PORT: String(PROD_PORT),
        HOSTNAME: 'localhost',
      },
      stdio: 'pipe',
    });

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Ready') || output.includes('started')) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('[Next.js]', data.toString());
    });

    serverProcess.on('error', reject);

    // Fallback: resolve after 5 seconds even if we don't see "Ready"
    setTimeout(resolve, 5000);
  });
}

function waitForDevServer(url, retries = 30, interval = 1000) {
  return new Promise((resolve, reject) => {
    const http = require('http');
    let attempts = 0;

    const check = () => {
      attempts++;
      http.get(url, (res) => {
        if (res.statusCode === 200 || res.statusCode === 304) {
          resolve();
        } else if (attempts < retries) {
          setTimeout(check, interval);
        } else {
          reject(new Error(`Dev server not ready after ${retries} attempts`));
        }
      }).on('error', () => {
        if (attempts < retries) {
          setTimeout(check, interval);
        } else {
          reject(new Error(`Dev server not reachable after ${retries} attempts`));
        }
      });
    };

    check();
  });
}

app.whenReady().then(async () => {
  buildAppMenu();

  if (isDev) {
    // In dev mode, wait for the Next.js dev server (started separately)
    console.log('Waiting for Next.js dev server...');
    try {
      await waitForDevServer(DEV_URL);
    } catch {
      console.error('Next.js dev server not found. Start it with: npm run dev');
      app.quit();
      return;
    }
    createWindow(DEV_URL);
  } else {
    // In production, start the standalone Next.js server
    console.log('Starting Next.js production server...');
    await startNextServer();
    createWindow(`http://localhost:${PROD_PORT}`);
  }
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
  app.quit();
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    const url = isDev ? DEV_URL : `http://localhost:${PROD_PORT}`;
    createWindow(url);
  }
});
