from __future__ import annotations

import base64
import logging
import os
import time
from typing import Any


logger = logging.getLogger(__name__)


def run_virtual_tryon(
    person_image_bytes: bytes,
    person_mime_type: str,
    garment_image_bytes: bytes,
    garment_mime_type: str,
) -> dict[str, str]:
    """
    Main integration seam for virtual try-on.

    In mock mode (default), this returns the person image unchanged.
    Set VTO_USE_VERTEX=true to enable the Vertex AI implementation.
    """
    use_vertex = os.getenv("VTO_USE_VERTEX", "false").lower() == "true"
    logger.info(
        "run_virtual_tryon called use_vertex=%s person_mime_type=%s garment_mime_type=%s",
        use_vertex,
        person_mime_type,
        garment_mime_type,
    )
    if use_vertex:
        return _run_virtual_tryon_vertex(
            person_image_bytes=person_image_bytes,
            person_mime_type=person_mime_type,
            garment_image_bytes=garment_image_bytes,
            garment_mime_type=garment_mime_type,
        )

    return _run_virtual_tryon_mock(person_image_bytes, person_mime_type)


def _run_virtual_tryon_mock(person_image_bytes: bytes, person_mime_type: str) -> dict[str, str]:
    logger.info("Using mock try-on implementation")
    return {
        "mime_type": person_mime_type or "image/png",
        "image_base64": base64.b64encode(person_image_bytes).decode("utf-8"),
    }


def _run_virtual_tryon_vertex(
    person_image_bytes: bytes,
    person_mime_type: str,
    garment_image_bytes: bytes,
    garment_mime_type: str,
) -> dict[str, str]:
    from google import genai
    from google.genai import types

    project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "")
    location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
    auth_mode = os.getenv("VTO_AUTH_MODE", "adc").lower()  # "adc" | "api_key"
    api_key = os.getenv("VERTEX_API_KEY", "")

    if not project_id:
        raise RuntimeError("GOOGLE_CLOUD_PROJECT is required when VTO_USE_VERTEX=true")

    logger.info(
        "Using Vertex try-on implementation project=%s location=%s auth_mode=%s person_mime_type=%s garment_mime_type=%s person_bytes=%s garment_bytes=%s",
        project_id,
        location,
        auth_mode,
        person_mime_type,
        garment_mime_type,
        len(person_image_bytes),
        len(garment_image_bytes),
    )

    # ── CA bundle (ZScaler / corporate proxy support) ────────────────────────
    # REQUESTS_CA_BUNDLE is set by the launch scripts when a custom cert is found.
    ca_bundle = os.getenv("REQUESTS_CA_BUNDLE") or os.getenv("SSL_CERT_FILE") or None
    if ca_bundle:
        logger.info("Using custom CA bundle for Vertex requests: %s", ca_bundle)

    def _http_options(**extra_headers: str) -> types.HttpOptions:
        opts: dict = {}
        if extra_headers:
            opts["headers"] = extra_headers
        if ca_bundle:
            opts["ca_bundle_path"] = ca_bundle
        return types.HttpOptions(**opts) if opts else None  # type: ignore[return-value]

    if auth_mode == "api_key":
        if not api_key:
            raise RuntimeError("VERTEX_API_KEY is required when VTO_AUTH_MODE=api_key")
        # API key must be passed as a header — SDK forbids combining api_key= with project/location args
        client = genai.Client(
            vertexai=True,
            project=project_id,
            location=location,
            http_options=types.HttpOptions(
                headers={"x-goog-api-key": api_key},
                **( {"ca_bundle_path": ca_bundle} if ca_bundle else {} ),
            ),
        )
    else:
        # Default: Application Default Credentials (ADC) or GOOGLE_APPLICATION_CREDENTIALS
        http_opts = _http_options()
        client = genai.Client(
            vertexai=True,
            project=project_id,
            location=location,
            **({"http_options": http_opts} if http_opts else {}),
        )

    logger.info("Calling Vertex AI recontext_image model=virtual-try-on-preview-08-04")
    start_time = time.monotonic()
    response = client.models.recontext_image(
        model="virtual-try-on-preview-08-04",
        source=types.RecontextImageSource(
            person_image=types.Image(image_bytes=person_image_bytes, mime_type=person_mime_type),
            product_images=[
                types.ProductImage(
                    product_image=types.Image(
                        image_bytes=garment_image_bytes,
                        mime_type=garment_mime_type,
                    ),
                )
            ],
        ),
        config=types.RecontextImageConfig(
            number_of_images=1,
            output_mime_type="image/png",
        ),
    )
    elapsed_ms = int((time.monotonic() - start_time) * 1000)
    logger.info("Vertex AI recontext_image completed in %sms", elapsed_ms)

    generated: Any = response.generated_images[0].image if response.generated_images else None
    if not generated or not generated.image_bytes:
        raise RuntimeError("Vertex AI returned no generated image. The model may have rejected the inputs.")
    image_bytes = generated.image_bytes
    mime_type = generated.mime_type or "image/png"

    return {
        "mime_type": mime_type,
        "image_base64": base64.b64encode(image_bytes).decode("utf-8"),
    }

