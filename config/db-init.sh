#!/bin/bash

mongoimport --host localhost \
            --db delivery_db \
            --collection menu_items \
            --type json \
            --file /tmp/menu.json \
            --jsonArray \
            --drop

mongoimport --host localhost \
            --db delivery_db \
            --collection restaurants \
            --type json \
            --file /tmp/restaurants.json \
            --jsonArray \
            --drop

mongosh --host localhost delivery_db --eval "
  db.restaurants.createIndex({ 'geometry': '2dsphere' });
  print('Utworzono indeks 2dsphere dla kolekcji restaurants.');

  db.menu_items.createIndex({ 'cuisine': 'text' });
  print('Utworzono indeks grupowania cuisine dla kolekcji menu_items.');
"