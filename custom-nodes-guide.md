# LiteGraph.js Custom Nodes and Widgets Guide

This document provides a comprehensive guide on creating custom nodes and implementing interactive controls (widgets) in LiteGraph.js.

## Creating a Basic Custom Node

Here's the basic structure for creating a custom node:

```javascript
// Node constructor function
function MyCustomNode() {
  // Add inputs
  this.addInput("Input1", "number");
  this.addInput("Input2", "string");
  
  // Add outputs
  this.addOutput("Output1", "number");
  
  // Define properties that can be configured and serialized
  this.properties = {
    someValue: 10,
    someOption: "default"
  };
}

// Set the node title
MyCustomNode.title = "My Custom Node";

// Set node appearance
MyCustomNode.title_color = "#345";  // Title color
MyCustomNode.shape = LiteGraph.ROUND_SHAPE;  // Node shape
MyCustomNode.size = [180, 60];  // Default size [width, height]

// Define execution behavior
MyCustomNode.prototype.onExecute = function() {
  // Get input values
  var input1 = this.getInputData(0) || 0;
  var input2 = this.getInputData(1) || "";
  
  // Process data
  var result = input1 + input2.length;
  
  // Set output data
  this.setOutputData(0, result);
};

// Register the node
LiteGraph.registerNodeType("category/mycustom", MyCustomNode);
```

## Supported Data Types

LiteGraph.js supports various data types for node connections:

- `"*"`: Generic type (accepts any)
- `"number"`: Numeric values
- `"string"`: Text
- `"boolean"`: True/False
- `"array"`: JavaScript arrays
- `"object"`: JavaScript objects
- `"vec2"`, `"vec3"`, `"vec4"`: Vector types
- `"color"`: Color values
- `"image"`, `"texture"`: Image/texture data
- `"audio"`: Audio data

## Node Lifecycle Callbacks

LiteGraph.js provides several callbacks you can implement:

```javascript
// Execution related
MyCustomNode.prototype.onAdded = function() {
  // Called when node is added to graph
};

MyCustomNode.prototype.onRemoved = function() {
  // Called when node is removed from graph
};

MyCustomNode.prototype.onStart = function() {
  // Called when graph starts playing
};

MyCustomNode.prototype.onStop = function() {
  // Called when graph stops playing
};

// Drawing related
MyCustomNode.prototype.onDrawBackground = function(ctx, canvas) {
  // Custom background rendering (only in edit mode)
};

MyCustomNode.prototype.onDrawForeground = function(ctx, canvas) {
  // Custom foreground rendering (visible in live mode too)
};

// Interaction related
MyCustomNode.prototype.onMouseDown = function(e, pos, canvas) {
  // Handle mouse down event
  return true; // Return true if you handled the event
};

MyCustomNode.prototype.onMouseMove = function(e, pos, canvas) {
  // Handle mouse move event
};

MyCustomNode.prototype.onMouseUp = function(e, pos, canvas) {
  // Handle mouse up event
};

MyCustomNode.prototype.onDblClick = function(e, pos, canvas) {
  // Handle double click
};

// Property related
MyCustomNode.prototype.onPropertyChanged = function(name, value) {
  // Called when a property changes in the panel
  // Return true to skip default behavior
};

// Connection related
MyCustomNode.prototype.onConnectInput = function(inputIndex, outputType, outputSlot, outputNode, outputIndex) {
  // Return false to reject the connection
  return true;
};

MyCustomNode.prototype.onConnectionsChange = function(type, slotIndex, isConnected, link_info, inputInfo) {
  // Called when connections change
  // type can be LiteGraph.INPUT or LiteGraph.OUTPUT
};
```

## Adding Widgets

Widgets are interactive UI controls inside nodes. Add them in the node constructor:

```javascript
function MyNodeWithWidgets() {
  // Add inputs/outputs
  this.addInput("Input", "number");
  this.addOutput("Output", "number");
  
  // Add widgets
  this.number_widget = this.addWidget("number", "Value", 5, function(v) {
    // This function is called when widget value changes
    console.log("Number value changed to:", v);
  }, { min: 0, max: 10, step: 0.1 });
  
  this.slider_widget = this.addWidget("slider", "Slider", 0.5, function(v) {
    console.log("Slider changed to:", v);
  }, { min: 0, max: 1 });
  
  this.combo_widget = this.addWidget("combo", "Options", "opt1", function(v) {
    console.log("Option selected:", v);
  }, { values: ["opt1", "opt2", "opt3"] });
  
  this.text_widget = this.addWidget("text", "Text", "default", function(v) {
    console.log("Text changed to:", v);
  });
  
  this.toggle_widget = this.addWidget("toggle", "Toggle", true, function(v) {
    console.log("Toggle changed to:", v);
  });
  
  this.button_widget = this.addWidget("button", "Click Me", null, function() {
    console.log("Button clicked!");
  });
}

// To persist widget values during serialization
MyNodeWithWidgets.prototype.serialize_widgets = true;
```

## Widget Types and Options

### 1. Number Widget
```javascript
this.addWidget("number", "Label", default_value, callback, {
  min: 0,         // Minimum value
  max: 100,       // Maximum value
  step: 1,        // Step increment
  precision: 2    // Decimal precision
});
```

### 2. Slider Widget
```javascript
this.addWidget("slider", "Label", default_value, callback, {
  min: 0,         // Minimum value
  max: 100,       // Maximum value
  step: 1         // Step increment
});
```

### 3. Combo Widget (Dropdown)
```javascript
// Using an array
this.addWidget("combo", "Label", default_value, callback, {
  values: ["option1", "option2", "option3"]
});

// Using an object
this.addWidget("combo", "Label", default_value, callback, {
  values: {
    "Display Name 1": "value1",
    "Display Name 2": "value2"
  }
});
```

### 4. Text Widget
```javascript
this.addWidget("text", "Label", default_value, callback);
```

### 5. Toggle Widget
```javascript
this.addWidget("toggle", "Label", default_value, callback);
```

### 6. Button Widget
```javascript
this.addWidget("button", "Label", null, callback);
```

## Linking Widgets to Properties

You can link widgets directly to node properties:

```javascript
function MyNode() {
  // Define properties
  this.properties = {
    speed: 10,
    enabled: true,
    name: "Default"
  };
  
  // Link widgets to properties
  this.addWidget("number", "Speed", this.properties.speed, null, {
    property: "speed",
    min: 0,
    max: 100
  });
  
  this.addWidget("toggle", "Enabled", this.properties.enabled, null, {
    property: "enabled"
  });
  
  this.addWidget("text", "Name", this.properties.name, null, {
    property: "name"
  });
}
```

## Custom Drawing for Enhanced UI

For more complex UI controls beyond standard widgets, use the drawing callbacks:

```javascript
MyNode.prototype.onDrawForeground = function(ctx, graphcanvas) {
  if (this.flags.collapsed) return;
  
  // Get the bounding area for drawing
  var y = this.size[1] - 30;
  var x = 10;
  var width = this.size[0] - 20;
  
  // Draw custom UI elements
  ctx.fillStyle = "#666";
  ctx.fillRect(x, y, width, 20);
  
  // Draw text
  ctx.fillStyle = "#FFF";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Custom Control", x + width/2, y + 15);
  
  // Store area for mouse interaction
  this.custom_area = [x, y, width, 20];
};

// Add mouse interaction
MyNode.prototype.onMouseDown = function(e, local_pos, graphcanvas) {
  if (this.custom_area && 
      local_pos[0] >= this.custom_area[0] && 
      local_pos[0] <= this.custom_area[0] + this.custom_area[2] &&
      local_pos[1] >= this.custom_area[1] && 
      local_pos[1] <= this.custom_area[1] + this.custom_area[3]) {
    
    // Custom action when control is clicked
    console.log("Custom control clicked");
    return true; // Capture the event
  }
  return false; // Allow other handlers
};
```

## Custom Widgets Limitations

According to GitHub issue #209, there are limitations with creating fully custom widget types. The `addCustomWidget` function exists but has issues with maintaining prototype functions.

To implement truly custom controls, you'll likely need to:

1. Use the standard widgets when possible
2. Implement custom drawing with `onDrawForeground` or `onDrawBackground`
3. Handle mouse interactions with `onMouseDown`, `onMouseMove`, etc.
4. Manage the state and positioning of your custom controls manually

## Example: Complex Custom Node

Here's a more complex example combining various features:

```javascript
function AdvancedNode() {
  // Inputs and outputs
  this.addInput("Number", "number");
  this.addInput("Enable", "boolean");
  this.addOutput("Result", "number");
  this.addOutput("Status", "string");
  
  // Properties
  this.properties = {
    mode: "add",
    factor: 1.0,
    threshold: 0.5,
    name: "Advanced Node"
  };
  
  // Widgets
  this.widgets_start_y = 10; // Position widgets from this Y coordinate
  
  this.addWidget("text", "Name", this.properties.name, function(v) {
    this.properties.name = v;
  });
  
  this.modeWidget = this.addWidget("combo", "Mode", this.properties.mode, function(v) {
    this.properties.mode = v;
  }, { values: ["add", "multiply", "divide", "subtract"] });
  
  this.factorWidget = this.addWidget("slider", "Factor", this.properties.factor, function(v) {
    this.properties.factor = v;
  }, { min: 0, max: 5, step: 0.1 });
  
  this.thresholdWidget = this.addWidget("number", "Threshold", this.properties.threshold, function(v) {
    this.properties.threshold = v;
  }, { min: 0, max: 1, step: 0.01 });
  
  this.addWidget("button", "Reset", null, function() {
    this.properties.factor = 1.0;
    this.properties.threshold = 0.5;
    this.factorWidget.value = 1.0;
    this.thresholdWidget.value = 0.5;
  }.bind(this));
  
  // Size
  this.size = [240, 180];
}

AdvancedNode.title = "Advanced Node";
AdvancedNode.title_color = "#2E4053";
AdvancedNode.shape = LiteGraph.ROUND_SHAPE;

AdvancedNode.prototype.onExecute = function() {
  // Get inputs
  var num = this.getInputData(0);
  if (num === undefined) num = 0;
  
  var enabled = this.getInputData(1);
  if (enabled === undefined) enabled = true;
  
  // Process
  var result = num;
  var status = "OK";
  
  if (enabled) {
    switch (this.properties.mode) {
      case "add":
        result = num + this.properties.factor;
        break;
      case "multiply":
        result = num * this.properties.factor;
        break;
      case "divide":
        if (this.properties.factor !== 0) {
          result = num / this.properties.factor;
        } else {
          result = 0;
          status = "Division by zero";
        }
        break;
      case "subtract":
        result = num - this.properties.factor;
        break;
    }
    
    // Apply threshold
    if (Math.abs(result) < this.properties.threshold) {
      result = 0;
      status = "Below threshold";
    }
  } else {
    status = "Disabled";
  }
  
  // Set outputs
  this.setOutputData(0, result);
  this.setOutputData(1, status);
};

AdvancedNode.prototype.onDrawForeground = function(ctx, graphcanvas) {
  if (this.flags.collapsed) return;
  
  // Draw a custom status indicator
  var y = this.size[1] - 30;
  var x = 10;
  var width = this.size[0] - 20;
  
  // Background
  ctx.fillStyle = "#333";
  ctx.fillRect(x, y, width, 20);
  
  // Fill based on status
  var status = this.getOutputData(1) || "Unknown";
  var color = status === "OK" ? "#5CB85C" : 
              status === "Disabled" ? "#777" : "#F0AD4E";
              
  var fillWidth = (status === "OK") ? width : 
                  (status === "Disabled") ? 0 : width * 0.5;
                  
  ctx.fillStyle = color;
  ctx.fillRect(x, y, fillWidth, 20);
  
  // Text
  ctx.fillStyle = "#FFF";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText(status, x + width/2, y + 15);
};

// Register
LiteGraph.registerNodeType("advanced/processor", AdvancedNode);
```

## Events Support

LiteGraph.js also supports event-based connections between nodes:

```javascript
function MyTriggerNode() {
  // Regular data input/output
  this.addInput("Value", "number");
  this.addOutput("Result", "number");
  
  // Event input/output
  this.addInput("Trigger", LiteGraph.ACTION);
  this.addOutput("OnComplete", LiteGraph.EVENT);
  
  this.properties = {
    threshold: 10
  };
  
  this.addWidget("number", "Threshold", this.properties.threshold, function(v) {
    this.properties.threshold = v;
  });
}

// Handle events with onAction
MyTriggerNode.prototype.onAction = function(action, data) {
  if (action === "Trigger") {
    var value = this.getInputData(0) || 0;
    var result = value * 2;
    
    this.setOutputData(0, result);
    
    if (result > this.properties.threshold) {
      // Trigger the output event
      this.triggerSlot(0, result);
    }
  }
};

LiteGraph.registerNodeType("events/trigger", MyTriggerNode);
```

This guide should help you create custom nodes with interactive widgets in LiteGraph.js. Remember that for truly custom interfaces, you may need to combine standard widgets with custom drawing and mouse handling.
