FROM node:lts-jod

RUN apt update && apt install -y ffmpeg

WORKDIR /usr/src/miska/website

COPY package.json ./
RUN yarn

COPY . ./

CMD ["yarn", "dev"]
