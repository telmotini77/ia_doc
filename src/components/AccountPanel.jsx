import { useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';

export default function AccountPanel({ apiBaseUrl, token, currentUser }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmation: '' });
  const [status, setStatus] = useState('');
  const update = (field, value) => setForm((previous) => ({ ...previous, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (form.newPassword !== form.confirmation) { setStatus('La confirmación no coincide con la nueva contraseña.'); return; }
    try {
      const response = await fetch(`${apiBaseUrl || ''}/api/auth/change-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const data = response.status === 204 ? {} : await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'No se pudo cambiar la contraseña.');
      setForm({ currentPassword: '', newPassword: '', confirmation: '' });
      setStatus('Contraseña actualizada correctamente.');
    } catch (error) { setStatus(error.message); }
  };

  return <main className="admin-workspace account-workspace"><section className="admin-header"><div><span className="eyebrow">MI CUENTA</span><h1>Seguridad de acceso</h1><p>{currentUser.name} · {currentUser.email}</p></div></section><section className="account-card"><div className="card-heading"><KeyRound size={18} /><h2>Cambiar contraseña</h2></div><p className="muted">Confirma tu contraseña actual y define una nueva de al menos 8 caracteres.</p><form className="admin-create-form" onSubmit={submit}><label>Contraseña actual<input type="password" value={form.currentPassword} onChange={(event) => update('currentPassword', event.target.value)} required autoComplete="current-password" /></label><label>Nueva contraseña<input type="password" value={form.newPassword} onChange={(event) => update('newPassword', event.target.value)} required minLength="8" autoComplete="new-password" /></label><label>Confirmar nueva contraseña<input type="password" value={form.confirmation} onChange={(event) => update('confirmation', event.target.value)} required minLength="8" autoComplete="new-password" /></label>{status && <p className="admin-status">{status}</p>}<button className="study-primary"><ShieldCheck size={16} />Actualizar contraseña</button></form></section></main>;
}
