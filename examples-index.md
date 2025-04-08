# LiteGraph.js Examples Index

This index catalogs the examples created in our research on custom nodes and widgets for LiteGraph.js.

## Basic Widgets

| Widget Type | Description | Example |
|-------------|-------------|---------|
| number | Numeric input | `CalculatorNode`, `GraphWidgetNode`, `EventControlNode` |
| slider | Numeric input with slider | `ColorMixerNode` |
| combo | Dropdown selection | `CalculatorNode` (operation selection) |
| toggle | Boolean on/off switch | `CalculatorNode` (show result), `EventControlNode` (auto trigger) |
| button | Clickable button | `EventControlNode` (trigger now) |
| text | Text input | Not shown in examples, but supported |

## Custom Widget Implementations

| Widget | Description | Implementation Approach |
|--------|-------------|------------------------|
| Color Preview | Visual preview of a color | Uses `onDrawForeground` to draw a rectangle with the selected color |
| Custom Buttons | Custom buttons with hover states | Defines button areas in node constructor and handles mouse events |
| Graph Display | Line graph showing historical data | Uses canvas drawing in `onDrawForeground` and tracks data in properties |
| 2D Knob | XY coordinate selector with drag interaction | Implements drag handling with mouse events and custom drawing |
| Event Indicator | Visual feedback for triggered events | Uses temporary property and custom drawing to show feedback |

## Event Handling Examples

| Event | Usage | Example |
|-------|-------|---------|
| onMouseDown | Detect clicks on custom areas | `CustomButtonsNode`, `Knob2DNode` |
| onMouseMove | Track hover states, handle dragging | `CustomButtonsNode`, `Knob2DNode` |
| onMouseUp | Complete drag operations | `Knob2DNode` |
| onDrawForeground | Custom rendering | All examples |
| onExecute | Run node logic | All examples |

## Advanced Techniques

1. **Custom Visual Controls**: Implement by defining areas and handling mouse events
   - Example: `CustomButtonsNode` creates button areas and tracks clicks/hovers
   - Example: `Knob2DNode` implements draggable control for setting X/Y values

2. **Data Visualization**: Implement by storing data and drawing in `onDrawForeground`
   - Example: `GraphWidgetNode` keeps a history of values and renders a line graph

3. **Event Triggers**: Implement using LiteGraph's event system
   - Example: `EventControlNode` triggers events both manually and automatically

4. **Property Binding**: Link widget values to node properties
   - Example: All nodes demonstrate binding widgets to properties

5. **Interactive Feedback**: Visual feedback for user interactions
   - Example: Button hover states in `CustomButtonsNode`
   - Example: Flash effect in `EventControlNode`

## Best Practices

1. Always keep UI elements inside the node bounds (typically within `this.size`)
2. Track interaction areas for custom controls (e.g., button rectangles)
3. Use widget callbacks to update properties, not direct property changes
4. Return `true` from mouse handlers when you've handled the event
5. Store minimal necessary data in properties to keep serialization efficient
6. Use `onDrawForeground` for UI elements visible in both edit and live modes
7. Add visual feedback for interactive elements (hover states, selection indicators)

## Usage Instructions

To use these examples:
1. Copy the desired node class 
2. Uncomment the registration line at the end of each node class
3. Include the code in your LiteGraph.js application
4. The new node types will appear in the node creation menu

For more information, refer to the [LiteGraph.js documentation](https://github.com/jagenjo/litegraph.js) and the [Custom Nodes Wiki](https://github.com/jagenjo/litegraph.js/wiki/Creating-custom-Nodes).
