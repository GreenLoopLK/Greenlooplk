with open('script.js', 'r', encoding='utf-8') as f:
    code = f.read()

stack = []
for idx, char in enumerate(code):
    line = code.count('\n', 0, idx) + 1
    if char in '{[(':
        stack.append((char, idx, line))
    elif char in '}])':
        if not stack:
            continue
        matching = {'}': '{', ']': '[', ')': '('}[char]
        
        # Search the stack from the top to find the matching character
        found = False
        for i in range(len(stack)-1, -1, -1):
            if stack[i][0] == matching:
                if char == '}' and line >= 800:
                    print(f'Line {line}: "}}" closes "{matching}" from line {stack[i][2]}')
                stack = stack[:i]
                found = True
                break
