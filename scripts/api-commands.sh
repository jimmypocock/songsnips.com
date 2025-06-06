#!/bin/bash

# API deployment helper script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

# Get the command from the first argument
COMMAND=$1

cd "$CDK_DIR" || exit 1

case $COMMAND in
  "deploy")
    npm run build && cdk deploy $API_STACK --require-approval never
    ;;
  "diff")
    npm run build && cdk diff $API_STACK
    ;;
  "destroy")
    cdk destroy $API_STACK --force
    ;;
  *)
    echo "Usage: $0 {deploy|diff|destroy}"
    exit 1
    ;;
esac