#!/bin/bash

read -p "Discord bot token: " token

echo DISCORD_TOKEN=$token >> website/.env

read -s -p "Database root password: " dbpassword

mkdir -p ./database/content/audio
mkdir -p ./database/content/picture
mkdir -p ./database/content/video
echo MONGO_INITDB_ROOT_USERNAME=root >> database/.env
echo MONGO_INITDB_ROOT_PASSWORD=$dbpassword >> database/.env
echo MONGO_INITDB_DATABASE=miska >> database/.env

echo MONGO_DB_USER=root >> website/.env
echo MONGO_DB_PASSWORD=$dbpassword >> website/.env
echo MONGO_DB_DATABASE=miska >> website/.env
echo MISKA_CONTENT_PATH=/usr/src/miska/database/content/ >> website/.env