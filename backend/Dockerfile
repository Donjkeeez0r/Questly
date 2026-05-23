FROM node:24-alpine AS builder

WORKDIR /app

RUN npm i -g pnpm

COPY package.json pnpm-workspace.yaml ./ 

RUN pnpm install

COPY . .

COPY prisma.config.ts ./prisma.config.ts

RUN pnpm dlx prisma generate

RUN pnpm run build


FROM node:24-alpine

WORKDIR /app

RUN npm i -g pnpm

COPY package.json pnpm-workspace.yaml ./ 

RUN pnpm install

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/prisma ./prisma

COPY prisma.config.ts ./prisma.config.ts

EXPOSE 3000

CMD [ "sh", "-c", "pnpm dlx prisma migrate deploy && node dist/src/main.js" ]