using System;

namespace SharpPNGHitMap
{
    class Program
    {
        static int Main(string[] args)
        {
            try
            {
                if (args.Length < 5)
                {
                    Console.WriteLine("Usage: TestPNGHitMap <hitMapBase64> <x> <y> <width> <height>");
                    Console.WriteLine("  hitMapBase64: Base64 encoded hit map data");
                    Console.WriteLine("  x: X coordinate percentage (0-100)");
                    Console.WriteLine("  y: Y coordinate percentage (0-100)");
                    Console.WriteLine("  width: Image width in pixels");
                    Console.WriteLine("  height: Image height in pixels");
                    Console.WriteLine("\nExample:");
                    Console.WriteLine("  dotnet run -- \"BQAJAxEFDggNCAsMCQwKCwoKCwoLCgsKCwoLCgsKDAkMCQwJDAkMCA0IHA===\" 82.60 8.30 1024 1024");
                    Console.WriteLine("  This example uses a 1% grid with alternating transparent/non-transparent cells");
                    return 1;
                }

                string hitMapBase64 = args[0];
                double x = double.Parse(args[1]);
                double y = double.Parse(args[2]);
                int width = int.Parse(args[3]);
                int height = int.Parse(args[4]);

                Console.WriteLine($"Testing hit map:");
                Console.WriteLine($"  Base64: {hitMapBase64}");
                Console.WriteLine($"  Coordinates: ({x}, {y})");
                Console.WriteLine($"  Image size: {width}x{height}");

                var imageInfo = new ImageInfo(width, height);
                bool isHit = PNGHitMap.TestHit(hitMapBase64, x, y, imageInfo);

                Console.WriteLine($"Hit test result: {(isHit ? "HIT" : "MISS")}");
                return 0;
            }
            catch (FormatException)
            {
                Console.Error.WriteLine("Error: Invalid number format in arguments");
                return 1;
            }
            catch (ArgumentException ex)
            {
                Console.Error.WriteLine($"Error: {ex.Message}");
                return 1;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Unexpected error: {ex.Message}");
                Console.Error.WriteLine(ex.StackTrace);
                return 1;
            }
        }
    }
} 