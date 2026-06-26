with open(r"C:\Users\BIG PP\OneDrive\Documents\GitHub\Greenloop\style.css", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx in range(675, 715):
    print(f"L{idx+1}: {lines[idx].strip()}")
