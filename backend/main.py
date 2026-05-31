from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from ultralytics import YOLO
from PIL import Image
import io
import base64
import cv2
import numpy as np

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your trained model
model = YOLO('best.pt')

@app.get("/")
def root():
    return {"message": "SafeLens API is running"}

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    # Read uploaded image
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    image_np = np.array(image)

    # Run detection
    results = model(image_np)

    # Get detections
    detections = []
    for box in results[0].boxes:
        label = model.names[int(box.cls)]
        confidence = float(box.conf)
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        detections.append({
            "label": label,
            "confidence": round(confidence, 2),
            "box": [x1, y1, x2, y2]
        })

    # Save annotated image and return as base64
    annotated = results[0].plot()
    _, buffer = cv2.imencode('.jpg', annotated)
    encoded_image = base64.b64encode(buffer).decode('utf-8')

    return JSONResponse({
        "detections": detections,
        "annotated_image": encoded_image
    })

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)