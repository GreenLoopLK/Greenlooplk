from html.parser import HTMLParser

class SimpleHTMLValidator(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.errors = []

    def handle_starttag(self, tag, attrs):
        # We don't track self-closing tags in HTML5
        self_closing = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']
        if tag not in self_closing:
            self.tags.append((tag, self.getpos()))

    def handle_endtag(self, tag):
        self_closing = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']
        if tag in self_closing:
            return
        if not self.tags:
            self.errors.append(f"Unexpected closing tag </{tag}> at line {self.getpos()[0]}")
            return
        last_tag, pos = self.tags.pop()
        if last_tag != tag:
            self.errors.append(f"Mismatched tag: expected </{last_tag}> (opened at line {pos[0]}), found </{tag}> at line {self.getpos()[0]}")

with open(r"C:\Users\BIG PP\OneDrive\Documents\GitHub\Greenloop\index.html", "r", encoding="utf-8") as f:
    content = f.read()

validator = SimpleHTMLValidator()
try:
    validator.feed(content)
    if validator.errors:
        print("HTML Validation Errors:")
        for err in validator.errors:
            print(f"- {err}")
    else:
        print("[OK] HTML structure is sound (no mismatched non-self-closing tags).")
except Exception as e:
    print(f"[ERROR] Failed to parse HTML: {e}")
