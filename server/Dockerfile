FROM node:alpine

RUN apk add --update ffmpeg python3 make g++ && ln -sf python3 /usr/bin/python

RUN npm install -g pm2

WORKDIR /usr/src/miska/server

COPY package*.json .
RUN npm install

COPY . .

CMD ["pm2-runtime", "ecosystem.config.js"]