#!/usr/bin/env bash

# Read input from stdin (e.g., wl-paste)
input=$(cat)

# Process logs:
# 1. Keep first occurrence of "DOM changed, reinitializing"
# 2. Keep all other "Grok Ctrl+Enter" logs
# 3. Keep error messages and stack traces
# 4. Deduplicate exact matches to reduce noise
echo "$input" | awk '
  BEGIN { dom_changed_seen = 0 }
  /Grok Ctrl+Enter: DOM changed, reinitializing/ {
    if (!dom_changed_seen) {
      print;
      dom_changed_seen = 1
    }
    next
  }
  /Grok Ctrl+Enter/ || /Failed to load resource/ || /Uncaught/ || /@.*content\.js/ {
    print
  }
' | sort | uniq
