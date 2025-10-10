const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export async function api(path, { method = "GET", body, token } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data?.error || "Request failed");
    }
    return data;
}

function qs(params = {}) {
    const entries = Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== null && `${v}`.trim() !== ""
    );
    if (!entries.length) return "";
    const query = new URLSearchParams(entries).toString();
    return `?${query}`;
}

export const profileApi = {
    meWithRecipes: (token) => api("/api/profile", { token })
};

export const recipesApi = {
    listMine: (token) => api("/api/recipes", { token }),
    create: (token, payload) =>
        api("/api/recipes", { method: "POST", body: payload, token }),
    update: (token, id, payload) =>
        api(`/api/recipes/${id}`, { method: "PUT", body: payload, token }),
    remove: (token, id) =>
        api(`/api/recipes/${id}`, { method: "DELETE", token })
};

export const publicApi = {
    list: (params) => api(`/api/recipes/public${qs(params)}`),
    get: (id) => api(`/api/recipes/public/${id}`)
};

export const commentsApi = {
    listPublic: (recipeId) => api(`/api/recipes/public/${recipeId}/comments`),
    add: (token, recipeId, content) =>
        api(`/api/recipes/${recipeId}/comments`, {
            method: "POST",
            body: { content },
            token
        })
};

export const bookmarksApi = {
    async list(token) {
        return api(`/api/bookmarks`, { token });
    },
    async add(token, recipeId) {
        return api(`/api/bookmarks/${recipeId}`, { method: "POST", token });
    },
    async remove(token, recipeId) {
        return api(`/api/bookmarks/${recipeId}`, { method: "DELETE", token });
    },
    async isBookmarked(token, recipeId) {
        return api(`/api/bookmarks/${recipeId}`, { token });
    }
};

export const authorsApi = {
    get: (username) => api(`/api/authors/${encodeURIComponent(username)}`)
};

export const followsApi = {
    status: (token, username) =>
        api(`/api/follows/status/${encodeURIComponent(username)}`, { token }),
    follow: (token, username) =>
        api(`/api/follows/${encodeURIComponent(username)}`, {
            method: "POST",
            token
        }),
    unfollow: (token, username) =>
        api(`/api/follows/${encodeURIComponent(username)}`, {
            method: "DELETE",
            token
        }),
    mine: (token) => api(`/api/follows`, { token })
};