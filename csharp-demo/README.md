# Sharp PNG Hit Map

A C# implementation of the PNG Hit Map library for efficient hit detection in transparent PNG images. Create compact binary hit maps that allow for fast point-in-shape testing without analyzing the full image at runtime.

## Installation

```bash
dotnet add package SharpPNGHitMap
```

## Key Features

- **Pure Binary Format**: Extremely compact binary data representation with minimal overhead
- **Run-Length Encoding (RLE)**: Specialized for binary data with alternating run values
- **Variable-Length Encoding**: Short runs take just 1 byte, long runs (≥255) take 5 bytes
- **Maximum Efficiency**: Approaches the theoretical minimum size

## Basic Usage

```csharp
using SharpPNGHitMap;

// Create image info
var imageInfo = new ImageInfo(1024, 1024);

// Test if a point hits a non-transparent part (coordinates as percentages)
string hitMapData = "BQAJAxEFDggNCAsMCQwKCwoKCwoLCgsKCwoLCgsKDAkMCQwJDAkMCA0IHA==";
bool isHit = PNGHitMap.TestHit(hitMapData, 82.60, 8.30, imageInfo);
```

## API Reference

### Core Functions

#### `TestHit(hitMapData, x, y, imageInfo)`

Tests if a point hits a non-transparent part.

- **Parameters**:
  - `hitMapData`: Hit map as string (base64) or byte array
  - `x`, `y`: Coordinates as percentages (0-100) of image dimensions
  - `imageInfo`: Object with `Width` and `Height` of the original image
- **Returns**: Boolean indicating whether the point hits a non-transparent part

## Command Line Tool

The package includes a command-line tool for testing hit detection:

```bash
dotnet run -- <hitMapBase64> <x> <y> <width> <height>
```

Example:
```bash
dotnet run -- "BQAJAxEFDggNCAsMCQwKCwoKCwoLCgsKCwoLCgsKDAkMCQwJDAkMCA0IHA==" 82.60 8.30 1024 1024
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

## Requirements

- .NET 6.0 or later

## License

MIT License 