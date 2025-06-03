#!/bin/bash
# Script to monitor stack status

# Load configuration
source "$(dirname "$0")/config.sh"

# Get stack name from argument or prompt
if [ -z "$1" ]; then
    echo "Usage: $0 <stack-name>"
    echo ""
    echo "Available stacks:"
    echo "  $FOUNDATION_STACK"
    echo "  $CERTIFICATE_STACK"
    echo "  $EDGE_FUNCTIONS_STACK"
    echo "  $WAF_STACK"
    echo "  $CDN_STACK"
    echo "  $APP_STACK"
    echo "  $MONITORING_STACK"
    exit 1
fi

STACK_NAME=$1

# Get AWS profile from environment or use default
AWS_PROFILE=${AWS_PROFILE:-default}

while true; do
    STATUS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --profile $AWS_PROFILE --region us-east-1 --query 'Stacks[0].StackStatus' --output text 2>/dev/null)
    
    if [ $? -ne 0 ]; then
        echo "$(date): Stack $STACK_NAME not found or error accessing it"
        break
    fi
    
    echo "$(date): $STACK_NAME status is $STATUS"
    
    if [[ $STATUS != *"IN_PROGRESS"* ]]; then
        echo "Stack is no longer in progress!"
        
        # Show any error reason if stack failed
        if [[ $STATUS == *"FAILED"* ]] || [[ $STATUS == *"ROLLBACK"* ]]; then
            echo ""
            echo "Stack operation failed. Recent events:"
            aws cloudformation describe-stack-events --stack-name $STACK_NAME --profile $AWS_PROFILE --region us-east-1 \
                --query 'StackEvents[?ResourceStatus==`CREATE_FAILED` || ResourceStatus==`UPDATE_FAILED`].[Timestamp,LogicalResourceId,ResourceStatusReason]' \
                --output table | head -20
        fi
        break
    fi
    
    sleep 30  # Check every 30 seconds
done