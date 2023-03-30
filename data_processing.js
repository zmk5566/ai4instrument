class DataProcessor {
    constructor(num_of_data_point,live_sample_window_size = 12) {
        this.num_of_data_point = num_of_data_point;
        this.recording_data = [];
        this.start_recording = false;
        this.onset=false;
        this.window_size = live_sample_window_size;
        var zero_array = new Array(num_of_data_point).fill(0);
        this.isPredictionMode = false;
        this.beat_threshold = [300,50];
        this.live_mode_data = new Array(live_sample_window_size).fill(zero_array);
        // initialized numebr of data point using zeros
    }


    input_data(raw_data_array) {
        if (!this.isPredictionMode){
          this.recording_data = this.recording_data.push(raw_data_array);
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
            onset_function();
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

    process_the_data_into_several_data_series(window_size = 12) {
      var current_status_onset = false;
      var current_onset_window_index = 0;
      var current_offset_window_index = 0;

      var training_data_index_array = [];

      if (current_status_onset == false){
        for (var i = current_offset_window_index; i < this.num_of_data_point-window_size; i++){
          // check the sum of the next 12 data points
          var sum_of_next_12_data_points = 0;
          for (var j = 0; j < window_size; j++){
            sum_of_next_12_data_points += this.recording_data[i+j];
          }
          if (sum_of_next_12_data_points > this.beat_threshold[0]){
            current_status_onset = true;
            current_window_index = i;
            break;
          }
        }

      }else{
        //deal 
        for (var i = current_onset_window_index; i < this.num_of_data_point-window_size; i++){
          // check the sum of the next 12 data points
          var sum_of_next_12_data_points = 0;
          for (var j = 0; j < window_size; j++){
            sum_of_next_12_data_points += this.recording_data[i+j];
          }
          if (sum_of_next_12_data_points < this.beat_threshold[1]){
            current_status_onset = false;
            current_offset_window_index = j;
            break;
          }
        }

        training_data_index_array.push([current_onset_window_index,current_offset_window_index]);

      }

      return training_data_index_array;

    }

  

  }
