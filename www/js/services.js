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
        }
      }
    }
  }
})
console.log("loaded starter.services");
