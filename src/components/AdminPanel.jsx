import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, ShieldCheck, UsersRound } from 'lucide-react';

const roleLabels = { super_admin: 'Super admin', admin: 'Admin', docente: 'Docente', estudiante: 'Estudiante' };

export default function AdminPanel({ apiBaseUrl, token, currentUser }) {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('');
  const isSuperAdmin = currentUser.role === 'super_admin';

  const loadUsers = useCallback(async () => {
    setStatus('Cargando usuarios…');
    try {
      const response = await fetch(`${apiBaseUrl || ''}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'No fue posible consultar los usuarios.');
      setUsers(data.users || []);
      setStatus(`${data.users?.length || 0} usuarios cargados.`);
    } catch (error) { setStatus(error.message); }
  }, [apiBaseUrl, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadUsers(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  const updateRole = async (userId, role) => {
    try {
      const response = await fetch(`${apiBaseUrl || ''}/api/admin/users/${userId}/role`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ role }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'No fue posible actualizar el rol.');
      setUsers((previous) => previous.map((user) => user.id === userId ? data.user : user));
      setStatus(`Rol actualizado para ${data.user.name}.`);
    } catch (error) { setStatus(error.message); }
  };

  return <main className="admin-workspace"><section className="admin-header"><div><span className="eyebrow">RBAC · ADMINISTRACIÓN</span><h1>Usuarios y permisos</h1><p>Sesión actual: <strong>{roleLabels[currentUser.role]}</strong>. {isSuperAdmin ? 'Puedes asignar todos los roles.' : 'Puedes consultar usuarios y gestionar cuentas de docente o estudiante.'}</p></div><button className="study-secondary" onClick={loadUsers}><RefreshCw size={16} />Actualizar</button></section><section className="admin-card"><div className="card-heading"><UsersRound size={18} /><h2>Directorio de usuarios</h2></div>{status && <p className="admin-status">{status}</p>}<div className="admin-users">{users.map((user) => <article key={user.id}><div><strong>{user.name}</strong><span>{user.email}</span><small>Creado: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-EC') : '—'}</small></div>{isSuperAdmin ? <label>Rol<select value={user.role} onChange={(event) => updateRole(user.id, event.target.value)}>{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label> : <span className="role-badge"><ShieldCheck size={14} />{roleLabels[user.role] || user.role}</span>}</article>)}</div></section></main>;
}
