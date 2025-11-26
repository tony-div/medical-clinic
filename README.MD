```
Instructions for an easy docker setup !!

1) replace the home dir path in the .env file in the infra folder with your own, or if you have the $Home path set up,
   replace the ${HOME_DIR} in the yaml file with the $Home variable directly
2) first go to the infra folder using (from root folder of the project)  cd ./infra
3) docker-compose up --build -d
4) if you wanna delete all containers to rebuild : docker-compose down then 3 again (make sure you're standing in /infra)
5) if you wanna remove a container : docker rm container_name
6) if you wanna stop a container: docker stop container_name
7) to list all running containers: docker ps
8) to show logs: docker logs container_name
9) to send environment variables while building the yaml like sending different port numbers to api or client containers, specify the variable and set it, like so:
   $env:API_PORT=4000
   docker-compose up -d
   or
   $env:API_PORT=4000
   $env:CLIENT_PORT=5174
   docker-compose up -d
these variable changes are only prevalent throughout a single terminal/powershell session, each line is a separate command

*: you can get container names from the docker-compose.yaml
```