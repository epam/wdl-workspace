#!/usr/bin/env bash

WDL_WORKSPACE_ROOT="${WDL_WORKSPACE_ROOT:-.}"

CROMWELL_API=$(grep -oP '"api":[ ]*"\K([^"]*)(?=")' $WDL_WORKSPACE_ROOT/ui/routes.json)
PATH_MASK=$(grep -oP '"path_mask":[ ]*"\K([^"]*)(?=")' $WDL_WORKSPACE_ROOT/ui/routes.json)
EXECUTIONS_URL=$(grep -oP '"url":[ ]*"\K([^"]*)(?=")' $WDL_WORKSPACE_ROOT/ui/routes.json)
WORKFLOWS_URL=$(grep -oP '"listing_url":[ ]*"\K([^"]*)(?=")' $WDL_WORKSPACE_ROOT/ui/routes.json)
CROMWELL_CONFIG_FILE=$WDL_WORKSPACE_ROOT/cromwell.config
REBUILD_ROUTES_JSON=0
BUILD_CONFIG=1
for i in "$@"
do
case $i in
    -a=*|--api=*)
    CROMWELL_API="${i#*=}"
    REBUILD_ROUTES_JSON=1
    shift
    ;;
    -p=*|--path=*)
    PATH_MASK="${i#*=}"
    REBUILD_ROUTES_JSON=1
    shift
    ;;
    -e=*|--executions=*)
    EXECUTIONS_URL="${i#*=}"
    REBUILD_ROUTES_JSON=1
    shift
    ;;
    -w=*|--workflows=*)
    WORKFLOWS_URL="${i#*=}"
    REBUILD_ROUTES_JSON=1
    shift
    ;;
    -c=*|--config=*)
    CROMWELL_CONFIG_FILE="${i#*=}"
    BUILD_CONFIG=0
    shift
    ;;
    --help)
    HELP=YES
    shift
    ;;
    *)
          # unknown option
    ;;
esac
done

if (( $REBUILD_ROUTES_JSON )); then
    echo "{\"api\":\"${CROMWELL_API}\",\"executions\":{\"path_mask\":\"${PATH_MASK}\",\"url\":\"${EXECUTIONS_URL}\"},\"workflows\":{\"listing_url\":\"${WORKFLOWS_URL}\"}}" > $WDL_WORKSPACE_ROOT/ui/routes.json
    echo "Starting with"
    echo "cromwell api: ${CROMWELL_API}"
    echo "path mask: ${PATH_MASK}"
    echo "executions url: ${EXECUTIONS_URL}"
    echo "workflows url: ${WORKFLOWS_URL}"
fi

echo "Starting nginx..."
nginx

if (( $BUILD_CONFIG )); then
  echo "backend {
    default = \"Local\"
    providers {
      Local {
        config {
          root: \"$WDL_WORKSPACE_ROOT/cromwell-executions\"
          dockerRoot: \"$WDL_WORKSPACE_ROOT/cromwell-executions\"
        }
      }
    }
  }
  workflow-options {
    workflow-log-dir = \"$WDL_WORKSPACE_ROOT/cromwell-executions\"
    workflow-log-temporary = false
  }" > "$CROMWELL_CONFIG_FILE"
fi
echo "Starting cromwell server with config file $CROMWELL_CONFIG_FILE..."
CROMWELL_LOG_FILE="${CROMWELL_LOG_FILE:-/var/log/cromwell.log}"
touch "$CROMWELL_LOG_FILE"
nohup java -Dconfig.file="$CROMWELL_CONFIG_FILE" -jar $WDL_WORKSPACE_ROOT/cromwell.jar server > "$CROMWELL_LOG_FILE" 2>&1 &

tail -f "$CROMWELL_LOG_FILE"
