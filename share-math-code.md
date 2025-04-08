# Guide to Sharing Mathematical Code Between LiteGraph.js Nodes

When developing math-heavy applications with LiteGraph.js, you'll often need consistent mathematical operations across multiple node types. This guide outlines several approaches for sharing mathematical code between custom nodes, with detailed examples and pros/cons for each method. By the end of this guide, you'll understand the trade-offs between different approaches and be able to select the best one for your specific project needs.

## Table of Contents

1. [Global Utility Object](#1-global-utility-object)
2. [LiteGraph Extensions](#2-litegraph-extensions)
3. [Module-based Approach](#3-module-based-approach)
4. [Prototype-based Inheritance](#4-prototype-based-inheritance)
5. [Dedicated Math Library Integration](#5-dedicated-math-library-integration)
6. [Factory Pattern for Math Nodes](#6-factory-pattern-for-math-nodes)
7. [Comparison Chart](#comparison-chart)
8. [Implementation Recommendations](#implementation-recommendations)

## 1. Global Utility Object

This approach creates a global JavaScript object that contains all shared mathematical functions, constants, and conversion utilities.

### Implementation Example

```javascript
// Create a global namespace for your application
window.MyApp = window.MyApp || {};

// Add a math utilities object
window.MyApp.MathUtils = {
  // Constants
  CONSTANTS: {
    PI: Math.PI,
    E: Math.E,
    GRAVITATIONAL_CONSTANT: 6.67430e-11,
    SPEED_OF_LIGHT: 299792458
  },
  
  // Basic math functions
  degToRad: function(degrees) {
    return degrees * (Math.PI / 180);
  },
  
  radToDeg: function(radians) {
    return radians * (180 / Math.PI);
  },
  
  roundToDecimalPlaces: function(value, places) {
    const factor = Math.pow(10, places);
    return Math.round(value * factor) / factor;
  },
  
  // More complex equations
  solveQuadratic: function(a, b, c) {
    const discriminant = b*b - 4*a*c;
    if (discriminant < 0) return null;
    
    const sqrtDiscriminant = Math.sqrt(discriminant);
    return [
      (-b + sqrtDiscriminant) / (2*a),
      (-b - sqrtDiscriminant) / (2*a)
    ];
  },
  
  // Vector operations
  vectorAdd: function(v1, v2) {
    return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
  },
  
  vectorDot: function(v1, v2) {
    return v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
  }
};

// Using in nodes
function QuadraticSolverNode() {
  this.addInput("a", "number");
  this.addInput("b", "number");
  this.addInput("c", "number");
  this.addOutput("Root 1", "number");
  this.addOutput("Root 2", "number");
}

QuadraticSolverNode.prototype.onExecute = function() {
  var a = this.getInputData(0) || 0;
  var b = this.getInputData(1) || 0;
  var c = this.getInputData(2) || 0;
  
  var roots = window.MyApp.MathUtils.solveQuadratic(a, b, c);
  
  if (roots) {
    this.setOutputData(0, roots[0]);
    this.setOutputData(1, roots[1]);
  } else {
    this.setOutputData(0, null);
    this.setOutputData(1, null);
  }
};

// Register node
LiteGraph.registerNodeType("math/quadratic_solver", QuadraticSolverNode);
```

### Pros

- **Simple Implementation**: Easy to set up and use immediately
- **Global Availability**: Functions accessible from anywhere in your application
- **No Build Tools Required**: Works without module bundlers or transpilers
- **Centralized Logic**: All math functions in one place for easy updates
- **Runtime Extensibility**: Can be extended at runtime (useful for plugins)

### Cons

- **Global Namespace Pollution**: Adds objects to global scope (potential conflicts)
- **No Encapsulation**: All functions are exposed to the global scope
- **Limited Organization**: Can become unwieldy as library grows
- **No Tree-Shaking**: All functions loaded regardless of what's used
- **Testing Challenges**: Global dependencies complicate unit testing

## 2. LiteGraph Extensions

This approach extends the LiteGraph library itself, adding methods directly to the LiteGraph object or the LGraphNode prototype.

### Implementation Example

```javascript
// Add utilities to LiteGraph
LiteGraph.MathUtils = {
  // Constants
  CONSTANTS: {
    GRAVITATIONAL_CONSTANT: 6.67430e-11,
    PLANCK_CONSTANT: 6.62607015e-34
  },
  
  // Static math utilities
  normalizeValue: function(value, min, max) {
    return (value - min) / (max - min);
  },
  
  interpolateValue: function(t, min, max) {
    return min + t * (max - min);
  }
};

// Add methods to node prototype (available in all nodes)
LiteGraph.LGraphNode.prototype.calculateDistance = function(point1, point2) {
  var dx = point2[0] - point1[0];
  var dy = point2[1] - point1[1];
  return Math.sqrt(dx*dx + dy*dy);
};

LiteGraph.LGraphNode.prototype.convertUnits = function(value, fromUnit, toUnit) {
  const conversionTable = {
    "m_to_ft": 3.28084,
    "ft_to_m": 0.3048,
    "kg_to_lb": 2.20462,
    "lb_to_kg": 0.453592
  };
  
  const conversionKey = fromUnit + "_to_" + toUnit;
  if (conversionTable[conversionKey]) {
    return value * conversionTable[conversionKey];
  }
  
  return value; // No conversion found
};

// Using in nodes
function DistanceNode() {
  this.addInput("Point 1", "array");
  this.addInput("Point 2", "array");
  this.addOutput("Distance", "number");
  this.addOutput("Distance (ft)", "number");
  
  this.properties = {
    outputUnit: "meters"
  };
  
  this.addWidget("combo", "Output Unit", this.properties.outputUnit, function(v) {
    this.properties.outputUnit = v;
  }.bind(this), { values: ["meters", "feet"] });
}

DistanceNode.prototype.onExecute = function() {
  var p1 = this.getInputData(0) || [0, 0];
  var p2 = this.getInputData(1) || [0, 0];
  
  var distance = this.calculateDistance(p1, p2);
  this.setOutputData(0, distance);
  
  if (this.properties.outputUnit === "feet") {
    var distanceInFeet = this.convertUnits(distance, "m", "ft");
    this.setOutputData(1, distanceInFeet);
  } else {
    this.setOutputData(1, distance);
  }
};

// Register node
LiteGraph.registerNodeType("math/distance", DistanceNode);
```

### Pros

- **Seamless Integration**: Methods feel like native LiteGraph features
- **Automatic Availability**: Node methods available to all nodes through prototype
- **No External Dependencies**: Everything stays within the LiteGraph ecosystem
- **Efficiency**: No need to reference external objects
- **Method Chaining**: Can be used in method chains with other LiteGraph functions

### Cons

- **Library Modification**: May cause issues when updating LiteGraph
- **Namespace Clashes**: Risk of conflicting with future LiteGraph features
- **Pollution of Node Prototype**: All nodes get all methods, even if not needed
- **Hidden Dependencies**: Not obvious which nodes use which extensions
- **Harder Maintenance**: Extensions spread across LiteGraph objects

## 3. Module-based Approach

This approach uses JavaScript modules (ES modules) to create importable utilities.

### Implementation Example

```javascript
// mathUtils.js
export const MathConstants = {
  PI: Math.PI,
  E: Math.E,
  GOLDEN_RATIO: 1.61803398875
};

export function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

export function radToDeg(radians) {
  return radians * (180 / Math.PI);
}

export function solveQuadratic(a, b, c) {
  const discriminant = b*b - 4*a*c;
  if (discriminant < 0) return null;
  
  const sqrtDiscriminant = Math.sqrt(discriminant);
  return [
    (-b + sqrtDiscriminant) / (2*a),
    (-b - sqrtDiscriminant) / (2*a)
  ];
}

// Additional specialized files
// vectorMath.js
export function dotProduct(v1, v2) {
  return v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
}

export function crossProduct(v1, v2) {
  return [
    v1[1]*v2[2] - v1[2]*v2[1],
    v1[2]*v2[0] - v1[0]*v2[2],
    v1[0]*v2[1] - v1[1]*v2[0]
  ];
}

// In your node file (TrigNode.js)
import { degToRad, radToDeg } from './mathUtils.js';

function TrigNode() {
  this.addInput("Angle", "number");
  this.addOutput("Sin", "number");
  this.addOutput("Cos", "number");
  this.addOutput("Tan", "number");
  
  this.properties = {
    inputMode: "degrees"
  };
  
  this.addWidget("combo", "Input Mode", this.properties.inputMode, 
    function(v) { this.properties.inputMode = v; }.bind(this), 
    { values: ["degrees", "radians"] });
}

TrigNode.prototype.onExecute = function() {
  var angle = this.getInputData(0) || 0;
  
  // Convert if needed
  if (this.properties.inputMode === "degrees") {
    angle = degToRad(angle);
  }
  
  this.setOutputData(0, Math.sin(angle));
  this.setOutputData(1, Math.cos(angle));
  this.setOutputData(2, Math.tan(angle));
};

// Register node
LiteGraph.registerNodeType("math/trigonometry", TrigNode);
```

### Pros

- **Modern JavaScript Approach**: Follows contemporary JS best practices
- **Proper Encapsulation**: Functions scoped to where they're used
- **Tree-Shaking Support**: Build tools can eliminate unused code
- **Organized Code Structure**: Clear separation of concerns into modules
- **Better Testing**: Easier to unit test isolated modules
- **IDE Support**: Better autocompletion and type inference

### Cons

- **Build Tools Required**: Needs module bundler (Webpack, Rollup, etc.)
- **Setup Complexity**: More initial configuration
- **Browser Compatibility**: May need transpilation for older browsers
- **Runtime Extension Challenges**: Harder to extend at runtime (for plugins)
- **Importing Overhead**: Need to import in each file where used

## 4. Prototype-based Inheritance

This approach creates base node classes that implement mathematical functionality, which concrete node types can then inherit from.

### Implementation Example

```javascript
// Create a base math node class
function BaseMathNode() {
  // Common initialization for all math nodes
  this.size = [120, 60];
  this.addProperty("precision", 2);
}

// Add common mathematical methods to the prototype
BaseMathNode.prototype.degToRad = function(degrees) {
  return degrees * (Math.PI / 180);
};

BaseMathNode.prototype.radToDeg = function(radians) {
  return radians * (180 / Math.PI);
};

BaseMathNode.prototype.roundToDecimalPlaces = function(value) {
  const factor = Math.pow(10, this.properties.precision);
  return Math.round(value * factor) / factor;
};

// Create specialized base classes for different math domains
function VectorMathNode() {
  BaseMathNode.call(this); // Call parent constructor
  this.addProperty("vectorSize", 3);
}

// Inherit from BaseMathNode
VectorMathNode.prototype = Object.create(BaseMathNode.prototype);
VectorMathNode.prototype.constructor = VectorMathNode;

// Add vector-specific methods
VectorMathNode.prototype.dotProduct = function(v1, v2) {
  let sum = 0;
  for (let i = 0; i < Math.min(v1.length, v2.length, this.properties.vectorSize); i++) {
    sum += v1[i] * v2[i];
  }
  return sum;
};

VectorMathNode.prototype.vectorMagnitude = function(v) {
  let sumOfSquares = 0;
  for (let i = 0; i < Math.min(v.length, this.properties.vectorSize); i++) {
    sumOfSquares += v[i] * v[i];
  }
  return Math.sqrt(sumOfSquares);
};

// Now create concrete node types that inherit from these base classes
function VectorDotProductNode() {
  VectorMathNode.call(this); // Call parent constructor
  
  this.addInput("Vector A", "array");
  this.addInput("Vector B", "array");
  this.addOutput("Dot Product", "number");
  this.addOutput("Normalized", "number");
}

// Inherit from VectorMathNode
VectorDotProductNode.prototype = Object.create(VectorMathNode.prototype);
VectorDotProductNode.prototype.constructor = VectorDotProductNode;

// Implement specific node behavior
VectorDotProductNode.prototype.onExecute = function() {
  const vecA = this.getInputData(0) || [0, 0, 0];
  const vecB = this.getInputData(1) || [0, 0, 0];
  
  // Use inherited methods from VectorMathNode
  const dotProduct = this.dotProduct(vecA, vecB);
  this.setOutputData(0, this.roundToDecimalPlaces(dotProduct));
  
  // Calculate normalized dot product
  const magA = this.vectorMagnitude(vecA);
  const magB = this.vectorMagnitude(vecB);
  
  if (magA > 0 && magB > 0) {
    const normalized = dotProduct / (magA * magB);
    this.setOutputData(1, this.roundToDecimalPlaces(normalized));
  } else {
    this.setOutputData(1, 0);
  }
};

// Register node
LiteGraph.registerNodeType("math/vector/dot_product", VectorDotProductNode);

// Create another concrete node that also inherits mathematical functionality
function AngleConversionNode() {
  BaseMathNode.call(this); // Call parent constructor
  
  this.addInput("Angle", "number");
  this.addOutput("Radians", "number");
  this.addOutput("Degrees", "number");
}

// Inherit from BaseMathNode
AngleConversionNode.prototype = Object.create(BaseMathNode.prototype);
AngleConversionNode.prototype.constructor = AngleConversionNode;

AngleConversionNode.prototype.onExecute = function() {
  const angle = this.getInputData(0) || 0;
  
  // Use inherited methods from BaseMathNode
  this.setOutputData(0, this.roundToDecimalPlaces(this.degToRad(angle)));
  this.setOutputData(1, this.roundToDecimalPlaces(angle));
};

// Register node
LiteGraph.registerNodeType("math/angle_conversion", AngleConversionNode);
```

### Pros

- **Clean Inheritance Hierarchy**: Organizes nodes by mathematical domain
- **Code Reusability**: Prevents duplication of common math code
- **Consistent Behavior**: Ensures all nodes handle calculations the same way
- **Property Inheritance**: Mathematical constants and settings can be inherited
- **Quick Implementation**: New math node types can be created quickly
- **Polymorphism**: Nodes from the same family can be used interchangeably

### Cons

- **Deep Inheritance Chains**: Can lead to complex inheritance hierarchies
- **Hidden Implementation**: Not always obvious where methods are defined
- **Rigid Structure**: Requires planning the hierarchy in advance
- **Memory Overhead**: All instances carry all methods, even if unused
- **Limited Multiple Inheritance**: JavaScript's prototype system only supports single inheritance
- **Versioning Challenges**: Changes to base classes affect all derived nodes

## 5. Dedicated Math Library Integration

This approach integrates a specialized third-party math library (like math.js, numeric.js, or three.js) into your LiteGraph.js nodes.

### Implementation Example

```javascript
// Assuming math.js is loaded or imported
// math.js provides powerful math functionality for complex calculations

// Create a wrapper to integrate math.js with LiteGraph nodes
const MathLibrary = {
  lib: math, // Reference to the math.js library
  
  // Helper methods for common operations with math.js
  createMatrix: function(rows, cols, defaultValue = 0) {
    return math.matrix(math.zeros(rows, cols).map(() => defaultValue));
  },
  
  solveSystem: function(coefficients, constants) {
    try {
      return math.lusolve(coefficients, constants);
    } catch (e) {
      console.error("Error solving system:", e);
      return null;
    }
  },
  
  evaluateExpression: function(expr, scope = {}) {
    try {
      const node = math.parse(expr);
      const compiled = node.compile();
      return compiled.evaluate(scope);
    } catch (e) {
      console.error("Error evaluating expression:", e);
      return null;
    }
  }
};

// Matrix Multiplication Node using math.js
function MatrixMultiplyNode() {
  this.addInput("Matrix A", "object");
  this.addInput("Matrix B", "object");
  this.addOutput("Result", "object");
  
  this.properties = {
    showDimensions: true
  };
  
  this.matrixADim = "N/A";
  this.matrixBDim = "N/A";
  this.resultDim = "N/A";
}

MatrixMultiplyNode.prototype.onExecute = function() {
  const matrixA = this.getInputData(0);
  const matrixB = this.getInputData(1);
  
  if (!matrixA || !matrixB) {
    this.matrixADim = "N/A";
    this.matrixBDim = "N/A";
    this.resultDim = "N/A";
    this.setOutputData(0, null);
    return;
  }
  
  try {
    // Use math.js library for matrix multiplication
    const result = math.multiply(matrixA, matrixB);
    
    // Update dimensions for display
    this.matrixADim = matrixA.size ? `${matrixA.size()[0]}×${matrixA.size()[1]}` : "N/A";
    this.matrixBDim = matrixB.size ? `${matrixB.size()[0]}×${matrixB.size()[1]}` : "N/A";
    this.resultDim = result.size ? `${result.size()[0]}×${result.size()[1]}` : "N/A";
    
    this.setOutputData(0, result);
  } catch (error) {
    console.error("Matrix multiplication error:", error);
    this.matrixADim = matrixA.size ? `${matrixA.size()[0]}×${matrixA.size()[1]}` : "N/A";
    this.matrixBDim = matrixB.size ? `${matrixB.size()[0]}×${matrixB.size()[1]}` : "N/A";
    this.resultDim = "Error";
    this.setOutputData(0, null);
  }
};

// Custom drawing function to show matrix dimensions
MatrixMultiplyNode.prototype.onDrawBackground = function(ctx) {
  if (this.properties.showDimensions) {
    ctx.font = "10px Arial";
    ctx.fillStyle = "#AAA";
    ctx.fillText(`A: ${this.matrixADim}`, 10, this.size[1] - 30);
    ctx.fillText(`B: ${this.matrixBDim}`, 10, this.size[1] - 20);
    ctx.fillText(`Result: ${this.resultDim}`, 10, this.size[1] - 10);
  }
};

// Register node
LiteGraph.registerNodeType("math/matrix/multiply", MatrixMultiplyNode);

// Expression Evaluator Node using math.js parser
function ExpressionNode() {
  this.addInput("x", "number");
  this.addInput("y", "number");
  this.addInput("z", "number");
  this.addOutput("Result", "number");
  
  this.properties = {
    expression: "sin(x) + cos(y) * z"
  };
  
  this.addWidget("text", "Expression", this.properties.expression, function(v) {
    this.properties.expression = v;
  }.bind(this));
}

ExpressionNode.prototype.onExecute = function() {
  const x = this.getInputData(0) || 0;
  const y = this.getInputData(1) || 0;
  const z = this.getInputData(2) || 0;
  
  // Use the helper method to evaluate the expression with math.js
  const result = MathLibrary.evaluateExpression(this.properties.expression, {
    x: x,
    y: y,
    z: z
  });
  
  this.setOutputData(0, result);
};

// Register node
LiteGraph.registerNodeType("math/expression", ExpressionNode);
```

### Pros

- **Advanced Capabilities**: Access to specialized mathematical functions
- **Optimized Performance**: Libraries often have optimized implementations
- **Broad Functionality**: Complete set of mathematical operations
- **Community Support**: Benefits from active development community
- **Consistent API**: Well-documented interfaces for mathematical operations
- **Domain Expertise**: Libraries implement complex algorithms correctly

### Cons

- **Additional Dependencies**: Increases project size and complexity
- **Learning Curve**: May require learning new APIs
- **Version Compatibility**: Library updates may break integration
- **Performance Overhead**: May be overkill for simple calculations
- **Integration Effort**: Requires wrapper code to adapt to LiteGraph
- **Bundle Size**: Can significantly increase application size

## 6. Factory Pattern for Math Nodes

This approach uses factory functions to create node types with shared mathematical functionality.

### Implementation Example

```javascript
// Math node factory - creates node types with consistent math capabilities
const MathNodeFactory = {
  // Internal utilities used by generated nodes
  _utils: {
    degToRad: function(degrees) {
      return degrees * (Math.PI / 180);
    },
    
    radToDeg: function(radians) {
      return radians * (180 / Math.PI);
    },
    
    round: function(value, decimals) {
      const factor = Math.pow(10, decimals);
      return Math.round(value * factor) / factor;
    }
  },
  
  // Factory method for creating trigonometric function nodes
  createTrigNode: function(funcName, title) {
    const nodeType = funcName.toLowerCase();
    const mathFunc = Math[funcName.toLowerCase()];
    
    if (!mathFunc) {
      console.error(`Math function ${funcName} not found`);
      return null;
    }
    
    // Create constructor for the node
    function TrigNode() {
      this.addInput("Angle", "number");
      this.addOutput(title || funcName, "number");
      
      this.properties = {
        inputMode: "degrees",
        decimals: 2
      };
      
      this.addWidget("combo", "Input Mode", this.properties.inputMode, 
        (v) => { this.properties.inputMode = v; }, 
        { values: ["degrees", "radians"] });
        
      this.addWidget("number", "Decimals", this.properties.decimals, 
        (v) => { this.properties.decimals = v; });
    }
    
    // Define the execution logic using the utility functions
    TrigNode.prototype.onExecute = function() {
      let angle = this.getInputData(0) || 0;
      
      // Convert if needed using the utility function
      if (this.properties.inputMode === "degrees") {
        angle = MathNodeFactory._utils.degToRad(angle);
      }
      
      // Compute using the specified Math function
      const result = mathFunc(angle);
      
      // Round the result using utility function
      const rounded = MathNodeFactory._utils.round(result, this.properties.decimals);
      
      this.setOutputData(0, rounded);
    };
    
    // Register the node type
    LiteGraph.registerNodeType(`math/trig/${nodeType}`, TrigNode);
    
    // Return the constructor for potential further extension
    return TrigNode;
  },
  
  // Factory method for creating statistic nodes
  createStatsNode: function(mode, title) {
    // Define the computation function based on mode
    let computeFunc;
    
    switch (mode) {
      case "mean":
        computeFunc = function(values) {
          return values.reduce((sum, val) => sum + val, 0) / values.length;
        };
        break;
      case "median":
        computeFunc = function(values) {
          const sorted = [...values].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          return sorted.length % 2 === 0 
            ? (sorted[mid - 1] + sorted[mid]) / 2 
            : sorted[mid];
        };
        break;
      case "min":
        computeFunc = function(values) {
          return Math.min(...values);
        };
        break;
      case "max":
        computeFunc = function(values) {
          return Math.max(...values);
        };
        break;
      default:
        console.error(`Unknown statistics mode: ${mode}`);
        return null;
    }
    
    // Create constructor for the node
    function StatsNode() {
      this.addInput("Values", "array");
      this.addOutput(title || mode, "number");
      
      this.properties = {
        decimals: 2
      };
      
      this.addWidget("number", "Decimals", this.properties.decimals, 
        (v) => { this.properties.decimals = v; });
    }
    
    // Define the execution logic
    StatsNode.prototype.onExecute = function() {
      const values = this.getInputData(0);
      
      if (!values || !Array.isArray(values) || values.length === 0) {
        this.setOutputData(0, null);
        return;
      }
      
      // Compute the statistic using the function for this mode
      const result = computeFunc(values);
      
      // Round the result
      const rounded = MathNodeFactory._utils.round(result, this.properties.decimals);
      
      this.setOutputData(0, rounded);
    };
    
    // Register the node type
    LiteGraph.registerNodeType(`math/stats/${mode}`, StatsNode);
    
    // Return the constructor
    return StatsNode;
  }
};

// Use the factory to create multiple node types at once
MathNodeFactory.createTrigNode("sin", "Sine");
MathNodeFactory.createTrigNode("cos", "Cosine");
MathNodeFactory.createTrigNode("tan", "Tangent");

MathNodeFactory.createStatsNode("mean", "Average");
MathNodeFactory.createStatsNode("median", "Median");
MathNodeFactory.createStatsNode("min", "Minimum");
MathNodeFactory.createStatsNode("max", "Maximum");

// Creating a custom node type with factory utilities
function CustomMathNode() {
  this.addInput("Value A", "number");
  this.addInput("Value B", "number");
  this.addOutput("Result", "number");
  
  this.properties = {
    operation: "multiply",
    decimals: 2
  };
  
  this.addWidget("combo", "Operation", this.properties.operation, 
    (v) => { this.properties.operation = v; }, 
    { values: ["add", "subtract", "multiply", "divide", "power"] });
}

CustomMathNode.prototype.onExecute = function() {
  const a = this.getInputData(0) || 0;
  const b = this.getInputData(1) || 0;
  
  let result;
  
  // Perform the selected operation
  switch (this.properties.operation) {
    case "add": result = a + b; break;
    case "subtract": result = a - b; break;
    case "multiply": result = a * b; break;
    case "divide": result = b !== 0 ? a / b : Infinity; break;
    case "power": result = Math.pow(a, b); break;
  }
  
  // Use the factory's utility functions
  result = MathNodeFactory._utils.round(result, this.properties.decimals);
  
  this.setOutputData(0, result);
};

// Register the custom node
LiteGraph.registerNodeType("math/custom", CustomMathNode);
```

### Pros

- **Efficient Node Creation**: Easily create families of related math nodes
- **Consistent Behavior**: All nodes created by the same factory share behavior
- **Centralized Logic**: Math algorithms defined in one place
- **Easy to Extend**: Add new node types by adding factory methods
- **Reduced Duplication**: Core math code shared among node types
- **Single Source of Truth**: Changes to math logic apply to all generated nodes

### Cons

- **Abstraction Complexity**: Factory pattern adds a layer of indirection
- **Limited Flexibility**: Nodes created by factories may be less customizable
- **Complex Setup**: Requires more initial planning and architecture
- **Harder Debugging**: Stack traces can be more difficult to follow
- **Performance Overhead**: Small overhead due to multiple function calls
- **Tight Coupling**: Changes to factory can affect all generated nodes at once
- **Code Discoverability**: Less obvious where functionality comes from when inspecting nodes

## 7. Comparison Chart

The following chart compares all six approaches across key factors to help you choose the most appropriate method for your project:

| Factor | Global Utility | LiteGraph Extension | Module-based | Prototype Inheritance | Math Library | Factory Pattern |
|--------|---------------|---------------------|--------------|----------------------|--------------|-----------------|
| **Setup Complexity** | Low | Low | Medium | Medium | High | High |
| **Code Reusability** | Medium | Medium | High | High | High | Very High |
| **Maintenance** | Medium | Difficult | Easy | Medium | Easy | Easy |
| **Performance** | Good | Excellent | Good | Good | Variable | Good |
| **Bundle Size Impact** | Low | None | Low | Low | High | Low |
| **Testing Ease** | Difficult | Difficult | Easy | Medium | Medium | Medium |
| **Encapsulation** | Poor | Poor | Excellent | Good | Good | Good |
| **Dependencies** | None | None | Build tools | None | External library | None |
| **Flexibility** | Medium | Low | High | Medium | High | Medium |
| **Runtime Extension** | Easy | Easy | Difficult | Medium | Difficult | Medium |
| **Suitable Project Size** | Small | Small-Medium | Medium-Large | Medium-Large | Large | Medium-Large |

## 8. Implementation Recommendations

Based on the comparison of these approaches, here are some recommendations for different project scenarios:

### For Small Projects or Prototypes

**Recommendation**: Global Utility Object or LiteGraph Extensions

**Reasoning**: These approaches are quick to set up and require minimal configuration. For small projects with a limited number of mathematical operations, the drawbacks of global scope pollution or prototype modification are usually outweighed by the simplicity of implementation.

**Example Use Case**: A simple data visualization tool with basic math operations or a proof-of-concept node editor with limited functionality.

### For Medium-sized Projects

**Recommendation**: Module-based Approach or Prototype-based Inheritance

**Reasoning**: As projects grow, proper code organization becomes more important. The module-based approach provides clean encapsulation and is easy to test, while prototype inheritance creates a natural hierarchy for related mathematical nodes.

**Example Use Case**: A specialized engineering application with multiple related mathematical computations or a scientific visualization tool with various calculation nodes.

### For Large-scale Applications

**Recommendation**: Math Library Integration (with Module-based organization) or Factory Pattern

**Reasoning**: Large applications benefit from specialized libraries that provide optimized implementations of complex algorithms. The factory pattern also scales well for creating families of related node types with consistent behavior.

**Example Use Case**: A comprehensive simulation environment, data analysis platform, or computational modeling application.

### For Projects That Will Grow Over Time

**Recommendation**: Start with Module-based Approach, then add Factory Pattern as needed

**Reasoning**: The module-based approach provides a solid foundation with good encapsulation, and factories can be introduced later to generate families of related nodes without changing the overall architecture.

**Example Use Case**: A node-based visual programming environment that will expand to include more mathematical domains over time.

### For Projects Focused on Performance

**Recommendation**: LiteGraph Extensions or Dedicated Math Library

**Reasoning**: LiteGraph extensions have minimal overhead since they're directly integrated into the library. For complex calculations, a specialized math library will often have highly optimized algorithms that outperform custom implementations.

**Example Use Case**: Real-time signal processing, physics simulations, or other computation-heavy applications.

### For Teams with Varying Skill Levels

**Recommendation**: Factory Pattern with clear documentation

**Reasoning**: The factory pattern centralizes complex mathematical logic while providing a simple interface for creating new node types. This allows team members with less experience to create nodes without duplicating or reimplementing complex algorithms.

**Example Use Case**: An open-source project with multiple contributors or an educational platform where instructors can create new node types.
