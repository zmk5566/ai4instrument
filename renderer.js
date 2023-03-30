// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')


var slider = document.getElementById("slider");
var output = document.getElementById("slider_value");

var dp = new DataProcessor(5);
output.innerHTML = slider.value;

slider.oninput = function() {
output.innerHTML = this.value;
}


function display_training_selections(){
  document.getElementById("ml_refresh").style.display = "none";
  document.getElementById("training_selections").style.display = "block";
}


var port_found = false;
var port_path = "COM2";

var serialPort;

async function listSerialPorts() {
  await SerialPort.list().then((ports, err) => {
    if(err) {
      document.getElementById('error').textContent = err.message
      return
    } else {
      document.getElementById('error').textContent = ''
    }
    console.log('ports', ports);

    if (ports.length === 0) {
      document.getElementById('error').textContent = 'No ports discovered'
    }else{
      port_found = true;
    }

    var ports_paths = process_the_ports_path_into_array(ports)
    render_all_buttons(ports_paths)
  })
}

function listPorts() {
  listSerialPorts();

  //check if port is found
  if (port_found == false) {
    
    setTimeout(listPorts, 2000);
  }
}

function render_all_buttons(ports){
  // clear all the guis
  document.getElementById('ports').innerHTML = '';
  for (var i = 0; i < ports.length; i++) {
    render_serial_button(ports[i]);
  }
}


//render a button for a single port
function render_serial_button(port) {
  var inputElement = document.createElement('button');
  inputElement.setAttribute('class', 'btn btn-primary');
  inputElement.addEventListener('click', function() {
    connect_to_port(port);
  });
  inputElement.setAttribute('type', 'button');
  inputElement.setAttribute('id', port);
  inputElement.innerHTML = port;
  document.getElementById('ports').appendChild(inputElement);
  
}

function connect_to_port(port) {
  console.log('connect to port', port);
  port_path =port;

  
  	
  serialPort = new SerialPort({
    path:port_path,
    baudRate:115200
  });

  const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }))
  serialPort.on('open', update_connection_status);
  parser.on('data', retrive_array_data);


  // serialPort.on("open", function() {
  //   console.log("-- Connection opened --");
  //   serialPort.on("data", function(data) {
  //     console.log("Data received: " + data);
  //   });
  // });



}


function update_connection_status(){
  var temp_dom = document.getElementById('status_text');
  document.getElementById('serial_button').style.display = "none";
  temp_dom.removeAttribute("class",'off');
  temp_dom.setAttribute('class', 'on');
  temp_dom.innerHTML = "Connected to " + port_path;
  document.getElementById("ml_refresh").style.display = "block";
  document.getElementById("ml_data_status_text").innerHTML = "Data Available";
  document.getElementById("ml_data_status_text").removeAttribute("class",'off');
  document.getElementById("ml_data_status_text").setAttribute('class', 'on');
}


function retrive_array_data(input_data)
{
document.getElementById('data_display').innerHTML = input_data;
  // frist tableify the data
 //console.log("Data received: " + input_data);

dp.input_data(input_data.split(',').map(Number));

}

function process_the_ports_path_into_array(ports) {
  var ports_array = [];
  for (var i = 0; i < ports.length; i++) {
    ports_array.push(ports[i].path);
  }
  return ports_array;
}

// Set a timeout that will check for new serialPorts every 2 seconds.
// This timeout reschedules itself.
setTimeout(listPorts, 2000);

listSerialPorts()
