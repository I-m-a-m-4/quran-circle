import os
from PIL import Image, ImageDraw

def create_icon(size):
    # Create high-res image with orange background and rounded corners
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Solid Orange background with rounded corners
    corner_radius = int(size * 0.22)
    orange_color = (249, 115, 22, 255) # #f97316
    white_color = (255, 255, 255, 255)
    
    draw.rounded_rectangle([(0, 0), (size, size)], radius=corner_radius, fill=orange_color)
    
    # Scale factors
    s = size / 40.0
    
    # Draw Crescent Moon
    # Crescent circle 1
    c1_x, c1_y, c1_r = 21.5 * s, 4 * s, 4.5 * s
    draw.ellipse([c1_x - c1_r, c1_y - c1_r, c1_x + c1_r, c1_y + c1_r], fill=white_color)
    # Cutout crescent circle 2 with orange
    c2_x, c2_y, c2_r = 23.5 * s, 3.5 * s, 3.8 * s
    draw.ellipse([c2_x - c2_r, c2_y - c2_r, c2_x + c2_r, c2_y + c2_r], fill=orange_color)
    
    # Star
    star_x, star_y, star_r = 25.5 * s, 6.5 * s, 1.8 * s
    draw.ellipse([star_x - star_r, star_y - star_r, star_x + star_r, star_y + star_r], fill=white_color)

    # Desk Stand Base
    sw = max(1, int(2.2 * s))
    draw.line([(6 * s, 34.5 * s), (34 * s, 34.5 * s)], fill=white_color, width=sw)
    draw.line([(14 * s, 34.5 * s), (17 * s, 31 * s)], fill=white_color, width=max(1, int(1.8 * s)))
    draw.line([(26 * s, 34.5 * s), (23 * s, 31 * s)], fill=white_color, width=max(1, int(1.8 * s)))

    # Open Quran Book outline
    # Draw book spine and pages
    draw.line([(20 * s, 18.5 * s), (20 * s, 30.5 * s)], fill=white_color, width=sw)
    
    # Left & Right page arches
    # Left page arc
    draw.arc([4 * s, 16 * s, 20 * s, 30.5 * s], start=180, end=360, fill=white_color, width=sw)
    # Right page arc
    draw.arc([20 * s, 16 * s, 36 * s, 30.5 * s], start=180, end=360, fill=white_color, width=sw)
    
    # Outer bounds
    draw.line([(4 * s, 18 * s), (4 * s, 30 * s)], fill=white_color, width=sw)
    draw.line([(36 * s, 18 * s), (36 * s, 30 * s)], fill=white_color, width=sw)
    draw.line([(4 * s, 30 * s), (20 * s, 30.5 * s)], fill=white_color, width=sw)
    draw.line([(36 * s, 30 * s), (20 * s, 30.5 * s)], fill=white_color, width=sw)

    return img

def main():
    root = r"c:\Users\Bello Imam\Documents\quran-circle"
    
    # Destination paths
    targets = [
        os.path.join(root, "public", "icon.png"),
        os.path.join(root, "src", "app", "icon.png"),
        os.path.join(root, "src-tauri", "icons", "icon.png"),
        os.path.join(root, "src-tauri", "icons", "128x128.png"),
        os.path.join(root, "src-tauri", "icons", "128x128@2x.png"),
        os.path.join(root, "src-tauri", "icons", "32x32.png"),
        os.path.join(root, "src-tauri", "icons", "Square30x30Logo.png"),
        os.path.join(root, "src-tauri", "icons", "Square44x44Logo.png"),
        os.path.join(root, "src-tauri", "icons", "Square71x71Logo.png"),
        os.path.join(root, "src-tauri", "icons", "Square89x89Logo.png"),
        os.path.join(root, "src-tauri", "icons", "Square107x107Logo.png"),
        os.path.join(root, "src-tauri", "icons", "Square142x142Logo.png"),
        os.path.join(root, "src-tauri", "icons", "Square150x150Logo.png"),
        os.path.join(root, "src-tauri", "icons", "Square284x284Logo.png"),
        os.path.join(root, "src-tauri", "icons", "Square310x310Logo.png"),
        os.path.join(root, "src-tauri", "icons", "StoreLogo.png"),
    ]
    
    for path in targets:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        # Determine size from filename or default to 512
        size = 512
        filename = os.path.basename(path)
        if "32x32" in filename or "30x30" in filename:
            size = 32
        elif "44x44" in filename:
            size = 44
        elif "71x71" in filename:
            size = 71
        elif "89x89" in filename:
            size = 89
        elif "107x107" in filename:
            size = 107
        elif "128x128" in filename:
            size = 128
        elif "142x142" in filename:
            size = 142
        elif "150x150" in filename:
            size = 150
        elif "284x284" in filename:
            size = 284
        elif "310x310" in filename:
            size = 310
            
        icon_img = create_icon(size)
        icon_img.save(path, "PNG")
        print(f"Generated {path} ({size}x{size})")

if __name__ == "__main__":
    main()
