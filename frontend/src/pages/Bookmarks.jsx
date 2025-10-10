import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { bookmarksApi } from "../api.js";

export default function Bookmarks({ user, token }) {
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [recipes, setRecipes] = useState([]);

    useEffect(() => {
        if (!token) return;
        (async () => {
            setLoading(true); setErr("");
            try {
                const { recipes } = await bookmarksApi.list(token);
                setRecipes(recipes);
            } catch (e) {
                setErr(e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="row justify-content-center">
            <div className="col-12 col-xl-10">
                <div className="d-flex justify-content-between align-items-end mb-3">
                    <h2 className="mb-0">My Bookmarks</h2>
                    <Link to="/" className="btn btn-outline-secondary">← Back to Home</Link>
                </div>

                <div className="card card-pastel p-3 p-md-4">
                    {err && <div className="alert alert-danger mb-3">{err}</div>}
                    {loading ? (
                        <div className="text-muted">Loading…</div>
                    ) : recipes.length === 0 ? (
                        <div className="text-muted text-center py-4">No bookmarks yet. Open a recipe and click “Add to bookmarks”.</div>
                    ) : (
                        <div className="row">
                            {recipes.map((r) => (
                                <div className="col-12 col-md-6 col-lg-4 mb-4" key={r.id}>
                                    <Link to={`/recipe/${r.id}`} className="card card-pastel h-100 recipe-card-link">
                                        {r.image_url && (
                                            <img
                                                src={r.image_url}
                                                alt={r.title}
                                                className="card-img-top"
                                                style={{ height: "180px", objectFit: "cover", borderTopLeftRadius: "14px", borderTopRightRadius: "14px" }}
                                                loading="lazy"
                                            />
                                        )}
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="recipe-title mb-1">{r.title}</h5>
                                            <small className="text-muted mb-2">by {r.author}</small>
                                            <p className="recipe-desc text-muted flex-grow-1">{r.description || "—"}</p>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}