// step1: press 'a' to add input values (x,y) + slider value.
// step2: press 'train' to train the model
// step3: drag mouse to predict values using regression
// NOTE: make sure you change ALL 3 sliders between colours or it won't quite work

let trainButton, saveButton;
let sliderR, sliderG, sliderB;
let predictMode = false;
let input_recieved = false;

function setup() {
  createCanvas(windowWidth, 400);
  background(220);
  sliderR = createSlider(0, 255, random(255));
  sliderG = createSlider(0, 255, random(255));
  sliderB = createSlider(0, 255, random(255));

  trainButton = createButton('train');
  trainButton.mousePressed(trainModel);

  saveButton = createButton('save');
  saveButton.mousePressed(function(){model.save()});

  let options = {
    task: 'regression',
    debug: 'true',
  };
  model = ml5.neuralNetwork(options);
}

function custom_load(){
  model.load('model/model.json', modelLoaded);
}

function modelLoaded(){
  console.log('model loaded');
  predictMode = true;
}

function draw(){
  
  noStroke();
  if (predictMode == false){
    fill(sliderR.value(), sliderG.value(), sliderB.value());
    }else{
    fill(predict_variables[0], predict_variables[1], predict_variables[2]);
    }
  

  // map three value from range 0-1024 to 0-width, 0-height, 0-255
  var temp_a = map(input_variables[0], 0, 4096, 0, width);
  var temp_b = map(input_variables[1], 0, 4096, 0, height);
  var temp_c = map(input_variables[2], 0, 4096, 0, 255);




  ellipse(temp_a, temp_b, temp_c,temp_c);

  makePrediction();

  rect(0,0,20,20);
}

function trainModel(){
  console.log('starting training');
  console.log(model)
  model.normalizeData();
  let options = {
    epochs: 50
  }
  model.train(options, whileTraining, finishedTraining);
}

function whileTraining(epoch, loss) {
  console.log("epoch: " + epoch);
}

function keyPressed() {

  if (key == 'a'){
    let inputs = input_variables;
    let outputs = [sliderR.value(), sliderG.value(), sliderB.value()]
    console.log(inputs, outputs);
    model.addData(inputs, outputs);
    console.log("added data");
    fill(sliderR.value(), sliderG.value(), sliderB.value());

    
    var temp_a = map(input_variables[0], 0, 4096, 0, width);
    var temp_b = map(input_variables[1], 0, 4096, 0, height);
    var temp_c = map(input_variables[2], 0, 4096, 0, 255);
  
    ellipse(temp_a, temp_b, temp_c,temp_c);


  }
}

function makePrediction(){

  if (predictMode && input_recieved){
    console.log("making prediections");
    //console.log(input_variables);
    model.predict(input_variables, gotResults);
  }
}



function finishedTraining() {
  console.log('finished training.');
  predictMode = true;
  background(255, 120);
}

function gotResults(error, results) {
  if (error) {
    //console.error(error);
    return;
  }
  if (results){
    let r = results[0]['value'];
    let g = results[1]['value'];
    let b = results[2]['value'];

    predict_variables[0] = results[0]['value']+0.00001;
    predict_variables[1] = results[1]['value']+0.00001;
    predict_variables[2] = results[2]['value']+0.00001;


    fill(r, g, b);
    console.log(r, g, b);
    //ellipse
    //circle(input_variables[0], input_variables[1], input_variables[2]);
    //rect(input_variables[0], input_variables[1], input_variables[2], input_variables[2]);

    //TODO add the sin logic here for controlling the music

    outputPrediction();
  }
}