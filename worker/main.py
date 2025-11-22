import io
import os
import uuid
from typing import List

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from PIL import Image
import face_recognition

app = FastAPI(title="Face Crop Service")


def crop_faces_bytes(
    image_bytes: bytes,
    output_dir: str,
    margin: int = 20,
) -> List[str]:
    """
    Recebe bytes de imagem, detecta rostos e salva cada rosto recortado
    como arquivo separado. Retorna a lista de caminhos dos arquivos gerados.
    """
    os.makedirs(output_dir, exist_ok=True)

    image = face_recognition.load_image_file(io.BytesIO(image_bytes))

    face_locations = face_recognition.face_locations(image)

    pil_image = Image.fromarray(image)

    output_paths: List[str] = []

    for i, (top, right, bottom, left) in enumerate(face_locations):
        top = max(0, top - margin)
        left = max(0, left - margin)
        bottom = min(pil_image.height, bottom + margin)
        right = min(pil_image.width, right + margin)

        face_image = pil_image.crop((left, top, right, bottom))

        filename = f"face_{i + 1}_{uuid.uuid4().hex[:8]}.jpg"
        output_path = os.path.join(output_dir, filename)

        face_image.save(output_path, format="JPEG", quality=95)
        output_paths.append(output_path)

    return output_paths


@app.post("/crop-faces")
async def crop_faces_endpoint(file: UploadFile = File(...)):
    image_bytes = await file.read()

    output_dir = "faces_recortadas"

    paths = crop_faces_bytes(image_bytes, output_dir=output_dir, margin=20)

    return JSONResponse(
        {
            "faces_count": len(paths),
            "files": paths,
        }
    )
