let server_status ;
let current_endpoint = "dev";

let server_status_btn = document.querySelector("#server_status_btn");
let server_status_led = document.querySelector(".server_status_led")

let endpoint_status_text = document.querySelector(".endpoint_status_text")
let endpoint_status_select = document.querySelector(".endpoint_status_select")
let endpoint_status_set_btn = document.querySelector("#endpoint_status_set_btn")

let error_codes_text = document.querySelector(".error_codes_text")

server_status_btn.addEventListener("click",async ()=>{
  await change_server_status()
  await check_server_status();
})


endpoint_status_set_btn.addEventListener("click",async()=>{
  await set_server_endpoint();
  await check_server_endpoint();
})

async function check_server_endpoint(){
  current_endpoint =  await window.wztApi.getEndpoint()
  
  if(current_endpoint === "dev"){
    endpoint_status_text.innerText = `Current Endpoint : Development`
  }else if(current_endpoint === "prod"){
    endpoint_status_text.innerText = `Current Endpoint : Production`
  }
}


async function set_server_endpoint(){
  if(confirm("Are you sure to change endpoints?")){
    current_endpoint = endpoint_status_select.value;

    await window.wztApi.setEndpoint(current_endpoint)
  }
}

async function check_server_status(){
    server_status = await window.wztApi.getServerStatus()
    // console.log(server_status)

    if(server_status){
      server_status_btn.innerText = "Stop Server";
      server_status_led.classList.remove("bg-red-500");
      server_status_led.classList.add("bg-green-500")
    }else{
      server_status_btn.innerText = "Start Server";
      server_status_led.classList.remove("bg-green-500");
      server_status_led.classList.add("bg-red-500")
    }
}


async function change_server_status(){
  server_status = !server_status
  await window.wztApi.setServerStatus(server_status)
}


window.wztApi.onServerCodes((value)=>{
  error_codes_text.innerHTML = value.toString();

  console.log(value)
})

setInterval(()=>{
  check_server_endpoint();
  check_server_status();
},5000)

check_server_endpoint();
check_server_status();