#!/bin/bash

mongoimport --host localhost \
            --db delivery_db \
            --collection menu_items \
            --type json \
            --file /tmp/menu.json \
            --jsonArray \
            --drop