#!/usr/bin/env bash

WW_VERSION=$(npm run version --loglevel silent)
BUILD_VERSION=${WW_VERSION%.*}.$TRAVIS_BUILD_NUMBER-$TRAVIS_COMMIT

if [[ "$TRAVIS_BRANCH" == "master" ]] && [[ "$TRAVIS_PULL_REQUEST" == "false" ]]; then
  echo "Deploying docker image: $BUILD_VERSION"
  docker login -u "$dockerhub_login" -p "$dockerhub_pass"
  docker tag wdl-workspace:build lifescience/wdl-workspace:$BUILD_VERSION
  docker tag wdl-workspace:build lifescience/wdl-workspace:latest
  docker push lifescience/wdl-workspace:$BUILD_VERSION
  docker push lifescience/wdl-workspace:latest
elif [[ "$TRAVIS_BRANCH" == "develop" ]] && [[ "$TRAVIS_PULL_REQUEST" == "false" ]]; then
  echo "Deploying docker image: develop"
  docker login -u "$dockerhub_login" -p "$dockerhub_pass"
  docker tag wdl-workspace:build lifescience/wdl-workspace:develop
  docker push lifescience/wdl-workspace:develop
else
  echo "Skipping deployment: $BUILD_VERSION"
fi
exit 0
