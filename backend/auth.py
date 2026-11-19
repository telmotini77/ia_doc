"""Authentication, user persistence and role based access control for DocuGenius."""

import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Generator

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from sqlalchemy import Boolean, Column, DateTime, Integer, String, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker


ROLES = {"super_admin", "admin", "docente", "estudiante"}
PUBLIC_REGISTRATION_ROLES = {"docente", "estudiante"}

database_url = os.getenv("DATABASE_URL", "sqlite:///./docugenius.db")
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+psycopg2://", 1)

engine_options = {"pool_pre_ping": True}
if database_url.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}

engine = create_engine(database_url, **engine_options)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
# PBKDF2-SHA256 avoids native bcrypt-version coupling and is appropriate for
# password storage with a per-password salt and a high iteration count.
password_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
security = HTTPBearer(auto_error=False)
JWT_SECRET = os.getenv("AUTH_SECRET_KEY") or secrets.token_urlsafe(48)
JWT_ALGORITHM = "HS256"
JWT_HOURS = int(os.getenv("AUTH_TOKEN_HOURS", "24"))


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(30), nullable=False, default="estudiante")
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))


def init_auth_database() -> None:
    """Create tables and seed the only privileged account from protected env vars."""
    Base.metadata.create_all(bind=engine)
    email = (os.getenv("SUPER_ADMIN_EMAIL") or "").strip().lower()
    password = os.getenv("SUPER_ADMIN_PASSWORD") or ""
    if not email or not password:
        return
    with SessionLocal() as db:
        if not db.query(User).filter(User.email == email).first():
            db.add(User(
                name=os.getenv("SUPER_ADMIN_NAME", "Super administrador"),
                email=email,
                password_hash=hash_password(password),
                role="super_admin",
            ))
            db.commit()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def hash_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return password_context.verify(password, password_hash)


def create_access_token(user: User) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "iat": now,
        "exp": now + timedelta(hours=JWT_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def user_payload(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "isActive": user.is_active,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
    }


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inicia sesión para continuar.")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = int(payload.get("sub", ""))
    except (jwt.PyJWTError, TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="La sesión no es válida o expiró.")
    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="La cuenta no está disponible.")
    return user


def require_roles(*allowed_roles: str):
    allowed = set(allowed_roles)

    def verify_role(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos para esta acción.")
        return user

    return verify_role


def can_assign_role(actor: User, role: str) -> bool:
    if role not in ROLES:
        return False
    if actor.role == "super_admin":
        return True
    return actor.role == "admin" and role in PUBLIC_REGISTRATION_ROLES


def is_last_super_admin(db: Session, user: User, new_role: str) -> bool:
    return user.role == "super_admin" and new_role != "super_admin" and db.query(User).filter(User.role == "super_admin", User.is_active.is_(True)).count() <= 1


def is_only_active_super_admin(db: Session, user: User) -> bool:
    return user.role == "super_admin" and db.query(User).filter(User.role == "super_admin", User.is_active.is_(True)).count() <= 1
