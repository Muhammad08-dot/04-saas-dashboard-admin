import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type Customer = {
  id: number; name: string; email: string; company: string;
  status: string; lifetime_value: number; created_at: string;
};

type Paginated = { count: number; results: Customer[] };

const emptyForm = { name: '', email: '', company: '', status: 'active', lifetime_value: 0 };

export default function Customers() {
  const [data, setData] = useState<Paginated | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [ordering, setOrdering] = useState('name');
  const { isAdmin } = useAuth();

  const load = useCallback(() => {
    api.get<Paginated>(`/customers/?page=${page}&search=${search}&ordering=${ordering}`).then(setData);
  }, [page, search, ordering]);

  useEffect(() => { load(); }, [load]);

  function toggleSort(field: string) {
    setOrdering((o) => (o === field ? `-${field}` : field));
    setPage(1);
  }

  function openNew() { setForm(emptyForm); setEditId(null); setModal(true); }
  function openEdit(c: Customer) { setForm({ name: c.name, email: c.email, company: c.company, status: c.status, lifetime_value: c.lifetime_value }); setEditId(c.id); setModal(true); }

  async function save() {
    if (editId) { await api.patch(`/customers/${editId}/`, form); }
    else { await api.post('/customers/', form); }
    setModal(false); load();
  }

  async function remove(id: number) {
    if (!confirm('Delete this customer?')) return;
    await api.delete(`/customers/${id}/`); load();
  }

  const totalPages = data ? Math.ceil(data.count / 20) : 1;

  const sortIcon = (field: string) =>
    ordering === field ? <ChevronUp size={12} /> : ordering === `-${field}` ? <ChevronDown size={12} /> : <ChevronsUpDown size={12} />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-800 dark:text-white">Customers</h1>
        {isAdmin && <button onClick={openNew} className="btn-primary"><Plus size={14} /> Add</button>}
      </div>

      <input
        type="search" placeholder="Search name, email, company…"
        value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="input mb-4 max-w-sm"
      />

      {/* Table */}
      <div className="panel overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-left">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
            <tr>
              <th className="table-th"><button type="button" onClick={() => toggleSort('name')} className="inline-flex items-center gap-1 hover:text-indigo">Name {sortIcon('name')}</button></th>
              <th className="table-th"><button type="button" onClick={() => toggleSort('company')} className="inline-flex items-center gap-1 hover:text-indigo">Company {sortIcon('company')}</button></th>
              <th className="table-th"><button type="button" onClick={() => toggleSort('status')} className="inline-flex items-center gap-1 hover:text-indigo">Status {sortIcon('status')}</button></th>
              <th className="table-th"><button type="button" onClick={() => toggleSort('lifetime_value')} className="inline-flex items-center gap-1 hover:text-indigo">LTV {sortIcon('lifetime_value')}</button></th>
              {isAdmin && <th className="table-th">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {data?.results.map((c) => (
              <tr key={c.id}>
                <td className="table-td"><span className="font-medium text-slate-800 dark:text-white">{c.name}</span><br /><span className="text-xs text-slate-400">{c.email}</span></td>
                <td className="table-td">{c.company}</td>
                <td className="table-td"><StatusBadge status={c.status} /></td>
                <td className="table-td">${c.lifetime_value.toLocaleString()}</td>
                {isAdmin && (
                  <td className="table-td space-x-2">
                    <button onClick={() => openEdit(c)} className="text-slate-400 hover:text-indigo"><Pencil size={14} /></button>
                    <button onClick={() => remove(c.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </td>
                )}
              </tr>
            ))}
            {data && data.results.length === 0 && (
              <tr><td colSpan={5} className="table-td text-center text-slate-400">No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-between text-sm text-slate-500">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary">Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary">Next</button>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="panel w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-white">{editId ? 'Edit customer' : 'New customer'}</h2>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            {(['name', 'email', 'company'] as const).map((f) => (
              <div key={f}>
                <label className="label">{f[0].toUpperCase() + f.slice(1)}</label>
                <input className="input" value={form[f]} onChange={(e) => setForm((v) => ({ ...v, [f]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm((v) => ({ ...v, status: e.target.value }))}>
                <option value="active">Active</option><option value="inactive">Inactive</option><option value="churned">Churned</option>
              </select>
            </div>
            <button onClick={save} className="btn-primary w-full">Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    churned: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };
  return <span className={`badge ${colors[status] || colors.inactive}`}>{status}</span>;
}
