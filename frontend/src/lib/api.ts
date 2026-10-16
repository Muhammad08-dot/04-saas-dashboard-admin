/**
 * Mock transport layer. Presents the same `api` object the app used with the
 * live DRF backend, but resolves against the local `mock.ts` dataset +
 * localStorage. Add a little latency so loading skeletons behave realistically.
 */
import {
  DEMO_USERS, currentUser, setCurrentUser,
  listCustomers, listOrders, dashboardStats,
  upsertCustomer, deleteCustomer, upsertOrder, deleteOrder,
} from '@/lib/mock';

const LATENCY = 260;
const wait = (ms = LATENCY) => new Promise((r) => setTimeout(r, ms));

function split(path: string) {
  const [rawPath, queryString = ''] = path.split('?');
  const segments = rawPath.split('/').filter(Boolean); // e.g. ['customers','12']
  return { segments, qs: new URLSearchParams(queryString) };
}

async function handle<T>(method: string, path: string, body?: unknown): Promise<T> {
  await wait();
  const { segments, qs } = split(path);
  const root = segments[0];
  const id = segments[1] ? Number(segments[1]) : null;

  switch (root) {
    case 'auth': {
      if (segments[1] === 'login' && method === 'POST') {
        const { username, password } = (body ?? {}) as { username: string; password: string };
        const match = DEMO_USERS.find(
          (u) => u.username === username && u.password === password,
        );
        if (!match) throw new Error('No account matches those credentials.');
        const { password: _pw, ...user } = match;
        setCurrentUser(user);
        return { access: 'mock.access', refresh: 'mock.refresh', user } as unknown as T;
      }
      if (segments[1] === 'me') {
        const user = currentUser();
        if (!user) throw new Error('Not authenticated.');
        return user as unknown as T;
      }
      break;
    }
    case 'dashboard': {
      if (segments[1] === 'stats') return dashboardStats() as unknown as T;
      break;
    }
    case 'customers': {
      if (method === 'GET') return listCustomers(qs) as unknown as T;
      if (method === 'POST') return upsertCustomer(null, body as never) as unknown as T;
      if (method === 'PATCH' || method === 'PUT') return upsertCustomer(id, body as never) as unknown as T;
      if (method === 'DELETE') { deleteCustomer(id!); return undefined as T; }
      break;
    }
    case 'orders': {
      if (method === 'GET') return listOrders(qs) as unknown as T;
      if (method === 'POST') return upsertOrder(null, body as never) as unknown as T;
      if (method === 'PATCH' || method === 'PUT') return upsertOrder(id, body as never) as unknown as T;
      if (method === 'DELETE') { deleteOrder(id!); return undefined as T; }
      break;
    }
  }
  throw new Error(`Unhandled mock route: ${method} ${path}`);
}

export const api = {
  get: <T>(p: string) => handle<T>('GET', p),
  post: <T>(p: string, body: unknown) => handle<T>('POST', p, body),
  put: <T>(p: string, body: unknown) => handle<T>('PUT', p, body),
  patch: <T>(p: string, body: unknown) => handle<T>('PATCH', p, body),
  delete: (p: string) => handle<void>('DELETE', p),
};
