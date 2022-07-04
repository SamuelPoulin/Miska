FROM node:latest
LABEL com.centurylinklabs.watchtower.enable="true"

RUN apt update && apt upgrade -y && apt install -y ffmpeg

WORKDIR /usr/src/miska/website

COPY package.json ./
RUN yarn

COPY . ./

CMD ["yarn", "dev"]
