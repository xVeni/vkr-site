# Этап 1: Сборка React приложения
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Этап 2: Раздача собранного приложения через Nginx
FROM nginx:alpine
# Копируем результаты сборки в стандартную директорию Nginx
COPY --from=build /app/build /usr/share/nginx/html
# (Сам конфиг Nginx мы примонтируем через docker-compose)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
