from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from api import auth, demos, comments, demo_manager, proxy, exporter, extensions, content_editor

app = FastAPI(
    title="Central Illustration API",
    description="API for demonstration project management",
    version="1.0.0",
)

# CORS middleware
cors_origins = settings.cors_origins_list

# Configure CORS middleware
if cors_origins == ["*"]:
    # Allow all origins (but can't use credentials)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Use specified origins with credentials
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include routers
app.include_router(auth.router)
app.include_router(demos.router)
app.include_router(comments.router)
app.include_router(demo_manager.router)
app.include_router(exporter.router)
app.include_router(extensions.router)
app.include_router(content_editor.router)
# Proxy router must be last due to catch-all pattern
app.include_router(proxy.router)


@app.get("/")
def root():
    return {
        "message": "Central Illustration API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

