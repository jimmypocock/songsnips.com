#!/bin/bash
set -e

# Load configuration
source "$(dirname "$0")/config.sh"

# Use CDN stack as default or accept first argument
STACK_NAME="${1:-$CDN_STACK}"
REGION="us-east-1"

echo "🔍 Diagnosing stack: $STACK_NAME"
echo ""

# Check stack status
echo "📊 Stack Status:"
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].[StackStatus,StackStatusReason]' \
    --output table 2>/dev/null || echo "Stack not found"

echo ""
echo "📋 Stack Events (last 10):"
aws cloudformation describe-stack-events \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'StackEvents[0:10].[Timestamp,ResourceStatus,ResourceType,LogicalResourceId,ResourceStatusReason]' \
    --output table 2>/dev/null || echo "Unable to get events"

echo ""
echo "🔧 Stack Resources:"
aws cloudformation describe-stack-resources \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'StackResources[?ResourceStatus!=`DELETE_COMPLETE`].[LogicalResourceId,ResourceType,ResourceStatus,PhysicalResourceId]' \
    --output table 2>/dev/null || echo "Unable to get resources"

echo ""
echo "🔒 Checking for deletion protection:"
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].EnableTerminationProtection' \
    --output text 2>/dev/null || echo "Unable to check"

echo ""
echo "💡 To force delete a stuck stack, you may need to:"
echo "   1. Skip certain resources during deletion"
echo "   2. Manually delete CloudFront distributions if they exist"
echo "   3. Check CloudFormation console for specific error messages"