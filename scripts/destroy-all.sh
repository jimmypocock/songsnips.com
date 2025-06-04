#!/bin/bash
set -e

# Script to completely remove all AWS resources created by this application
# This will delete ALL stacks and their resources - use with caution!

# Load configuration
source "$(dirname "$0")/config.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Trap Ctrl+C
trap 'echo -e "\n${RED}Script interrupted by user${NC}"; exit 1' INT

echo -e "${RED}⚠️  WARNING: Complete Stack Deletion${NC}"
echo "=========================================="
echo "This will DELETE all AWS resources including:"
echo "  - CloudFront distribution"
echo "  - S3 buckets (website and logs)"
echo "  - WAF rules"
echo "  - Monitoring dashboards"
echo "  - SSL certificate (if you want to keep it)"
echo ""
echo -e "${YELLOW}Note: S3 buckets will be emptied before deletion${NC}"
echo ""

# Confirm deletion
read -p "Are you sure you want to delete EVERYTHING? Type 'DELETE' to confirm: " CONFIRM
if [ "$CONFIRM" != "DELETE" ]; then
    echo "Deletion cancelled."
    exit 0
fi

# Check if user wants to keep certificate
echo ""
read -p "Do you want to KEEP your SSL certificate for future use? (y/N): " KEEP_CERT
KEEP_CERT=${KEEP_CERT:-N}

echo ""
echo "Starting deletion process..."
echo "=========================================="

# Function to check if stack exists
check_stack_exists() {
    local stack_name=$1
    aws cloudformation describe-stacks --stack-name "$stack_name" --region us-east-1 2>&1 | grep -q "$stack_name"
}

# Function to wait for stack deletion with timeout
wait_for_deletion() {
    local stack_name=$1
    local max_attempts=60  # 30 minutes max (30 seconds * 60)
    local attempt=0
    
    echo "Waiting for $stack_name deletion to complete..."
    
    while [ $attempt -lt $max_attempts ]; do
        STATUS=$(aws cloudformation describe-stacks --stack-name "$stack_name" --region us-east-1 --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "DELETED")
        
        if [ "$STATUS" == "DELETED" ] || [ "$STATUS" == "DELETE_COMPLETE" ]; then
            echo "  Stack deleted successfully"
            return 0
        elif [ "$STATUS" == "DELETE_FAILED" ]; then
            echo "  Stack deletion failed"
            return 1
        fi
        
        echo -n "."
        sleep 30
        ((attempt++))
    done
    
    echo ""
    echo "  Timeout waiting for deletion (this is normal for CloudFront)"
    return 0
}

# Function to empty S3 bucket
empty_s3_bucket() {
    local bucket_name=$1
    if aws s3api head-bucket --bucket "$bucket_name" 2>/dev/null; then
        echo "Emptying S3 bucket: $bucket_name"
        
        # First remove all current objects
        aws s3 rm "s3://$bucket_name" --recursive || true
        
        # Check if versioning is enabled
        VERSIONING=$(aws s3api get-bucket-versioning --bucket "$bucket_name" --query 'Status' --output text 2>/dev/null || echo "")
        
        if [ "$VERSIONING" == "Enabled" ] || [ "$VERSIONING" == "Suspended" ]; then
            echo "  Removing versioned objects..."
            # Remove all versions
            aws s3api list-object-versions --bucket "$bucket_name" --output json 2>/dev/null | \
            jq -r '.Versions[]? | "--key '\''\(.Key)'\'' --version-id \(.VersionId)"' | \
            while read -r line; do
                if [ ! -z "$line" ]; then
                    eval "aws s3api delete-object --bucket $bucket_name $line" 2>/dev/null || true
                fi
            done
            
            # Remove all delete markers
            aws s3api list-object-versions --bucket "$bucket_name" --output json 2>/dev/null | \
            jq -r '.DeleteMarkers[]? | "--key '\''\(.Key)'\'' --version-id \(.VersionId)"' | \
            while read -r line; do
                if [ ! -z "$line" ]; then
                    eval "aws s3api delete-object --bucket $bucket_name $line" 2>/dev/null || true
                fi
            done
        fi
    fi
}

# 1. Delete App Stack (fastest changing, no dependencies)
if check_stack_exists "$APP_STACK"; then
    echo ""
    echo "1/7: Deleting App Stack..."
    aws cloudformation delete-stack --stack-name "$APP_STACK" --region us-east-1
    wait_for_deletion "$APP_STACK"
    echo -e "${GREEN}✅ App stack deleted${NC}"
else
    echo "✅ App stack not found (already deleted)"
fi

# 2. Delete Monitoring Stack
if check_stack_exists "$MONITORING_STACK"; then
    echo ""
    echo "2/7: Deleting Monitoring Stack..."
    aws cloudformation delete-stack --stack-name "$MONITORING_STACK" --region us-east-1
    wait_for_deletion "$MONITORING_STACK"
    echo -e "${GREEN}✅ Monitoring stack deleted${NC}"
else
    echo "✅ Monitoring stack not found (already deleted)"
fi

# 3. Delete CDN Stack
if check_stack_exists "$CDN_STACK"; then
    echo ""
    echo "3/7: Deleting CDN Stack..."
    echo "Note: CloudFront distribution deletion can take 15-20 minutes..."
    aws cloudformation delete-stack --stack-name "$CDN_STACK" --region us-east-1
    wait_for_deletion "$CDN_STACK"
    echo -e "${GREEN}✅ CDN stack deleted${NC}"
else
    echo "✅ CDN stack not found (already deleted)"
fi

# 4. Delete WAF Stack
if check_stack_exists "$WAF_STACK"; then
    echo ""
    echo "4/7: Deleting WAF Stack..."
    aws cloudformation delete-stack --stack-name "$WAF_STACK" --region us-east-1
    wait_for_deletion "$WAF_STACK"
    echo -e "${GREEN}✅ WAF stack deleted${NC}"
else
    echo "✅ WAF stack not found (already deleted)"
fi

# 5. Delete Edge Functions Stack
if check_stack_exists "$EDGE_FUNCTIONS_STACK"; then
    echo ""
    echo "5/7: Deleting Edge Functions Stack..."
    aws cloudformation delete-stack --stack-name "$EDGE_FUNCTIONS_STACK" --region us-east-1
    wait_for_deletion "$EDGE_FUNCTIONS_STACK"
    echo -e "${GREEN}✅ Edge Functions stack deleted${NC}"
else
    echo "✅ Edge Functions stack not found (already deleted)"
fi

# 6. Delete Certificate Stack (if not keeping)
if [ "$KEEP_CERT" != "y" ] && [ "$KEEP_CERT" != "Y" ]; then
    if check_stack_exists "$CERTIFICATE_STACK"; then
        echo ""
        echo "6/7: Deleting Certificate Stack..."
        aws cloudformation delete-stack --stack-name "$CERTIFICATE_STACK" --region us-east-1
        wait_for_deletion "$CERTIFICATE_STACK"
        echo -e "${GREEN}✅ Certificate stack deleted${NC}"
    else
        echo "✅ Certificate stack not found (already deleted)"
    fi
else
    echo -e "${YELLOW}⚠️  Keeping certificate stack as requested${NC}"
fi

# 7. Delete Foundation Stack (must be last due to S3 buckets)
FOUNDATION_STATUS=$(aws cloudformation describe-stacks --stack-name "$FOUNDATION_STACK" --region us-east-1 --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$FOUNDATION_STATUS" != "NOT_FOUND" ]; then
    echo ""
    echo "7/7: Deleting Foundation Stack..."
    
    # If stack is already in DELETE_FAILED, we need to force delete buckets
    if [ "$FOUNDATION_STATUS" == "DELETE_FAILED" ]; then
        echo -e "${YELLOW}Stack is in DELETE_FAILED state. Force deleting buckets...${NC}"
        
        # Force delete buckets
        for bucket_name in "${DOMAIN_NAME}-app" "${DOMAIN_NAME}-logs"; do
            if aws s3api head-bucket --bucket "$bucket_name" 2>/dev/null; then
                echo "Force deleting bucket: $bucket_name"
                
                # Remove bucket policy
                aws s3api delete-bucket-policy --bucket "$bucket_name" 2>/dev/null || true
                
                # Delete all objects and versions
                aws s3 rm "s3://$bucket_name" --recursive 2>/dev/null || true
                
                # Delete all versions if versioning was enabled (batch delete for efficiency)
                echo "  Checking for versioned objects..."
                VERSIONS_FILE="/tmp/versions-$$.json"
                
                # Get all versions
                aws s3api list-object-versions --bucket "$bucket_name" --output json 2>/dev/null > "$VERSIONS_FILE" || echo '{}' > "$VERSIONS_FILE"
                
                # Count versions
                VERSION_COUNT=$(jq '.Versions | length' "$VERSIONS_FILE" 2>/dev/null || echo "0")
                if [ "$VERSION_COUNT" -gt "0" ]; then
                    echo "  Deleting $VERSION_COUNT object versions..."
                    jq -r '.Versions[] | "--key '\''\(.Key)'\'' --version-id \(.VersionId)"' "$VERSIONS_FILE" | \
                    head -1000 | \
                    while read -r line; do
                        if [ ! -z "$line" ]; then
                            eval "aws s3api delete-object --bucket $bucket_name $line" 2>/dev/null || true
                        fi
                    done
                fi
                
                # Count delete markers
                MARKER_COUNT=$(jq '.DeleteMarkers | length' "$VERSIONS_FILE" 2>/dev/null || echo "0")
                if [ "$MARKER_COUNT" -gt "0" ]; then
                    echo "  Deleting $MARKER_COUNT delete markers..."
                    jq -r '.DeleteMarkers[] | "--key '\''\(.Key)'\'' --version-id \(.VersionId)"' "$VERSIONS_FILE" | \
                    head -1000 | \
                    while read -r line; do
                        if [ ! -z "$line" ]; then
                            eval "aws s3api delete-object --bucket $bucket_name $line" 2>/dev/null || true
                        fi
                    done
                fi
                
                rm -f "$VERSIONS_FILE"
                
                # Force delete the bucket
                aws s3api delete-bucket --bucket "$bucket_name" --region us-east-1 2>/dev/null || \
                aws s3 rb "s3://$bucket_name" --force 2>/dev/null || true
                
                if ! aws s3api head-bucket --bucket "$bucket_name" 2>/dev/null; then
                    echo "  ✅ Bucket $bucket_name deleted"
                fi
            fi
        done
    else
        # Normal deletion - just empty buckets
        empty_s3_bucket "${DOMAIN_NAME}-app"
        empty_s3_bucket "${DOMAIN_NAME}-logs"
    fi
    
    # Now delete the stack
    aws cloudformation delete-stack --stack-name "$FOUNDATION_STACK" --region us-east-1
    wait_for_deletion "$FOUNDATION_STACK"
    
    # Check if deletion was successful
    FINAL_STATUS=$(aws cloudformation describe-stacks --stack-name "$FOUNDATION_STACK" --region us-east-1 --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "DELETED")
    
    if [ "$FINAL_STATUS" == "DELETE_FAILED" ]; then
        echo -e "${RED}❌ Foundation stack still in DELETE_FAILED state${NC}"
        echo ""
        echo "Manual intervention required:"
        echo "1. Go to CloudFormation console"
        echo "2. Select the stack and delete it"
        echo "3. Check 'Retain' for any problematic resources"
        exit 1
    elif [ "$FINAL_STATUS" == "DELETED" ]; then
        echo -e "${GREEN}✅ Foundation stack deleted${NC}"
    fi
else
    echo "✅ Foundation stack not found (already deleted)"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 All AWS resources have been deleted!${NC}"
echo ""
echo "Note: DNS records pointing to CloudFront should be removed manually."
if [ "$KEEP_CERT" == "y" ] || [ "$KEEP_CERT" == "Y" ]; then
    echo -e "${YELLOW}Your SSL certificate was preserved for future use.${NC}"
fi
echo ""
echo "To redeploy in the future, run: npm run deploy:all"