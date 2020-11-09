FROM node:12-alpine

RUN mkdir -p /usr/src/frontend

WORKDIR /usr/src/frontend

COPY . .

RUN npm install

ENV NUXT_HOST 0.0.0.0

RUN npm run build

ENTRYPOINT npm run start
