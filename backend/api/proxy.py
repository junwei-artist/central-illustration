from fastapi import APIRouter, Response, HTTPException, status, Depends
from fastapi.responses import StreamingResponse
from starlette.requests import Request as StarletteRequest
from sqlalchemy.orm import Session
from db.session import get_db
from models.demonstration import Demonstration
from core.process_manager import process_manager
import httpx

router = APIRouter()


async def proxy_request(
    target_url: str,
    request: StarletteRequest,
    path_suffix: str = "",
    url_prefix: str | None = None,
) -> Response:
    """
    Proxy a request to a target URL
    """
    try:
        # Build the full target URL
        if path_suffix:
            # Remove leading slash if present
            path_suffix = path_suffix.lstrip('/')
            target_full_url = f"{target_url}/{path_suffix}"
        else:
            target_full_url = target_url
        
        # Get query parameters from original request
        query_params = dict(request.query_params)
        
        # Prepare headers (exclude some that shouldn't be forwarded)
        headers = {}
        exclude_headers = {
            'host', 'content-length', 'connection', 
            'upgrade', 'proxy-connection', 'keep-alive'
        }
        
        for key, value in request.headers.items():
            if key.lower() not in exclude_headers:
                headers[key] = value
        
        # Read request body if present
        body = await request.body()
        
        # Make the proxied request
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True, trust_env=False) as client:
            # Determine the method
            method = request.method
            
            response = await client.request(
                method=method,
                url=target_full_url,
                params=query_params,
                headers=headers,
                content=body,
            )
            
            # Get response headers (exclude some)
            response_headers = {}
            exclude_response_headers = {
                'content-encoding', 'content-length', 'transfer-encoding',
                'connection', 'keep-alive'
            }
            
            for key, value in response.headers.items():
                if key.lower() not in exclude_response_headers:
                    response_headers[key] = value
            
            # Possibly rewrite HTML so asset URLs work behind the proxy
            content_type = response.headers.get('content-type', '')
            if url_prefix and content_type.startswith('text/html'):
                try:
                    text = response.text
                    # Rewrite common URL attributes that start at root
                    # href="/...", src="/...", action="/..."
                    import re as _re
                    def _repl(m):
                        return f"{m.group(1)}{url_prefix}/"
                    pattern = _re.compile(r"((?:href|src|action)=[\"\'])(/(?!/|https?:))")
                    text = _re.sub(pattern, _repl, text)
                    body_bytes = text.encode('utf-8')
                except Exception:
                    body_bytes = response.content
            else:
                body_bytes = response.content

            # Return a regular Response with full body
            return Response(
                content=body_bytes,
                status_code=response.status_code,
                headers=response_headers,
                media_type=response.headers.get('content-type')
            )
            
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Gateway timeout"
        )
    except httpx.ConnectError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Cannot connect to demo service"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Proxy error: {str(e)}"
        )


@router.api_route(
    "/proxy/{demo_id}/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
)
async def proxy_demo_request(
    demo_id: int,
    path: str,
    request: StarletteRequest,
    db: Session = Depends(get_db)
):
    """
    Proxy requests to a demo application
    """
    # Get the demo from database
    demo = db.query(Demonstration).filter(Demonstration.id == demo_id).first()
    if not demo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demonstration not found"
        )
    
    # Check if demo is running
    status_info = process_manager.get_demo_status(demo.folder_name)
    
    if status_info['status'] != 'running' or not status_info.get('port'):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Demo service is not running"
        )
    
    # Build the internal URL (localhost since we're in the same network)
    port = status_info['port']
    internal_url = f"http://127.0.0.1:{port}"
    
    # Proxy the request
    return await proxy_request(internal_url, request, path, url_prefix=f"/proxy/{demo_id}")


@router.api_route(
    "/proxy/{demo_id}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
)
async def proxy_demo_root(
    demo_id: int,
    request: StarletteRequest,
    db: Session = Depends(get_db)
):
    """
    Proxy requests to demo root (no additional path)
    """
    # Get the demo from database
    demo = db.query(Demonstration).filter(Demonstration.id == demo_id).first()
    if not demo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demonstration not found"
        )
    
    # Check if demo is running
    status_info = process_manager.get_demo_status(demo.folder_name)
    
    if status_info['status'] != 'running' or not status_info.get('port'):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Demo service is not running"
        )
    
    # Build the internal URL
    port = status_info['port']
    internal_url = f"http://127.0.0.1:{port}"
    
    # Proxy the request (no path suffix)
    return await proxy_request(internal_url, request, "", url_prefix=f"/proxy/{demo_id}")

