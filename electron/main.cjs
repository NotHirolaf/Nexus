const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        title: "Nexus Student Dashboard"
    });

    const isDev = !app.isPackaged;

    if (isDev) {
        // In dev mode, connect to the Vite server
        win.loadURL('http://localhost:5173');
        // win.webContents.openDevTools();
    } else {
        // In production, load the built HTML
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
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
