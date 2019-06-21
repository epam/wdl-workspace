#!/bin/bash

set -e

# Parse inputs
DOCKER_REPO=$1
[ "$DOCKER_REPO" ] && DOCKER_REPO="${DOCKER_REPO}/"

IMAGE_NAME=${DOCKER_REPO}wdl-workspace

docker build -t ${IMAGE_NAME}:latest .
