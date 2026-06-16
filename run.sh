#!/bin/bash
set -e
echo "Uruchamianie procedury startowej Dopamine Delivery"

echo "Budowanie aplikacji Angular..."
cd dopamine-delivery-frontend 
ng build

cd - > /dev/null
echo "Uruchamianie kontenerów Docker Compose..."
docker-compose up --build -d

echo "Wszystkie systemy wystartowały."