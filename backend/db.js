import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getDb() {
    const db = await open({
        filename: path.join(__dirname, "recipe_world.sqlite"),
        driver: sqlite3.Database
    });
    await db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
  `);
    return db;
}

export async function initDb() {
    const db = await getDb();

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             email TEXT UNIQUE NOT NULL,
                                             username TEXT NOT NULL,
                                             password_hash TEXT NOT NULL,
                                             created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS recipes (
                                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                                               user_id INTEGER NOT NULL,
                                               title TEXT NOT NULL,
                                               description TEXT DEFAULT '',
                                               ingredients TEXT DEFAULT '',
                                               steps TEXT DEFAULT '',
                                               image_url TEXT DEFAULT '',
                                               created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                               updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                               FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

        CREATE INDEX IF NOT EXISTS idx_recipes_user ON recipes(user_id);

        CREATE TABLE IF NOT EXISTS comments (
                                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                recipe_id INTEGER NOT NULL,
                                                user_id INTEGER NOT NULL,
                                                content TEXT NOT NULL,
                                                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

        CREATE INDEX IF NOT EXISTS idx_comments_recipe ON comments(recipe_id);
        CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);

        CREATE TABLE IF NOT EXISTS favorites (
                                                 user_id INTEGER NOT NULL,
                                                 recipe_id INTEGER NOT NULL,
                                                 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                 PRIMARY KEY (user_id, recipe_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
            );

        CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
        CREATE INDEX IF NOT EXISTS idx_favorites_recipe ON favorites(recipe_id);

        CREATE TABLE IF NOT EXISTS follows (
                                               follower_id INTEGER NOT NULL,
                                               followee_id INTEGER NOT NULL,
                                               created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                               PRIMARY KEY (follower_id, followee_id),
            FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (followee_id) REFERENCES users(id) ON DELETE CASCADE
            );
        CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
        CREATE INDEX IF NOT EXISTS idx_follows_followee ON follows(followee_id);
    `);

    await seed(db);
    await seedComments(db);
    return db;
}

async function seed(db) {
    const users = [
        { email: "alice@example.com", username: "alice", password: "password123" },
        { email: "bob@example.com", username: "bob", password: "password123" },
        { email: "charlie@example.com", username: "charlie", password: "password123" }
    ];

    const userIds = {};
    for (const u of users) {
        const existing = await db.get(`SELECT id FROM users WHERE email = ?`, u.email);
        if (existing) {
            userIds[u.username] = existing.id;
        } else {
            const hash = await bcrypt.hash(u.password, 12);
            const r = await db.run(
                `INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)`,
                u.email, u.username, hash
            );
            userIds[u.username] = r.lastID;
        }
    }

    const addRecipeOnce = async (user_id, title, description, ingredientsArr, stepsArr, image_url = "/food.png") => {
        const exists = await db.get(`SELECT id FROM recipes WHERE user_id = ? AND title = ?`, user_id, title);
        if (exists) return;
        const ingredients = (ingredientsArr || []).join("\n");
        const steps = (stepsArr || []).join("\n");
        await db.run(
            `INSERT INTO recipes (user_id, title, description, ingredients, steps, image_url)
             VALUES (?, ?, ?, ?, ?, ?)`,
            user_id, title, description || "", ingredients, steps, image_url
        );
    };

    const img = "/food.png";

    await addRecipeOnce(
        userIds.alice,
        "Fluffy Pancakes",
        "Simple, soft pancakes perfect for weekends.",
        ["1 cup flour", "2 tbsp sugar", "1 tsp baking powder", "1 egg", "3/4 cup milk", "Pinch of salt"],
        ["Whisk dry ingredients.", "Add egg and milk; mix until smooth.", "Cook on medium pan until bubbles form; flip."],
        "/fluffy_pancakes.jpg"
    );
    await addRecipeOnce(
        userIds.alice,
        "Garlic Butter Shrimp",
        "Quick 10-minute skillet shrimp.",
        ["400g shrimp", "3 cloves garlic", "3 tbsp butter", "Lemon juice", "Parsley", "Salt & pepper"],
        ["Melt butter and sauté garlic.", "Add shrimp; cook 2–3 min.", "Finish with lemon and parsley."],
        "/garlic_butter_shrimp.jpg"
    );
    await addRecipeOnce(
        userIds.alice,
        "Blueberry Muffins",
        "Bakery-style muffins with crunchy tops.",
        ["2 cups flour", "1/2 cup sugar", "2 tsp baking powder", "1 cup blueberries", "1 egg", "3/4 cup milk", "1/3 cup oil"],
        ["Mix dry ingredients.", "Fold in wet ingredients gently.", "Add blueberries.", "Bake at 190°C for 18–22 min."],
        "/blueberry-muffin.jpg"
    );
    await addRecipeOnce(
        userIds.alice,
        "Classic French Toast",
        "Custardy center, golden edges.",
        ["4 slices brioche", "2 eggs", "1/2 cup milk", "1 tsp vanilla", "Butter", "Maple syrup"],
        ["Whisk eggs, milk, vanilla.", "Soak bread briefly.", "Cook in butter until golden both sides."],
        "/classic_french_toast.jpeg"
    );
    await addRecipeOnce(
        userIds.alice,
        "Avocado Toast with Egg",
        "Creamy avo, jammy egg, chili flakes.",
        ["2 slices sourdough", "1 avocado", "1 egg", "Chili flakes", "Salt", "Olive oil"],
        ["Toast bread.", "Mash avocado with salt + oil.", "Top with egg and chili flakes."],
        "/avocado_toast_with_egg.jpg"
    );
    await addRecipeOnce(
        userIds.alice,
        "Banana Bread",
        "Moist, one-bowl banana bread.",
        ["3 ripe bananas", "1/2 cup sugar", "1 egg", "1.5 cups flour", "1 tsp baking soda", "Pinch of salt", "1/3 cup butter"],
        ["Mash bananas.", "Mix with sugar, egg, melted butter.", "Add dry ingredients.", "Bake at 175°C for ~55 min."],
        "/banana_bread.jpg"
    );
    await addRecipeOnce(
        userIds.alice,
        "Tomato Basil Bruschetta",
        "Fresh starter for any occasion.",
        ["Baguette", "3 tomatoes", "2 tbsp olive oil", "Basil", "1 garlic clove", "Salt"],
        ["Toast baguette slices.", "Mix diced tomatoes with oil, basil, salt.", "Rub bread with garlic, top with tomatoes."],
        "/tomato_basic_bruschetta.jpg"
    );
    await addRecipeOnce(
        userIds.alice,
        "Creamy Mushroom Risotto",
        "Silky Arborio rice with mushrooms.",
        ["1 cup Arborio rice", "200g mushrooms", "1 onion", "2 tbsp butter", "750ml stock", "Parmesan"],
        ["Sauté onion + mushrooms.", "Toast rice.", "Add stock gradually, stirring.", "Finish with butter and parmesan."],
        "/creamy_mushroom_risotto.jpeg"
    );

    await addRecipeOnce(
        userIds.bob,
        "Creamy Tomato Pasta",
        "Weeknight pasta with a silky tomato-cream sauce.",
        ["250g pasta", "1 cup tomato passata", "1/2 cup cream", "1 onion", "Olive oil", "Parmesan", "Salt"],
        ["Boil pasta.", "Sauté onion in oil.", "Add passata, then cream.", "Toss pasta with sauce; top with parmesan."],
        "/creamy_tomato_pasta.jpg"
    );
    await addRecipeOnce(
        userIds.bob,
        "Spaghetti Carbonara",
        "No cream, just eggs and cheese.",
        ["200g spaghetti", "100g pancetta", "2 eggs", "50g pecorino", "Black pepper", "Salt"],
        ["Cook pasta.", "Fry pancetta.", "Mix eggs + cheese.", "Combine off heat; add pepper."],
        "/spaghetti_carbonara.jpg"
    );
    await addRecipeOnce(
        userIds.bob,
        "Pesto Genovese",
        "Classic basil pesto.",
        ["2 cups basil", "1/3 cup pine nuts", "1/2 cup olive oil", "1 garlic clove", "Parmesan", "Salt"],
        ["Blend basil, nuts, garlic.", "Stream in oil.", "Stir in cheese, season."],
        "/pesto_genovese.jpg"
    );
    await addRecipeOnce(
        userIds.bob,
        "Chicken Alfredo",
        "Creamy garlic sauce with grilled chicken.",
        ["250g fettuccine", "200g chicken breast", "2 tbsp butter", "2 cloves garlic", "3/4 cup cream", "Parmesan"],
        ["Grill chicken.", "Sauté garlic in butter.", "Add cream + cheese.", "Toss with pasta and sliced chicken."],
        "/chicken_alfredo.jpg"
    );
    await addRecipeOnce(
        userIds.bob,
        "Beef Chili",
        "Comforting, mildly spicy chili.",
        ["400g ground beef", "1 onion", "2 cloves garlic", "1 can tomatoes", "1 can beans", "Chili powder", "Cumin", "Salt"],
        ["Brown beef.", "Sauté onion+garlic.", "Add tomatoes, beans, spices.", "Simmer 25–30 min."],
        "/beef_chili.jpg"
    );
    await addRecipeOnce(
        userIds.bob,
        "Greek Salad",
        "Crisp, tangy, refreshing.",
        ["Tomatoes", "Cucumber", "Red onion", "Olives", "Feta", "Olive oil", "Oregano", "Salt"],
        ["Chop veg.", "Dress with oil, oregano, salt.", "Top with feta."],
        "/greek_salat.jpg"
    );
    await addRecipeOnce(
        userIds.bob,
        "Shakshuka",
        "Eggs poached in spiced tomato sauce.",
        ["1 onion", "2 cloves garlic", "1 red pepper", "1 can tomatoes", "4 eggs", "Paprika", "Cumin", "Salt"],
        ["Sauté onion, pepper, garlic.", "Add spices + tomatoes.", "Simmer, crack eggs, cover until set."],
        img
    );
    await addRecipeOnce(
        userIds.bob,
        "Teriyaki Salmon",
        "Sticky, sweet-salty glaze.",
        ["2 salmon fillets", "3 tbsp soy sauce", "2 tbsp mirin", "1 tbsp sugar", "1 tsp ginger", "Sesame"],
        ["Mix glaze.", "Sear salmon, add glaze to reduce.", "Sprinkle sesame."],
        "/teriyaki_salmon.jpg"
    );

    await addRecipeOnce(
        userIds.charlie,
        "Oven-Baked Chicken Thighs",
        "Crispy skin, juicy inside.",
        ["6 chicken thighs", "Olive oil", "Paprika", "Garlic powder", "Salt & pepper"],
        ["Preheat oven 200°C.", "Rub thighs with oil and spices.", "Bake 35–40 min until crispy."],
        "/oven_baked_chicken_thighs.jpg"
    );
    await addRecipeOnce(
        userIds.charlie,
        "Roasted Veggie Medley",
        "Sheet-pan colorful vegetables.",
        ["Carrots", "Broccoli", "Bell peppers", "Red onion", "Olive oil", "Salt", "Pepper"],
        ["Chop veggies.", "Toss with oil, salt, pepper.", "Roast at 200°C for 20–25 min."],
        "/roasted_veggie_medley.jpg"
    );
    await addRecipeOnce(
        userIds.charlie,
        "Creamy Pumpkin Soup",
        "Velvety autumn soup.",
        ["500g pumpkin", "1 onion", "1 potato", "Stock", "Cream", "Nutmeg", "Salt"],
        ["Sauté onion.", "Add pumpkin + potato + stock.", "Cook soft, blend, add cream + nutmeg."],
        "creamy_pumpkin_soup.jpg"
    );
    await addRecipeOnce(
        userIds.charlie,
        "Caprese Sandwich",
        "Fresh mozzarella, tomato, basil.",
        ["Ciabatta", "Tomato", "Mozzarella", "Basil", "Olive oil", "Balsamic", "Salt"],
        ["Slice bread, layer tomato + mozzarella + basil.", "Drizzle oil + balsamic, season."],
        "/caprese_sandwich.jpg"
    );
    await addRecipeOnce(
        userIds.charlie,
        "Crispy Tofu Stir-Fry",
        "Quick plant-based dinner.",
        ["300g firm tofu", "Broccoli", "Carrot", "Soy sauce", "Garlic", "Ginger", "Cornstarch"],
        ["Cube tofu, coat with cornstarch, pan-fry.", "Stir-fry veggies, add aromatics + soy.", "Combine."],
        "/crispy_tofu_stir_fry.jpg"
    );
    await addRecipeOnce(
        userIds.charlie,
        "Vegan Lentil Bolognese",
        "Hearty, rich, satisfying.",
        ["1 cup lentils", "1 onion", "2 carrots", "1 celery", "Tomato passata", "Olive oil", "Salt"],
        ["Sauté veg.", "Add lentils + passata + water.", "Simmer until tender."],
        "/vegan_lentil_bolognese.jpg"
    );
    await addRecipeOnce(
        userIds.charlie,
        "Garlic Naan",
        "Soft, buttery flatbread.",
        ["2 cups flour", "1 tsp yeast", "1 tsp sugar", "1/2 cup yogurt", "2 tbsp butter", "Garlic", "Salt"],
        ["Make dough, rise 1h.", "Cook on hot pan.", "Brush with garlic butter."],
        "/garlic_naan.jpg"
    );
    await addRecipeOnce(
        userIds.charlie,
        "Chocolate Chip Cookies",
        "Chewy centers, crisp edges.",
        ["1/2 cup butter", "1/2 cup brown sugar", "1/3 cup white sugar", "1 egg", "1.5 cups flour", "1 tsp baking soda", "Choc chips", "Salt"],
        ["Cream butter + sugars.", "Add egg.", "Fold dry + chips.", "Bake at 180°C for 10–12 min."],
        "/chocolate_chip_cookies.jpg"
    );
}

async function seedComments(db) {
    const any = await db.get(`SELECT id FROM comments LIMIT 1`);
    if (any) return;

    const recipes = await db.all(`
        SELECT r.id, u.username AS author
        FROM recipes r
                 JOIN users u ON u.id = r.user_id
        ORDER BY r.created_at ASC
            LIMIT 12
    `);
    if (!recipes.length) return;

    const users = await db.all(`SELECT id, username FROM users`);
    const byName = Object.fromEntries(users.map(u => [u.username, u.id]));

    const samples = [
        "Looks delicious! 🧑‍🍳",
        "Tried this today — turned out great.",
        "Any tip to make it spicier?",
        "Family loved it, thanks!",
        "Super quick weeknight recipe.",
        "This will be on repeat!",
        "Perfect texture and flavor!",
        "Made it for friends — they asked for the recipe!"
    ];

    for (let i = 0; i < recipes.length; i++) {
        const r = recipes[i];
        const authorId =
            i % 3 === 0 ? byName["alice"] :
                i % 3 === 1 ? byName["bob"]   :
                    byName["charlie"];

        const msg1 = samples[i % samples.length];
        await db.run(
            `INSERT INTO comments (recipe_id, user_id, content) VALUES (?, ?, ?)`,
            r.id, authorId, msg1
        );

        if (i % 2 === 0) {
            const msg2 = samples[(i + 3) % samples.length];
            const altUser =
                authorId === byName["alice"] ? byName["bob"] :
                    authorId === byName["bob"]   ? byName["charlie"] :
                        byName["alice"];
            await db.run(
                `INSERT INTO comments (recipe_id, user_id, content) VALUES (?, ?, ?)`,
                r.id, altUser, msg2
            );
        }
    }
}