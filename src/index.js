// const { app, BrowserWindow,nativeTheme,ipcMain, } = require('electron');
// const path = require('node:path');
// const {active,checkPrintJobs, stopCheckPrintJobs} = require('./server');
// const Store = require("electron-store");

import {app,BrowserWindow, nativeTheme , ipcMain, Tray,Menu} from 'electron'
import path from 'node:path'
import {active, checkPrintJobs, stopCheckPrintJobs} from './server.mjs'
import Store from 'electron-store';

import { fileURLToPath } from 'node:url';
import { logger } from './logger.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const electron_store = new Store();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
//   app.quit();
// }

let mainWindow ;


const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "/preload.js"), //path.join(__dirname, 'preload.js'),
      devTools: false, //remove devtools from application
    },
    show: false,
    icon:path.join(__dirname,'/static/wzt_icon.ico')
  });

  mainWindow.show();
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.

  nativeTheme.themeSource = 'light'



  let tray = null;

let createTray = ()=>{
  let appIcon = new Tray(path.join(__dirname,"/static/wzt_icon.ico"));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show' , click: ()=>{
        mainWindow.show()
      }
    },
    {
      label: 'Exit', click: ()=>{
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);






  appIcon.on('double-click', event=>{
    mainWindow.show();
  })

  appIcon.setToolTip('PSM DB Print Server');
  appIcon.setContextMenu(contextMenu);

  return appIcon;
}

mainWindow.on('minimize',(event)=>{
  event.preventDefault();
  mainWindow.hide();
  tray = createTray();
  console.log("minimize")
  logger("app minimized",'info')
});

mainWindow.on("restore",()=>{
  mainWindow.show();
  tray.destroy();
})


  return mainWindow
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  mainWindow = createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    logger("Application Started","info");
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  logger("Application Closed","info");
  if (process.platform !== 'darwin') {
    app.quit();
  }


});



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

let endpoint_mode ='dev';
endpoint_mode = electron_store.get("endpoint_mode") ?? endpoint_mode;

ipcMain.handle('get_endpoint',(event,value)=>{
  endpoint_mode = electron_store.get("endpoint_mode") ?? endpoint_mode;
  return endpoint_mode
})

ipcMain.on('set_endpoint',(event,value)=>{
  endpoint_mode = value
  logger(`Endpoint Changed from {${electron_store.get("endpoint_mode")}} to {${endpoint_mode}}`,'info')
  electron_store.set("endpoint_mode",endpoint_mode);
  
})


let server_status = false
ipcMain.handle('get_server_status',(event,value)=>{
  return server_status;
})

ipcMain.on('set_server_status',(event,value)=>{
  

  if(value){
    checkPrintJobs(endpoint_mode,mainWindow)
    server_status = true;
    logger("Server Started...." , 'info');
    if(!!mainWindow){
      mainWindow.webContents.send('server_codes',`Server Started.....`)
    }
  }else{
    stopCheckPrintJobs()
    server_status = false
    if(!!mainWindow){
      mainWindow.webContents.send('server_codes',`Server Stopped.....`)
    }

  }
})

