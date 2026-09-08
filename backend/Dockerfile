FROM node:20-alpine

# Prisma engine (linux-musl-openssl-3.0.x, см. schema.prisma) требует
# реально существующую libssl.so.3 в системе — на голом node:20-alpine
# её может не быть в ожидаемом виде без явной установки пакета.
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start:dev"]
