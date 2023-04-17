class DataProcessor {
    constructor(num_of_data_point,live_sample_window_size = 12) {
        this.num_of_data_point = num_of_data_point;
        this.recording_data = [];
        this.start_recording = false;
        this.onset=false;
        this.window_size = live_sample_window_size;
        var zero_array = new Array(num_of_data_point).fill(0);
        this.isPredictionMode = false;
        this.beat_threshold = [2500,1000];
        this.live_mode_data = new Array(live_sample_window_size).fill(zero_array);
        // initialized numebr of data point using zeros
    }


    input_data(raw_data_array) {
        if (!this.isPredictionMode){
          if (this.start_recording){
          this.recording_data.push(raw_data_array);
        }
      }else{
        this.live_mode_data_input(raw_data_array);
        // try to 
      }
    }
    live_mode_data_input(input_data){
      // maintain a list of the most recent live sample windows size of the data
      this.live_mode_data.shift();
      this.live_mode_data.push(input_data);
    }

    start_recording() {
        this.start_recording = true;
    }

    stop_recording() {
        this.start_recording = false;
    }

    onset_detection(onset_function,offset_function){
      
        if (this.onset==false){
        var sum_of_next_12_data_points = 0;
        for (var i = 0; i < this.window_size; i++){
            sum_of_next_12_data_points += this.recording_data[i];
        }
        if (sum_of_next_12_data_points >  this.beat_threshold[0]){
            this.onset = true;
            this.onset_function();
            console.log("onset detected")
            return true;
        }else{
            return false;
        }
      }else{
        var sum_of_next_12_data_points = 0;
        for (var i = 0; i < this.window_size; i++){
            sum_of_next_12_data_points += this.recording_data[i];
        }
        if (sum_of_next_12_data_points <  this.beat_threshold[1]){
            this.onset = false;
            offset_function();
            console.log("offset detected")
            return false;
        }else{
            return true;
        }
      }
    }

    sum_one_set_data(data_array){
      var sum = 0;
      for (var i = 0; i < data_array.length; i++){
        sum += data_array[i];
      }
      return sum;
    }

    generate_sample_list(){
      var sample_list = this.process_the_data_into_several_data_series();
      // check if the last sample is a onset or offset, remove if it is a onset
      if (sample_list[sample_list.length-1].onset){
        sample_list.pop();
      }

      //remove first 2 samples
      sample_list.shift();
      sample_list.shift();

      //merge the samples into pairs
      var sample_list_with_label = [];
      for (var i = 0; i < sample_list.length; i=i+2){
        sample_list_with_label.push([sample_list[i],sample_list[i+1]]);
      }
      console.log(sample_list_with_label);
      return sample_list_with_label;
    }


    //TODO
    get_sample_data_series(){
      var sample_list = this.generate_sample_list();
      var sample_data_series = [];
      // get the index and then return the array from the recording data

    }

    process_the_data_into_several_data_series(window_size = 12,
                                              current_index = 0,
                                              current_status_onset=false,
                                              training_data_index_array = []) {


      console.log("current index is ", current_index,"current status is ",current_status_onset);
      // if (current_index > this.recording_data.length-window_size*2){
      //   return training_data_index_array;
      // }

      var temp_current_index = current_index;
      var temp_current_status_onset = current_status_onset;


      if (current_status_onset == false){
        for (var i = current_index; i < this.recording_data.length-window_size; i++){
          // check the sum of the next 12 data points
          var sum_of_next_12_data_points = 0;
          for (var j = 0; j < window_size; j++){
            sum_of_next_12_data_points += this.sum_one_set_data(this.recording_data[i+j]);
            if(this.sum_one_set_data(this.recording_data[i+j])!=0){
              console.log(this.sum_one_set_data(this.recording_data[i+j]));
            }
          }
      
          if (sum_of_next_12_data_points > this.beat_threshold[1]){
            console.log("started the ");
            temp_current_status_onset = true;
            temp_current_index = i;
            break;
          }
        }

      }else{
        //deal 
        for (var i = current_index; i < this.recording_data.length-window_size; i++){
          // check the sum of the next 12 data points
          var sum_of_next_12_data_points = 0;
          for (var j = 0; j < window_size; j++){
            sum_of_next_12_data_points += this.sum_one_set_data(this.recording_data[i+j]);
          }
          if (sum_of_next_12_data_points < this.beat_threshold[1]){
            temp_current_status_onset = false;
            temp_current_index = i;
            break;
          }
        }

        if (temp_current_index == current_index){
          return training_data_index_array;
          
        }


      }
      training_data_index_array.push({"current_index":temp_current_index,"onset":temp_current_status_onset});

      return this.process_the_data_into_several_data_series(window_size,temp_current_index,temp_current_status_onset,training_data_index_array);

    }

  

  }
