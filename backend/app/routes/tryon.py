import logging

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.vertex_tryon import run_virtual_tryon

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/tryon")
async def tryon(
    person_image: UploadFile = File(...),
    garment_image: UploadFile = File(...),
) -> dict[str, str]:
    logger.info(
        "Received /tryon request person_content_type=%s garment_content_type=%s person_filename=%s garment_filename=%s",
        person_image.content_type,
        garment_image.content_type,
        person_image.filename,
        garment_image.filename,
    )

    if not person_image.content_type or not person_image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="person_image must be an image")

    if not garment_image.content_type or not garment_image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="garment_image must be an image")

    person_image_bytes = await person_image.read()
    garment_image_bytes = await garment_image.read()

    logger.info(
        "Read /tryon payload person_bytes=%s garment_bytes=%s",
        len(person_image_bytes),
        len(garment_image_bytes),
    )

    if not person_image_bytes:
        raise HTTPException(status_code=400, detail="person_image is empty")
    if not garment_image_bytes:
        raise HTTPException(status_code=400, detail="garment_image is empty")

    try:
        result = run_virtual_tryon(
            person_image_bytes=person_image_bytes,
            person_mime_type=person_image.content_type,
            garment_image_bytes=garment_image_bytes,
            garment_mime_type=garment_image.content_type,
        )
        logger.info(
            "Completed /tryon request response_mime_type=%s image_base64_length=%s",
            result.get("mime_type"),
            len(result.get("image_base64", "")),
        )
        return result
    except RuntimeError as exc:
        logger.exception("Runtime error while processing /tryon")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unhandled error while processing /tryon")
        raise HTTPException(status_code=502, detail=f"Virtual try-on request failed: {exc}") from exc

