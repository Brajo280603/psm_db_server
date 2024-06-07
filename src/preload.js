// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const {contextBridge, ipcRenderer} = require("electron")

contextBridge.exposeInMainWorld('wztApi',{
  getEndpoint: ()=>ipcRenderer.invoke('get_endpoint'),
  setEndpoint: (endpoint)=>ipcRenderer.send('set_endpoint',endpoint),
  getServerStatus: ()=>ipcRenderer.invoke('get_server_status'),
  setServerStatus: (status)=>ipcRenderer.send('set_server_status',status),
  onServerCodes: (callback)=> ipcRenderer.on('server_codes', (_event,value)=>callback(value)),
})