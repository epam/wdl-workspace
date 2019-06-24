#!/usr/bin/env bash

WW_VERSION=$(npm run version --loglevel silent)
BUILD_VERSION=${WW_VERSION%.*}.$TRAVIS_BUILD_NUMBER
echo "Building WDL Workspace version $BUILD_VERSION"
docker build -t wdl-workspace:build . --build-arg VERSION=$BUILD_VERSION
