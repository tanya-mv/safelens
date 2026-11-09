# SafeLens - PPE Compliance Detector

SafeLens detects whether people in an image are wearing required Personal Protective Equipment (PPE) - hardhats, safety vests, gloves, goggles and masks - and flags violations. Upload an image, and the system returns bounding boxes with labels and confidence scores, plus an annotated copy of the image highlighting what was detected.

Built end to end: a custom-trained YOLOv8s detection model, a FastAPI backend that serves it, and a Next.js frontend to upload images and view results.

## What it does

- Detects 14 classes: Person, Hardhat, NO-Hardhat, Safety Vest, NO-Safety Vest, Gloves, NO-Gloves, Goggles, NO-Goggles, Mask, NO-Mask, Ladder, Safety Cone, Fall-Detected
- Returns each detection as a label, confidence score, and bounding box
- Returns the input image annotated with the drawn boxes
- The NO-* classes let the system flag violations directly (e.g. a person with NO-Hardhat)

## Results

Model: YOLOv8s, trained for 50 epochs (~8.4 hours on a Tesla T4) on the [Personal Protective Equipment - Combined Model](https://universe.roboflow.com/roboflow-universe-projects/personal-protective-equipment-combined-model/dataset/8) dataset from Roboflow Universe (30,765 training / 8,814 validation images).

Final validation of `backend/best.pt`:

| Metric | Value |
| --- | --- |
| mAP@50 | **78.3%** |
| mAP@50-95 | 51.2% |
| Precision | 71.4% |
| Recall | 84.0% |
| Classes | 14 |

Per-class highlights (mAP@50): strongest are Goggles (96.5%), Ladder (96.4%) and Gloves (95.3%); the weakest is NO-Safety Vest (24.0%), a known hard negative case - see training notebook for the full table.



## Tech stack

- **Model:** YOLOv8s (Ultralytics), trained on Kaggle (see `ppe-training.ipynb`)
- **Backend:** FastAPI + Uvicorn, serving `best.pt` via Ultralytics
- **Frontend:** Next.js 16, React 19, Tailwind CSS v4
- **Image handling:** Pillow, OpenCV, NumPy

## Project structure

```
safelens/
├── Day-1.ipynb              # Kaggle training notebook
├── backend/
│   ├── best.pt              # trained model weights
│   ├── main.py              # FastAPI app: GET / and POST /detect
│   └── requirements.txt
└── frontend/                # Next.js app
    ├── app/
    └── package.json
```

## API

### `POST /detect`

Accepts a single image upload (`multipart/form-data`, field name `file`) and returns:

```json
{
  "detections": [
    { "label": "Hardhat", "confidence": 0.92, "box": [x1, y1, x2, y2] }
  ],
  "annotated_image": "<base64-encoded JPEG with boxes drawn>"
}
```

Interactive docs available at `http://localhost:8000/docs` while the backend is running.

## How to run

### Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The API starts on `http://localhost:8000`.

<!-- TODO: fix in repo - main.py also imports cv2 (OpenCV) and numpy, but they are not in requirements.txt. Add opencv-python and numpy to backend/requirements.txt, or pip install them manually -->

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI starts on `http://localhost:3000`.

## Notes

- CORS is currently open (`allow_origins=["*"]`) for local development.
- Model weights are committed to the repo (`backend/best.pt`) so the backend runs without retraining.

## Author

Tanya Mariam Viji
