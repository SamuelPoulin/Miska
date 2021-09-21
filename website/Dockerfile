FROM node:alpine

RUN apk add --update ffmpeg python3 make g++ && ln -sf python3 /usr/bin/python

WORKDIR /usr/src/miska/website

COPY package.json ./
RUN yarn

COPY . ./

CMD ["yarn", "dev"]
