import hmac
import os

from fastapi import HTTPException, Request


def require_operator(request: Request) -> None:
    if os.getenv("REKADESA_MODE", "demo").lower() != "production":
        return
    expected = os.getenv("OPERATOR_API_KEY", "")
    if not expected:
        raise HTTPException(503, "Kunci operator belum dikonfigurasi")
    provided = request.headers.get("X-Operator-Key", "")
    if not hmac.compare_digest(provided, expected):
        raise HTTPException(401, "Akses operator diperlukan")
