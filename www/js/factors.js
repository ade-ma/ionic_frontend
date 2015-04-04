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

// one of the environmental factors, humidity, heat etc.
function Factor(factor_descriptor){
  
  // e.g. 'humidity' or 'temperature'
  this.name = factor_descriptor.name;
  
  // unique etc.
  this.id = factor_descriptor.id;
  
  // used to mark which recursive chain it belongs in
  this.chain = 0;
  
  // function for appending the right symbol for the units
  this.string = factor_descriptor.string;
  
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
    var values2 = this.values;
    id = this.id;
    console.log(id);
    
    /*
     *  This AJAX call should get the latest value for this factor
     *
     */

    URL = "http://"+SERVER_IP+":5000/last" + this.name + "?ID=001";
    if (this.name == "Lights"){
        return;
    }
    service.get(URL)
    .success(function(data, status, headers, config) {
      console.log(data)
      var array = data.split("--");
      var time = parseInt(array[0]);
      
      // only update if the value is new
      if (values2.length == 0){
          values2.push([time, parseFloat(array[1])]);
      }
      else if (values2.slice(-1)[0][0] != time){
          values2.push([time, parseFloat(array[1])]);
      }
    })
    .error(function(data, status, headers, config) {
      console.log("error getting new data")
    });
    //this.values.push([time.getTime(), 57+((id*id+id+1)%7)+Math.sin(time.getTime()/100000)+(id+1)*Math.cos(time.getTime()/600000)+8*Math.sin(time.getTime()/6000000)]);
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
      values:  []},
    /*{ id: 2,
      name: 'Soil Moisture',
      summary: average_latest,
      string: hum_to_string,
      values: []},*/
    { id: 2,
      name: 'Lights',
      summary: average_state,
      values:[],
      string: identity}
  ];

// create global array of the factor aobjects
var FACTORS = [
  new Factor(factor_descriptors[0]),
  new Factor(factor_descriptors[1]),
  new Factor(factor_descriptors[2])//,
  //new Factor(factor_descriptors[3])
]
