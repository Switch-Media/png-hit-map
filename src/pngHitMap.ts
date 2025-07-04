/**
 * PNG Hit Map Core - Minimal library for creating and testing hit areas from PNG images
 * Production-ready module with only essential functions
 */

// Type definitions
export interface HitMapOptions {
  gridPercent?: number;
  base64Output?: boolean;
}

export interface ImageInfo {
  width: number;
  height: number;
}

/**
 * Environment detection to handle browser/node differences
 */
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const isNode = typeof process !== "undefined" && !!process.versions && !!process.versions.node;

/**
 * Creates a hit map from a PNG image by analyzing non-transparent pixels
 * and converting them to a compressed binary representation using RLE
 */

export async function createHitMap(
  image: HTMLImageElement | string | Buffer,
  options: HitMapOptions = {}
): Promise<ArrayBuffer | string> {
  const gridPercent = options.gridPercent || 1;
  const base64Output = options.base64Output !== false;

  let width: number;
  let height: number;
  let data: Uint8Array;

  if (isBrowser) {
    let imgElement: HTMLImageElement = image as HTMLImageElement;
    if (typeof image === 'string') {
      imgElement = await loadImage(image);
    }
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    ctx.drawImage(imgElement, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    data = new Uint8Array(imageData.data.buffer);
    width = canvas.width;
    height = canvas.height;
  } else if (isNode) {
    const { PNG } = await import('pngjs');
    const fs = await import('fs');
    let buffer: Buffer;
    if (typeof image === 'string') {
      buffer = await fs.promises.readFile(image);
    } else if (image instanceof Uint8Array || Buffer.isBuffer(image)) {
      buffer = Buffer.from(image as any);
    } else {
      throw new Error('Image must be a file path or Buffer in Node.js');
    }
    const png = PNG.sync.read(buffer);
    width = png.width;
    height = png.height;
    data = png.data;
  } else {
    throw new Error('Unsupported environment for createHitMap');
  }

  const gridSizeX = Math.max(1, Math.floor((gridPercent / 100) * width));
  const gridSizeY = Math.max(1, Math.floor((gridPercent / 100) * height));
  const gridWidth = Math.ceil(width / gridSizeX);
  const gridHeight = Math.ceil(height / gridSizeY);
  const grid = new Uint8Array(gridWidth * gridHeight);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const alpha = data[index + 3];

      if (alpha > 0) {
        const gridX = Math.floor(x / gridSizeX);
        const gridY = Math.floor(y / gridSizeY);
        grid[gridY * gridWidth + gridX] = 1;
      }
    }
  }

  if (isBrowser && (window as any)._pngHitMapVisualization) {
    (window as any)._pngHitMapMetadata = {
      width,
      height,
      gridSizeX,
      gridSizeY,
      gridWidth,
      gridHeight
    };
  }

  const binaryData = compressGridRLEBinary(grid, gridPercent);

  if (base64Output) {
    return arrayBufferToBase64(binaryData);
  } else {
    return binaryData;
  }
}
/**
 * Compress grid data using run-length encoding and output as binary data
 */
function compressGridRLEBinary(grid: Uint8Array, gridPercent: number): ArrayBuffer {
  // Analyze the grid to determine run lengths
  const runLengths: number[] = [];
  let currentValue = grid[0]; // Start with the first value
  let currentRunLength = 1;
  
  // Process the entire grid as a 1D array
  for (let i = 1; i < grid.length; i++) {
    if (grid[i] === currentValue) {
      // Extend current run
      currentRunLength++;
    } else {
      // Save current run and start a new one
      runLengths.push(currentRunLength);
      currentValue = grid[i];
      currentRunLength = 1;
    }
  }
  
  // Add the last run
  runLengths.push(currentRunLength);
  
  // Create binary data
  // Format: 
  // - Byte 0: Grid percentage (0-100)
  // - Byte 1: Starting value (0 or 1)
  // - Remaining bytes: Run lengths (variable encoding)
  
  // Calculate the required buffer size
  let bufferSize = 2; // First byte for grid percentage, second for starting value
  for (const length of runLengths) {
    bufferSize += length < 255 ? 1 : 5; // 1 byte or 5 bytes
  }
  
  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);
  
  // Write grid percentage
  view.setUint8(0, Math.round(gridPercent));
  
  // Write starting value
  view.setUint8(1, grid[0]);
  
  // Write run lengths
  let offset = 2;
  for (const length of runLengths) {
    if (length < 255) {
      view.setUint8(offset, length);
      offset += 1;
    } else {
      view.setUint8(offset, 0xFF); // Marker for long run
      offset += 1;
      view.setUint32(offset, length, true); // Little endian
      offset += 4;
    }
  }
  
  return buffer;
}

/**
 * Convert an ArrayBuffer to a base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  if (isBrowser) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } else {
    // Node.js environment
    return Buffer.from(buffer).toString('base64');
  }
}

/**
 * Convert a base64 string to an ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  if (isBrowser) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  } else {
    // Node.js environment
    return Buffer.from(base64, 'base64').buffer;
  }
}

/**
 * Load an image from URL
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  if (!isBrowser) {
    throw new Error('Image loading requires a browser environment');
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image at ${url}`));
    img.src = url;
  });
}

/**
 * Tests if a point hits a non-transparent part of the image
 */
export function testHit(
  hitMapData: string | ArrayBuffer,
  x: number,
  y: number,
  imageInfo: ImageInfo
): boolean {
  if (!imageInfo || !imageInfo.width || !imageInfo.height) {
    throw new Error('Image dimensions are required for hit detection. Please provide imageInfo parameter with width and height.');
  }

  // Convert from base64 if needed
  let buffer: ArrayBuffer;
  if (typeof hitMapData === 'string') {
    buffer = base64ToArrayBuffer(hitMapData);
  } else {
    buffer = hitMapData;
  }
  
  const view = new DataView(buffer);
  
  // Get grid percentage from the first byte
  const gridPercent = view.getUint8(0);
  
  const width = imageInfo.width;
  const height = imageInfo.height;
  
  // Calculate grid dimensions based on percentage
  const gridSizeX = Math.max(1, Math.floor((gridPercent / 100) * width));
  const gridSizeY = Math.max(1, Math.floor((gridPercent / 100) * height));
  const gridWidth = Math.ceil(width / gridSizeX);
  const gridHeight = Math.ceil(height / gridSizeY);
  
  // Convert percentage to actual coordinates
  const pixelX = Math.floor((x / 100) * width);
  const pixelY = Math.floor((y / 100) * height);
  
  // Convert to grid coordinates
  const gridX = Math.floor(pixelX / gridSizeX);
  const gridY = Math.floor(pixelY / gridSizeY);
  
  // Calculate grid index
  const gridIndex = gridY * gridWidth + gridX;
  
  // Test the hit using RLE binary data
  return testHitRLEBinary(buffer, gridIndex);
}

/**
 * Test a hit using RLE binary data
 */
function testHitRLEBinary(buffer: ArrayBuffer, gridIndex: number): boolean {
  const view = new DataView(buffer);
  const startingValue = view.getUint8(1);
  let currentValue = startingValue;
  let currentIndex = 0;
  let offset = 2;
  
  while (currentIndex <= gridIndex) {
    let runLength = view.getUint8(offset);
    offset += 1;
    
    if (runLength === 0xFF) {
      // Long run
      runLength = view.getUint32(offset, true);
      offset += 4;
    }
    
    if (currentIndex + runLength > gridIndex) {
      return currentValue === 1;
    }
    
    currentIndex += runLength;
    currentValue = currentValue === 0 ? 1 : 0;
  }
  
  return false;
} 
