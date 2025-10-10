# 🍳 Recipe World

A modern **recipe sharing web app** built with **React (Vite)** and **Express + SQLite**.

<img width="1703" height="873" alt="image" src="https://github.com/user-attachments/assets/226b1db3-c175-458e-9e01-e2129f480a7d" />

---

## 🚀 Features

### 👤 Users
- Register / Login (JWT authentication)
- View your profile with all your recipes
- View other users’ public profiles

### 🧑‍🍳 Recipes
- Create, edit, and delete your own recipes  
- View all public recipes on the homepage  
- Filter and sort recipes (by title, author, date)  
- Detailed recipe view with ingredients and steps  
- Print-friendly layout for recipe details  

### 💬 Comments
- Add comments to recipes  
- Display author and date for each comment  

### 📘 Bookmarks
- Add or remove recipes from bookmarks  
- View all bookmarked recipes under *My Bookmarks*  

### 🤝 Following
- Follow or unfollow other users  
- View follower/following counts on profiles  
- See who you follow and who follows you  


---

## 🐳 Docker
Each part has its own Dockerfile:

```bash
# Build and run backend
cd backend
docker build -t recipe_world_backend_image .
docker run -d --name recipe_world_backend_container -p 3000:3000 recipe_world_backend_image

# Build and run frontend
cd frontend
docker build -t recipe_world_frontend_image .
docker run -d --name recipe_world_frontend_container -p 5173:5173 recipe_world_frontend_image
```
