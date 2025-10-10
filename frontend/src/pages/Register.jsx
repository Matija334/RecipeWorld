import { useState } from "react";
import { api } from "../api.js";
import { Link, useNavigate } from "react-router-dom";

export default function Register({ onAuth }) {
    const [form, setForm] = useState({ email: "", username: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErr("");
        try {
            const { user, token } = await api("/api/auth/register", {
                method: "POST",
                body: form
            });
            onAuth(token, user);
            navigate("/");
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-12 col-md-6 col-lg-4">
                <div className="card card-pastel p-4">
                    <h2 className="brand-title mb-3">Create your account</h2>
                    {err && <div className="alert alert-danger py-2">{err}</div>}
                    <form onSubmit={submit}>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input type="email" className="form-control"
                                   value={form.email}
                                   onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Username</label>
                            <input type="text" className="form-control"
                                   value={form.username}
                                   onChange={(e) => setForm({ ...form, username: e.target.value })} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input type="password" className="form-control"
                                   value={form.password}
                                   onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                        </div>
                        <button className="btn btn-pastel w-100" disabled={loading}>
                            {loading ? "Creating..." : "Register"}
                        </button>
                    </form>
                    <p className="mt-3 text-center text-muted">
                        Already have an account? <Link className="link-accent" to="/login">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}