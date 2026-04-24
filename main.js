const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;

// 백엔드 서버를 앱 내에서 실행
// 실제 운영 시에는 빌드된 서버 파일이 필요합니다.
const backend = spawn('node', [path.join(__dirname, 'server/src/index.ts')]); 

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // 개발 중에는 프론트엔드 서버 주소를 로드
  mainWindow.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  backend.kill(); 
  if (process.platform !== 'darwin') app.quit();
});
