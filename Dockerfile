FROM node:18.13-alpine3.17

WORKDIR /app

# Установка пакетов
COPY package.json package-lock.json ./
RUN npm install

COPY . .
