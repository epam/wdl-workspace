FROM  node:lts-alpine AS WDL_WORKSPACE_BUILD

ARG   WDL_WORKSPACE_INSTALL_ROOT="/opt/wdl-workspace"

WORKDIR $WDL_WORKSPACE_INSTALL_ROOT

ENV   PUBLIC_URL="/"

COPY  ./ $WDL_WORKSPACE_INSTALL_ROOT/wdl-workspace/

ENV   WW_CROMWELL_API="api" \
      WW_CROMWELL_EXECUTIONS_URL="executions" \
      WW_WORKFLOWS_URL="workflows"

RUN   cd wdl-workspace && \
      npm install && \
      npm run build

FROM  openjdk:8-jre

ARG   WDL_WORKSPACE_INSTALL_ROOT="/opt/wdl-workspace"

WORKDIR $WDL_WORKSPACE_INSTALL_ROOT

RUN   mkdir -p $WDL_WORKSPACE_INSTALL_ROOT/ui \
      /workflows

COPY  ./workflows/ /workflows/

COPY --from=WDL_WORKSPACE_BUILD $WDL_WORKSPACE_INSTALL_ROOT/wdl-workspace/build $WDL_WORKSPACE_INSTALL_ROOT/ui

COPY  ./docker/ /tmp/wdl-workspace/

RUN   apt update && \
      apt install -y nginx wget

RUN   wget -q "https://github.com/broadinstitute/cromwell/releases/download/41/cromwell-41.jar" -O cromwell.jar

RUN   sed -e "s,WDL_WORKSPACE_INSTALL_ROOT,$WDL_WORKSPACE_INSTALL_ROOT," \
      /tmp/wdl-workspace/wdl-workspace.nginx.conf >> /etc/nginx/sites-available/wdl-workspace && \
      cp /tmp/wdl-workspace/start.sh start && \
      chmod +x start && \
      rm -rf /tmp/wdl-workspace && \
      rm -rf /etc/nginx/sites-enabled/default && \
      ln -s /etc/nginx/sites-available/wdl-workspace /etc/nginx/sites-enabled/

ENV   PATH=$PATH:$WDL_WORKSPACE_INSTALL_ROOT \
      WDL_WORKSPACE_ROOT=$WDL_WORKSPACE_INSTALL_ROOT

CMD   ["./start"]
