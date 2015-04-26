angular.module('starter.controllers', [])

.controller('SettingsCtrl', function($scope) {
})

.controller('OverviewCtrl', function($scope, $stateParams, Factors, Update) {
    $scope.factors = Factors.all();
    $scope.farm = $stateParams.farm;
    
    // initialize each sensor with its farm
    for(var i = 0; i < $scope.factors.length; i++){
        $scope.factors[i].farm = $scope.farm;
    }
    
    Update.all();
    
    $scope.detail_click = function(factor, $event) {
	    $scope.factors[factor].show_detail = 1 - $scope.factors[factor].show_detail;
	    
	    // force to redraw DOM
	    //$scope.$digest();
	}
	
})

.controller('FactorCtrl', function($scope, $stateParams, Factors, $http){
  $scope.factor = Factors.get($stateParams.factorId);
  $scope.factor.service = $http;
  $scope.override = override;
})

// this makes the plot reappear after navigating away and back, without waiting for the update cycle
.directive('plotDirective', function($http){
  var plotter = function(scope, element, attrs){
    var id = attrs.id;
    
    var factor_id = Number(attrs.id[attrs.id.length -1]);
    var factor = FACTORS[factor_id];
    var data = factor.values;
    
    var canvas = document.getElementById(attrs.id);
    if (canvas == null){
        canvas = element[0];
    }
    
    
    plot_values(data, factor_id, canvas);
  }
  return plotter;
})

.directive('overrideDirective', function(){
  var dir =  function(scope, element, attrs){
    var warning = element[0];
    
    // exctract the ID of the device this corresponds to
    device_id = Number(attrs.id[attrs.id.length -1]);
    var duration = document.getElementById('override-duration-'+device_id);
    
    // check if this device is being overriden
    if (DEVICES[device_id].is_override()){
      // make the warning visible
      warning.style.visibility = "visible";
      
      //update the duration
      if (duration != null){
        duration.innerHTML = pretty_time(DEVICES[device_id].override_left());
      }  
    }
    
    else {
      warning.style.visibility = "hidden";
    }
    setTimeout(function(){dir(scope, element, attrs)}, 500);
  }
 
 return dir;
});
