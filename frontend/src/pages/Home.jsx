import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { publicApi } from "../api.js";

export default function Home() {
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [recipes, setRecipes] = useState([]);
    const [q, setQ] = useState("");
    const [sort, setSort] = useState("created_desc");
    const [author, setAuthor] = useState("");
    const tRef = useRef(null);

    const authors = useMemo(() => {
        const set = new Set(recipes.map((r) => r.author).filter(Boolean));
        return ["", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
    }, [recipes]);

    const hasActiveFilters = useMemo(
        () => q.trim() !== "" || author.trim() !== "" || sort !== "created_desc",
        [q, author, sort]
    );

    const load = async (params = {}) => {
        setLoading(true);
        setErr("");
        try {
            const { recipes } = await publicApi.list(params);
            setRecipes(recipes);
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load({ q, sort, author });
    }, []);

    useEffect(() => {
        load({ q, sort, author });
    }, [sort, author]);

    useEffect(() => {
        if (tRef.current) clearTimeout(tRef.current);
        tRef.current = setTimeout(() => {
            load({ q, sort, author });
        }, 300);
        return () => clearTimeout(tRef.current);
    }, [q]);

    const clearFilters = () => {
        setQ("");
        setAuthor("");
        setSort("created_desc");
        load({ q: "", author: "", sort: "created_desc" });
    };

    return (
        <div className="row justify-content-center">
            <div className="col-12 col-xl-10">

                <section className="hero-quote mb-4" aria-label="Inspiration">
                    <h1 className="hero-quote-text">
                        “A recipe has no soul. You as the cook must bring soul to the recipe.”
                    </h1>
                    <p className="text-muted mb-0">Browse the latest community recipes.</p>
                </section>

                <div className="card card-pastel p-0 recipes-box">
                    <div className="filters p-3 p-md-4 border-bottom">
                        <div className="row g-2 align-items-end">
                            <div className="col-12 col-lg-5">
                                <label className="form-label">Search</label>
                                <div className="input-group">
                                    <input
                                        className="form-control"
                                        placeholder="Search title, description, or ingredients…"
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        aria-label="Search recipes"
                                    />
                                </div>
                            </div>
                            <div className="col-6 col-lg-3">
                                <label className="form-label">Author</label>
                                <select
                                    className="form-select"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    aria-label="Filter by author"
                                >
                                    {authors.map((a, i) => (
                                        <option key={i} value={a}>
                                            {a ? a : "All authors"}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-6 col-lg-3">
                                <label className="form-label">Sort by</label>
                                <select
                                    className="form-select"
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    aria-label="Sort recipes"
                                >
                                    <option value="created_desc">Newest first</option>
                                    <option value="created_asc">Oldest first</option>
                                    <option value="title_asc">Title A–Z</option>
                                    <option value="title_desc">Title Z–A</option>
                                    <option value="author_asc">Author A–Z</option>
                                    <option value="author_desc">Author Z–A</option>
                                </select>
                            </div>
                            <div className="col-12 col-lg-1 d-flex">
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary ms-lg-auto w-100"
                                        onClick={clearFilters}
                                        aria-label="Clear filters"
                                        title="Clear filters"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="d-flex flex-wrap gap-2 mt-3 small text-muted">
                            <span><strong>{recipes.length}</strong> result{recipes.length === 1 ? "" : "s"}</span>
                            {q.trim() !== "" && <span className="badge bg-light text-dark border">{`q: "${q.trim()}"`}</span>}
                            {author.trim() !== "" && <span className="badge bg-light text-dark border">{`author: ${author}`}</span>}
                            {sort !== "created_desc" && <span className="badge bg-light text-dark border">{`sort: ${sort.replace("_", " ")}`}</span>}
                        </div>
                    </div>

                    <div className="p-3 p-md-4">
                        {err && <div className="alert alert-danger mb-3">{err}</div>}
                        {loading ? (
                            <div className="text-center text-muted">Loading recipes…</div>
                        ) : recipes.length === 0 ? (
                            <div className="text-center text-muted py-4">No recipes match your filters.</div>
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
                                                    style={{
                                                        height: "180px",
                                                        objectFit: "cover",
                                                        borderTopLeftRadius: "14px",
                                                        borderTopRightRadius: "14px"
                                                    }}
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
        </div>
    );
}