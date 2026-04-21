FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Пробрасываем 3000 порт
EXPOSE 3000

# Команда для запуска NestJS в production режиме
CMD ["npm", "run", "start:prod"]
