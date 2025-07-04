/**
 * PNG Hit Map Core - Minimal library for creating and testing hit areas from PNG images
 * Production-ready module with only essential functions
 */
export interface HitMapOptions {
    gridPercent?: number;
    base64Output?: boolean;
}
export interface ImageInfo {
    width: number;
    height: number;
}
/**
 * Creates a hit map from a PNG image by analyzing non-transparent pixels
 * and converting them to a compressed binary representation using RLE
 */
export declare function createHitMap(image: HTMLImageElement | string | Buffer, options?: HitMapOptions): Promise<ArrayBuffer | string>;
/**
 * Tests if a point hits a non-transparent part of the image
 */
export declare function testHit(hitMapData: string | ArrayBuffer, x: number, y: number, imageInfo: ImageInfo): boolean;
