# Running WDL Workspace using docker

You can use Docker image to build and run WDL Workspace.
Make sure `docker` is installed:
```
$ docker version
Docker version 18.09.2, build 6247962
```
If `docker` is not installed, please follow [docker engine installation guide](https://docs.docker.com/install/) for your operating system.
## Using published docker image
Pull docker image
```
$ docker pull lifescience/wdl-workspace:latest
```
## Building local WDL Workspace docker image
Get WDL Workspace sources:
```
$ git clone https://github.com/epam/wdl-workspace.git
cd wdl-workspace
```
Build docker image:
```
$ bash build.docker.sh
```
Image with name **wdl-workspace:latest** will be created.

## Running docker image
Run WDL Workspace in docker container:
```
$ docker run -p <LOCAL PORT>:80 -d wdl-workspace:latest
```
*where `<LOCAL PORT>` is port to be used for WDL Workspace GUI.*

Open your browser and navigate to **localhost:\<LOCAL PORT\>**

#### **Running options**
By default, `docker run ...` command will launch the docker container with **WDL Workspace GUI**, **cromwell** running in `server` mode and pre-distributed wdl workflows (**Workflow library**). You can override some endpoints:
```
$ docker run  -p <LOCAL PORT>:80 -d \
              -v <YOUR LOCAL FOLDER WITH WDL SCRIPTS>:/workflows \
              wdl-workspace:latest \
              --api=<CROMWELL SERVER API URL> \
              --executions=<CROMWELL SERVER EXECUTIONS FOLDER URL>
```
- use `-v <YOUR LOCAL FOLDER WITH WDL SCRIPTS>:/workflows` option if you want to browse your scripts within **Workflow library**
- use `--api=<CROMWELL SERVER API URL>` to set **cromwell**'s API endpoint URL, e.g. *https://some.server.com/cromwell/api*
- use ` --executions=<CROMWELL SERVER EXECUTIONS FOLDER URL>` to set **cromwell**'s server executions endpoint, e.g. *https://some.server.com/executions*
