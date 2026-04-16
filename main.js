const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
require('./server');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
  mainWin = win;
}

function createMinigameWindow() {
  const minigameWin = new BrowserWindow({
    width: 900,
    height: 650,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  minigameWin.loadFile('platformer.html');
}

function createMarioPlatformerWindow() {
  const marioWin = new BrowserWindow({
    width: 1200,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  marioWin.loadFile('mario-platformer.html');
}

function createQuizWindow() {
  const quizWin = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  quizWin.loadFile('quiz.html');
}

let mainWin;

app.whenReady().then(createWindow);

ipcMain.on('open-minigame', () => {
  createMinigameWindow();
});

ipcMain.on('open-mario-platformer', () => {
  createMarioPlatformerWindow();
});

ipcMain.on('open-quiz', () => {
  createQuizWindow();
});

ipcMain.on('add-points', (event, points) => {
  if (mainWin) mainWin.webContents.send('add-points', points);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
