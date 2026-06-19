#!/bin/bash
set -e
echo "Uruchamianie procedury startowej Dopamine Delivery"

echo "Budowanie aplikacji Angular..."
cd dopamine-delivery-frontend 
ng build

cd - > /dev/null
echo "Uruchamianie kontenerów Docker Compose..."
docker compose --env-file ./config/.env-test -f ./config/docker-compose-test.yml up -d --build

echo "Wszystkie systemy wystartowały."