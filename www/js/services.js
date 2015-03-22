angular.module('starter.services', [])

/**
 * A service that returns the current environmental factors being measured and 
 * their current values
 */
 
.factory('Factors', function() {

  return {
    all: function() {
      //return factors;
      return FACTORS;
    },
    get: function(factorId) {
      // Simple index lookup
      return FACTORS[factorId];
    }
  }
})


/**
 * A service that updates the current environmental factors being measured
 */
 
.factory('Update', function($http) {

  return {
    all: function() {
      //update each factor
      for (var factor_id in FACTORS){
        // supposedly good practice to include this check
        if (FACTORS.hasOwnProperty(factor_id)){
          FACTORS[factor_id].update($http);
          var plot_canvas = document.getElementById("value_plot_"+factor_id);
          if(plot_canvas){
            var factor = FACTORS[factor_id];
            var data = factor.values;
    
            var time = new Date();
    
            var x = {
                data: [],
                string: function(value){
                            return pretty_time(value)+ ' ago';
                }};
            var y = {
              data: [],
              string: FACTORS[factor_id].string};
            
            for (var i = 0; i < data.length; i++){
              x.data.push(time.getTime() - data[i][0]);
              y.data.push(data[i][1]);
            
            plot(plot_canvas, x, y);
            }
          }
        }
      }
    }
  }
})
console.log("loaded starter.services");
