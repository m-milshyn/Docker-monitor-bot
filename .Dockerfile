FROM node:18-alpine
# Создание группы и пользователя с другим UID
RUN addgroup -g 998 docker && \
    adduser -u 1001 -G docker -h /home/dockeruser -D dockeruser

# Установка Docker CLI
RUN apk add --no-cache docker-cli

# Установка вашего приложения
WORKDIR /app
COPY . .

# Установка зависимостей
RUN npm install

# Переключение на созданного пользователя
USER dockeruser
COPY . .