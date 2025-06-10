/**
 * PNG Hit Map - Main Entry Point
 * Exports the core functionality for creating and testing hit maps
 */

// Import core functionality
import { createHitMap, testHit } from './pngHitMap';
import * as visualTools from './pngHitMapVisuals';

// Re-export as named exports
export { createHitMap, testHit };

// Also provide visualization tools as a separate export
export { visualTools };

// Default export with main functions
export default {
  createHitMap,
  testHit
}; 