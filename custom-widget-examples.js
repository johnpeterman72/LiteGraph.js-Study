/**
 * LiteGraph.js Custom Widget Examples
 * 
 * This file contains examples of creating custom nodes with various widget types
 * and advanced customization techniques.
 */

// -------------------------------------------------------------------------
// Example 1: Basic widgets for a simple calculator node
// -------------------------------------------------------------------------

function CalculatorNode() {
  // Inputs and outputs
  this.addInput("A", "number");
  this.addInput("B", "number");
  this.addOutput("Result", "number");
  
  // Properties
  this.properties = {
    operation: "add",
    showResult: true
  };
  
  // Add combo widget for selecting operation
  this.addWidget("combo", "Operation", this.properties.operation, function(v) {
    this.properties.operation = v;
  }.bind(this), { 
    values: ["add", "subtract", "multiply", "divide"] 
  });
  
  // Add toggle widget to show/hide result
  this.addWidget("toggle", "Show Result", this.properties.showResult, function(v) {
    this.properties.showResult = v;
  }.bind(this));
  
  // Set size
  this.size = [180, 90];
}

CalculatorNode.title = "Calculator";
CalculatorNode.desc = "Performs basic arithmetic operations";

CalculatorNode.prototype.onExecute = function() {
  var A = this.getInputData(0);
  if (A === undefined) A = 0;
  
  var B = this.getInputData(1);
  if (B === undefined) B = 0;
  
  var result = 0;
  
  switch (this.properties.operation) {
    case "add": result = A + B; break;
    case "subtract": result = A - B; break;
    case "multiply": result = A * B; break;
    case "divide": result = B !== 0 ? A / B : 0; break;
  }
  
  this.setOutputData(0, result);
};

CalculatorNode.prototype.onDrawForeground = function(ctx, graphcanvas) {
  if (this.flags.collapsed) return;
  if (!this.properties.showResult) return;
  
  var value = this.getOutputData(0);
  if (value === undefined) return;
  
  // Draw result text
  ctx.font = "14px Arial";
  ctx.fillStyle = "#AAF";
  ctx.textAlign = "center";
  ctx.fillText(value.toFixed(3), this.size[0] * 0.5, this.size[1] - 10);
};

// Register the node
//LiteGraph.registerNodeType("math/calculator", CalculatorNode);


// -------------------------------------------------------------------------
// Example 2: Node with slider widget and custom drawing
// -------------------------------------------------------------------------

function ColorMixerNode() {
  // Outputs
  this.addOutput("Color", "color");
  
  // Properties
  this.properties = {
    red: 0.5,
    green: 0.5, 
    blue: 0.5,
    alpha: 1.0
  };
  
  // Add slider widgets
  this.addWidget("slider", "Red", this.properties.red, function(v) {
    this.properties.red = v;
  }.bind(this), { min: 0, max: 1, step: 0.01 });
  
  this.addWidget("slider", "Green", this.properties.green, function(v) {
    this.properties.green = v;
  }.bind(this), { min: 0, max: 1, step: 0.01 });
  
  this.addWidget("slider", "Blue", this.properties.blue, function(v) {
    this.properties.blue = v;
  }.bind(this), { min: 0, max: 1, step: 0.01 });
  
  this.addWidget("slider", "Alpha", this.properties.alpha, function(v) {
    this.properties.alpha = v;
  }.bind(this), { min: 0, max: 1, step: 0.01 });
  
  // Set size
  this.size = [220, 160];
}

ColorMixerNode.title = "Color Mixer";
ColorMixerNode.desc = "Mixes RGBA color values";

ColorMixerNode.prototype.onExecute = function() {
  // Create color in rgba format
  var color = [
    this.properties.red,
    this.properties.green,
    this.properties.blue,
    this.properties.alpha
  ];
  
  this.setOutputData(0, color);
};

ColorMixerNode.prototype.onDrawForeground = function(ctx, graphcanvas) {
  if (this.flags.collapsed) return;
  
  // Draw color preview
  var x = 10;
  var y = 110;
  var width = this.size[0] - 20;
  var height = 30;
  
  // Draw color rectangle
  ctx.fillStyle = "rgba(" + 
    Math.floor(this.properties.red * 255) + "," +
    Math.floor(this.properties.green * 255) + "," +
    Math.floor(this.properties.blue * 255) + "," +
    this.properties.alpha + ")";
  
  ctx.fillRect(x, y, width, height);
  
  // Draw border
  ctx.strokeStyle = "#AAA";
  ctx.strokeRect(x, y, width, height);
};

// Register the node
//LiteGraph.registerNodeType("color/mixer", ColorMixerNode);


// -------------------------------------------------------------------------
// Example 3: Custom buttons and interaction
// -------------------------------------------------------------------------

function CustomButtonsNode() {
  // Output
  this.addOutput("Value", "number");
  
  // Properties
  this.properties = {
    value: 0,
    increment: 1
  };
  
  // Add regular widgets
  this.addWidget("number", "Value", this.properties.value, function(v) {
    this.properties.value = v;
  }.bind(this));
  
  this.addWidget("number", "Increment", this.properties.increment, function(v) {
    this.properties.increment = v;
  }.bind(this), { min: 0.1, max: 10, step: 0.1 });
  
  // Set size
  this.size = [180, 150];
  
  // Store button areas for interaction
  this.buttons = [
    { name: "+", x: 40, y: 110, w: 30, h: 20 },
    { name: "-", x: 110, y: 110, w: 30, h: 20 },
    { name: "Reset", x: 40, y: 140, w: 100, h: 20 }
  ];
}

CustomButtonsNode.title = "Custom Buttons";
CustomButtonsNode.desc = "Example of custom button controls";

CustomButtonsNode.prototype.onExecute = function() {
  this.setOutputData(0, this.properties.value);
};

CustomButtonsNode.prototype.onDrawForeground = function(ctx, graphcanvas) {
  if (this.flags.collapsed) return;
  
  // Draw custom buttons
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "12px Arial";
  
  for (var i = 0; i < this.buttons.length; i++) {
    var btn = this.buttons[i];
    
    // Button background
    ctx.fillStyle = btn.hover ? "#AAA" : "#666";
    ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
    
    // Button border
    ctx.strokeStyle = "#888";
    ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
    
    // Button text
    ctx.fillStyle = "#FFF";
    ctx.fillText(btn.name, btn.x + btn.w/2, btn.y + btn.h/2);
  }
};

CustomButtonsNode.prototype.onMouseDown = function(e, pos, graphcanvas) {
  if (this.flags.collapsed) return false;
  
  // Check if a button was clicked
  for (var i = 0; i < this.buttons.length; i++) {
    var btn = this.buttons[i];
    
    if (pos[0] >= btn.x && pos[0] <= btn.x + btn.w && 
        pos[1] >= btn.y && pos[1] <= btn.y + btn.h) {
      
      // Handle button actions
      if (btn.name === "+") {
        this.properties.value += this.properties.increment;
      } 
      else if (btn.name === "-") {
        this.properties.value -= this.properties.increment;
      }
      else if (btn.name === "Reset") {
        this.properties.value = 0;
      }
      
      return true; // Event handled
    }
  }
  
  return false; // Not handled
};

CustomButtonsNode.prototype.onMouseMove = function(e, pos, graphcanvas) {
  if (this.flags.collapsed) return false;
  
  var changed = false;
  
  // Update hover states
  for (var i = 0; i < this.buttons.length; i++) {
    var btn = this.buttons[i];
    var hover = pos[0] >= btn.x && pos[0] <= btn.x + btn.w && 
               pos[1] >= btn.y && pos[1] <= btn.y + btn.h;
    
    if (btn.hover !== hover) {
      btn.hover = hover;
      changed = true;
    }
  }
  
  return changed; // Return true if something changed to trigger redraw
};

// Register the node
//LiteGraph.registerNodeType("widget/custom_buttons", CustomButtonsNode);


// -------------------------------------------------------------------------
// Example 4: Complex widget with canvas drawing
// -------------------------------------------------------------------------

function GraphWidgetNode() {
  // Inputs and outputs
  this.addInput("Value", "number");
  this.addOutput("Average", "number");
  
  // Properties
  this.properties = {
    min: 0,
    max: 100,
    history: 100, // Number of samples to keep
    data: [] // Array to store historical data
  };
  
  // Add widgets for configuration
  this.addWidget("number", "Min", this.properties.min, function(v) {
    this.properties.min = v;
  }.bind(this));
  
  this.addWidget("number", "Max", this.properties.max, function(v) {
    this.properties.max = v;
  }.bind(this));
  
  this.addWidget("number", "History", this.properties.history, function(v) {
    this.properties.history = Math.max(2, Math.floor(v));
    // Resize data array
    if (this.properties.data.length > this.properties.history) {
      this.properties.data = this.properties.data.slice(
        -this.properties.history
      );
    }
  }.bind(this), { min: 2, max: 1000, step: 1 });
  
  // Set node size
  this.size = [240, 200];
}

GraphWidgetNode.title = "Graph Widget";
GraphWidgetNode.desc = "Displays a line graph of input values";

GraphWidgetNode.prototype.onExecute = function() {
  // Get input value
  var value = this.getInputData(0);
  if (value !== undefined) {
    // Add value to history
    this.properties.data.push(value);
    
    // Limit array size
    if (this.properties.data.length > this.properties.history) {
      this.properties.data.shift(); // Remove oldest value
    }
  }
  
  // Calculate average
  var sum = 0;
  var count = this.properties.data.length;
  
  if (count > 0) {
    for (var i = 0; i < count; i++) {
      sum += this.properties.data[i];
    }
    
    var avg = sum / count;
    this.setOutputData(0, avg);
  } else {
    this.setOutputData(0, 0);
  }
};

GraphWidgetNode.prototype.onDrawForeground = function(ctx, graphcanvas) {
  if (this.flags.collapsed) return;
  
  var data = this.properties.data;
  if (!data.length) return;
  
  // Graph area dimensions
  var margin = 10;
  var x = margin;
  var y = 80;
  var w = this.size[0] - margin * 2;
  var h = 100;
  
  // Draw background
  ctx.fillStyle = "#111";
  ctx.fillRect(x, y, w, h);
  
  // Draw border
  ctx.strokeStyle = "#555";
  ctx.strokeRect(x, y, w, h);
  
  // Draw grid lines
  ctx.strokeStyle = "#333";
  ctx.beginPath();
  
  // Horizontal grid lines
  for (var i = 1; i < 4; i++) {
    var gridY = y + (h / 4) * i;
    ctx.moveTo(x, gridY);
    ctx.lineTo(x + w, gridY);
  }
  
  // Vertical grid lines
  var steps = 4;
  for (var i = 1; i < steps; i++) {
    var gridX = x + (w / steps) * i;
    ctx.moveTo(gridX, y);
    ctx.lineTo(gridX, y + h);
  }
  
  ctx.stroke();
  
  // Draw min and max values
  ctx.fillStyle = "#AAA";
  ctx.font = "10px Arial";
  ctx.textAlign = "left";
  ctx.fillText(this.properties.max.toFixed(1), x + 2, y + 10);
  ctx.fillText(this.properties.min.toFixed(1), x + 2, y + h - 4);
  
  // Plot the data
  var min = this.properties.min;
  var max = this.properties.max;
  var range = max - min;
  
  if (range <= 0) range = 1; // Prevent division by zero
  
  ctx.strokeStyle = "#8F8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  var count = data.length;
  
  for (var i = 0; i < count; i++) {
    // Calculate position
    var dataX = x + (i / (count - 1)) * w;
    var normalizedValue = (data[i] - min) / range;
    var dataY = y + h - (normalizedValue * h);
    
    // Clamp Y to graph area
    dataY = Math.max(y, Math.min(y + h, dataY));
    
    if (i === 0) {
      ctx.moveTo(dataX, dataY);
    } else {
      ctx.lineTo(dataX, dataY);
    }
  }
  
  ctx.stroke();
  
  // Draw current value and average
  ctx.fillStyle = "#FFF";
  ctx.textAlign = "right";
  ctx.font = "12px Arial";
  
  var currentValue = data[data.length - 1];
  var avgValue = this.getOutputData(0);
  
  ctx.fillText("Current: " + currentValue.toFixed(2), x + w - 5, y - 10);
  ctx.fillText("Average: " + avgValue.toFixed(2), x + w - 5, y - 25);
};

// Register the node
//LiteGraph.registerNodeType("widget/graph", GraphWidgetNode);


// -------------------------------------------------------------------------
// Example 5: Custom widget with drag interaction
// -------------------------------------------------------------------------

function Knob2DNode() {
  // Outputs
  this.addOutput("X", "number");
  this.addOutput("Y", "number");
  
  // Properties
  this.properties = {
    x: 0.5,
    y: 0.5,
    min_x: 0,
    max_x: 1,
    min_y: 0,
    max_y: 1
  };
  
  // Add regular widgets for numeric input
  this.addWidget("number", "X", this.properties.x, function(v) {
    this.properties.x = this.clamp(v, this.properties.min_x, this.properties.max_x);
  }.bind(this));
  
  this.addWidget("number", "Y", this.properties.y, function(v) {
    this.properties.y = this.clamp(v, this.properties.min_y, this.properties.max_y);
  }.bind(this));
  
  // Set node size
  this.size = [180, 200];
  
  // Track interaction
  this.knobArea = { x: 40, y: 90, size: 100 };
  this.dragging = false;
}

Knob2DNode.title = "2D Knob";
Knob2DNode.desc = "A 2D knob control for X/Y values";

Knob2DNode.prototype.clamp = function(v, min, max) {
  return Math.max(min, Math.min(max, v));
};

Knob2DNode.prototype.onExecute = function() {
  // Map property values to output ranges
  var x_value = this.properties.x;
  var y_value = this.properties.y;
  
  this.setOutputData(0, x_value);
  this.setOutputData(1, y_value);
};

Knob2DNode.prototype.onDrawForeground = function(ctx, graphcanvas) {
  if (this.flags.collapsed) return;
  
  var area = this.knobArea;
  var x = area.x;
  var y = area.y;
  var size = area.size;
  
  // Draw border
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, size, size);
  
  // Draw background
  ctx.fillStyle = "#444";
  ctx.fillRect(x, y, size, size);
  
  // Draw grid lines
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 1;
  ctx.beginPath();
  
  // Vertical center line
  ctx.moveTo(x + size/2, y);
  ctx.lineTo(x + size/2, y + size);
  
  // Horizontal center line
  ctx.moveTo(x, y + size/2);
  ctx.lineTo(x + size, y + size/2);
  
  ctx.stroke();
  
  // Calculate knob position
  var normalizedX = (this.properties.x - this.properties.min_x) / 
                   (this.properties.max_x - this.properties.min_x);
  var normalizedY = (this.properties.y - this.properties.min_y) / 
                   (this.properties.max_y - this.properties.min_y);
  
  var knobX = x + normalizedX * size;
  var knobY = y + (1 - normalizedY) * size; // Invert Y for display
  
  // Draw knob position
  ctx.fillStyle = this.dragging ? "#FFF" : "#AAF";
  ctx.beginPath();
  ctx.arc(knobX, knobY, 8, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = "#556";
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Draw value text
  ctx.fillStyle = "#CCC";
  ctx.font = "10px Arial";
  ctx.textAlign = "center";
  ctx.fillText("X: " + this.properties.x.toFixed(2), x + size/2, y + size + 15);
  ctx.fillText("Y: " + this.properties.y.toFixed(2), x + size/2, y + size + 30);
};

Knob2DNode.prototype.onMouseDown = function(e, pos, graphcanvas) {
  if (this.flags.collapsed) return false;
  
  var area = this.knobArea;
  
  // Check if click is inside the knob area
  if (pos[0] >= area.x && pos[0] <= area.x + area.size &&
      pos[1] >= area.y && pos[1] <= area.y + area.size) {
    
    this.dragging = true;
    this.setValueFromMousePos(pos);
    return true;
  }
  
  return false;
};

Knob2DNode.prototype.onMouseMove = function(e, pos, graphcanvas) {
  if (this.dragging) {
    this.setValueFromMousePos(pos);
    return true;
  }
  return false;
};

Knob2DNode.prototype.onMouseUp = function(e, pos, graphcanvas) {
  if (this.dragging) {
    this.dragging = false;
    return true;
  }
  return false;
};

Knob2DNode.prototype.setValueFromMousePos = function(pos) {
  var area = this.knobArea;
  
  // Calculate normalized position within the area (0 to 1)
  var normalizedX = (pos[0] - area.x) / area.size;
  var normalizedY = 1 - (pos[1] - area.y) / area.size; // Invert Y for natural mapping
  
  // Clamp values to 0-1 range
  normalizedX = this.clamp(normalizedX, 0, 1);
  normalizedY = this.clamp(normalizedY, 0, 1);
  
  // Map to property range
  this.properties.x = this.properties.min_x + normalizedX * 
                    (this.properties.max_x - this.properties.min_x);
  this.properties.y = this.properties.min_y + normalizedY * 
                    (this.properties.max_y - this.properties.min_y);
};

// Register the node
//LiteGraph.registerNodeType("widget/knob2d", Knob2DNode);


// -------------------------------------------------------------------------
// Example 6: Node with event triggers and action buttons
// -------------------------------------------------------------------------

function EventControlNode() {
  // Add event output
  this.addOutput("OnTrigger", LiteGraph.EVENT);
  this.addOutput("Value", "number");
  
  // Properties
  this.properties = {
    value: 10,
    lastTriggerTime: 0,
    autoTrigger: false,
    interval: 1000 // ms
  };
  
  // Add widgets
  this.addWidget("number", "Value", this.properties.value, function(v) {
    this.properties.value = v;
  }.bind(this));
  
  this.addWidget("toggle", "Auto Trigger", this.properties.autoTrigger, function(v) {
    this.properties.autoTrigger = v;
  }.bind(this));
  
  this.addWidget("number", "Interval (ms)", this.properties.interval, function(v) {
    this.properties.interval = Math.max(100, v);
  }.bind(this), { min: 100, max: 10000, step: 100 });
  
  // Create a button widget
  this.addWidget("button", "Trigger Now", null, function() {
    this.triggerEvent();
  }.bind(this));
  
  // Size
  this.size = [180, 130];
}

EventControlNode.title = "Event Control";
EventControlNode.desc = "Triggers events manually or automatically";

EventControlNode.prototype.onExecute = function() {
  this.setOutputData(1, this.properties.value);
  
  // Check if auto trigger is enabled
  if (this.properties.autoTrigger) {
    var currentTime = Date.now();
    if (currentTime - this.properties.lastTriggerTime >= this.properties.interval) {
      this.triggerEvent();
      this.properties.lastTriggerTime = currentTime;
    }
  }
};

EventControlNode.prototype.triggerEvent = function() {
  this.triggerSlot(0, this.properties.value);
  
  // Visual feedback - we'll circle flash a colored circle
  this.boxcolor = "#FFF";
  setTimeout(function() {
    this.boxcolor = null;
  }.bind(this), 200);
};

EventControlNode.prototype.onDrawForeground = function(ctx, graphcanvas) {
  if (this.flags.collapsed) return;
  
  // Draw indicator when event is triggered
  if (this.boxcolor) {
    var centerX = this.size[0] * 0.5;
    var centerY = this.size[1] * 0.75;
    
    ctx.fillStyle = this.boxcolor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
    ctx.fill();
  }
};

// Register the node
//LiteGraph.registerNodeType("events/control", EventControlNode);
