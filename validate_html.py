#!/usr/bin/env python3
"""
Simple HTML validation script
"""
import html.parser
import re
import sys

class HTMLValidator(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.errors = []
        self.tag_stack = []
        self.self_closing_tags = {
            'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
            'link', 'meta', 'param', 'source', 'track', 'wbr'
        }
        
    def handle_starttag(self, tag, attrs):
        if tag not in self.self_closing_tags:
            self.tag_stack.append((tag, self.getpos()))
            
        # Check for duplicate IDs
        for name, value in attrs:
            if name == 'id':
                # Store IDs to check for duplicates later
                pass
                
    def handle_endtag(self, tag):
        if tag in self.self_closing_tags:
            return
            
        if not self.tag_stack:
            self.errors.append(f"Unexpected closing tag </{tag}> at line {self.getpos()[0]}")
            return
            
        last_tag, pos = self.tag_stack.pop()
        if last_tag != tag:
            self.errors.append(f"Mismatched tags: expected </{last_tag}> but found </{tag}> at line {self.getpos()[0]}")
            
    def error(self, message):
        self.errors.append(f"Parse error at line {self.getpos()[0]}: {message}")
        
    def close(self):
        super().close()
        # Check for unclosed tags
        for tag, pos in self.tag_stack:
            self.errors.append(f"Unclosed tag <{tag}> opened at line {pos[0]}")

def validate_html_file(filename):
    print(f"Validating {filename}...")
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading file: {e}")
        return False
        
    validator = HTMLValidator()
    
    try:
        validator.feed(content)
        validator.close()
    except Exception as e:
        print(f"HTML parsing error: {e}")
        return False
        
    if validator.errors:
        print("HTML validation errors found:")
        for error in validator.errors:
            print(f"  - {error}")
        return False
    else:
        print("✅ HTML validation passed!")
        return True

def check_common_issues(filename):
    """Check for common HTML issues"""
    print(f"Checking common issues in {filename}...")
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
        
    issues = []
    
    # Check for duplicate IDs
    id_pattern = r'id=["\']([^"\']+)["\']'
    ids = re.findall(id_pattern, content)
    duplicate_ids = set([x for x in ids if ids.count(x) > 1])
    if duplicate_ids:
        issues.append(f"Duplicate IDs found: {', '.join(duplicate_ids)}")
    
    # Check for missing alt attributes on images
    img_pattern = r'<img[^>]*>'
    images = re.findall(img_pattern, content)
    for img in images:
        if 'alt=' not in img:
            issues.append(f"Image missing alt attribute: {img[:50]}...")
    
    # Check for missing lang attribute
    if 'lang=' not in content[:200]:  # Check in head section
        issues.append("Missing lang attribute on html element")
    
    if issues:
        print("Common issues found:")
        for issue in issues:
            print(f"  - {issue}")
        return False
    else:
        print("✅ No common issues found!")
        return True

if __name__ == "__main__":
    filename = sys.argv[1] if len(sys.argv) > 1 else "index.html"
    
    html_valid = validate_html_file(filename)
    common_valid = check_common_issues(filename)
    
    if html_valid and common_valid:
        print(f"\n✅ {filename} passed all validation checks!")
        sys.exit(0)
    else:
        print(f"\n❌ {filename} has validation issues.")
        sys.exit(1)