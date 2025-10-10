#docker build -t recipe_world_frontend_image .
#docker run -d --name recipe_world_frontend_container -p 5173:5173 recipe_world_frontend_image

FROM node:20-bookworm-slim
WORKDIR /app

COPY package.json ./

RUN npm install --no-audit --no-fund

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]