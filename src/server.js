
let {createPool} = require('mysql2/promise')
// import {createPool} from 'mysql2/promise'
// import {logger} from './logger.js'
const {logger} = require("./logger")

const fetch = require('node-fetch')

let connectionConfig = {
  host: '172.16.59.105',
  user: 'root',
  password: 'rteptgg6thapril',
}

// export let active = false
let active = false
let clearPrintJob ;


const pool = createPool(connectionConfig);

// export const checkPrintJobs = async (endpoint_mode,mainWindow)=>{
const checkPrintJobs = async (endpoint_mode,mainWindow)=>{
  let connection;



  mainWindow ??= false
  active = true
  if(active){
    try{
      connection = await pool.getConnection();
  
      const [results] = await connection.query(
        "select rid, job_data , status, datetime,response from ptgg_pm.print_job where status = -1 order by datetime desc"
      )
  
      console.log("Print Pending : ");
      console.log(results);

      if(results.length > 0){
        logger(`Print Pending : ${!!results?JSON.stringify(results):""}`,'info');
      }
  
      if(!!mainWindow){
        mainWindow.webContents.send('server_codes',`Print Pending : \n ${JSON.stringify(results)}`)
      }
      
      for(const print_el of results){
        let print_data = JSON.parse(print_el.job_data);
    
        // console.log(print_data)
      
        
        // let print_body = {
        //   product: String(print_data.body.product),
        //   spec: String(print_data.body.spec),
        //   dimension: String(print_data.body.dimension),
        //   heat: String(print_data.body.heat),
        //   batch: String(print_data.body.batch),
        //   qty: String(print_data.body.qty),
        //   weight: String(print_data.body.weight),
        // };

        //now can add any number of props
        let print_body = {}
        for(let prop in print_data.body){
          print_body[prop] = String(print_data.body[prop]);
        }

        console.log(print_body)
      
        let end_points = {
          type: String(print_data.end_point.type),
          printerIP: String(print_data.end_point.printerIP),
        };
        
        let post_req = {
          method: 'POST',
          headers : {
          "Authorization" : "Bearer PSM|$2a$10$m.0FP7zyPHiQXMeIMPjK6.1ks/m0BQvMCDEkqmr0zTFA7BRwImmGG",
          },
          body: JSON.stringify(print_body),
        };
        

        let post_url;
        if(endpoint_mode == "dev"){
          post_url = `http://dev-printer.gunungsteel.com/api/printing/zpl/${end_points.type}/${end_points.printerIP}`;
          //let post_url = `http://172.16.20.245/api/printing/zpl/${end_points.type}/${end_points.printerIP}`;
        }else if(endpoint_mode == "prod"){
          post_url = `http://printer.gunungsteel.com/api/printing/zpl/${end_points.type}/${end_points.printerIP}`;
        }
         
        
        try{
  
  
          let response = await fetch(post_url,post_req);
      
          response = await response.json();
      
      
      
          let print_status = response?.status == 200 ? 1 : 0;
       
          let print_response = JSON.stringify(response);
      
          await connection.execute(`UPDATE ptgg_pm.print_job SET status = ${print_status}, response = '${print_response}' WHERE rid = ${print_el.rid}`)
  
          
          console.log(print_status ? "Print Success" : "Print Failed");
          console.log(response)

          if(!!mainWindow){
            mainWindow.webContents.send('server_codes',`${print_status ? "Print Success" : "Print Failed"} : \n ${JSON.stringify(response)}`)
          }
          logger(`${print_status ? "Print Success" : "Print Failed"} : \n ${JSON.stringify(response)}`,'info')
        }catch(err){
  
          await connection.execute(`UPDATE ptgg_pm.print_job SET status = 0, response = 'printer api connection error' WHERE rid = ${print_el.rid}`)
  
          console.log("print failed due to print Api connection Error");
          console.error(err);
          logger(`print failed due to print Api connection Error : \n stack : ${err.stack.toString()} \n post_url: ${post_url} \n post_req: ${JSON.stringify(post_req)}`,'error')

          if(!!mainWindow){
            // mainWindow.webContents.send('server_codes',`print failed due to print Api connection Error : \n ${String(err)}`)
            mainWindow.webContents.send('server_codes',`print failed due to print Api connection Error`)
          }

  
        }
      }
  
  
  
    }catch(error){
      console.error("Error during print job check: ", error);
      if(!!mainWindow){
        mainWindow.webContents.send('server_codes',`Error during print job check : \n ${String(error)}`)
      }
      logger(`Error during print job check : ${error.stack.toString()}`,'error')

    }finally{
      if(connection){
        connection.release();
      }
      
      clearPrintJob = setTimeout(()=>{checkPrintJobs(endpoint_mode,mainWindow)},10000);
  
    }


  }
  
}

// checkPrintJobs(active);
// export const stopCheckPrintJobs = () => {
 const stopCheckPrintJobs = () => {
  active = false;
  clearTimeout(clearPrintJob);
  logger(`Server Stopped....`,'info')
};

module.exports = {
  stopCheckPrintJobs,
  active,
  checkPrintJobs
}

