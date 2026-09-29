import os
from PIL import Image, ImageOps
import numpy as np
from scipy.ndimage import label

# 1. Load source image
source_path = 'C:/Users/Bello Imam/.gemini/antigravity-ide/brain/632c39a9-d425-4b45-9fc1-56414674fdb3/muslim_desk_mark_1790625074720.jpg'
im = Image.open(source_path).convert('RGBA')
arr = np.array(im)

# 2. Make outer background transparent (rounded squircle)
# White threshold: all RGB > 240
is_white = (arr[:,:,0] > 240) & (arr[:,:,1] > 240) & (arr[:,:,2] > 240)
labeled, num_features = label(is_white)
corner_labels = set([labeled[0,0], labeled[0,-1], labeled[-1,0], labeled[-1,-1]])
outer_mask = np.isin(labeled, list(corner_labels))

# Set alpha to 0 for outer mask
arr[outer_mask, 3] = 0

master_icon = Image.fromarray(arr, 'RGBA')
print("Master icon shape:", arr.shape, "Outer transparent pixels:", np.sum(outer_mask))

# Ensure output directories exist
os.makedirs('public', exist_ok=True)
os.makedirs('src/app', exist_ok=True)
os.makedirs('src-tauri/icons', exist_ok=True)

# 3. Generate Web & Next.js icons
# Master 512x512
icon_512 = master_icon.resize((512, 512), Image.Resampling.LANCZOS)
icon_512.save('public/icon.png', 'PNG')
icon_512.save('public/icon-512.png', 'PNG')
icon_512.save('public/logo.png', 'PNG')
icon_512.save('src/app/icon.png', 'PNG')

# 192x192 PWA
icon_192 = master_icon.resize((192, 192), Image.Resampling.LANCZOS)
icon_192.save('public/icon-192.png', 'PNG')

# 180x180 Apple Touch Icon
icon_180 = master_icon.resize((180, 180), Image.Resampling.LANCZOS)
icon_180.save('public/apple-touch-icon.png', 'PNG')
icon_180.save('src/app/apple-icon.png', 'PNG')

# Multi-resolution .ico for Windows & Browsers (16, 24, 32, 48, 64, 128, 256)
ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
master_icon.save('public/favicon.ico', format='ICO', sizes=ico_sizes)
master_icon.save('src/app/favicon.ico', format='ICO', sizes=ico_sizes)
master_icon.save('src-tauri/icons/icon.ico', format='ICO', sizes=ico_sizes)

# 4. Generate Desktop (Tauri) icons
tauri_sizes = {
    'src-tauri/icons/icon.png': (512, 512),
    'src-tauri/icons/32x32.png': (32, 32),
    'src-tauri/icons/64x64.png': (64, 64),
    'src-tauri/icons/128x128.png': (128, 128),
    'src-tauri/icons/128x128@2x.png': (256, 256),
    'src-tauri/icons/Square30x30Logo.png': (30, 30),
    'src-tauri/icons/Square44x44Logo.png': (44, 44),
    'src-tauri/icons/Square71x71Logo.png': (71, 71),
    'src-tauri/icons/Square89x89Logo.png': (89, 89),
    'src-tauri/icons/Square107x107Logo.png': (107, 107),
    'src-tauri/icons/Square142x142Logo.png': (142, 142),
    'src-tauri/icons/Square150x150Logo.png': (150, 150),
    'src-tauri/icons/Square284x284Logo.png': (284, 284),
    'src-tauri/icons/Square310x310Logo.png': (310, 310),
    'src-tauri/icons/StoreLogo.png': (50, 50),
}

for path, size in tauri_sizes.items():
    resized = master_icon.resize(size, Image.Resampling.LANCZOS)
    resized.save(path, 'PNG')
    print(f"Saved {path} ({size[0]}x{size[1]})")

# 5. Generate Android Mipmaps
# Mipmap sizes: mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192
android_mipmaps = {
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192,
}

for density, px in android_mipmaps.items():
    dir_path = f"src-tauri/icons/android/mipmap-{density}"
    os.makedirs(dir_path, exist_ok=True)
    
    # 1. Standard ic_launcher (rounded squircle)
    launcher = master_icon.resize((px, px), Image.Resampling.LANCZOS)
    launcher.save(f"{dir_path}/ic_launcher.png", 'PNG')
    
    # 2. Round ic_launcher_round (circular mask)
    mask = Image.new('L', (px, px), 0)
    from PIL import ImageDraw
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, px, px), fill=255)
    
    # Create filled orange background circle with centered emblem
    # Or mask the launcher with circle
    round_img = Image.new('RGBA', (px, px), (0, 0, 0, 0))
    round_img.paste(launcher, (0, 0), mask=mask)
    round_img.save(f"{dir_path}/ic_launcher_round.png", 'PNG')
    
    # 3. Adaptive foreground ic_launcher_foreground (centered with 20% safe zone padding)
    fg_size = int(px * 1.5)  # Android adaptive foreground is 108dp on 72dp viewport
    fg_img = Image.new('RGBA', (fg_size, fg_size), (0, 0, 0, 0))
    # Place scaled emblem/launcher in center
    scaled_w = int(fg_size * 0.65)
    scaled = master_icon.resize((scaled_w, scaled_w), Image.Resampling.LANCZOS)
    offset = (fg_size - scaled_w) // 2
    fg_img.paste(scaled, (offset, offset), mask=scaled)
    # Resize to px size matching existing file if needed, or save fg_size
    fg_target = master_icon.resize((px, px), Image.Resampling.LANCZOS)
    fg_target.save(f"{dir_path}/ic_launcher_foreground.png", 'PNG')
    
    print(f"Generated Android {density} ({px}x{px})")

# 6. Generate iOS Icons if dir exists
ios_dir = 'src-tauri/icons/ios'
if os.path.exists(ios_dir):
    for f in os.listdir(ios_dir):
        if f.endswith('.png'):
            # Determine size from filename, e.g. AppIcon-60x60@2x.png -> 120x120
            # Read existing size
            try:
                curr_path = os.path.join(ios_dir, f)
                curr_im = Image.open(curr_path)
                target_sz = curr_im.size
                curr_im.close()
                res = master_icon.resize(target_sz, Image.Resampling.LANCZOS)
                res.save(curr_path, 'PNG')
                print(f"Updated iOS {f} {target_sz}")
            except Exception as e:
                print(f"Error updating iOS {f}: {e}")

print("All icons successfully generated!")
