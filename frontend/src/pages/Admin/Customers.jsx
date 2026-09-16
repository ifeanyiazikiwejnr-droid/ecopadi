import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { formatPence } from '../../format';

export default function AdminCustomers() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminCustomers(token).then(setCustomers).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="muted">Loading customers…</p>;

  if (customers.length === 0) {
    return <p className="muted">No registered customers yet.</p>;
  }

  return (
    <div className="admin-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>VIP</th>
            <th>Reward Points</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.full_name}</td>
              <td className="muted">{c.email}</td>
              <td>{c.is_vip ? <span className="badge badge-vip">VIP</span> : <span className="muted">—</span>}</td>
              <td>{formatPence(c.reward_points)}</td>
              <td className="muted">{new Date(c.created_at).toLocaleDateString('en-GB')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
