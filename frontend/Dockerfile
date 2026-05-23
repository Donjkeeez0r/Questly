FROM node:24-alpine AS builder

WORKDIR /app

RUN npm i -g pnpm

COPY package.json ./

RUN pnpm install

COPY . .

RUN pnpm run build


FROM nginx:stable-alpine

WORKDIR /app

COPY --from=builder /app/dist /user/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]