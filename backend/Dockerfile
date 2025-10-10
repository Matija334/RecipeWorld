#docker build -t recipe_world_backend_image .
#docker run -d --name recipe_world_backend_container -p 3000:3000 recipe_world_backend_image

FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]