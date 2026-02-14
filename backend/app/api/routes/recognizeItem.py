from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.ai_recognition import recognize_item_with_ai

import base64

router = APIRouter()

MAX_FILE_SIZE = 2 * 1024 * 1024  # 2 MB


@router.post("/")
async def recognize_item(image: UploadFile = File(...)):
    if image.content_type not in {"image/jpeg", "image/png"}:
        raise HTTPException(status_code=400, detail="Unsupported image type")

    raw = await image.read()

    if len(raw) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code = 413,
            detail = "Imgage too large. The maximum size is 2MB"
        )

    b64 = base64.b64encode(raw).decode("utf-8")
    data_url = f"data:{image.content_type};base64,{b64}"

    # call your AI service here
    result = await recognize_item_with_ai(data_url)

    return result

