#!/bin/bash

# Load configuration
source "$(dirname "$0")/config.sh"

echo "📊 Checking status of all stacks..."
echo ""

PROFILE_ARG=""
if [ -n "$AWS_PROFILE" ]; then
    PROFILE_ARG="--profile $AWS_PROFILE"
fi

# List of stacks to check
STACKS=(
    # Legacy monolithic stack (being phased out)
    "$LEGACY_STACK"
    "$LEGACY_WAF_STACK"
    "$LEGACY_MONITORING_STACK"
    
    # New decoupled stacks
    "$FOUNDATION_STACK"
    "$CERTIFICATE_STACK"
    "$EDGE_FUNCTIONS_STACK"
    "$WAF_STACK"
    "$CDN_STACK"
    "$MONITORING_STACK"
    "$APP_STACK"
)

# Function to get stack status
get_stack_status() {
    local stack_name=$1
    local status=$(aws cloudformation describe-stacks --stack-name $stack_name $PROFILE_ARG --region us-east-1 --query 'Stacks[0].StackStatus' --output text 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo "$status"
    else
        echo "NOT_FOUND"
    fi
}

# Check each stack
echo "Stack Status:"
echo "=============================================="
for stack in "${STACKS[@]}"; do
    status=$(get_stack_status $stack)
    
    # Color code the status
    case $status in
        *COMPLETE)
            printf "%-40s ✅ %s\n" "$stack:" "$status"
            ;;
        *IN_PROGRESS)
            printf "%-40s ⏳ %s\n" "$stack:" "$status"
            ;;
        *FAILED*|*ROLLBACK*)
            printf "%-40s ❌ %s\n" "$stack:" "$status"
            ;;
        NOT_FOUND)
            printf "%-40s ⚠️  %s\n" "$stack:" "Not deployed"
            ;;
        *)
            printf "%-40s ❓ %s\n" "$stack:" "$status"
            ;;
    esac
done

echo ""

# Check if any stacks are in progress
IN_PROGRESS=false
for stack in "${STACKS[@]}"; do
    status=$(get_stack_status $stack)
    if [[ $status == *"IN_PROGRESS"* ]]; then
        IN_PROGRESS=true
        echo "⏳ Stack operation in progress: $stack"
    fi
done

if [ "$IN_PROGRESS" = true ]; then
    echo ""
    echo "💡 Tip: Run 'npm run status' to monitor progress"
else
    echo "✅ No operations in progress"
fi