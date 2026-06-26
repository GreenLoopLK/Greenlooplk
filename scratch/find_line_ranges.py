html_path = r"D:\VIdeo\Uni\Multimedia Production\github\ProductDevelopment\index.html"
with open(html_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

output = []

def print_block(target, context_before=3, context_after=3):
    for idx, line in enumerate(lines):
        if target in line:
            output.append(f"Match '{target}' at line {idx+1}\n")
            start = max(0, idx - context_before)
            end = min(len(lines), idx + context_after + 1)
            for i in range(start, end):
                output.append(f"  {i+1}: {lines[i]}")
            output.append("\n")

print_block("brand-logo-img", 2, 2)
print_block("id=\"logo-frame-target\"", 1, 60)
print_block("id=\"geo-frame-target\"", 1, 105)
print_block("id=\"color-frame-target\"", 1, 40)
print_block("id=\"photo-frame-target\"", 1, 55)
print_block("data-num=\"03.7.7\"", 1, 30)
print_block("id=\"render-frame-target\"", 1, 5)
print_block("id=\"screen-frame-target\"", 1, 40)

with open(r"C:\Users\BIG PP\OneDrive\Documents\GitHub\Greenloop\scratch\line_ranges_output.txt", "w", encoding="utf-8") as f:
    f.writelines(output)

print("Line ranges output written successfully!")
