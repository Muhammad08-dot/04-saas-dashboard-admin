/**
 * Mock backend for the SaaS dashboard demo.
 *
 * The Django code in ../backend is kept as a code showcase, but the deployed
 * frontend is fully static — so all data lives here, seeded once into
 * localStorage and mutated in place so search / sort / pagination / CRUD feel
 * real. Swap this file back to the live `api.ts` fetch client to point at the
 * DRF backend again.
 */

export interface MockUser {
  id: number; username: string; email: string;
  first_name: string; last_name: string; role: string; company: string;
}
export interface Customer {
  id: number; name: string; email: string; company: string;
  status: string; lifetime_value: number; created_at: string;
}
export interface Order {
  id: number; customer: number; customer_name: string;
  amount: number; plan: string; status: string; created_at: string;
}
export interface Stats {
  total_customers: number; total_revenue: number; orders_this_month: number;
  revenue_series: { date: string; revenue: number }[];
}

interface DB { customers: Customer[]; orders: Order[] }

const DB_KEY = 'saaspanel.db.v1';
const USER_KEY = 'saaspanel.user';

export const DEMO_USERS: (MockUser & { password: string })[] = [
  { id: 1, username: 'admin', password: 'Admin@2025!', email: 'admin@saaspanel.io',
    first_name: 'Dana', last_name: 'Okafor', role: 'admin', company: 'Northwind Analytics' },
  { id: 2, username: 'viewer', password: 'Viewer@2025!', email: 'viewer@saaspanel.io',
    first_name: 'Sam', last_name: 'Reed', role: 'viewer', company: 'Northwind Analytics' },
];

const FIRST = ['Amara','Priya','Luis','Chen','Fatima','Noah','Grace','Diego','Yuki','Omar','Hana','Marcus','Elena','Tomas','Aisha','Ben','Nadia','Kofi','Sofia','Ivan','Leila','Marco','Zara','Theo','Ines','Raj','Clara','Mateo','Aya','Felix','Nina','Owen','Lena','Caleb','Rosa','Dmitri'];
const LAST = ['Bello','Nair','Ortega','Wei','Haddad','Kim','Adeyemi','Silva','Tanaka','Farouk','Petrov','Webb','Rossi','Novak','Mensah','Frost','Karim',' Boateng'.trim(),'Duarte','Sokolov','Hassan','Costa','Ali','Vance','Moreau','Kapoor','Muller','Reyes','Okafor','Braun','Petrova','Wyatt','Sorensen','Brooks','Alvarez','Volkov'];
const COMPANY = ['Northwind','Lumen Health','Cobalt Labs','Brightpath','Meridian Freight','Atlas Retail','Fernwood Media','Quanta Energy','Harbor & Pine','Vela Robotics','Orchard Fintech','Kite Logistics','Solstice Foods','Ironclad Security','Beacon Edtech','Nimbus Cloud','Grove Collective','Tidal Analytics','Ember Studio','Halcyon Care','Pinnacle Works','Copperline','Verdant Agritech','Lattice Systems'];
const PLANS = ['starter', 'pro', 'enterprise'];
const ORDER_STATUS = ['completed', 'pending', 'cancelled', 'refunded'];
const CUST_STATUS = ['active', 'inactive', 'churned'];

// Deterministic pseudo-random so the seed is stable across reloads/sessions.
function makeRng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
const pick = <T,>(rng: () => number, arr: T[]): T => arr[Math.floor(rng() * arr.length)];

function daysAgo(n: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function seed(): DB {
  const rng = makeRng(20260416);
  const customers: Customer[] = [];
  for (let i = 1; i <= 36; i++) {
    const first = pick(rng, FIRST);
    const last = pick(rng, LAST);
    const company = `${pick(rng, COMPANY)}`;
    customers.push({
      id: i,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase().replace(/\s/g, '')}@${company.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      company,
      status: pick(rng, CUST_STATUS),
      lifetime_value: Math.round((300 + rng() * 48000) / 10) * 10,
      created_at: daysAgo(Math.floor(rng() * 220) + 2),
    });
  }
  const orders: Order[] = [];
  for (let i = 1; i <= 64; i++) {
    const cust = pick(rng, customers);
    const plan = pick(rng, PLANS);
    const amount = plan === 'enterprise'
      ? Math.round(1800 + rng() * 9200)
      : plan === 'pro'
        ? Math.round(390 + rng() * 1400)
        : Math.round(49 + rng() * 300);
    // Bias status toward completed so the dashboard looks healthy.
    const status = rng() < 0.66 ? 'completed' : pick(rng, ORDER_STATUS);
    orders.push({
      id: i,
      customer: cust.id,
      customer_name: cust.name,
      amount,
      plan,
      status,
      created_at: daysAgo(Math.floor(rng() * 29)), // all within last 30 days
    });
  }
  return { customers, orders };
}

function load(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw) as DB;
  } catch { /* ignore */ }
  const fresh = seed();
  localStorage.setItem(DB_KEY, JSON.stringify(fresh));
  return fresh;
}
function save(db: DB) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function currentUser(): MockUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as MockUser) : null;
  } catch { return null; }
}
export function setCurrentUser(u: MockUser | null) {
  if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
  else localStorage.removeItem(USER_KEY);
}

export function resetDemoData() {
  localStorage.removeItem(DB_KEY);
  load();
}

/** Rebuild the customer_name links after a customer edit, then return fresh DB. */
function reindex(db: DB): DB {
  const map = new Map(db.customers.map((c) => [c.id, c.name]));
  db.orders.forEach((o) => { const n = map.get(o.customer); if (n) o.customer_name = n; });
  return db;
}

// ---- Query helpers mirroring the DRF endpoints ----

function paginate<T>(rows: T[], page: number, size = 20) {
  const start = (page - 1) * size;
  return { count: rows.length, results: rows.slice(start, start + size) };
}

export function listCustomers(qs: URLSearchParams) {
  const db = load();
  const search = (qs.get('search') || '').toLowerCase();
  const ordering = qs.get('ordering') || 'name';
  let rows = db.customers.slice();
  if (search) {
    rows = rows.filter((c) =>
      [c.name, c.email, c.company].some((f) => f.toLowerCase().includes(search)));
  }
  const dir = ordering.startsWith('-') ? -1 : 1;
  const key = ordering.replace('-', '') as keyof Customer;
  rows.sort((a, b) => {
    const av = a[key]; const bv = b[key];
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  });
  return paginate(rows, Number(qs.get('page') || 1));
}

export function listOrders(qs: URLSearchParams) {
  const db = load();
  const search = (qs.get('search') || '').toLowerCase();
  const ordering = qs.get('ordering') || '-created_at';
  let rows = db.orders.slice();
  if (search) {
    rows = rows.filter((o) =>
      o.customer_name.toLowerCase().includes(search) || String(o.id).includes(search));
  }
  const dir = ordering.startsWith('-') ? -1 : 1;
  const key = ordering.replace('-', '') as keyof Order;
  rows.sort((a, b) => {
    const av = a[key]; const bv = b[key];
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  });
  return paginate(rows, Number(qs.get('page') || 1));
}

export function dashboardStats(): Stats {
  const db = load();
  const totalRevenue = db.orders
    .filter((o) => o.status === 'completed')
    .reduce((s, o) => s + o.amount, 0);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const ordersThisMonth = db.orders.filter((o) => new Date(o.created_at) >= monthStart).length;
  const series: { date: string; revenue: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const revenue = db.orders
      .filter((o) => o.status === 'completed' && new Date(o.created_at).toDateString() === d.toDateString())
      .reduce((s, o) => s + o.amount, 0);
    series.push({ date: label, revenue });
  }
  return {
    total_customers: db.customers.length,
    total_revenue: totalRevenue,
    orders_this_month: ordersThisMonth,
    revenue_series: series,
  };
}

function guardWrite(): void {
  const u = currentUser();
  if (!u || u.role !== 'admin') {
    throw new Error('Read-only role: sign in as admin to make changes.');
  }
}

export function upsertCustomer(id: number | null, body: Partial<Customer>): Customer {
  guardWrite();
  const db = load();
  if (id != null) {
    const c = db.customers.find((x) => x.id === id);
    if (!c) throw new Error('Customer not found.');
    Object.assign(c, body);
    reindex(db); save(db); return c;
  }
  const nid = Math.max(0, ...db.customers.map((c) => c.id)) + 1;
  const created: Customer = {
    id: nid,
    name: (body.name as string) || 'New Customer',
    email: (body.email as string) || '',
    company: (body.company as string) || '',
    status: (body.status as string) || 'active',
    lifetime_value: Number(body.lifetime_value) || 0,
    created_at: new Date().toISOString(),
  };
  db.customers.push(created);
  save(db);
  return created;
}

export function deleteCustomer(id: number) {
  guardWrite();
  const db = load();
  db.customers = db.customers.filter((c) => c.id !== id);
  save(reindex(db));
}

export function upsertOrder(id: number | null, body: Partial<Order>): Order {
  guardWrite();
  const db = load();
  const cust = db.customers.find((c) => c.id === Number(body.customer));
  if (id != null) {
    const o = db.orders.find((x) => x.id === id);
    if (!o) throw new Error('Order not found.');
    Object.assign(o, body);
    if (cust) o.customer_name = cust.name;
    save(db); return o;
  }
  const nid = Math.max(0, ...db.orders.map((o) => o.id)) + 1;
  const created: Order = {
    id: nid,
    customer: Number(body.customer) || 0,
    customer_name: cust ? cust.name : `Customer #${body.customer}`,
    amount: Number(body.amount) || 0,
    plan: (body.plan as string) || 'starter',
    status: (body.status as string) || 'pending',
    created_at: new Date().toISOString(),
  };
  db.orders.push(created);
  save(db);
  return created;
}

export function deleteOrder(id: number) {
  guardWrite();
  const db = load();
  db.orders = db.orders.filter((o) => o.id !== id);
  save(db);
}
