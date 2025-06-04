/**
 * PNG Hit Map Visualization - Tools for visualizing and testing hit maps
 * For development and testing use only - not required for production use
 */
import { ImageInfo } from './pngHitMap';
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
 * Create visualization data for display purposes (creation page only)
 */
declare function createVisualizationData(grid: Uint8Array, width: number, height: number): RunData[][];
/**
 * Visualize the grid on a canvas
 */
declare function visualizeGrid(canvas: HTMLCanvasElement, hitMapData: string | ArrayBuffer, imageInfo: ImageInfo, options?: VisualizationOptions): void;
/**
 * Improved visualization that uses testHit directly to ensure consistency
 * Use this instead of visualizeGrid if the standard visualization method fails
 */
declare function visualizeGridDirect(canvas: HTMLCanvasElement, hitMapData: string | ArrayBuffer, imageInfo: ImageInfo, options?: VisualizationOptions): void;
/**
 * Visualize RLE runs on a canvas
 */
declare function visualizeRLERuns(canvas: HTMLCanvasElement, hitMapData: string | ArrayBuffer, options?: VisualizationOptions): void;
/**
 * Analyze RLE data and return statistics
 */
declare function analyzeRLEData(hitMapData: string | ArrayBuffer): {
    gridPercent: number;
    startValue: number;
    totalRuns: number;
    totalCells: number;
    hitCells: number;
    compressionRatio: number;
};
/**
 * Format RLE data as hex for debugging
 */
declare function formatRLEHex(hitMapData: string | ArrayBuffer): string;
/**
 * Get visualization data from window object
 */
declare const getVisualizationData: () => VisualizationData | null;
/**
 * Store visualization data in window object
 */
declare const storeVisualizationData: (grid: Uint8Array, width: number, height: number) => void;
export { createVisualizationData, visualizeGrid, visualizeGridDirect, visualizeRLERuns, analyzeRLEData, formatRLEHex, getVisualizationData, storeVisualizationData };
