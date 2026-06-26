import os
import shutil

src_dir = r"D:\VIdeo\Uni\Multimedia Production\brand guild line"
dst_dir = r"D:\VIdeo\Uni\Multimedia Production\github\ProductDevelopment\assets"

mapping = {
    "closeup shots of machine.png": "closeup_shots_of_machine.png",
    "colour palette.png": "colour_palette.png",
    "dress.png": "dress.png",
    "logo bad usage.png": "logo_bad_usage.png",
    "logo concept.png": "logo_concept.png",
    "logo usage.png": "logo_usage.png",
    "logo variations.png": "logo_variations.png",
    "logo.png": "logo.png",
    "machine appearance (1).png": "machine_appearance_1.png",
    "machine appearance 2.png": "machine_appearance_2.png",
    "machine turnarounds.png": "machine_turnarounds.png",
    "photo 1.png": "photo_1.png",
    "photo 2.png": "photo_2.png",
    "photo 3.png": "photo_3.png"
}

for src_name, dst_name in mapping.items():
    src_path = os.path.join(src_dir, src_name)
    dst_path = os.path.join(dst_dir, dst_name)
    if os.path.exists(src_path):
        print(f"Copying {src_name} to {dst_name}...")
        shutil.copy2(src_path, dst_path)
    else:
        print(f"Warning: {src_name} does not exist at {src_path}")
