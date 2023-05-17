// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { SerialPort } = require('serialport')
//const { ReadlineParser } = require('@serialport/parser-readline')
const OSC = require('osc-js')


const { Server,Client} = require('node-osc');

var input_variables = [0,0,0];

var predict_variables = [0,0,0];


const client = new Client('127.0.0.1', 8788);



function outputPrediction(){
  client.send('/pipafan', predict_variables, () => {
    client.close();
  });
}

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
 input_variables = input_data;
//dp.input_data(input_data);

}

function process_the_ports_path_into_array(ports) {
  var ports_array = [];
  for (var i = 0; i < ports.length; i++) {
    ports_array.push(ports[i].path);
  }
  return ports_array;
}


var oscServer = new Server(12000, '0.0.0.0', () => {
  console.log('OSC Server is listening');
  var temp_dom = document.getElementById('status_text');
  temp_dom.removeAttribute("class",'off');
  temp_dom.setAttribute('class', 'on');
  temp_dom.innerHTML = "Server Started on  " + oscServer.port;
});

oscServer.on('message', function (msg) {
  var topic_name = msg.shift();
  //check the topic name and process the logic
  if (topic_name == "/arduino/sensors") {
    retrive_array_data(msg);
  }

  console.log("recieved something");
    
  //console.log("Message",msg);
  //oscServer.close();
});

function generate_form(){
  document.getElementById("training_table").appendChild(generate_table_training(5));
}


function generate_table_training(number_of_inputs){
  var temp_dom = document.createElement('table');
  temp_dom.setAttribute('id', 'training_table');
  // a typical data json is like this data_json = [{index:}]


  // create five colume titles , which are : sample index, name, existing training samples, a button for press for training , a button for remove all samples
  var temp_row = document.createElement('tr');
  var temp_input = document.createElement('th');
  temp_input.innerHTML = "Sample Index";
  
  temp_row.appendChild(temp_input);


  temp_input = document.createElement('th');
  temp_input.innerHTML = "Custom Name";

  temp_row.appendChild(temp_input);
  
  temp_input = document.createElement('th');
  temp_input.innerHTML = "Existing Training Samples";
  temp_row.appendChild(temp_input);
  temp_input = document.createElement('th');
  temp_input.innerHTML = "Press for Training";
  temp_row.appendChild(temp_input);
  temp_input = document.createElement('th');
  temp_input.innerHTML = "Remove All Samples";
  temp_row.appendChild(temp_input);
  temp_dom.appendChild(temp_row);

  for (var i=0; i <number_of_inputs;i++){
    // append a row for each input
    temp_row = document.createElement('tr');


    temp_input = document.createElement('td');
    temp_input.innerHTML = i;
    temp_row.appendChild(temp_input);

    //add another column for input name, with a default name of input_1, input_2, input_3 etc. It can allow the user to do text input 
    temp_input = document.createElement('td');
    temp_input.setAttribute('id', 'training_name_'+i);
    temp_text = document.createElement('input');
    temp_text.setAttribute('type', 'text');
    temp_text.setAttribute('id', 'training_name_input_'+i);
    temp_text.setAttribute('value', 'input_'+i);
    temp_input.appendChild(temp_text);
    temp_row.appendChild(temp_input);

    
    
    

    temp_input = document.createElement('td');
    temp_input.setAttribute('id', 'training_sample_'+i);
    temp_input.innerHTML = "0";
    temp_row.appendChild(temp_input);
    temp_input = document.createElement('td');
    temp_input.setAttribute('id', 'training_button_'+i);
    temp_input.setAttribute('class', 'btn btn-primary');
    temp_input.innerHTML = "Train";
    temp_input.addEventListener('click', function() {
      console.log('train button clicked');
    }
    );
    temp_row.appendChild(temp_input);

    temp_input = document.createElement('td');
    var temp_button = document.createElement('button');
    temp_button.setAttribute('id', 'remove_all_button_'+i);
    temp_button.setAttribute('class', 'btn btn-primary');
    temp_button.innerHTML = "Remove All";
    temp_button.addEventListener('click', function() {
      console.log('remove all button clicked');
    }
    );
    temp_input.appendChild(temp_button);

    temp_row.appendChild(temp_input);

    temp_dom.appendChild(temp_row);


  }
  return temp_dom;

}