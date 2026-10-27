"""TrustETL API: user registration only.

Run from the project root (the folder that contains Register.html):

    uvicorn backend.main:app --reload --port 8000

The same app also serves the existing static pages (read-only), so
http://localhost:8000/Register.html works with no CORS setup.
"""

import logging
import re
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from .config import settings
from .database import Base, engine, get_db
from .models import User
from .schemas import RegisterRequest, RegisterResponse
from .security import hash_password

logger = logging.getLogger("trustetl")

FRONTEND_DIR = Path(__file__).resolve().parent.parent

PG_UNIQUE_VIOLATION = "23505"

DUPLICATE_MESSAGE = (
    "Registration could not be completed with this email address. "
    "If you already have an account, please log in."
)
UNAVAILABLE_MESSAGE = "The service is temporarily unavailable. Please try again later."


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Creates the users table only if it is missing; never alters or drops anything.
    # (backend/sql/001_create_users.sql does the same thing by hand.)
    try:
        Base.metadata.create_all(engine)
    except SQLAlchemyError as exc:
        # Log the exception type only: messages can contain connection details.
        logger.error("Could not reach/initialise PostgreSQL (%s). Check DATABASE_URL.", type(exc).__name__)
    yield


app = FastAPI(title="TrustETL API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
)


# ---------------------------------------------------------------------------
# Error handling: never echo request bodies (they contain passwords).
# ---------------------------------------------------------------------------

@app.exception_handler(RequestValidationError)
async def validation_error_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    errors: dict[str, str] = {}

    for err in exc.errors():
        loc = err.get("loc", ())
        field = str(loc[-1]) if len(loc) > 1 and loc[0] == "body" else None
        kind = err.get("type", "")

        if kind == "missing":
            message = "This field is required."
        elif kind == "string_type":
            message = "Invalid value."
        elif kind == "extra_forbidden":
            continue
        elif kind == "value_error":
            message = str(err.get("msg", "Invalid value.")).removeprefix("Value error, ")
        else:
            message = "Invalid value."

        errors.setdefault(field or "_request", message)

    return JSONResponse(
        status_code=422,
        content={"detail": "Please correct the highlighted fields.", "errors": errors},
    )


# ---------------------------------------------------------------------------
# POST /api/auth/register
# ---------------------------------------------------------------------------

@app.post("/api/auth/register", response_model=RegisterResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> User:
    # Hash first so duplicate and new emails cost the same time (limits account enumeration by timing).
    password_hash = hash_password(payload.password)

    try:
        exists = db.execute(select(User.id).where(User.email == payload.email)).first()
        if exists is not None:
            raise HTTPException(status_code=409, detail=DUPLICATE_MESSAGE)

        user = User(full_name=payload.full_name, email=payload.email, password_hash=password_hash)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    except IntegrityError as exc:
        db.rollback()
        # Two simultaneous sign-ups with the same email: the DB unique constraint decides.
        if getattr(exc.orig, "sqlstate", None) == PG_UNIQUE_VIOLATION:
            raise HTTPException(status_code=409, detail=DUPLICATE_MESSAGE)
        logger.error("Database integrity error during registration (%s).", type(exc.orig).__name__)
        raise HTTPException(status_code=503, detail=UNAVAILABLE_MESSAGE)

    except SQLAlchemyError as exc:
        db.rollback()
        logger.error("Database error during registration (%s).", type(exc).__name__)
        raise HTTPException(status_code=503, detail=UNAVAILABLE_MESSAGE)


# ---------------------------------------------------------------------------
# Static frontend (read-only). Only css/, js/ and top-level *.html are exposed,
# so backend/ (including .env) is never reachable over HTTP.
# ---------------------------------------------------------------------------

app.mount("/css", StaticFiles(directory=FRONTEND_DIR / "css"), name="css")
app.mount("/js", StaticFiles(directory=FRONTEND_DIR / "js"), name="js")

_PAGE_NAME = re.compile(r"^[A-Za-z0-9_-]+$")


@app.get("/", include_in_schema=False)
def home() -> FileResponse:
    return FileResponse(FRONTEND_DIR / "index.html")


@app.get("/{page}.html", include_in_schema=False)
def html_page(page: str) -> FileResponse:
    path = FRONTEND_DIR / f"{page}.html"
    if not _PAGE_NAME.match(page) or not path.is_file():
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(path)
