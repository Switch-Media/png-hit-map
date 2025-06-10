# PNG Hit Map Demo

A web application that demonstrates the functionality of the PNG Hit Map library with interactive pages for creating and testing hit maps for transparent PNG images.

## Features

- **Two Separate Pages**:
  - **Create Page**: For generating hit maps from transparent PNGs
  - **Verify Page**: For testing hit detection using the generated data
  
- **Visualization Tools**:
  - Grid overlay to see how the image is divided
  - Visual highlighting of hit and miss areas
  - Statistical analysis of the compressed data

## Getting Started

### Prerequisites

- Node.js 14+ and npm

### Installation

```bash
# Install dependencies
npm install
```

### Running the Demo

```bash
# Start the development server
npm start
```

Then open your browser to:
- Main page: http://localhost:3000
- Create page: http://localhost:3000/create.html
- Verify page: http://localhost:3000/verify.html

## How It Works

This demo application uses Express to serve static files and provides a dedicated route to access the PNG Hit Map library from the bundled version in `node_modules`. The demo imports the library directly from the distribution files:

```javascript
// In create.html and verify.html
import { createHitMap, testHit } from '/dist/index.esm.js';
```

## Usage Examples

1. **Creating a Hit Map**:
   - Upload a transparent PNG
   - Set the grid percentage (determines precision)
   - Generate the hit map
   - Copy the base64 output 

2. **Verifying Hit Detection**:
   - Paste the hit map data
   - Enter the original image dimensions
   - (Optional) Upload the image for reference
   - Click on the canvas to test hit detection

## Project Structure

```
png-hit-map-demo/
├── public/              # Static files
│   ├── index.html       # Landing page
│   ├── create.html      # Creation page
│   └── verify.html      # Verification page
├── server.js            # Express server
└── package.json         # Project configuration
```

## License

MIT License 