FROM node:18.14.2 AS builder

WORKDIR /app

COPY package.json .

RUN yarn install

COPY . .

RUN yarn build

FROM nginx:latest

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build/ /usr/share/nginx/html/
