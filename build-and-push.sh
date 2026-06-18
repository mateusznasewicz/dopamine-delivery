#!/bin/bash
set -e

DOCKER_USER="mateusznasewicz"
BACKEND_IMAGE="dopamine-backend"
FRONTEND_IMAGE="dopamine-nginx"
TAG="latest"

docker login

docker build -f ./Dockerfile.backend -t $DOCKER_USER/$BACKEND_IMAGE:$TAG ./dopamine-delivery-backend
docker push $DOCKER_USER/$BACKEND_IMAGE:$TAG

docker build -f ./Dockerfile.nginx -t $DOCKER_USER/$FRONTEND_IMAGE:$TAG ./dopamine-delivery-frontend
docker push $DOCKER_USER/$FRONTEND_IMAGE:$TAG