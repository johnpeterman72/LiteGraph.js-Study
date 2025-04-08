# Guide: Creating a Dynamic Input Node in litegraph.js

This guide will walk you through creating a custom node in `litegraph.js` that dynamically adds a new input when the last input is filled. This can be useful for creating nodes that can handle a variable number of inputs, depending on the user's connections.

## Prerequisites

Before you begin, make sure you have a basic understanding of:

* **JavaScript:** The primary language used for `litegraph.js`.
* **litegraph.js:** Familiarity with the core concepts of `litegraph.js`, such as nodes, inputs, outputs, and the graph canvas.

## The Problem

Sometimes, you might need a node in your visual graph editor that can accept a varying number of inputs. For example, you might want a node that combines multiple values, and the number of values to combine isn't fixed beforehand. Instead of predefining a large number of potential inputs, it's more user-friendly to add new inputs as the existing ones are connected.

## The Solution: A Custom Dynamic Input Node

We'll create a custom node class that extends `LGraphNode` and implements the logic to add new inputs dynamically.

```javascript
class DynamicInputNode extends LGraphNode {
  constructor() {
    super();
    this.title = "Dynamic Inputs";
    this.color = "#AA33AA";
    this.inputs = [["Input 1", ""]]; // Initialize with one input
    this.input_count = 1;
  }

  // This method is called when an input gets connected
  onInputConnected(slot, node, output_slot) {
    // Check if the connected slot is the last available input
    if (slot === this.input_count - 1) {
      // Add a new input
      this.addInput(`Input ${this.input_count + 1}`, "");
      this.input_count++;
      // Trigger a redraw of the canvas to show the new input
      this.setDirtyCanvas(true);
    }
  }

  // Optional: You might want to handle the case where an input is disconnected
  // onInputDisconnected(slot, node, output_slot) {
  //   // Implement logic here to remove inputs if needed potentially.
  // }

  // Optional: You might want to provide a method to get the data from the inputs
  onExecute() {
    this.inputs_data = [];
    for (let i = 0; i < this.inputs.length; ++i) {
      this.inputs_data.push(this.getInputData(i));
    }
    // You can now work with the this.inputs_data array
    // console.log("Input data:", this.inputs_data);
  }

  // Define the output if your node produces any
  // onGetOutput(slot) {
  //   return this.some_output_data;
  // }
}

// Register your custom node type with LiteGraph
LiteGraph.registerNodeType("my_nodes/dynamic_input", DynamicInputNode);
```

## Explanation of the Code

Let's break down the code step by step:

1.  **`class DynamicInputNode extends LGraphNode`**:
    * We define a new JavaScript class named `DynamicInputNode` that inherits from `LGraphNode`. This is the foundation for our custom node.

2.  **`constructor()`**:
    * `super();`: Calls the constructor of the parent class (`LGraphNode`) to initialize the base properties of the node.
    * `this.title = "Dynamic Inputs";`: Sets the title that will be displayed on the node in the editor.
    * `this.color = "#AA33AA";`: Sets the background color of the node for visual identification.
    * `this.inputs = [["Input 1", ""]];`: Initializes the node with a single input named "Input 1". The array structure `[["name", "type"]]` defines the input. An empty string for the type means it can accept any data type.
    * `this.input_count = 1;`: This variable keeps track of the current number of input slots the node has. We initialize it to 1 since we start with one input.

3.  **`onInputConnected(slot, node, output_slot)`**:
    * This is a crucial method in `litegraph.js`. It's a callback function that gets automatically called whenever an input on your node is successfully connected to the output of another node in the graph.
    * `slot`: This argument represents the index of the input slot that was just connected (starting from 0 for the first input).
    * `node`: This is the instance of the node that is providing the output connection.
    * `output_slot`: This is the index of the output slot on the providing node that was connected.
    * `if (slot === this.input_count - 1)`: This condition checks if the connected input is the last currently available input on our dynamic node. Since `this.input_count` holds the total number of inputs, the index of the last input is always `this.input_count - 1`.
    * `this.addInput(\`Input ${this.input_count + 1}\`, "");`: If the last input was connected, we call the `addInput()` method of the `LGraphNode` class to add a new input slot to our node. We dynamically name the new input as "Input 2", "Input 3", and so on.
    * `this.input_count++;`: We increment our `input_count` to reflect the addition of the new input.
    * `this.setDirtyCanvas(true);`: This is very important. After modifying the node's interface (by adding a new input), we need to tell the `litegraph.js` canvas that the node has changed and needs to be redrawn. This will make the newly added input visible in the editor.

4.  **`onInputDisconnected(slot, node, output_slot)` (Optional)**:
    * This method is the counterpart to `onInputConnected`. It's called when an input is disconnected. To keep the node tidy, you could implement logic here to remove inputs if the last one is disconnected. You would need to be careful about the logic for removing inputs, especially if data flow depends on the order of inputs.

5.  **`onExecute()` (Optional)**:
    * This method is called when the graph is being executed. Here, we demonstrate how you can access the data from all the dynamically added inputs.
    * We loop through the `this.inputs` array (which holds the definitions of all inputs) and use `this.getInputData(i)` to retrieve the data that is connected to each input slot. This data is then stored in the `this.inputs_data` array. You would typically perform your node's main logic within this method.

6.  **`onGetOutput(slot)` (Optional)**:
    * If your dynamic input node is also meant to produce some output based on the connected inputs, you would implement the `onGetOutput(slot)` method.

7.  **`LiteGraph.registerNodeType("my_nodes/dynamic_input", DynamicInputNode);`**:
    * This line is essential for making your custom node available in the `litegraph.js` editor.
    * `"my_nodes/dynamic_input"`: This is a unique string identifier for your node type. You can choose your own namespace and name for your node. Using a namespace (like `"my_nodes/"`) is common practice to organize your custom nodes.
    * `DynamicInputNode`: This is the constructor of the custom node class we defined.

## How to Use This Custom Node

To use this dynamic input node in your `litegraph.js` project, follow these steps:

1.  **Ensure litegraph.js is included:** Ensure you include the `litegraph.js` library in your HTML file.

2.  **Register the node:** Include the JavaScript code for the `DynamicInputNode` class in your script. This will automatically register the node type with `LiteGraph`.

3.  **Create a graph and canvas:** Set up your `LGraph` and `LGraphCanvas` instances as usual.

4.  **Create an instance of your dynamic node:**
    ```javascript
    const graph = new LiteGraph.LGraph();
    const canvas = new LiteGraph.LGraphCanvas("#mycanvas", graph);

    const dynamicNode = LiteGraph.createNode("my_nodes/dynamic_input");
    dynamicNode.pos = [100, 100]; // Set the position of the node
    graph.addNode(dynamicNode);
    ```

5.  **Connect to the inputs:** When you connect an output from another node to the first input of your "Dynamic Inputs" node, you will see that a second input automatically appears. This process will repeat each time you connect to the last available input on the node.

## Further Considerations

* **Removing Inputs:** The current implementation only adds inputs. To keep the node interface clean, you might want to implement the `onInputDisconnected` method to potentially remove inputs if the last one is disconnected. You would need to be careful about the logic for removing inputs, especially if data flow depends on the order of inputs.
* **Maximum Number of Inputs:** To prevent the node from growing indefinitely, you might want to set a maximum number of inputs that can be added. To enforce this limit, you can add a check in the `onInputConnected` method.
* **Input Types:** In this example, all inputs are of the generic type "". If needed, you could modify the `addInput()` calls to specify different input types.

This guide provides a solid foundation for creating dynamic input nodes in `litegraph.js`. You can adapt and extend this example to create more complex and flexible nodes for your visual graph editing applications.
