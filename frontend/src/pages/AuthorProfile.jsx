import { useEffect, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { authorsApi, followsApi } from "../api.js";

export default function AuthorProfile({ user, token }) {
    const { username: rawUsername } = useParams();
    const username = decodeURIComponent(rawUsername || "");
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [author, setAuthor] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [following, setFollowing] = useState(false);
    const [busy, setBusy] = useState(false);

    const loadAuthor = useCallback(async () => {
        setLoading(true);
        setErr("");
        try {
            const { author, recipes } = await authorsApi.get(username);
            setAuthor(author);
            setRecipes(Array.isArray(recipes) ? recipes : []);
        } catch (e) {
            setErr(e?.message || "Failed to load author.");
            setAuthor(null);
            setRecipes([]);
        } finally {
            setLoading(false);
        }
    }, [username]);

    const loadFollowStatus = useCallback(async () => {
        if (!token || !user || !author) {
            setFollowing(false);
            return;
        }
        // if you’re on *your own* page, never show Follow
        if (author?.id && user?.id && author.id === user.id) {
            setFollowing(false);
            return;
        }
        try {
            const { following } = await followsApi.status(token, author.username);
            setFollowing(!!following);
        } catch {
            setFollowing(false);
        }
    }, [token, user, author]);

    useEffect(() => { loadAuthor(); }, [loadAuthor]);
    useEffect(() => { loadFollowStatus(); }, [loadFollowStatus]);

    const refreshHeader = async () => {
        try {
            const { author } = await authorsApi.get(username);
            setAuthor(author);
        } catch { /* ignore */ }
    };

    const doFollow = async () => {
        if (!token) return navigate("/login");
        if (!author || !user) return;
        if (author?.id === user?.id) return; // safety
        try {
            setBusy(true);
            await followsApi.follow(token, author.username);
            setFollowing(true);
            await refreshHeader();
        } catch (e) {
            alert(e?.message || "Failed to follow.");
        } finally {
            setBusy(false);
        }
    };

    const doUnfollow = async () => {
        if (!token) return navigate("/login");
        if (!author || !user) return;
        if (author?.id === user?.id) return; // safety
        try {
            setBusy(true);
            await followsApi.unfollow(token, author.username);
            setFollowing(false);
            await refreshHeader();
        } catch (e) {
            alert(e?.message || "Failed to unfollow.");
        } finally {
            setBusy(false);
        }
    };

    if (loading) return <div className="text-center text-muted">Loading…</div>;
    if (err) return <div className="alert alert-danger">{err}</div>;
    if (!author) return <div className="alert alert-danger">Author not found.</div>;

    const isMe = !!user?.id && !!author?.id && user.id === author.id;

    return (
        <div className="row justify-content-center">
            <div className="col-12 col-xl-10">
                <div className="d-flex justify-content-between align-items-end mb-3">
                    <div>
                        <h2 className="mb-1">@{author.username}</h2>
                        <div className="text-muted">
                            {author.followers_count} {author.followers_count === 1 ? "follower" : "followers"} • Member since{" "}
                            {new Date(author.joined_at).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <Link to="/" className="btn btn-outline-secondary">← Back</Link>
                        {!isMe && (
                            token && user ? (
                                following ? (
                                    <button className="btn btn-outline-secondary" disabled={busy} onClick={doUnfollow}>
                                        ✓ Following
                                    </button>
                                ) : (
                                    <button className="btn btn-pastel" disabled={busy} onClick={doFollow}>
                                        + Follow
                                    </button>
                                )
                            ) : (
                                <Link to="/login" className="btn btn-outline-secondary">+ Follow</Link>
                            )
                        )}
                    </div>
                </div>

                <div className="card card-pastel p-3 p-md-4">
                    {recipes.length === 0 ? (
                        <div className="text-muted text-center py-4">No recipes yet.</div>
                    ) : (
                        <div className="row">
                            {recipes.map((r) => (
                                <div className="col-12 col-md-6 col-lg-4 mb-4" key={r.id}>
                                    <Link to={`/recipe/${r.id}`} className="card card-pastel h-100 recipe-card-link">
                                        {(r.image_url || "/food.png") && (
                                            <img
                                                src={r.image_url || "/food.png"}
                                                alt={r.title}
                                                className="card-img-top"
                                                style={{ height: "180px", objectFit: "cover", borderTopLeftRadius: "14px", borderTopRightRadius: "14px" }}
                                                loading="lazy"
                                                onError={(e) => { e.currentTarget.src = "/food.png"; }}
                                            />
                                        )}
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="recipe-title mb-1">{r.title}</h5>
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