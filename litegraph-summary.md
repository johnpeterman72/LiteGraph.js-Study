# LiteGraph.js Research - Custom Nodes and Controls

## Overview

LiteGraph.js is a JavaScript library that allows the creation of modular node-based graphs similar to Unreal Blueprints or PureData. It provides a canvas-based editor and an execution engine for creating node workflows. 

Key features:
- HTML5 Canvas2D-based rendering with zoom and panning support
- Easy-to-use node editor with searchbox and contextual menus
- Support for hundreds of nodes in a single graph
- Customizable node appearance (colors, shapes, backgrounds)
- Ability to create custom nodes with various widgets and controls
- Support for subgraphs (nodes containing other graphs)
- Live mode for UIs
- Server-side execution support (NodeJS)

## Creating Custom Nodes

To create a custom node in LiteGraph.js, you need to:

1. Define a constructor function for your node class
2. Add inputs and outputs to your node
3. Implement the `onExecute` method (or other callbacks)
4. Register your node type

Basic example:

```javascript
// Node constructor class
function MyAddNode() {
  this.addInput("A", "number");
  this.addInput("B", "number");
  this.addOutput("A+B", "number");
  this.properties = { precision: 1 };
}

// Name to show in the editor
MyAddNode.title = "Sum";

// Function called when node is executed
MyAddNode.prototype.onExecute = function() {
  var A = this.getInputData(0);
  if(A === undefined) A = 0;
  var B = this.getInputData(1);
  if(B === undefined) B = 0;
  this.setOutputData(0, A + B);
}

// Register the node type
LiteGraph.registerNodeType("basic/sum", MyAddNode);
```

## Node Appearance Customization

You can customize various aspects of a node's appearance:

```javascript
// Set node color
MyNodeClass.title_color = "#345";

// Set node shape
MyNodeClass.shape = LiteGraph.ROUND_SHAPE; // Options: BOX_SHAPE, ROUND_SHAPE, CARD_SHAPE

// Set node size
MyNodeClass.size = [300, 50];
```

## Node Callbacks

LiteGraph.js provides numerous callbacks for node behavior and interaction:

### Execution phases:
- `onAdded`: When added to graph
- `onRemoved`: When removed from graph
- `onStart`: When the graph starts playing
- `onStop`: When the graph stops playing
- `onExecute`: Execute the node

### Drawing:
- `onDrawForeground`: Render widgets inside the node (visible in Live mode)
- `onDrawBackground`: Render the background area (only in edit mode)

### User Interaction:
- `onMouseDown`, `onMouseUp`, `onDblClick`, `onMouseMove`
- `onMouseEnter`, `onMouseLeave`
- `onSelected`, `onDeselected`
- `onDropItem`: DOM item dropped over the node
- `onDropFile`: File dropped over the node

## Adding Widgets to Nodes

Widgets allow for user interaction within nodes. To add a widget, use the `addWidget` method in your node constructor:

```javascript
function MyNodeType() {
  this.slider_widget = this.addWidget(
    "slider",              // Widget type
    "Slider",              // Widget name
    0.5,                   // Default value
    function(value, widget, node) {
      // Callback when value changes
    },
    { min: 0, max: 1 }     // Widget options
  );
}
```

### Widget Types

LiteGraph.js supports several widget types:

1. **number**: Change a numeric value
   ```javascript
   this.addWidget("number", "Number", current_value, callback, { min: 0, max: 100, step: 1, precision: 3 });
   ```

2. **slider**: Change a value by dragging the mouse
   ```javascript
   this.addWidget("slider", "Slider", 0.5, callback, { min: 0, max: 1 });
   ```

3. **combo**: Select from multiple choices
   ```javascript
   // Simple array of options
   this.addWidget("combo", "Combo", "red", callback, { values: ["red", "green", "blue"] });
   
   // Object with title/value pairs
   this.addWidget("combo", "Combo", value1, callback, { values: { "title1": value1, "title2": value2 } });
   ```

4. **text**: Edit a short string
   ```javascript
   this.addWidget("text", "Name", "default text", callback);
   ```

5. **toggle**: Checkbox-like behavior
   ```javascript
   this.addWidget("toggle", "Active", true, callback);
   ```

6. **button**: Simple button
   ```javascript
   this.addWidget("button", "Click Me", null, callback);
   ```

### Widget Options

Common options for widgets:
- `property`: Name of a node property to modify when the widget changes
- `min`: Minimum value (for number and slider)
- `max`: Maximum value (for number and slider)
- `step`: Increment step (for number)
- `precision`: Number of digits after decimal point (for number)
- `callback`: Function to call when the value changes

### Widget Serialization

Widget values aren't serialized by default. To enable serialization:

```javascript
function MyNode() {
  this.addWidget("text", "name", "");
  this.serialize_widgets = true;
}
```

Or associate a widget with a node property:

```javascript
function MyNode() {
  this.properties = { surname: "smith" };
  this.addWidget("text", "Surname", "", { property: "surname" });
}
```

## Custom Widget Appearance

For custom widget drawing, you can use the `onDrawForeground` callback:

```javascript
node.onDrawForeground = function(ctx, graphcanvas) {
  if(this.flags.collapsed) return;
  ctx.save();
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 10, this.size[1]);
  ctx.restore();
}
```

## Limitations with Custom Widgets

As of March 2021, there are limitations with creating fully custom widgets beyond the built-in types. According to issue #209 in the GitHub repository, the system is limited to predefined widget types. The `addCustomWidget` function exists but has issues with prototype functions being lost during transformation.

For truly custom controls, you may need to bypass the widget system and implement drawing and interaction directly using the node's drawing callbacks (`onDrawBackground` or `onDrawForeground`) and mouse event callbacks.

## Resources

1. GitHub Repository: https://github.com/jagenjo/litegraph.js
2. Wiki on Creating Custom Nodes: https://github.com/jagenjo/litegraph.js/wiki/Creating-custom-Nodes
3. Guides: https://github.com/jagenjo/litegraph.js/blob/master/guides/README.md
4. Demo: https://tamats.com/projects/litegraph/

## Example Projects Using LiteGraph.js

- comfyUI
- webglstudio.org
- MOI Elephant
- Mynodes
