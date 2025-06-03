#!/bin/bash

# Script to update TODO status and manage todo list

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TODO_FILE="$PROJECT_ROOT/TODO.md"

# Function to mark a todo as complete
mark_complete() {
    local pattern="$1"
    local date=$(date +"%Y-%m-%d")
    
    # Find the line matching the pattern
    local line=$(grep -n "\[ \] .*${pattern}" "$TODO_FILE" | head -1)
    if [ -z "$line" ]; then
        echo "No pending todo found matching: $pattern"
        return 1
    fi
    
    local line_num=$(echo "$line" | cut -d: -f1)
    local content=$(echo "$line" | cut -d: -f2-)
    
    # Remove the line from its current position
    sed -i.bak "${line_num}d" "$TODO_FILE"
    
    # Add [x] and date to the content
    local completed_content=$(echo "$content" | sed "s/\[ \]/[x]/")
    completed_content="${completed_content} ✓ ${date}"
    
    # Add to Completed section
    if ! grep -q "^## Completed" "$TODO_FILE"; then
        echo "" >> "$TODO_FILE"
        echo "---" >> "$TODO_FILE"
        echo "" >> "$TODO_FILE"
        echo "## Completed" >> "$TODO_FILE"
    fi
    
    echo "$completed_content" >> "$TODO_FILE"
    echo "Marked as complete and moved to Completed section: $pattern"
}

# Function to move todo to in progress
mark_in_progress() {
    local pattern="$1"
    sed -i.bak "s/\[ \] \(.*${pattern}.*\)/[ ] 🔄 \1/" "$TODO_FILE"
    echo "Marked as in progress: $pattern"
}

# Function to add a new todo
add_todo() {
    local priority="$1"
    local category="$2"
    local description="$3"
    
    # Generate next TODO key
    local last_num=$(grep -oE '\[TODO-[0-9]{3}\]' "$TODO_FILE" | sed 's/\[TODO-//' | sed 's/\]//' | sort -n | tail -1)
    if [ -z "$last_num" ]; then
        last_num=0
    else
        # Remove leading zeros to avoid octal interpretation
        last_num=$((10#$last_num))
    fi
    local next_num=$(printf "%03d" $((last_num + 1)))
    local key="[TODO-$next_num]"
    
    # Find the right section and add the todo
    awk -v prio="$priority" -v cat="$category" -v desc="$description" -v key="$key" '
    /^### '"$priority"' -/ {
        print
        getline
        print
        print "- [ ] **[" cat "]** " desc " `" key "`"
        next
    }
    {print}
    ' "$TODO_FILE" > "$TODO_FILE.tmp" && mv "$TODO_FILE.tmp" "$TODO_FILE"
    
    echo "Added new todo: [$category] $description (Priority: $priority) Key: $key"
}

# Function to show current todos
show_todos() {
    echo "Current TODOs:"
    echo "============="
    echo ""
    
    # Show in progress items first
    echo "In Progress:"
    grep -E "^- \[ \] 🔄" "$TODO_FILE" | while read -r line; do
        echo "  🔄 $line"
    done
    
    echo ""
    echo "Pending:"
    grep -E "^- \[ \] \*\*" "$TODO_FILE" | while read -r line; do
        echo "  $line"
    done
    
    echo ""
    echo "Completed:"
    grep -E "^- \[x\]" "$TODO_FILE" | while read -r line; do
        echo "  ✓ $line"
    done
}

# Main script logic
case "$1" in
    complete)
        mark_complete "$2"
        ;;
    progress)
        mark_in_progress "$2"
        ;;
    add)
        add_todo "$2" "$3" "$4"
        ;;
    show)
        show_todos
        ;;
    *)
        echo "Usage: $0 {complete|progress|add|show} [args]"
        echo "  complete <pattern>  - Mark a todo matching pattern as complete"
        echo "                        Pattern can be a TODO key (e.g., TODO-001) or text"
        echo "  progress <pattern>  - Mark a todo matching pattern as in progress"
        echo "                        Pattern can be a TODO key (e.g., TODO-001) or text"
        echo "  add <priority> <category> <description> - Add a new todo"
        echo "                        Priority: P0, P1, P2, P3"
        echo "                        Category: UI/UX, Infrastructure, Features, Monetization, Documentation"
        echo "  show                - Display all todos with status"
        echo ""
        echo "Examples:"
        echo "  $0 complete TODO-001"
        echo "  $0 complete \"font size\""
        echo "  $0 progress TODO-002"
        echo "  $0 add P1 Features \"Add dark mode support\""
        exit 1
        ;;
esac