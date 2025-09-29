# --BUILD STAGE--
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


# --SERVER STAGE--
FROM nginx:stable-alpine3.21-slim

COPY --from=build /app/dist /usr/share/ngnix/html

EXPOSE 80

CMD ["nginx","-g","daemon off;"]