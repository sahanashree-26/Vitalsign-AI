import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .database import Base, engine
from . import models  # noqa: F401 -- ensures models are registered before create_all
from .routers import auth, patients, predictions, dashboard, risk_alerts, analytics, reports, settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vitalsignai")

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VitalSignAI API",
    description="Early Disease Prediction Using Machine Learning on Health Data",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Never leak raw Python tracebacks to the frontend."""
    logger.exception("Unhandled error on %s %s", request.method, request.url)
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong on the server. Please try again."},
    )


app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(predictions.router)
app.include_router(dashboard.router)
app.include_router(risk_alerts.router)
app.include_router(analytics.router)
app.include_router(reports.router)
app.include_router(settings.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "VitalSignAI API"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}
