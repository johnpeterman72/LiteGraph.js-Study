# Guide to Multi-Value Passing and Unit Conversion in LiteGraph.js

When building node-based applications with LiteGraph.js, you'll often encounter scenarios where nodes need to exchange not just raw values but also contextual information such as units of measurement. This guide explores various approaches for passing multiple values between nodes and implementing automatic unit conversions, with practical examples focused on flow rate calculations.

## Table of Contents

1. [Understanding the Challenge](#understanding-the-challenge)
2. [Structured Data Objects Approach](#structured-data-objects-approach)
3. [Custom Connection Types Approach](#custom-connection-types-approach)
4. [Unit-Aware Node System Approach](#unit-aware-node-system-approach)
5. [Metadata Connections Approach](#metadata-connections-approach)
6. [Comparison Chart](#comparison-chart)
7. [Implementation Examples](#implementation-examples)
8. [Best Practices and Recommendations](#best-practices-and-recommendations)

## Understanding the Challenge

Consider a scenario where you have:

- A node calculating flow rate in cubic feet per minute (CFM)
- Another node that needs this flow rate value but works with metric units (m³/s)
- A single connection (noodle) between these nodes

The challenge is to:
1. Pass both the numerical value and unit information through a single connection
2. Implement automatic unit conversion in the receiving node
3. Maintain compatibility with existing nodes when possible
4. Provide a user-friendly way to control unit preferences

Let's explore different solutions to this challenge.

# Structured Data Objects Approach

The most straightforward approach is to pass JavaScript objects containing both the value and its metadata through connections.

### How It Works

Instead of passing raw numerical values, nodes exchange structured objects that include:
- The actual numerical value
- The unit of measurement
- Optional type information and additional metadata

### Implementation Example

```javascript
// Output from the CFM node
function FlowCalculatorNode() {
  this.addOutput("Flow", "object");
  this.properties = { unit: "cfm" };
}

FlowCalculatorNode.prototype.onExecute = function() {
  // Calculate flow rate
  let flowValue = /* calculation logic here */;
  
  // Create a data object with both value and unit
  this.setOutputData(0, {
    value: flowValue,
    unit: this.properties.unit,
    type: "flow_rate"
  });
};

// In the receiving node
function ProcessFlowNode() {
  this.addInput("Flow", "object");
  this.properties = { requiredUnit: "m3s" };
}

ProcessFlowNode.prototype.onExecute = function() {
  let flowData = this.getInputData(0);
  
  // Check if we have valid data with unit information
  if (flowData && flowData.unit) {
    // Convert if needed
    if (flowData.unit === "cfm" && this.properties.requiredUnit === "m3s") {
      const convertedValue = flowData.value * 0.00047194745;
      // Now use the converted value in calculations
    }
  }
};
```

### Pros and Cons

**Pros:**
- Clear structure with explicit unit information
- Extensible to include additional metadata (temperature, pressure, etc.)
- Receiving nodes can decide whether to convert or not
- Simple to implement and understand

**Cons:**
- Requires all connected nodes to understand this object structure
- Breaks compatibility with simple number-type connections
- Object creation slightly impacts performance
- No standard format without additional conventions

## Custom Connection Types Approach

LiteGraph.js allows defining custom connection types, which can be used to create specialized types that implicitly carry unit information.

### How It Works

This approach:
1. Registers a custom connection type (e.g., "flow_rate")
2. Defines compatibility rules for this type
3. Adds unit information to node properties rather than passing it through connections
4. Nodes use these properties to determine when conversion is needed

### Implementation Example

```javascript
// Register a custom connection type
LiteGraph.registerType("flow_rate", {
  isCompatibleWith: function(type) {
    return type === "number" || type === "flow_rate";
  }
});

// In the CFM node
function FlowRateCFMNode() {
  this.addOutput("Flow", "flow_rate");
  this.properties = { outputUnit: "cfm" };
}

FlowRateCFMNode.prototype.onExecute = function() {
  // Calculate CFM
  let cfm = /* calculation logic */;
  this.setOutputData(0, cfm);
};

// In the receiving node
function ProcessFlowNode() {
  this.addInput("Flow", "flow_rate");
  this.properties = { 
    inputUnit: "cfm", // Expected input unit
    workingUnit: "m3s" // Unit to work with internally
  };
}

ProcessFlowNode.prototype.onExecute = function() {
  let flow = this.getInputData(0);
  
  // Convert based on the expected input unit
  if (this.properties.inputUnit === "cfm" && this.properties.workingUnit === "m3s") {
    flow = flow * 0.00047194745;
  }
  
  // Continue with calculation using the converted value
};
```

### Pros and Cons

**Pros:**
- Maintains compatibility with number-type connections
- Node types can have default unit assumptions
- No overhead from passing objects
- Works with existing nodes that output numbers

**Cons:**
- No explicit unit information is passed
- Requires standardization of unit assumptions between nodes
- Less flexible for handling multiple unit types
- Conversion logic is duplicated across nodes

## Unit-Aware Node System Approach

This more comprehensive approach creates a system where nodes can negotiate units between them while maintaining a clean architecture.

### How It Works

This approach:
1. Creates a central unit conversion utility
2. Passes structured data objects with unit information
3. Implements a base class for unit-aware nodes
4. Provides widgets for users to select preferred units
5. Handles conversions transparently

### Implementation Example

```javascript
// Base class for unit-aware nodes
function UnitAwareNode() {
  this.unitConversions = {
    // Flow rate conversions
    "flow_rate": {
      "cfm_to_m3s": 0.00047194745,
      "m3s_to_cfm": 2118.88,
      // Add more conversions as needed
    }
  };
}

UnitAwareNode.prototype.convertUnit = function(value, fromUnit, toUnit, measurementType) {
  if (fromUnit === toUnit) return value;
  
  const conversionKey = fromUnit + "_to_" + toUnit;
  const conversionFactor = this.unitConversions[measurementType][conversionKey];
  
  if (conversionFactor !== undefined) {
    return value * conversionFactor;
  }
  
  console.warn(`No conversion from ${fromUnit} to ${toUnit} for ${measurementType}`);
  return value;
};

// Example flow rate node
function FlowRateNode() {
  UnitAwareNode.call(this); // Inherit from UnitAwareNode
  
  this.addOutput("Flow", "object");
  this.properties = { outputUnit: "cfm" };
  
  // Create a widget to select output unit
  this.addWidget("combo", "Output Unit", this.properties.outputUnit, (v) => {
    this.properties.outputUnit = v;
  }, { values: ["cfm", "m3s"] });
}

// Inherit from UnitAwareNode
FlowRateNode.prototype = Object.create(UnitAwareNode.prototype);

FlowRateNode.prototype.onExecute = function() {
  // Calculate the flow rate
  let flow = /* calculation */;
  
  // Output with unit information
  this.setOutputData(0, {
    value: flow,
    unit: this.properties.outputUnit,
    type: "flow_rate"
  });
};

// Example receiving node
function ProcessFlowNode() {
  UnitAwareNode.call(this);
  
  this.addInput("Flow", "object");
  this.properties = { workingUnit: "m3s" };
  
  this.addWidget("combo", "Working Unit", this.properties.workingUnit, (v) => {
    this.properties.workingUnit = v;
  }, { values: ["cfm", "m3s"] });
}

// Inherit from UnitAwareNode
ProcessFlowNode.prototype = Object.create(UnitAwareNode.prototype);

ProcessFlowNode.prototype.onExecute = function() {
  const flowData = this.getInputData(0);
  
  if (!flowData || typeof flowData.value !== "number") {
    return; // Handle missing or invalid input
  }
  
  // Automatically convert to the working unit
  const convertedValue = this.convertUnit(
    flowData.value, 
    flowData.unit, 
    this.properties.workingUnit,
    "flow_rate"
  );
  
  // Now use the converted value in calculations
};
```

### Pros and Cons

**Pros:**
- Comprehensive unit conversion system
- User control over units via widgets
- Maintains unit information throughout the graph
- Extensible to many measurement types
- Centralizes conversion logic

**Cons:**
- More complex implementation
- Requires a base class or mixin pattern
- Slightly higher complexity for node developers
- More resource-intensive than simpler approaches

## Metadata Connections Approach

This approach leverages LiteGraph's node connection metadata capabilities to pass unit information separately from values.

### How It Works

This approach:
1. Uses standard number connections for values
2. Stores metadata about outputs in the node
3. Provides methods to query this metadata
4. Receiving nodes check connection metadata to determine units

### Implementation Example

```javascript
function FlowRateCFMNode() {
  this.addOutput("Flow", "number");
  this.properties = { unit: "cfm" };
  
  // Store metadata about this output
  this.outputMetadata = [{ unit: "cfm", type: "flow_rate" }];
}

FlowRateCFMNode.prototype.getOutputInfo = function(slot) {
  return this.outputMetadata[slot];
};

// In the receiving node
function ProcessFlowNode() {
  this.addInput("Flow", "number");
  this.properties = { workingUnit: "m3s" };
}

ProcessFlowNode.prototype.onExecute = function() {
  const flow = this.getInputData(0);
  let convertedFlow = flow;
  
  // Get the connected node
  const inputLink = this.inputs[0].link;
  if (inputLink) {
    const graph = this.graph;
    const linkInfo = graph.links[inputLink];
    if (linkInfo) {
      const sourceNode = graph.getNodeById(linkInfo.origin_id);
      
      // Get metadata about the output
      const metadata = sourceNode.getOutputInfo(linkInfo.origin_slot);
      
      if (metadata && metadata.unit && metadata.unit !== this.properties.workingUnit) {
        // Perform conversion based on the metadata
        if (metadata.unit === "cfm" && this.properties.workingUnit === "m3s") {
          convertedFlow = flow * 0.00047194745;
        }
      }
    }
  }
  
  // Continue with the calculation
};
```

### Pros and Cons

**Pros:**
- Maintains simple number connections
- Works with existing nodes that expect numbers
- No overhead in the data transfer
- Unit information available through metadata

**Cons:**
- More complex to implement and maintain
- Requires querying the graph for connection information
- Less direct than passing structured data
- Possible edge cases with complex graph connections

## Comparison Chart

The following chart compares all four approaches across key factors:

| Factor | Structured Data Objects | Custom Connection Types | Unit-Aware Node System | Metadata Connections |
|--------|------------------------|------------------------|----------------------|---------------------|
| **Implementation Complexity** | Low | Medium | High | Medium-High |
| **Performance Impact** | Slight | Minimal | Moderate | Minimal |
| **Compatibility with Existing Nodes** | Poor | Good | Poor | Good |
| **Explicit Unit Information** | Yes | No | Yes | Yes |
| **User Control Over Units** | Possible | Possible | Built-in | Possible |
| **Extensibility** | Good | Limited | Excellent | Good |
| **Reusability** | Medium | Medium | High | Medium |
| **Visual Feedback** | Requires Implementation | Limited | Built-in | Requires Implementation |


## Implementation Examples

Let's look at a complete implementation example using the Unit-Aware Node System approach, which offers the best balance of features for most applications.

### Global Unit Conversion Utility

```javascript
// Create a global unit conversion utility
window.UnitConverter = {
  conversions: {
    "flow_rate": {
      "cfm_to_m3s": 0.00047194745,
      "m3s_to_cfm": 2118.88,
      "cfm_to_lps": 0.471947,
      "lps_to_cfm": 2.11888,
      "m3s_to_lps": 1000,
      "lps_to_m3s": 0.001
    },
    "temperature": {
      "c_to_f": function(c) { return c * 9/5 + 32; },
      "f_to_c": function(f) { return (f - 32) * 5/9; },
      "c_to_k": function(c) { return c + 273.15; },
      "k_to_c": function(k) { return k - 273.15; },
      "f_to_k": function(f) { return (f - 32) * 5/9 + 273.15; },
      "k_to_f": function(k) { return (k - 273.15) * 9/5 + 32; }
    },
    "length": {
      "m_to_ft": 3.28084,
      "ft_to_m": 0.3048,
      "m_to_in": 39.3701,
      "in_to_m": 0.0254,
      "ft_to_in": 12,
      "in_to_ft": 1/12
    },
    // Add other measurement types as needed
  },
  
  convert: function(value, fromUnit, toUnit, measurementType) {
    if (fromUnit === toUnit) return value;
    
    const convType = this.conversions[measurementType];
    if (!convType) {
      console.warn(`Unknown measurement type: ${measurementType}`);
      return value;
    }
    
    const conversionKey = `${fromUnit}_to_${toUnit}`;
    const conversion = convType[conversionKey];
    
    if (conversion !== undefined) {
      // Handle both function-based and factor-based conversions
      return typeof conversion === 'function' ? conversion(value) : value * conversion;
    }
    
    // Try to find a conversion path with one intermediate step
    for (const key in convType) {
      if (key.startsWith(fromUnit + "_to_")) {
        const intermUnit = key.split("_to_")[1];
        const step1 = convType[fromUnit + "_to_" + intermUnit];
        const step2Key = intermUnit + "_to_" + toUnit;
        const step2 = convType[step2Key];
        
        if (step1 && step2) {
          const interValue = typeof step1 === 'function' ? step1(value) : value * step1;
          return typeof step2 === 'function' ? step2(interValue) : interValue * step2;
        }
      }
    }
    
    console.warn(`No conversion from ${fromUnit} to ${toUnit} for ${measurementType}`);
    return value;
  },
  
  // Get available units for a measurement type
  getAvailableUnits: function(measurementType) {
    const units = new Set();
    const convType = this.conversions[measurementType];
    
    if (!convType) return [];
    
    for (const key in convType) {
      const [from, to] = key.split("_to_");
      units.add(from);
      units.add(to);
    }
    
    return Array.from(units);
  }
};
```

### Flow Rate Calculator Node

```javascript
function FlowRateCalculatorNode() {
  this.addInput("Area", "number");
  this.addInput("Velocity", "number");
  this.addOutput("Flow Rate", "object");
  
  this.properties = { 
    outputUnit: "cfm",
    areaUnit: "sqft",
    velocityUnit: "fpm"
  };
  
  // Add widgets for units
  this.addWidget("combo", "Output Unit", this.properties.outputUnit, (v) => {
    this.properties.outputUnit = v;
  }, { values: UnitConverter.getAvailableUnits("flow_rate") });
}

FlowRateCalculatorNode.prototype.onExecute = function() {
  const area = this.getInputData(0) || 0;
  const velocity = this.getInputData(1) || 0;
  
  // Calculate flow rate (area × velocity)
  const flowRate = area * velocity;
  
  // Create a data object with value and unit information
  this.setOutputData(0, {
    value: flowRate,
    unit: this.properties.outputUnit,
    type: "flow_rate",
    original: {
      area: area,
      areaUnit: this.properties.areaUnit,
      velocity: velocity,
      velocityUnit: this.properties.velocityUnit
    }
  });
};

// Optional: Custom drawing to show values
FlowRateCalculatorNode.prototype.onDrawBackground = function(ctx) {
  if (this.outputs[0].links && this.outputs[0].links.length) {
    ctx.font = "12px Arial";
    ctx.fillStyle = "#AAA";
    const flowData = this.getOutputData(0);
    if (flowData && typeof flowData.value === 'number') {
      ctx.fillText(`${flowData.value.toFixed(2)} ${flowData.unit}`, 10, this.size[1] - 10);
    }
  }
};
```

### Flow Consumer Node

```javascript
function MetricFlowConsumerNode() {
  this.addInput("Flow Rate", "object");
  this.addOutput("Processed Value", "number");
  
  this.properties = { 
    workingUnit: "m3s",
    showUnitConversion: true
  };
  
  // Add widget for selecting working unit
  this.addWidget("combo", "Working Unit", this.properties.workingUnit, (v) => {
    this.properties.workingUnit = v;
  }, { values: UnitConverter.getAvailableUnits("flow_rate") });
  
  // Flag to show unit conversion in the UI
  this.addWidget("toggle", "Show Conversion", this.properties.showUnitConversion, (v) => {
    this.properties.showUnitConversion = v;
  });
  
  // For displaying conversion info
  this.incomingUnit = "unknown";
  this.convertedValue = 0;
}

MetricFlowConsumerNode.prototype.onExecute = function() {
  const flowData = this.getInputData(0);
  
  if (!flowData || typeof flowData.value !== "number") {
    this.incomingUnit = "unknown";
    this.convertedValue = 0;
    this.setOutputData(0, 0);
    return;
  }
  
  this.incomingUnit = flowData.unit;
  
  // Automatically convert to the working unit
  this.convertedValue = UnitConverter.convert(
    flowData.value, 
    flowData.unit, 
    this.properties.workingUnit,
    "flow_rate"
  );
  
  // Use the converted value in your calculation
  const processedValue = this.convertedValue * 2; // Example calculation
  
  this.setOutputData(0, processedValue);
};

// Optional: Custom drawing to show conversion info
MetricFlowConsumerNode.prototype.onDrawBackground = function(ctx) {
  if (this.properties.showUnitConversion && this.incomingUnit !== "unknown") {
    ctx.font = "12px Arial";
    ctx.fillStyle = "#AAA";
    ctx.fillText(`Input: ${this.incomingUnit}`, 10, this.size[1] - 40);
    ctx.fillText(`Working: ${this.properties.workingUnit}`, 10, this.size[1] - 25);
    ctx.fillText(`Converted: ${this.convertedValue.toFixed(2)}`, 10, this.size[1] - 10);
  }
};

// Register nodes
LiteGraph.registerNodeType("flow/calculator", FlowRateCalculatorNode);
LiteGraph.registerNodeType("flow/consumer", MetricFlowConsumerNode);
```

## Best Practices and Recommendations

### When to Use Each Approach

1. **Structured Data Objects**:
   - For small to medium projects
   - When node compatibility isn't a major concern
   - When you need a quick, simple solution

2. **Custom Connection Types**:
   - When compatibility with existing number-based nodes is essential
   - For specialized domain-specific applications
   - When performance is critical

3. **Unit-Aware Node System**:
   - For medium to large projects
   - When building a comprehensive node library
   - When user experience and flexibility are priorities
   - When multiple measurement types and units are involved

4. **Metadata Connections**:
   - When you need both compatibility and unit awareness
   - In graphs with complex connection patterns
   - When extending an existing system without modifying core nodes

### Implementation Tips

1. **Standardize Data Structures**:
   - Define a consistent format for value-unit objects
   - Document the expected structure for other developers
   - Consider including a "type" field to identify measurement kinds

2. **Centralize Conversion Logic**:
   - Create a single source of truth for conversion factors
   - Use a utility object or class for conversions
   - Support multi-step conversions for uncommon unit pairs

3. **Provide Visual Feedback**:
   - Show unit information in the node UI
   - Highlight unit mismatches or conversions
   - Use node coloring or icons to indicate unit types

4. **Handle Edge Cases**:
   - Validate incoming data before attempting conversions
   - Provide graceful fallbacks for unknown units
   - Log warnings for impossible conversions

5. **Optimize for User Experience**:
   - Add unit selection widgets to nodes
   - Remember user preferences
   - Provide common unit presets

### Advanced Techniques

1. **Unit Negotiation**:
   Implement a system where nodes communicate to automatically select the most appropriate units:

   ```javascript
   MyGraph.prototype.afterChange = function() {
     // After connections change, run unit negotiation
     for (const id in this.nodes) {
       const node = this.nodes[id];
       if (node.negotiateUnits) {
         node.negotiateUnits();
       }
     }
   };
   ```

2. **Unit Validation**:
   Implement validation to prevent incompatible units from connecting:

   ```javascript
   MyCustomNode.prototype.onConnectInput = function(inputIndex, outputType, outputSlot, outputNode, outputIndex) {
     // Check if units are compatible
     if (outputNode.outputMetadata && outputNode.outputMetadata[outputIndex]) {
       const outputUnit = outputNode.outputMetadata[outputIndex].unit;
       const inputUnit = this.inputMetadata[inputIndex].unit;
       
       if (!this.areUnitsCompatible(outputUnit, inputUnit)) {
         return false; // Prevent connection
       }
     }
     return true; // Allow connection
   };
   ```

3. **Dynamic Unit Discovery**:
   Build a system that can detect and register available units at runtime:

   ```javascript
   function discoverAvailableUnits() {
     const units = {
       "flow_rate": new Set(),
       "temperature": new Set(),
       "length": new Set()
     };
     
     // Scan all registered node types
     for (const nodeType in LiteGraph.registered_node_types) {
       const node = LiteGraph.createNode(nodeType);
       if (node.availableUnits) {
         for (const type in node.availableUnits) {
           if (units[type]) {
             node.availableUnits[type].forEach(unit => units[type].add(unit));
           }
         }
       }
     }
     
     // Convert sets to arrays
     const result = {};
     for (const type in units) {
       result[type] = Array.from(units[type]);
     }
     
     return result;
   }
   ```

By implementing these techniques, your LiteGraph.js application can handle unit conversions seamlessly, improving user experience and reducing errors in calculations that span multiple units of measurement.
