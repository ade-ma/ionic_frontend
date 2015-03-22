function pretty_int(int){
  if (int < 10){
    return '0' + int;
  }
  else
    return int;
}

function pretty_time(millis){
  var hours = millis - millis % (1000*60*60);
  var minutes = (millis - hours) - (millis - hours) % (1000*60);
  var seconds = (millis - hours - minutes) - (millis - hours - minutes) % 1000;
  return [pretty_int(Math.floor(hours/(1000*60*60))), pretty_int(Math.floor(minutes/(60*1000))), pretty_int(Math.floor(seconds/1000))].join(':');
}

// a device
function Device(device_descriptor){
  
  this.id = device_descriptor.id;
  
  this.outlet_name = device_descriptor.outlet_name;
  
  this.states = ['off', 'on'];
  
  this.date = new Date();
  
  // 0 or 1
  this.state = device_descriptor.state;
  
  this._override_begin = 0;
  this._override_duration = 0;
  this.is_override = function() {
    this.date = new Date();
    return ((this.date.getTime() - this._override_begin) < (this._override_duration - 10));
  }

  this.override = function(milliseconds) {
    // overrides for the duration specified
    this.date = new Date();
    this._override_begin = this.date.getTime();
    this._override_duration = milliseconds;
    
    /*
     * This AJAX should toggle the device state
     *  Use this.outlet_name to address the right outlet
     *  (this.outlet_name defined in the descriptors in this document
     * Probably need to do service.post.
     */
    YQI = escape("select * from yahoo.finance.quotes where symbol in ('AAPL','GOOG','MSFT')");
    URL = "http://query.yahooapis.com/v1/public/yql?q=" + YQI +      "&format=json&env=http://datatables.org/alltables.env&callback=";
    this.factor.service.get(URL)
    .success(function(data, status, headers, config) {
    //console.log("response", data);  
    
    // keep track of the state
    this.state = 1 - this.state;});
  }
  
  this.override_left = function() {
    var time_left = 0;
    this.date = new Date();
    if (this.is_override()){
      time_left =  (this._override_begin + this._override_duration - this.date.getTime());
    }

    return time_left;
  }
  
  this.cancel_override = function() {
    this._override_duration = 0;
  }
  
  // e.g. 'heater' or 'fan' etc
  this.name = device_descriptor.name
  
  // factor object
  // the envoronmental fector controlled by this device  (temperature, humidity etc.)
  this.factor = device_descriptor.factor;
  
  //
  this.toggle_state = function() {
    this.state = 1 - this.state;
  }
  
  this.string = function() {
    return this.factor.string(this.latest_value());
  }
}

var device_descriptors = [
    { id: 0, 
      state: 1,
      name: 'heater',
      factor: FACTORS[0],
      outlet_name: 0},
    { id: 1,
      state: 0,
      name: 'mister',
      factor: FACTORS[1],
      outlet_name: 1},
    { id: 2,
      name: 'irrigator',
      factor: FACTORS[2],
      state: 1,
      outlet_name: 2},
    { id: 3,
      name: 'lights',
      factor: FACTORS[3],
      state: 1,
      outlet_name: 3},
    { id: 4, 
      state: 0,
      name: 'fan',
      factor: FACTORS[0],
      outlet_name: 4}
  ];

// instantiate the device ocjects
var DEVICES = [];
for (var i = 0; i < device_descriptors.length; i++){
  DEVICES.push(new Device(device_descriptors[i]));
}

function prepare(factor){
  var states = ['off', 'on'];
  var prepared = {
            id: factor.id,
            states: states,
            state: factor.state,
            name: factor.name,
            overview: factor.string(factor.value.slice(-1)[0]),
            value: factor.value,
            device: factor.device
          };
  return prepared
}

function override(id){
      var state_word = document.getElementById("current-state-word-"+id);
      var current_state = state_word.innerHTML;
      var not_state_word = document.getElementById("current-not-state-word-"+id);
      state_word.innerHTML = not_state_word.innerHTML;
      not_state_word.innerHTML = current_state;
    
      // actually toggle state and override
      device = DEVICES[id];
      device.toggle_state();
      
      console.log("override: ",device.is_override());
      if (device.is_override())
        device.cancel_override();
      else
      {
        device.override(1000*60*60*2);
      }
  }

