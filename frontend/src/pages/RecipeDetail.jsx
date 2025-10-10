import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { publicApi, commentsApi } from "../api.js";
import { bookmarksApi } from "../api.js";

export default function RecipeDetail({ user, token }) {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [recipe, setRecipe] = useState(null);
    const [comments, setComments] = useState([]);
    const [cLoading, setCLoading] = useState(true);
    const [cErr, setCErr] = useState("");
    const [cText, setCText] = useState("");
    const [bookmarked, setBookmarked] = useState(false);
    const [bmBusy, setBmBusy] = useState(false);

    const ingredients = useMemo(
        () => (recipe?.ingredients || "").split(/\r?\n/).filter(Boolean),
        [recipe]
    );
    const steps = useMemo(
        () => (recipe?.steps || "").split(/\r?\n/).filter(Boolean),
        [recipe]
    );

    const loadRecipe = async () => {
        setLoading(true); setErr("");
        try {
            const { recipe } = await publicApi.get(id);
            setRecipe(recipe);
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    };

    const loadComments = async () => {
        setCLoading(true); setCErr("");
        try {
            const { comments } = await commentsApi.listPublic(id);
            setComments(comments);
        } catch (e) {
            setCErr(e.message);
        } finally {
            setCLoading(false);
        }
    };


    useEffect(() => {
        loadRecipe();
        loadComments();
        if (token) {
            bookmarksApi.isBookmarked(token, id)
                .then(({ bookmarked }) => setBookmarked(!!bookmarked))
                .catch(() => setBookmarked(false));
        } else {
            setBookmarked(false);
        }
    }, [id, token]);



    const submitComment = async (e) => {
        e.preventDefault();
        if (!cText.trim()) return;
        try {
            const { comment } = await commentsApi.add(token, id, cText.trim());
            setComments((prev) => [...prev, comment]);
            setCText("");
        } catch (e) {
            alert(e.message);
        }
    };

    const handlePrint = () => window.print();

    const addBookmark = async () => {
        if (!token) return;
        try {
            setBmBusy(true);
            await bookmarksApi.add(token, id);
            setBookmarked(true);
        } catch (e) {
            alert(e.message);
        } finally {
            setBmBusy(false);
        }
    };
    const removeBookmark = async () => {
        if (!token) return;
        try {
            setBmBusy(true);
            await bookmarksApi.remove(token, id);
            setBookmarked(false);
        } catch (e) {
            alert(e.message);
        } finally {
            setBmBusy(false);
        }
    };

    if (loading) return <div className="text-center text-muted">Loading…</div>;
    if (err) return <div className="alert alert-danger">{err}</div>;
    if (!recipe) return <div className="alert alert-danger">Recipe not found.</div>;

    return (
        <div className="row justify-content-center">
            <div className="col-12 col-xl-10">
                <div className="card card-pastel p-0 mb-4 print-container">
                    <div className="print-only p-4 pb-0">
                        <div className="d-flex justify-content-between align-items-end">
                            <h1 className="mb-1" style={{ fontSize: "1.8rem" }}>Recipe World</h1>
                            <small>Printed on {new Date().toLocaleString()}</small>
                        </div>
                    </div>

                    {recipe.image_url && (
                        <img
                            src={recipe.image_url}
                            alt={recipe.title}
                            className="recipe-detail-img img-fluid mb-3 rounded-3"
                            loading="eager"
                            style={{
                                maxHeight: "360px",
                                objectFit: "cover",
                                display: "block",
                                borderTopLeftRadius: "14px",
                                borderTopRightRadius: "14px"
                            }}
                        />
                    )}

                    <div className="p-4">
                        <div className="d-flex gap-3 justify-content-between align-items-start">
                            <div>
                                <h2 className="mb-1">{recipe.title}</h2>
                                <small className="text-muted">
                                    by <Link to={`/author/${encodeURIComponent(recipe.author)}`} className="link-accent">
                                    {recipe.author}
                                </Link> • Updated{" "}
                                    {new Date(recipe.updated_at || recipe.created_at).toLocaleString()}
                                </small>
                            </div>

                            <div className="d-flex gap-2 no-print">
                                {user ? (
                                    bookmarked ? (
                                        <button
                                            onClick={removeBookmark}
                                            className="btn btn-outline-secondary"
                                            disabled={bmBusy}
                                            title="Remove from bookmarks"
                                        >
                                            ★ Bookmarked
                                        </button>
                                    ) : (
                                        <button
                                            onClick={addBookmark}
                                            className="btn btn-pastel"
                                            disabled={bmBusy}
                                            title="Add to bookmarks"
                                        >
                                            ☆ Add to bookmarks
                                        </button>
                                    )
                                ) : (
                                    <Link to="/login" className="btn btn-outline-secondary">☆ Add to bookmarks</Link>
                                )}
                                <button onClick={handlePrint} className="btn btn-outline-secondary" title="Print recipe">
                                    🖨 Print
                                </button>
                                <Link to="/" className="btn btn-outline-secondary">← Back</Link>
                            </div>
                        </div>

                        {recipe.description && (
                            <p className="mt-3 text-muted">{recipe.description}</p>
                        )}
                    </div>
                </div>

                <div className="row print-avoid-break">
                    <div className="col-md-6 mb-4">
                        <div className="card card-pastel p-3 h-100">
                            <h5>Ingredients</h5>
                            <ul className="mb-0">
                                {ingredients.length ? ingredients.map((it, i) => <li key={i}>{it}</li>) : <li className="text-muted">—</li>}
                            </ul>
                        </div>
                    </div>
                    <div className="col-md-6 mb-4">
                        <div className="card card-pastel p-3 h-100">
                            <h5>Steps</h5>
                            <ol className="mb-0">
                                {steps.length ? steps.map((it, i) => <li key={i}>{it}</li>) : <li className="text-muted">—</li>}
                            </ol>
                        </div>
                    </div>
                </div>

                <div className="card card-pastel p-4 mb-4 no-print">
                    <h5 className="mb-3">Comments</h5>
                    {cErr && <div className="alert alert-danger">{cErr}</div>}
                    {cLoading ? (
                        <div className="text-muted">Loading comments…</div>
                    ) : comments.length === 0 ? (
                        <div className="text-muted">No comments yet.</div>
                    ) : (
                        <ul className="list-unstyled">
                            {comments.map((c) => (
                                <li key={c.id} className="mb-3 pb-3 border-bottom">
                                    <div className="d-flex align-items-center mb-1">
                                        <strong className="me-2">{c.author}</strong>
                                        <small className="text-muted">{new Date(c.created_at).toLocaleString()}</small>
                                    </div>
                                    <div>{c.content}</div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {user ? (
                        <form onSubmit={submitComment} className="mt-3">
                            <label className="form-label">Add a comment as <strong>{user.username}</strong></label>
                            <textarea
                                className="form-control mb-2"
                                rows={3}
                                placeholder="Write your comment…"
                                value={cText}
                                onChange={(e) => setCText(e.target.value)}
                                required
                            />
                            <button className="btn btn-pastel">Post comment</button>
                        </form>
                    ) : (
                        <div className="mt-3 text-muted">
                            <Link to="/login" className="link-accent">Log in</Link> to post a comment.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}