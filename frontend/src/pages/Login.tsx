import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { ShieldCheck, Eye } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@2025!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginAs } = useAuth();
  const navigate = useNavigate();

  async function run(fn: () => Promise<void>) {
    setError('');
    setLoading(true);
    try {
      await fn();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    run(() => login(username, password));
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-xl font-bold text-slate-800 dark:text-white">SaaSPanel</h1>
        <p className="mb-6 text-center text-sm text-slate-500">Admin dashboard sign in</p>

        {/* One-click demo roles */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => run(() => loginAs('admin'))}
            className="btn-primary flex flex-col items-center gap-1 py-3"
          >
            <ShieldCheck size={18} /> <span className="text-sm">Login as Admin</span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => run(() => loginAs('viewer'))}
            className="btn-secondary flex flex-col items-center gap-1 py-3"
          >
            <Eye size={18} /> <span className="text-sm">Login as Viewer</span>
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          or sign in manually
          <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>

        <form onSubmit={handleSubmit} className="panel space-y-4">
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="username" className="label">Username</label>
            <input id="username" type="text" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className="input" placeholder="admin" />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading || !username || !password} className="btn-primary w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 rounded-md bg-indigo-light px-3 py-2 text-center text-xs text-indigo">
          Demo mode — data is mocked in your browser (no server). Admin has full CRUD; the Viewer
          role is read-only.
        </p>
      </div>
    </div>
  );
}
