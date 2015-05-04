function temp_to_string(temp){
    temp = Math.round(temp*1)/1;
    return String(temp) + "\u2109";
}

function hum_to_string(humidity){
    return String(Math.round(humidity)) + '%';
}

function identity(value){
    return value;
}

function average_latest(){
    return this.string(this.latest_value());
}

function average_state(){
    
    var states = ['all off', 'some on', 'all on'];
    var state_sum = 0;
    for(var i = 0; i < this.devices().length; i++){
      state_sum += this.devices()[i].state;
    }
  
    if (state_sum == 0)
      return states[0];
    else if (state_sum < this.devices().length)
      return states[1];
    else
      return states[2];
}


function plot_values(data, id, canvas){
    if (arguments.length == 2){
        var canvas = document.getElementById("value_plot_"+id);
        if(!canvas){
            return;
        }
    }
    var time = new Date();
    
    var x = {
        data: [],
        string: function(value){
                    return pretty_time(value);
        }};
    var y = {
       data: [],
       string: FACTORS[id].string};
            
    for (var i = 0; i < data.length; i++){
        x.data.push(-time.getTime() + data[i][0]);
        y.data.push(data[i][1]);
    }
    
    plot(canvas, x, y);
}


// one of the environmental factors, humidity, heat etc.
function Factor(factor_descriptor){
    //
  
    // e.g. 'humidity' or 'temperature'
    this.name = factor_descriptor.name;
    
    //if the plot should be displayed
    this.show_detail = 0;
    
    // unique etc.
    this.id = factor_descriptor.id;
    
    // used to mark which recursive chain it belongs in
    this.chain = 0;
    
    // function for appending the right symbol for the units
    this.string = factor_descriptor.string;
    
    this.farm = "";
    this.track = false;
    
    // return a list of all the Device objects that effect this factor
    this._devices = [];
    this.devices = function() {
      if(this._devices.length == 0){
        for(var i = 0; i < DEVICES.length; i++){
          if (DEVICES[i].factor == this)
            this._devices.push(DEVICES[i]);
        }
      }
      return this._devices;
    }
    
    // return the summary of the state of this factor
    this.summary = factor_descriptor.summary;
    
    // summary of device states
    this.device_summary = average_state;
    
    // data about this environmental factor
    this.values = factor_descriptor.values;
    
    //update values
    this.update = function(service) {
        
        // make values2 point to the right list
        var values2 = this.values;
        var id = this.id;
      
        /*
         *  This AJAX call should get the latest values for this factor
         *
         */
    
        URL = "http://"+SERVER_IP+"/range" + this.name + "?ID=001&hours=" + HOSTORY_HOURS + "&max_length=" + MAX_DATA_LENGTH + "&farm=" + this.farm;
        console.log(URL);
        if (this.name == "Lights"){
            return;
        }
        service.get(URL)
        .success(function(data, status, headers, config){
            points = data.split(";");
            
            // we can't change where values2 points, or else this.values won't be updated
            // we also can't access this.values because the context is different here :(
            values2.length = 0;
            for (var i = 0; i < points.length; i++){
                points[i] = points[i].split("--");
              
                // turn time into an int
                points[i][0] = parseInt(points[i][0]);
              
                // turn value into float
                points[i][1] = parseFloat(points[i][1]);
                
                values2.push(points[i]);
            }
            
            // now plot the values
            plot_values(values2, id);
            
        })
        .error(function(data, status, headers, config) {
            console.log("error getting new data")
        });
    }
    
  this.updateValues = function (data, status, headers, config){
      
      var points = data.split(";");
      console.log(points);
      for (var i = 0; i < points.length; i++){
          points[i] = points[i].split("--");
          
          // turn time into an int
          points[i][0] = parseInt(points[i][0]);
          
          // turn value into float
          points[i][1] = parseFloat(points[i][1]);
      }
      this.values = points;
      console.log(this.id);
  }
  
  // get most recent value
  var time = new Date();
  this.latest_value = function() {
    if (this.values.length > 0){
      return this.values.slice(-1)[0][1];
    }
    else {
      return NaN;
    }
  }
}



var factor_descriptors = [
    { id: 0, 
      name: 'Temperature',
      string: temp_to_string,
      summary: average_latest,
      values: []},
    { id: 1,
      name: 'Humidity',
      summary: average_latest,
      string: hum_to_string,
      values:  []}];
    /*{ id: 2,
      name: 'Soil Moisture',
      summary: average_latest,
      string: hum_to_string,
      values: []},
    { id: 2,
      name: 'Lights',
      summary: average_state,
      values:[],
      string: identity}
  ];*/

// create global array of the factor aobjects
var FACTORS = [
  new Factor(factor_descriptors[0]),
  new Factor(factor_descriptors[1]),
  //new Factor(factor_descriptors[2])//,
  //new Factor(factor_descriptors[3])
]
