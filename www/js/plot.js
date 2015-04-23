function plot(canvas, x, y){
  /*
   * Canvas: a canvas DOM element
   * x,y: X.data a numeric array
   *      X.string function for how to draw a data point (eg units etc)
   */
  canvas.width  = window.innerWidth;
  var x_label_height = 35;
  var y_label_width = 75;
  var origin = {
    x: canvas.width - y_label_width,
    y: canvas.height - x_label_height
  };
  
  var plot_size = {
    x: canvas.width - y_label_width - 20,
    y: canvas.height - x_label_height - 20
  };
  
  var ctx = canvas.getContext("2d");
  
  // if fetching data, just say so
  if ((!x)||(!y)||(x.data.length == 0)||(y.data.length == 0)){
    print_fetching_data(canvas);
    return;
  }
  
  // clear for actually plotting
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  
  // determine order of magnitude (step size)
  var x_accuracy = compute_accuracy(x.data, 6);
  var y_accuracy = compute_accuracy(y.data);
  
  // determine endpoints
  var x_range = compute_range(x_accuracy, x.data);
  x_range[1] = 0;
  
  var y_range = compute_range(y_accuracy, y.data);
  // determine scales (conversion from units of x and y to pixels)
  var x_scale = compute_scale(plot_size.x, x_range);
  var y_scale = compute_scale(plot_size.y, y_range);
  
  // draw axes
  draw_axes(canvas, origin);
  
  
   /*********************************
    * Draw the tick marks on the axes
    *********************************/

  //draw x-ticks
  set_tick_style(ctx);
  
  // calculate pixels between ticks
  var tick_spacing = (x_accuracy*x_scale);
  var num_ticks =  Math.floor(plot_size.x/tick_spacing);
  var label_freq = Math.ceil(30/(plot_size.y/num_ticks));
  var tick_length = 8;
  var begin = [];
  var end = [];
  var x_pixel = canvas.width;
  for(var i = 0; i <= num_ticks; i++){
    
    // copmute the x value
    x_pixel = Math.round(origin.x - i*tick_spacing);
    
    // draw label (and make stroke bigger) if appropriate
    if(mod(i,label_freq) == 0){
      ctx.lineWidth = 4;
      
      //draw label
      var value = (x_pixel - origin.x)/x_scale;// - x_range[1];
      value = x_range[1] - i*x_accuracy;
      value = x.string(value);
      ctx.fillText(value, x_pixel - 20, canvas.height - 5);
    }
    else
      ctx.lineWidth = 2;
    
    begin = [x_pixel, origin.y];
    end = [x_pixel, origin.y + tick_length];
    draw_line(ctx, begin, end);
    
  }
  
  //draw y-ticks
  var y_pixel = 0;
  tick_spacing = 
  tick_spacing = (y_accuracy*y_scale);
  var num_ticks =  Math.floor(plot_size.y/tick_spacing);
  label_freq = Math.ceil(30/(plot_size.y/num_ticks));
  for(var i = 0; i <= num_ticks; i++){
    
    // copmute the x value
    y_pixel = origin.y - i*tick_spacing;
    
    // draw label (and make stroke bigger) if appropriate
    if(mod(i,label_freq) == 0){
      
      //draw label
      var value = ( -y_pixel + origin.y)/y_scale + y_range[0];
      value = y.string(value);
      ctx.fillText(value, origin.x + tick_length + 2, y_pixel+5);
      
      // draw horizontal marker if not on axis
      if(i != 0){
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;
        draw_line(ctx, [origin.x-1, Math.floor(y_pixel)+.5], [0, Math.floor(y_pixel)+.5]);
        set_tick_style(ctx);
      }
      
      // set up to fraw a fatter tick
      ctx.lineWidth = 4;
    }
    else
      ctx.lineWidth = 2;
    
    begin = [origin.x, y_pixel];
    end = [origin.x + tick_length, y_pixel];
    draw_line(ctx, begin, end);
  }
  
  
  /*******************************
   * Now we actually plot the data
   *******************************/

  ctx.strokeStyle = '#0099bb';
  
  var x_pixel = -1;
  var y_pixel = -1;
  var old_x = -1;
  var old_y = -1;
  ctx.beginPath();
  for( var i = 0; i < x.data.length; i++){
    // remember last point
    old_x = x_pixel;
    old_y = y_pixel;
    
    x_pixel = origin.x + (x.data[i] - x_range[1])*x_scale;
    y_pixel = origin.y - (y.data[i] - y_range[0])*y_scale;
    // draw line from last point if there was a last point
    if(old_x > 0){
      ctx.lineWidth = 2;
      draw_line(ctx, [old_x, old_y], [x_pixel, y_pixel], false);
    }
    
    
    // draw a circle around it if it is the last point
    if (x.data.length == i+1){
        ctx.stroke();
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.arc(x_pixel, y_pixel, 2, 0, Math.PI*2);
        ctx.stroke();
    }
  }
}

function compute_accuracy(data, res){
  // how far apart to put markers on the plot
  
  // how the resolution scales with the number of digits (low = higher resolution)
  if (arguments.length == 1){
    res = 5;
  }
  
  var max_value = Math.max.apply(null, data);
  var min_value = Math.min.apply(null, data);
  var accuracy = res;
  if (res == 6){
    max_value = 0;
  }
  if (max_value != min_value){
    
    var diff = max_value - min_value;
    
    var digits = Math.ceil(Math.log(diff)/Math.log(10));
  
    // the accuracy should scale with the number of digits
    if(digits != 1)      
      accuracy = res*Math.pow(10,Math.ceil(digits - 2));
      
      // force half-hour/hour scale in this situation
      if (res == 6){
        if (digits > 7 && diff < 36000000){
            accuracy = 1000*60*30;
        }
        if (digits < 9 && diff > 36000000){
            accuracy = 1000*60*60;
        }  
    }
    else
      accuracy = 1;
  }

  if (accuracy < 1)
    accuracy = 1;
  
  return accuracy;
}

function compute_range(accuracy, data){
  // finds endpoints that are nearest multiples of the accuracy
  
    var end_data = Math.max.apply(null, data);
    var first_data = Math.min.apply(null, data);

    var first_point;
    var end_point;
    if(Math.abs(end_data - first_data)<accuracy){
        end_point = end_data + mod(-end_data, accuracy);
        first_point = first_data - mod(first_data, accuracy);    
    }
    else{
        end_point = end_data + mod(-end_data, accuracy);
        first_point = first_data - mod(first_data, accuracy);
    }
  
    if (mod(-end_data, accuracy) <= accuracy/100){
        end_point = end_point + accuracy;
    }
    if (mod(first_data, accuracy) <= accuracy/100){
        first_point = first_point - accuracy;
    }
    return [first_point, end_point];
}

function compute_scale(pixels, range){
  return Math.abs(pixels/(range[1] - range[0]))
}

function compute_num_ticks(size, accuracy, scale){
  var tick_spacing = (accuracy*scale);
  return Math.floor(size/tick_spacing);
}


function draw_axes(canvas, origin){
  var ctx = canvas.getContext("2d");
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#666666';
  
  //draw x_axis  
  draw_line(ctx,
            [origin.x, origin.y],
            [0, origin.y]);
  
  // draw y-axis
  draw_line(ctx,
            [origin.x, origin.y + ctx.lineWidth/2],
            [origin.x, 0]);
}

function draw_line(ctx, begin, end, drawnow){
    // just a small utility to reduce typing
    if(arguments.length == 3){
        drawnow = true;
    }
    if(drawnow)
        ctx.beginPath();
    ctx.moveTo(begin[0], begin[1]);
    ctx.lineTo(end[0], end[1]);
    if(drawnow)
        ctx.stroke();
}

function set_tick_style(ctx){
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#666666';
  ctx.font = "16px Helvetica";
}

function print_fetching_data(canvas){
    var ctx = canvas.getContext("2d");
    msg = "Fetching Data...";
    ctx.font = "36px Helvetica";
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    
    x = (canvas.width - ctx.measureText(msg).width)/2
    y = (canvas.height - 18)/2
    ctx.fillText(msg, x, y);
}

function mod(x,y){
  // computes x%y the way it should be, because javascript be dumb
  var rem = x % y;
  if (rem < 0){
    rem = y + rem;
  }
  return rem;
}

function range(start, edge, step) {
  // Credit of Chris West: http://cwestblog.com/2013/12/16/javascript-range-array-function/
  // If only one number was passed in make it the edge and 0 the start.
  if (arguments.length == 1) {
    edge = start;
    start = 0;
  }
 
  // Validate the edge and step numbers.
  edge = edge || 0;
  step = step || 1;
 
  // Create the array of numbers, stopping befor the edge.
  for (var ret = []; (edge - start) * step > 0; start += step) {
    ret.push(start);
  }
  return ret;
}
