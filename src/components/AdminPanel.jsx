import { useCallback, useEffect, useState } from 'react';
import { Ban, CircleCheck, RefreshCw, ShieldCheck, Trash2, UserPlus, UsersRound } from 'lucide-react';

const roleLabels = { super_admin: 'Super admin', admin: 'Admin', docente: 'Docente', estudiante: 'Estudiante' };
const publicRoles = ['docente', 'estudiante'];

export default function AdminPanel({ apiBaseUrl, token, currentUser }) {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'estudiante' });
  const isSuperAdmin = currentUser.role === 'super_admin';
  const allowedRoles = isSuperAdmin ? Object.keys(roleLabels) : publicRoles;
  const requestHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

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
      const response = await fetch(`${apiBaseUrl || ''}/api/admin/users/${userId}/role`, { method: 'PATCH', headers: requestHeaders, body: JSON.stringify({ role }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'No fue posible actualizar el rol.');
      setUsers((previous) => previous.map((user) => user.id === userId ? data.user : user));
      setStatus(`Rol actualizado para ${data.user.name}.`);
    } catch (error) { setStatus(error.message); }
  };

  const createUser = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${apiBaseUrl || ''}/api/admin/users`, { method: 'POST', headers: requestHeaders, body: JSON.stringify(newUser) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'No fue posible crear la cuenta.');
      setUsers((previous) => [data.user, ...previous]);
      setNewUser({ name: '', email: '', password: '', role: 'estudiante' });
      setStatus(`Cuenta creada para ${data.user.name} (${roleLabels[data.user.role]}).`);
    } catch (error) { setStatus(error.message); }
  };

  const updateStatus = async (user, isActive) => {
    try {
      const response = await fetch(`${apiBaseUrl || ''}/api/admin/users/${user.id}/status`, { method: 'PATCH', headers: requestHeaders, body: JSON.stringify({ isActive }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'No fue posible cambiar el estado de la cuenta.');
      setUsers((previous) => previous.map((item) => item.id === user.id ? data.user : item));
      setStatus(`${data.user.name} fue ${data.user.isActive ? 'reactivado' : 'baneado'}.`);
    } catch (error) { setStatus(error.message); }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`¿Eliminar definitivamente a ${user.name}? Esta acción no se puede deshacer.`)) return;
    try {
      const response = await fetch(`${apiBaseUrl || ''}/api/admin/users/${user.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = response.status === 204 ? {} : await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'No fue posible eliminar la cuenta.');
      setUsers((previous) => previous.filter((item) => item.id !== user.id));
      setStatus(`Cuenta eliminada: ${user.name}.`);
    } catch (error) { setStatus(error.message); }
  };

  const updateNewUser = (field, value) => setNewUser((previous) => ({ ...previous, [field]: value }));

  return <main className="admin-workspace">
    <section className="admin-header"><div><span className="eyebrow">RBAC · ADMINISTRACIÓN</span><h1>Usuarios y permisos</h1><p>Sesión actual: <strong>{roleLabels[currentUser.role]}</strong>. {isSuperAdmin ? 'Control total: puedes crear, modificar, banear y eliminar cualquier cuenta, con protecciones para el último super admin.' : 'Puedes consultar usuarios y crear cuentas de docente o estudiante.'}</p></div><button className="study-secondary" onClick={loadUsers}><RefreshCw size={16} />Actualizar</button></section>
    <section className="admin-grid">
      <article className="admin-card user-create-card"><div className="card-heading"><UserPlus size={18} /><h2>Crear cuenta</h2></div><p className="muted">{isSuperAdmin ? 'Puedes crear super admins, admins, docentes o estudiantes.' : 'Puedes crear docentes o estudiantes.'}</p><form className="admin-create-form" onSubmit={createUser}><label>Nombre<input value={newUser.name} onChange={(event) => updateNewUser('name', event.target.value)} required minLength="2" /></label><label>Correo<input type="email" value={newUser.email} onChange={(event) => updateNewUser('email', event.target.value)} required /></label><label>Contraseña inicial<input type="password" value={newUser.password} onChange={(event) => updateNewUser('password', event.target.value)} required minLength="8" /></label><label>Rol<select value={newUser.role} onChange={(event) => updateNewUser('role', event.target.value)}>{allowedRoles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}</select></label><button className="study-primary"><UserPlus size={16} />Crear usuario</button></form></article>
      <article className="admin-card"><div className="card-heading"><UsersRound size={18} /><h2>Directorio de usuarios</h2></div>{status && <p className="admin-status">{status}</p>}<div className="admin-users">{users.map((user) => <article key={user.id} className={!user.isActive ? 'banned' : ''}><div><strong>{user.name} {!user.isActive && <em>Cuenta baneada</em>}</strong><span>{user.email}</span><small>Creado: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-EC') : '—'}</small></div><div className="user-actions">{isSuperAdmin ? <label>Rol<select value={user.role} onChange={(event) => updateRole(user.id, event.target.value)}>{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label> : <span className="role-badge"><ShieldCheck size={14} />{roleLabels[user.role] || user.role}</span>}{isSuperAdmin && <><button className={user.isActive ? 'danger-action' : 'success-action'} onClick={() => updateStatus(user, !user.isActive)}>{user.isActive ? <><Ban size={15} />Banear</> : <><CircleCheck size={15} />Reactivar</>}</button><button className="danger-action" onClick={() => deleteUser(user)}><Trash2 size={15} />Eliminar</button></>}</div></article>)}</div></article>
    </section>
  </main>;
}
