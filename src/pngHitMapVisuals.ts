/**
 * PNG Hit Map Visualization - Tools for visualizing and testing hit maps
 * For development and testing use only - not required for production use
 */

import { testHit, ImageInfo } from './pngHitMap';

/**
 * Environment detection to handle browser/node differences
 */
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

// Type definitions
interface VisualizationOptions {
  fillColor?: string;
  gridColor?: string;
  lineWidth?: number;
  showGrid?: boolean;
}

interface RunData {
  value: number;
  count: number;
  row: number;
  startX: number;
  endX: number;
}

interface VisualizationData {
  width: number;
  height: number;
  gridSizeX: number;
  gridSizeY: number;
  gridWidth: number;
  gridHeight: number;
}

/**
 * Convert a base64 string to an ArrayBuffer - helper function needed by visualization
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
 * Create visualization data for display purposes (creation page only)
 */
function createVisualizationData(grid: Uint8Array, width: number, height: number): RunData[][] {
  const visualRuns: RunData[][] = [];
  
  // Process grid row by row for visualization
  for (let y = 0; y < height; y++) {
    let rowRuns: RunData[] = [];
    let startX = 0;
    let currentValue = grid[y * width];
    
    for (let x = 1; x <= width; x++) {
      // If we're at the end or the value changes, add a run
      if (x === width || grid[y * width + x] !== currentValue) {
        const run: RunData = {
          value: currentValue,
          count: x - startX,
          row: y,
          startX: startX,
          endX: x - 1
        };
        
        rowRuns.push(run);
        
        if (x < width) {
          currentValue = grid[y * width + x];
          startX = x;
        }
      }
    }
    
    visualRuns.push(rowRuns);
  }
  
  return visualRuns;
}

/**
 * Visualize the grid on a canvas
 */
function visualizeGrid(
  canvas: HTMLCanvasElement,
  hitMapData: string | ArrayBuffer,
  imageInfo: ImageInfo,
  options: VisualizationOptions = {}
): void {
  if (!isBrowser) {
    throw new Error('Visualization requires a browser environment with Canvas support');
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
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
  
  // We need image dimensions for visualization
  const width = imageInfo.width;
  const height = imageInfo.height;
  
  // Calculate grid dimensions based on percentage
  const gridSizeX = Math.max(1, Math.floor((gridPercent / 100) * width));
  const gridSizeY = Math.max(1, Math.floor((gridPercent / 100) * height));
  const gridWidth = Math.ceil(width / gridSizeX);
  const gridHeight = Math.ceil(height / gridSizeY);
  
  // Adjust canvas size if needed
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw grid cells by reconstructing from RLE
  const startValue = view.getUint8(1);
  
  let currentIndex = 0;
  let currentValue = startValue;
  let offset = 2; // Start after grid percentage and starting value
  
  // Fill grid cells
  ctx.fillStyle = options.fillColor || 'rgba(0, 255, 0, 0.2)';
  
  while (offset < buffer.byteLength) {
    let runLength: number;
    
    // Read run length (variable encoding)
    if (view.getUint8(offset) === 0xFF) {
      // Long run
      offset += 1;
      runLength = view.getUint32(offset, true); // Little endian
      offset += 4;
    } else {
      // Short run
      runLength = view.getUint8(offset);
      offset += 1;
    }
    
    // If this is a "hit" run, draw the cells
    if (currentValue === 1) {
      for (let i = 0; i < runLength; i++) {
        const gridPos = currentIndex + i;
        const gridY = Math.floor(gridPos / gridWidth);
        const gridX = gridPos % gridWidth;
        
        ctx.fillRect(gridX * gridSizeX, gridY * gridSizeY, gridSizeX, gridSizeY);
      }
    }
    
    // Move to next run
    currentIndex += runLength;
    // Flip the value (alternating 0/1)
    currentValue = 1 - currentValue;
  }
  
  // Draw grid lines if enabled
  if (options.showGrid) {
    ctx.strokeStyle = options.gridColor || 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = options.lineWidth || 1;
    
    // Vertical lines
    for (let x = 0; x <= width; x += gridSizeX) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= height; y += gridSizeY) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }
}

/**
 * Improved visualization that uses testHit directly to ensure consistency
 * Use this instead of visualizeGrid if the standard visualization method fails
 */
function visualizeGridDirect(
  canvas: HTMLCanvasElement,
  hitMapData: string | ArrayBuffer,
  imageInfo: ImageInfo,
  options: VisualizationOptions = {}
): void {
  if (!isBrowser) {
    throw new Error('Visualization requires a browser environment with Canvas support');
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Convert from base64 if needed
  let buffer: ArrayBuffer;
  if (typeof hitMapData === 'string') {
    buffer = base64ToArrayBuffer(hitMapData);
  } else {
    buffer = hitMapData;
  }
  
  // Get grid percentage from first byte
  const view = new DataView(buffer);
  const gridPercent = view.getUint8(0);
  
  // Calculate grid dimensions
  const gridSizeX = Math.max(1, Math.floor((gridPercent / 100) * imageInfo.width));
  const gridSizeY = Math.max(1, Math.floor((gridPercent / 100) * imageInfo.height));
  const gridWidth = Math.ceil(imageInfo.width / gridSizeX);
  const gridHeight = Math.ceil(imageInfo.height / gridSizeY);
  
  // Calculate scaling factors
  const scaleX = canvas.width / imageInfo.width;
  const scaleY = canvas.height / imageInfo.height;
  
  // Draw grid if needed
  if (options.showGrid) {
    ctx.strokeStyle = options.gridColor || 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= gridWidth; x++) {
      const pixelX = Math.floor(x * gridSizeX * scaleX);
      ctx.beginPath();
      ctx.moveTo(pixelX, 0);
      ctx.lineTo(pixelX, canvas.height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= gridHeight; y++) {
      const pixelY = Math.floor(y * gridSizeY * scaleY);
      ctx.beginPath();
      ctx.moveTo(0, pixelY);
      ctx.lineTo(canvas.width, pixelY);
      ctx.stroke();
    }
  }
  
  // Fill cells using testHit to ensure consistency
  if (options.fillColor) {
    ctx.fillStyle = options.fillColor || 'rgba(0, 255, 0, 0.4)';
    
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const pixelX = Math.floor(x * gridSizeX * scaleX);
        const pixelY = Math.floor(y * gridSizeY * scaleY);
        const pixelWidth = Math.ceil(gridSizeX * scaleX);
        const pixelHeight = Math.ceil(gridSizeY * scaleY);
        
        // Convert grid coordinates to percentage
        const percentX = (x * gridSizeX / imageInfo.width) * 100;
        const percentY = (y * gridSizeY / imageInfo.height) * 100;
        
        if (testHit(hitMapData, percentX, percentY, imageInfo)) {
          ctx.fillRect(pixelX, pixelY, pixelWidth, pixelHeight);
        }
      }
    }
  }
}

/**
 * Visualize RLE runs on a canvas
 */
function visualizeRLERuns(
  canvas: HTMLCanvasElement,
  hitMapData: string | ArrayBuffer,
  options: VisualizationOptions = {}
): void {
  if (!isBrowser) {
    throw new Error('Visualization requires a browser environment with Canvas support');
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  // Convert from base64 if needed
  let buffer: ArrayBuffer;
  if (typeof hitMapData === 'string') {
    buffer = base64ToArrayBuffer(hitMapData);
  } else {
    buffer = hitMapData;
  }
  
  const view = new DataView(buffer);
  const gridPercent = view.getUint8(0);
  const startValue = view.getUint8(1);
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw runs
  let currentValue = startValue;
  let offset = 2;
  let y = 0;
  
  while (offset < buffer.byteLength) {
    let runLength: number;
    
    // Read run length
    if (view.getUint8(offset) === 0xFF) {
      offset += 1;
      runLength = view.getUint32(offset, true);
      offset += 4;
    } else {
      runLength = view.getUint8(offset);
      offset += 1;
    }
    
    // Draw run
    ctx.fillStyle = currentValue === 1 ? 
      (options.fillColor || 'rgba(0, 255, 0, 0.4)') : 
      'rgba(255, 0, 0, 0.1)';
    
    ctx.fillRect(0, y, runLength * 2, 20);
    
    // Draw run length text
    ctx.fillStyle = 'black';
    ctx.font = '12px monospace';
    ctx.fillText(runLength.toString(), runLength * 2 + 5, y + 15);
    
    y += 25;
    currentValue = 1 - currentValue;
  }
}

/**
 * Analyze RLE data and return statistics
 */
function analyzeRLEData(hitMapData: string | ArrayBuffer): {
  gridPercent: number;
  startValue: number;
  totalRuns: number;
  totalCells: number;
  hitCells: number;
  compressionRatio: number;
} {
  // Convert from base64 if needed
  let buffer: ArrayBuffer;
  if (typeof hitMapData === 'string') {
    buffer = base64ToArrayBuffer(hitMapData);
  } else {
    buffer = hitMapData;
  }
  
  const view = new DataView(buffer);
  const gridPercent = view.getUint8(0);
  const startValue = view.getUint8(1);
  
  let totalRuns = 0;
  let totalCells = 0;
  let hitCells = 0;
  let currentValue = startValue;
  let offset = 2;
  
  while (offset < buffer.byteLength) {
    let runLength: number;
    
    if (view.getUint8(offset) === 0xFF) {
      offset += 1;
      runLength = view.getUint32(offset, true);
      offset += 4;
    } else {
      runLength = view.getUint8(offset);
      offset += 1;
    }
    
    totalRuns++;
    totalCells += runLength;
    if (currentValue === 1) {
      hitCells += runLength;
    }
    
    currentValue = 1 - currentValue;
  }
  
  return {
    gridPercent,
    startValue,
    totalRuns,
    totalCells,
    hitCells,
    compressionRatio: buffer.byteLength / totalCells
  };
}

/**
 * Format RLE data as hex for debugging
 */
function formatRLEHex(hitMapData: string | ArrayBuffer): string {
  // Convert from base64 if needed
  let buffer: ArrayBuffer;
  if (typeof hitMapData === 'string') {
    buffer = base64ToArrayBuffer(hitMapData);
  } else {
    buffer = hitMapData;
  }
  
  const bytes = new Uint8Array(buffer);
  let hex = '';
  
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i].toString(16).padStart(2, '0');
    hex += byte + ' ';
    
    if ((i + 1) % 16 === 0) {
      hex += '\n';
    }
  }
  
  return hex;
}

/**
 * Get visualization data from window object
 */
const getVisualizationData = (): VisualizationData | null => {
  return isBrowser ? (window as any)._pngHitMapMetadata || null : null;
};

/**
 * Store visualization data in window object
 */
const storeVisualizationData = (grid: Uint8Array, width: number, height: number): void => {
  if (isBrowser) {
    (window as any)._pngHitMapMetadata = {
      width,
      height,
      grid
    };
  }
};

export {
  createVisualizationData,
  visualizeGrid,
  visualizeGridDirect,
  visualizeRLERuns,
  analyzeRLEData,
  formatRLEHex,
  getVisualizationData,
  storeVisualizationData
}; 