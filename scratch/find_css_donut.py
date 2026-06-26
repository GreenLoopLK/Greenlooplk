with open(r"C:\Users\BIG PP\OneDrive\Documents\GitHub\Greenloop\style.css", "r", encoding="utf-8") as f:
    lines = f.readlines()

found = False
for idx, line in enumerate(lines):
    if "donut" in line or "pie" in line or "legend" in line:
        print(f"L{idx+1}: {line.strip()}")
        found = True

if not found:
    print("No references to donut, pie, or legend found in style.css.")
