from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_tryon_mock_returns_base64() -> None:
    files = {
        "person_image": ("person.png", b"fake-person-bytes", "image/png"),
        "garment_image": ("jersey.png", b"fake-garment-bytes", "image/png"),
    }
    response = client.post("/tryon", files=files)

    assert response.status_code == 200
    data = response.json()
    assert data["mime_type"] == "image/png"
    assert isinstance(data["image_base64"], str)
    assert len(data["image_base64"]) > 0


def test_tryon_service_failure_returns_502(monkeypatch) -> None:
    def failing_tryon(**_kwargs):
        raise Exception("upstream auth failed")

    monkeypatch.setattr("app.routes.tryon.run_virtual_tryon", failing_tryon)

    files = {
        "person_image": ("person.png", b"fake-person-bytes", "image/png"),
        "garment_image": ("jersey.png", b"fake-garment-bytes", "image/png"),
    }
    response = client.post("/tryon", files=files)

    assert response.status_code == 502
    assert response.json() == {"detail": "Virtual try-on request failed: upstream auth failed"}


