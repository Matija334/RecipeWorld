import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { profileApi, recipesApi } from "../api.js";
import { followsApi } from "../api.js";

function RecipeFormModal({ show, onClose, onSubmit, initial }) {
    const [form, setForm] = useState(() => initial || {
        title: "",
        description: "",
        ingredients: "",
        steps: ""
    });

    useEffect(() => {
        setForm(initial || { title: "", description: "", ingredients: "", steps: "" });
    }, [initial, show]);

    if (!show) return null;

    const change = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const submit = (e) => { e.preventDefault(); onSubmit(form); };

    return (
        <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.35)" }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content card-pastel">
                    <div className="modal-header">
                        <h5 className="modal-title brand-title">{initial ? "Edit recipe" : "Add recipe"}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={submit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Title *</label>
                                <input className="form-control" value={form.title} required
                                       onChange={(e) => change("title", e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Description</label>
                                <textarea className="form-control" rows={2} value={form.description}
                                          onChange={(e) => change("description", e.target.value)} />
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Ingredients (one per line)</label>
                                    <textarea className="form-control" rows={6} value={form.ingredients}
                                              onChange={(e) => change("ingredients", e.target.value)} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Steps (one per line)</label>
                                    <textarea className="form-control" rows={6} value={form.steps}
                                              onChange={(e) => change("steps", e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-pastel">{initial ? "Save changes" : "Create recipe"}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function RecipeCard({ r, onEdit, onDelete, onOpen }) {
    const ingredients = useMemo(() => (r.ingredients || "").split(/\r?\n/).filter(Boolean), [r.ingredients]);
    const steps = useMemo(() => (r.steps || "").split(/\r?\n/).filter(Boolean), [r.steps]);
    const stop = (e) => e.stopPropagation();

    return (
        <div
            className="card card-pastel p-3 mb-3 card-clickable"
            onClick={() => onOpen(r.id)}
            role="button"
            aria-label={`Open ${r.title}`}
        >
            <div className="d-flex justify-content-between align-items-start">
                <h5 className="brand-title mb-2">{r.title}</h5>
                <div className="btn-group">
                    <button className="btn btn-sm btn-outline-secondary" onClick={(e) => { stop(e); onEdit(r); }}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={(e) => { stop(e); onDelete(r); }}>Delete</button>
                </div>
            </div>

            {r.description && <p className="text-muted">{r.description}</p>}

            <div className="row">
                <div className="col-md-6">
                    <h6>Ingredients</h6>
                    <ul className="mb-2">
                        {ingredients.length ? ingredients.map((it, idx) => <li key={idx}>{it}</li>) : <li className="text-muted">—</li>}
                    </ul>
                </div>
                <div className="col-md-6">
                    <h6>Steps</h6>
                    <ol className="mb-2">
                        {steps.length ? steps.map((it, idx) => <li key={idx}>{it}</li>) : <li className="text-muted">—</li>}
                    </ol>
                </div>
            </div>

            <small className="text-muted">
                Updated {new Date(r.updated_at || r.created_at).toLocaleString()}
            </small>
        </div>
    );
}

function UsersList({ title, users }) {
    return (
        <div className="panel mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="m-0">{title}</h6>
                <span className="text-muted">{users.length}</span>
            </div>
            {users.length === 0 ? (
                <div className="text-muted">—</div>
            ) : (
                <ul className="list-unstyled mb-0">
                    {users.map(u => (
                        <li key={u.id} className="mb-1">
                            <Link className="link-accent" to={`/author/${encodeURIComponent(u.username)}`}>@{u.username}</Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function Profile({ token, user }) {
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [recipes, setRecipes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);

    const navigate = useNavigate();

    const load = async () => {
        setLoading(true);
        setErr("");
        try {
            const [{ recipes }, follows] = await Promise.all([
                profileApi.meWithRecipes(token),
                followsApi.mine(token)
            ]);
            setRecipes(recipes || []);
            setFollowers(follows?.followers || []);
            setFollowing(follows?.following || []);
        } catch (e) {
            setErr(e.message || "Failed to load profile.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const createRecipe = async (form) => {
        try {
            const { recipe } = await recipesApi.create(token, form);
            setRecipes((r) => [recipe, ...r]);
            setShowModal(false);
        } catch (e) {
            alert(e.message);
        }
    };

    const updateRecipe = async (id, form) => {
        try {
            const { recipe } = await recipesApi.update(token, id, form);
            setRecipes((r) => r.map((it) => (it.id === id ? recipe : it)));
            setShowModal(false);
            setEditItem(null);
        } catch (e) {
            alert(e.message);
        }
    };

    const deleteRecipe = async (rec) => {
        if (!confirm(`Delete "${rec.title}"?`)) return;
        try {
            await recipesApi.remove(token, rec.id);
            setRecipes((r) => r.filter((it) => it.id !== rec.id));
        } catch (e) {
            alert(e.message);
        }
    };

    const followersCount = followers.length;
    const followingCount = following.length;

    return (
        <div className="row justify-content-center">
            <div className="col-12 col-xl-10">

                <div className="card card-pastel p-4 mb-4">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                        <div>
                            <h2 className="brand-title mb-2">My Profile</h2>
                            <p className="mb-1"><strong>Username:</strong> {user.username}</p>
                            <p className="mb-1"><strong>Email:</strong> {user.email}</p>
                        </div>
                        <div className="text-md-end">
                            <div className="mb-2">
                                <span className="me-3"><strong>{followersCount}</strong> Followers</span>
                                <span><strong>{followingCount}</strong> Following</span>
                            </div>
                            <button className="btn btn-pastel" onClick={() => { setEditItem(null); setShowModal(true); }}>
                                + Add Recipe
                            </button>
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-md-6">
                            <UsersList title="Followers" users={followers} />
                        </div>
                        <div className="col-md-6">
                            <UsersList title="Following" users={following} />
                        </div>
                    </div>
                </div>

                {err && <div className="alert alert-danger">{err}</div>}

                {loading ? (
                    <div className="text-center text-muted">Loading…</div>
                ) : recipes.length === 0 ? (
                    <div className="card card-pastel p-4 text-center text-muted">No recipes yet. Click “Add Recipe”.</div>
                ) : (
                    recipes.map((r) => (
                        <RecipeCard
                            key={r.id}
                            r={r}
                            onEdit={(rec) => { setEditItem(rec); setShowModal(true); }}
                            onDelete={deleteRecipe}
                            onOpen={(id) => navigate(`/recipe/${id}`)}
                        />
                    ))
                )}

                <RecipeFormModal
                    show={showModal}
                    initial={editItem}
                    onClose={() => { setShowModal(false); setEditItem(null); }}
                    onSubmit={(form) => editItem ? updateRecipe(editItem.id, form) : createRecipe(form)}
                />
            </div>
        </div>
    );
}