import { useEffect, useState } from 'react';
import { Users, DollarSign, ShoppingCart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '@/lib/api';

type Stats = {
  total_customers: number;
  total_revenue: number;
  orders_this_month: number;
  revenue_series: { date: string; revenue: number }[];
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Stats>('/dashboard/stats/').then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (!stats) return <div className="grid gap-4 sm:grid-cols-3"><Skeleton /><Skeleton /><Skeleton /></div>;

  return (
    <div>
      <h1 className="mb-6 text-lg font-semibold text-slate-800 dark:text-white">Dashboard</h1>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Total Customers" value={String(stats.total_customers)} />
        <StatCard icon={DollarSign} label="Total Revenue" value={`$${stats.total_revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
        <StatCard icon={ShoppingCart} label="Orders This Month" value={String(stats.orders_this_month)} />
      </div>

      {/* Revenue chart */}
      <div className="panel mt-6">
        <h2 className="mb-4 text-sm font-medium text-slate-600 dark:text-slate-300">Revenue — last 30 days</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.revenue_series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DDE2E8" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#4F46E5" fill="#EEF2FF" strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="panel flex items-center gap-4">
      <div className="rounded-md bg-indigo-light p-2.5"><Icon size={20} className="text-indigo" /></div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-lg font-semibold text-slate-800 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function Skeleton() {
  return <div className="panel h-20 animate-pulse bg-slate-100 dark:bg-slate-700" />;
}
