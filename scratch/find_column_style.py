with open(r"C:\Users\BIG PP\OneDrive\Documents\GitHub\Greenloop\style.css", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "overview-visual-column" in line:
        print(f"L{idx+1}: {line.strip()}")
