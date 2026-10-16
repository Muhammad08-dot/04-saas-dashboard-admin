import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type Order = {
  id: number; customer: number; customer_name: string;
  amount: number; plan: string; status: string; created_at: string;
};
type Paginated = { count: number; results: Order[] };

const emptyForm = { customer: 0, amount: 0, plan: 'starter', status: 'pending' };

export default function Orders() {
  const [data, setData] = useState<Paginated | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [ordering, setOrdering] = useState('-created_at');
  const { isAdmin } = useAuth();

  const load = useCallback(() => {
    api.get<Paginated>(`/orders/?page=${page}&search=${search}&ordering=${ordering}`).then(setData);
  }, [page, search, ordering]);

  useEffect(() => { load(); }, [load]);

  function toggleSort(field: string) {
    setOrdering((o) => (o === field ? `-${field}` : field));
    setPage(1);
  }

  function openNew() { setForm(emptyForm); setEditId(null); setModal(true); }
  function openEdit(o: Order) { setForm({ customer: o.customer, amount: o.amount, plan: o.plan, status: o.status }); setEditId(o.id); setModal(true); }

  async function save() {
    if (editId) { await api.patch(`/orders/${editId}/`, form); }
    else { await api.post('/orders/', form); }
    setModal(false); load();
  }

  async function remove(id: number) {
    if (!confirm('Delete this order?')) return;
    await api.delete(`/orders/${id}/`); load();
  }

  const totalPages = data ? Math.ceil(data.count / 20) : 1;

  const sortIcon = (field: string) =>
    ordering === field ? <ChevronUp size={12} /> : ordering === `-${field}` ? <ChevronDown size={12} /> : <ChevronsUpDown size={12} />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-800 dark:text-white">Orders</h1>
        {isAdmin && <button onClick={openNew} className="btn-primary"><Plus size={14} /> Add</button>}
      </div>

      <input
        type="search" placeholder="Search customer…"
        value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="input mb-4 max-w-sm"
      />

      <div className="panel overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-left">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
            <tr>
              <th className="table-th"><button type="button" onClick={() => toggleSort('customer_name')} className="inline-flex items-center gap-1 hover:text-indigo">Customer {sortIcon('customer_name')}</button></th>
              <th className="table-th"><button type="button" onClick={() => toggleSort('plan')} className="inline-flex items-center gap-1 hover:text-indigo">Plan {sortIcon('plan')}</button></th>
              <th className="table-th"><button type="button" onClick={() => toggleSort('amount')} className="inline-flex items-center gap-1 hover:text-indigo">Amount {sortIcon('amount')}</button></th>
              <th className="table-th"><button type="button" onClick={() => toggleSort('status')} className="inline-flex items-center gap-1 hover:text-indigo">Status {sortIcon('status')}</button></th>
              <th className="table-th"><button type="button" onClick={() => toggleSort('created_at')} className="inline-flex items-center gap-1 hover:text-indigo">Date {sortIcon('created_at')}</button></th>
              {isAdmin && <th className="table-th">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {data?.results.map((o) => (
              <tr key={o.id}>
                <td className="table-td font-medium text-slate-800 dark:text-white">{o.customer_name}</td>
                <td className="table-td capitalize">{o.plan}</td>
                <td className="table-td">${o.amount.toLocaleString()}</td>
                <td className="table-td"><StatusBadge status={o.status} /></td>
                <td className="table-td text-xs text-slate-400">{new Date(o.created_at).toLocaleDateString()}</td>
                {isAdmin && (
                  <td className="table-td space-x-2">
                    <button onClick={() => openEdit(o)} className="text-slate-400 hover:text-indigo"><Pencil size={14} /></button>
                    <button onClick={() => remove(o.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </td>
                )}
              </tr>
            ))}
            {data && data.results.length === 0 && (
              <tr><td colSpan={6} className="table-td text-center text-slate-400">No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-between text-sm text-slate-500">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary">Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary">Next</button>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="panel w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-white">{editId ? 'Edit order' : 'New order'}</h2>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <div>
              <label className="label">Customer ID</label>
              <input type="number" className="input" value={form.customer || ''} onChange={(e) => setForm((v) => ({ ...v, customer: +e.target.value }))} />
            </div>
            <div>
              <label className="label">Amount</label>
              <input type="number" step="0.01" className="input" value={form.amount || ''} onChange={(e) => setForm((v) => ({ ...v, amount: +e.target.value }))} />
            </div>
            <div>
              <label className="label">Plan</label>
              <select className="input" value={form.plan} onChange={(e) => setForm((v) => ({ ...v, plan: e.target.value }))}>
                <option value="starter">Starter</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm((v) => ({ ...v, status: e.target.value }))}>
                <option value="pending">Pending</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="refunded">Refunded</option>
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
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    cancelled: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    refunded: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };
  return <span className={`badge ${colors[status] || colors.cancelled}`}>{status}</span>;
}
