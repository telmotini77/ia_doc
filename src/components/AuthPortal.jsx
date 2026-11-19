import { useState } from 'react';
import { BookOpenCheck, BrainCircuit, GraduationCap, LockKeyhole, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import './AuthPortal.css';

const publicRoles = [
  { value: 'estudiante', label: 'Estudiante', description: 'Estudia, crea recursos y realiza evaluaciones.' },
  { value: 'docente', label: 'Docente', description: 'Organiza material y prepara recursos de clase.' },
];

const roleCards = [
  ['Super admin', 'Control total de usuarios, roles y plataforma.'],
  ['Admin', 'Consulta usuarios y administra estudiantes y docentes.'],
  ['Docente', 'Prepara contenido, clases y evaluaciones.'],
  ['Estudiante', 'Estudia, practica y organiza su avance.'],
];

export default function AuthPortal({ apiBaseUrl, onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'estudiante' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const endpoint = (path) => `${apiBaseUrl || ''}${path}`;
  const update = (field, value) => setForm((previous) => ({ ...previous, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const payload = mode === 'login'
      ? { email: form.email, password: form.password }
      : form;
    try {
      const response = await fetch(endpoint(mode === 'login' ? '/api/auth/login' : '/api/auth/register'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || 'No fue posible procesar la solicitud.');
      onAuthenticated(data);
    } catch (error) {
      setMessage(error.message || 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return <main className="auth-portal">
    <section className="landing-hero">
      <nav className="landing-nav"><div className="landing-brand"><Sparkles size={21} />DocuGenius <span>STUDY</span></div><button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}</button></nav>
      <div className="landing-copy"><span className="landing-eyebrow">PLATAFORMA ACADÉMICA CON ACCESO SEGURO</span><h1>Tu material, tu estudio y tu equipo en un solo lugar.</h1><p>Genera documentos, organiza tus libros, estudia anatomía y crea evaluaciones con accesos definidos para cada integrante de la institución.</p><div className="landing-actions"><button className="landing-primary" onClick={() => setMode('register')}>Comenzar ahora <Sparkles size={17} /></button><a href="#roles">Ver roles y permisos</a></div></div>
      <div className="landing-feature-grid"><article><BookOpenCheck size={20} /><strong>Biblioteca guiada</strong><span>Material y progreso de estudio.</span></article><article><BrainCircuit size={20} /><strong>Recursos inteligentes</strong><span>Mapas, tarjetas y cuestionarios.</span></article><article><GraduationCap size={20} /><strong>Evaluación práctica</strong><span>Exámenes basados en tus textos.</span></article></div>
    </section>

    <section className="roles-section" id="roles"><div><span className="landing-eyebrow">CONTROL DE ACCESO</span><h2>Un rol claro para cada persona</h2><p>Los permisos administrativos no se pueden escoger durante el registro público: los asigna el super administrador desde el panel protegido.</p></div><div className="role-grid">{roleCards.map(([role, description], index) => <article key={role}><span>{index + 1}</span><h3>{role}</h3><p>{description}</p></article>)}</div></section>

    <section className="auth-card" aria-label={mode === 'login' ? 'Inicio de sesión' : 'Registro de usuario'}>
      <div className="auth-card-heading"><div className="auth-icon"><LockKeyhole size={19} /></div><div><span>{mode === 'login' ? 'BIENVENIDO DE NUEVO' : 'NUEVA CUENTA'}</span><h2>{mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}</h2></div></div>
      <p>{mode === 'login' ? 'Accede con tu cuenta para continuar.' : 'Elige si eres estudiante o docente. Los roles administrativos se asignan de forma controlada.'}</p>
      <form onSubmit={submit}>
        {mode === 'register' && <label>Nombre completo<input value={form.name} onChange={(event) => update('name', event.target.value)} minLength="2" required autoComplete="name" /></label>}
        <label>Correo electrónico<input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required autoComplete="email" /></label>
        <label>Contraseña<input type="password" value={form.password} onChange={(event) => update('password', event.target.value)} minLength="8" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
        {mode === 'register' && <fieldset><legend>Tipo de cuenta</legend>{publicRoles.map((role) => <label className={`role-choice ${form.role === role.value ? 'selected' : ''}`} key={role.value}><input type="radio" name="role" value={role.value} checked={form.role === role.value} onChange={(event) => update('role', event.target.value)} /><span><strong>{role.label}</strong><small>{role.description}</small></span></label>)}</fieldset>}
        {message && <p className="auth-error">{message}</p>}
        <button className="auth-submit" disabled={loading}>{loading ? 'Procesando…' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'} <ShieldCheck size={17} /></button>
      </form>
      <button className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage(''); }}>{mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}</button>
      <div className="auth-security"><UsersRound size={15} />Tus privilegios se aplican y validan en el servidor.</div>
    </section>
  </main>;
}
