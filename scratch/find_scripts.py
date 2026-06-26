with open(r"C:\Users\BIG PP\OneDrive\Documents\GitHub\Greenloop\index.html", "r", encoding="utf-8") as f:
    html = f.read()

import re
scripts = re.findall(r'<script.*?>.*?</script>|<script.*?>', html, re.DOTALL)
for s in scripts:
    print(s)
