# LiteGraph.js Research Summary

## Overview

This document summarizes our research on LiteGraph.js, focusing on creating custom nodes and interactive controls (widgets). LiteGraph.js is a JavaScript library for creating node-based graphs similar to Unreal Blueprints or PureData, with a canvas-based editor and an execution engine.

## Key Findings

### 1. Node Creation System

LiteGraph.js provides a flexible system for creating custom nodes:

- Nodes are created as JavaScript constructor functions
- Node behavior is defined through prototype methods
- Nodes are registered to make them available in the editor
- Nodes can have inputs, outputs, properties, and interactive widgets

The system follows a pattern similar to:

```javascript
function MyCustomNode() {
  // Define inputs/outputs
  this.addInput("Input", "number");
  this.addOutput("Output", "number");
  
  // Define properties
  this.properties = { value: 10 };
  
  // Add widgets
  this.addWidget("number", "Value", this.properties.value, callback);
}

// Register node
LiteGraph.registerNodeType("category/my_node", MyCustomNode);
```

### 2. Built-in Widget Types

LiteGraph.js includes several built-in widget types:

- **number**: Numeric input field
- **slider**: Slider control for numeric values
- **combo**: Dropdown selection
- **text**: Text input field
- **toggle**: Boolean on/off switch
- **button**: Clickable button

These widgets provide basic interactivity and can be linked to node properties.

### 3. Widget Limitations

While LiteGraph.js provides a widget system, it has some limitations:

- Limited to the predefined widget types
- No direct way to create completely custom widget types
- The `addCustomWidget` function exists but has prototype inheritance issues
- Complex UI elements require bypassing the widget system

### 4. Custom UI Implementation

For truly custom controls, we found that the best approach is to:

1. Use custom drawing via `onDrawForeground` or `onDrawBackground`
2. Handle mouse interactions with `onMouseDown`, `onMouseMove`, etc.
3. Track interaction areas manually
4. Manage state through node properties

This approach allows for creating any type of custom control, from buttons to complex interactive visualizations.

### 5. Event System

LiteGraph.js includes an event system for triggering actions between nodes:

- Use `LiteGraph.ACTION` type for input slots that receive events
- Use `LiteGraph.EVENT` type for output slots that trigger events
- Implement `onAction` to handle incoming events
- Use `triggerSlot` to send events to connected nodes

This system enables creating workflow-based applications where nodes can trigger each other without continuous data flow.

### 6. Custom Drawing

The library provides powerful custom drawing capabilities:

- `onDrawBackground`: For drawing content only visible in edit mode
- `onDrawForeground`: For drawing content visible in both edit and live modes
- Access to the standard Canvas2D API for rendering
- Local coordinate system with (0,0) at the top-left of the node content area

These capabilities allow for creating rich visualizations, custom controls, and data previews within nodes.

### 7. Mouse Interaction

Nodes can handle mouse interactions through callback methods:

- `onMouseDown`: Called when mouse button is pressed on the node
- `onMouseMove`: Called when mouse moves over the node
- `onMouseUp`: Called when mouse button is released
- `onMouseEnter`/`onMouseLeave`: Called when mouse enters/leaves node area
- `onDblClick`: Called on double-click

These callbacks receive the event, local position, and graph canvas instance, enabling complex interactive elements.

### 8. Node State and Serialization

Node state is managed through:

- `properties`: Object containing serializable properties
- `serialize_widgets`: Boolean flag to include widget values in serialization
- `onSerialize`/`onConfigure`: Optional methods for custom serialization logic

By default, widget values aren't serialized unless the widget is linked to a property or `serialize_widgets` is set to true.

## Best Practices

Based on our research, we recommend the following best practices for creating custom nodes with interactive controls:

1. **Use built-in widgets when possible** - They're optimized and integrate well with the system

2. **Link widgets to properties** - This simplifies state management and serialization

3. **For custom controls:**
   - Define clear interaction areas
   - Implement all relevant mouse handlers
   - Provide visual feedback for interactions
   - Constrain interaction to node boundaries

4. **For complex visualizations:**
   - Use efficient data structures
   - Optimize drawing routines
   - Consider throttling or buffering frequent updates
   - Use clipping to prevent drawing outside node bounds

5. **Node design:**
   - Keep nodes focused on a single purpose
   - Provide clear visual feedback about node state
   - Use consistent visual language across custom nodes
   - Set appropriate node size to accommodate controls

## Challenges

1. **Limited Widget Customization**: The built-in widget system doesn't provide a direct way to create fully custom widget types

2. **Documentation Gaps**: While the basic documentation is good, some advanced features aren't well documented

3. **Custom Widget Inheritance**: The `addCustomWidget` function has issues with prototype methods being lost

4. **Complex UI Elements**: Creating complex UI elements requires managing interaction and drawing manually

5. **Mobile Support**: Touch interaction handling requires additional consideration

## Examples Created

As part of our research, we created several example custom nodes demonstrating different widget and interaction techniques:

1. **CalculatorNode**: Basic widget usage with combo and toggle widgets
2. **ColorMixerNode**: Slider widgets with custom color preview
3. **CustomButtonsNode**: Custom buttons with hover states
4. **GraphWidgetNode**: Complex data visualization widget
5. **Knob2DNode**: Custom XY control with drag interaction
6. **EventControlNode**: Event triggering with visual feedback

These examples cover most common use cases for custom widgets and can serve as starting points for more specific implementations.

## Resources

- [GitHub Repository](https://github.com/jagenjo/litegraph.js)
- [Creating Custom Nodes Wiki](https://github.com/jagenjo/litegraph.js/wiki/Creating-custom-Nodes)
- [Guides Documentation](https://github.com/jagenjo/litegraph.js/blob/master/guides/README.md)
- [Demo Site](https://tamats.com/projects/litegraph/)

## Projects Using LiteGraph.js

- comfyUI
- webglstudio.org
- MOI Elephant
- Mynodes

## Conclusion

LiteGraph.js provides a solid foundation for creating node-based graph editors with custom nodes and interactive controls. While the built-in widget system has limitations for highly custom interfaces, the combination of custom drawing and mouse interaction callbacks enables creating virtually any type of control. 

The library is well-suited for workflow editors, visual programming tools, and data processing applications. With the right approach to creating custom nodes and widgets, it's possible to build sophisticated and user-friendly graph-based applications.
