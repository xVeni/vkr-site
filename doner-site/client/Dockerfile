# Этап 1: Сборка React приложения
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Этап 2: Раздача собранного приложения через Nginx
FROM nginx:alpine
# Копируем конфиг Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Копируем результаты сборки
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
