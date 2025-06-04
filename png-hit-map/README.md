# PNG Hit Map

A lightweight JavaScript library for efficient hit detection in transparent PNG images. Create compact binary hit maps that allow for fast point-in-shape testing without analyzing the full image at runtime.

## Installation

```bash
npm install png-hit-map
```

## Key Features

- **Pure Binary Format**: Extremely compact binary data representation with minimal overhead
- **Run-Length Encoding (RLE)**: Specialized for binary data with alternating run values
- **Variable-Length Encoding**: Short runs take just 1 byte, long runs (≥255) take 5 bytes
- **Maximum Efficiency**: Approaches the theoretical minimum size 

## Basic Usage

```javascript
import { createHitMap, testHit } from 'png-hit-map';

// Create a hit map from an image
const imgElement = document.getElementById('myImage');
const hitMapData = await createHitMap(imgElement);

// Store image dimensions with the hit map
const imageInfo = { 
  width: imgElement.width, 
  height: imgElement.height 
};

// Test if a point hits a non-transparent part (coordinates as percentages)
const isHit = testHit(hitMapData, 25, 50, imageInfo); // Test at 25% from left, 50% from top
```

## API Reference

### Core Functions

#### `createHitMap(image, options)`

Creates a binary hit map from a PNG image.

- **Parameters**:
  - `image`: HTMLImageElement or URL string
  - `options`: (Optional) Configuration object 
    - `gridPercent`: Grid cell size as percentage (default: 1)
    - `base64Output`: Whether to output as base64 (default: true)
- **Returns**: Promise resolving to hit map data (ArrayBuffer or base64 string)

#### `testHit(hitMapData, x, y, imageInfo)`

Tests if a point hits a non-transparent part.

- **Parameters**:
  - `hitMapData`: Hit map as ArrayBuffer or base64 string
  - `x`, `y`: Coordinates as percentages (0-100) of image dimensions
  - `imageInfo`: Object with `width` and `height` of the original image
- **Returns**: Boolean indicating whether the point hits a non-transparent part

### Visualization Tools

The package also includes optional visualization tools (not required for production):

```javascript
import { visualTools } from 'png-hit-map';

// Visualize the hit map on a canvas
visualTools.visualizeGrid(canvasElement, hitMapData, imageInfo, {
  showGrid: true,
  fillColor: 'rgba(0, 255, 0, 0.2)'
});
```

## How It Works

1. **Grid Creation**: The image is divided into a grid, with each cell marked as 0 (transparent) or 1 (has non-transparent pixels)
2. **Run-Length Encoding**: The grid is compressed as a sequence of alternating runs (0→1→0→1...)
3. **Binary Format**: 
   - First byte: Grid percentage (0-100)
   - Second byte: Starting value (0 or 1)
   - Remaining bytes: Run lengths with variable encoding
4. **Hit Detection**: When testing a hit, the system:
   - Converts the click coordinates to a grid cell
   - Determines which run contains the cell
   - Returns whether that run represents a transparent or non-transparent region

## Browser Compatibility

The library works in all modern browsers that support:
- Canvas API
- ArrayBuffer
- DataView

## Node.js Usage

While the primary use case is in browsers, the `testHit` function can be used in Node.js environments. The `createHitMap` function requires a browser environment with Canvas support.

## License

MIT License 