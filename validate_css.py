#!/usr/bin/env python3
"""
Simple CSS validation script
"""
import re
import sys

def validate_css(filename):
    print(f'Validating {filename}...')
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading file: {e}")
        return False
    
    issues = []
    
    # Check for unmatched braces
    open_braces = content.count('{')
    close_braces = content.count('}')
    if open_braces != close_braces:
        issues.append(f'Unmatched braces: {open_braces} opening, {close_braces} closing')
    
    # Check for basic syntax issues
    lines = content.split('\n')
    for i, line in enumerate(lines, 1):
        line = line.strip()
        
        # Skip comments and empty lines
        if not line or line.startswith('/*') or line.startswith('*') or line.endswith('*/'):
            continue
            
        # Check for missing semicolons on property declarations
        if ':' in line and not line.endswith((';', '{', '}', '/*', '*/')):
            # Skip @rules, selectors, and other special cases
            if not any(x in line for x in ['@', 'url(', 'calc(', 'var(', 'rgb(', 'rgba(', 'hsl(', 'hsla(']):
                if not line.strip().endswith(',') and '{' not in line:
                    issues.append(f'Line {i}: Possible missing semicolon: {line[:50]}{"..." if len(line) > 50 else ""}')
    
    # Check for common CSS errors
    # Invalid color values (basic check)
    color_pattern = r'#[0-9a-fA-F]{1,2}(?![0-9a-fA-F])'
    invalid_colors = re.findall(color_pattern, content)
    for color in invalid_colors:
        if len(color) not in [4, 7]:  # #RGB or #RRGGBB
            issues.append(f'Invalid color value: {color}')
    
    if issues:
        print('CSS validation issues:')
        for issue in issues:
            print(f'  - {issue}')
        return False
    else:
        print('✅ CSS validation passed!')
        return True

if __name__ == "__main__":
    filename = sys.argv[1] if len(sys.argv) > 1 else "styles.css"
    
    if validate_css(filename):
        print(f"\n✅ {filename} passed validation!")
        sys.exit(0)
    else:
        print(f"\n❌ {filename} has validation issues.")
        sys.exit(1)