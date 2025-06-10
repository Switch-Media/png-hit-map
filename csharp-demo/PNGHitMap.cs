using System;
using System.Text;

namespace SharpPNGHitMap
{
    public class ImageInfo
    {
        public int Width { get; set; }
        public int Height { get; set; }

        public ImageInfo(int width, int height)
        {
            Width = width;
            Height = height;
        }
    }

    public static class PNGHitMap
    {
        /// <summary>
        /// Tests if a point hits a non-transparent part of the image
        /// </summary>
        /// <param name="hitMapData">Base64 string or byte array containing the hit map data</param>
        /// <param name="x">X coordinate (0-100)</param>
        /// <param name="y">Y coordinate (0-100)</param>
        /// <param name="imageInfo">Image dimensions information</param>
        /// <returns>True if the point hits a non-transparent part of the image</returns>
        public static bool TestHit(object hitMapData, double x, double y, ImageInfo imageInfo)
        {
            if (imageInfo == null || imageInfo.Width <= 0 || imageInfo.Height <= 0)
            {
                throw new ArgumentException("Image dimensions are required for hit detection. Please provide imageInfo parameter with width and height.");
            }

            if (x < 0 || x > 100 || y < 0 || y > 100)
            {
                throw new ArgumentException("Coordinates must be between 0 and 100");
            }

            // Convert from base64 if needed
            byte[] buffer;
            if (hitMapData is string base64String)
            {
                try
                {
                    buffer = Convert.FromBase64String(base64String);
                }
                catch (FormatException)
                {
                    throw new ArgumentException("Invalid base64 string format");
                }
            }
            else if (hitMapData is byte[] byteArray)
            {
                buffer = byteArray;
            }
            else
            {
                throw new ArgumentException("hitMapData must be either a base64 string or byte array");
            }

            if (buffer.Length < 3)
            {
                throw new ArgumentException("Hit map data is too short. Must be at least 3 bytes long.");
            }

            // Get grid percentage from the first byte
            int gridPercent = buffer[0];
            if (gridPercent == 0 || gridPercent > 100)
            {
                throw new ArgumentException($"Invalid grid percentage: {gridPercent}. Must be between 1 and 100.");
            }
            
            int width = imageInfo.Width;
            int height = imageInfo.Height;
            
            // Calculate grid dimensions based on percentage
            int gridSizeX = Math.Max(1, (int)Math.Floor((gridPercent / 100.0) * width));
            int gridSizeY = Math.Max(1, (int)Math.Floor((gridPercent / 100.0) * height));
            int gridWidth = (int)Math.Ceiling(width / (double)gridSizeX);
            int gridHeight = (int)Math.Ceiling(height / (double)gridSizeY);
            
            // Convert percentage to actual coordinates
            int pixelX = (int)Math.Floor((x / 100.0) * width);
            int pixelY = (int)Math.Floor((y / 100.0) * height);
            
            // Convert to grid coordinates
            int gridX = (int)Math.Floor(pixelX / (double)gridSizeX);
            int gridY = (int)Math.Floor(pixelY / (double)gridSizeY);
            
            // Validate grid coordinates
            if (gridX >= gridWidth || gridY >= gridHeight)
            {
                throw new ArgumentException($"Coordinates ({x}, {y}) map to grid position ({gridX}, {gridY}) which is outside the grid dimensions ({gridWidth}x{gridHeight})");
            }
            
            // Calculate grid index
            int gridIndex = gridY * gridWidth + gridX;
            
            // Test the hit using RLE binary data
            return TestHitRLEBinary(buffer, gridIndex);
        }

        /// <summary>
        /// Test a hit using RLE binary data
        /// </summary>
        private static bool TestHitRLEBinary(byte[] buffer, int gridIndex)
        {
            if (buffer.Length < 2)
            {
                throw new ArgumentException("Hit map data is too short. Must be at least 2 bytes long.");
            }

            int startingValue = buffer[1];
            if (startingValue != 0 && startingValue != 1)
            {
                throw new ArgumentException($"Invalid starting value: {startingValue}. Must be 0 or 1.");
            }

            int currentValue = startingValue;
            int currentIndex = 0;
            int offset = 2;
            
            while (currentIndex <= gridIndex)
            {
                if (offset >= buffer.Length)
                {
                    throw new ArgumentException("Hit map data ended unexpectedly while reading run length");
                }

                int runLength = buffer[offset];
                offset += 1;
                
                if (runLength == 0xFF)
                {
                    // Long run (4 bytes)
                    if (offset + 4 > buffer.Length)
                    {
                        throw new ArgumentException("Hit map data ended unexpectedly while reading long run length");
                    }
                    runLength = BitConverter.ToInt32(buffer, offset);
                    offset += 4;
                }
                
                if (currentIndex + runLength > gridIndex)
                {
                    return currentValue == 1;
                }
                
                currentIndex += runLength;
                currentValue = currentValue == 0 ? 1 : 0;
            }
            
            return false;
        }
    }
} 