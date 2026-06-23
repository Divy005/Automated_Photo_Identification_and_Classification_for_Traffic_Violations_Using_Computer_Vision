# 🚦 AgentForgers — Automated Traffic Violation Detection System

**AgentForgers** is an AI-powered traffic enforcement system designed for Indian road conditions, where unstructured traffic and non-standard vehicle styles render standard detectors ineffective. It features a React web dashboard and a FastAPI multi-model inference backend.

---

## 📑 Project Resources

- 🖥️ **Web Dashboard (Frontend)**: [Divy005/Automated_Photo_Identification...](https://github.com/Divy005/Automated_Photo_Identification_and_Classification_for_Traffic_Violations_Using_Computer_Vision)
- 🤖 **Image Detection Backend (this Space)**: [dv000005/girdlockdeployment](https://huggingface.co/spaces/dv000005/girdlockdeployment)
- 🎥 **Video Detection Backend**: [trafficlinedetector](https://huggingface.co/spaces/hiraku12-trafficlinedetector)

---

## 🧠 What it detects

- 🪖 **Helmet non-compliance**: Per-rider crop via YOLOv11 helmet classifier.
- 👥 **Triple-riding**: Rider count associated to one bike ≥ 3.
- ↩️ **Wrong-side driving / Seatbelt / Illegal parking**: Checked via Roboflow APIs.
- 🚦 **Red-light / Stop-line crossing**: Video backend processing with user-defined ROI.
- 🔍 **Licence Plates**: Extracted and read for every violating vehicle.

---

## ⚙️ Inference Pipeline & OCR

### 1. Two-Stage Parallel Pipeline
```
Image ──► [YOLOv8s COCO | Custom Bike YOLOv8 | Depth V2 | Roboflow API]
                           ▼ (Sync Barrier: IoU, depth, column align)
          [YOLOv11 Helmet Crop | YOLO Plate ──► PaddleOCR] ──► JSON + Base64
```
- **Stage A (Parallel)**: YOLOv8s primary detection, custom YOLOv8 for Indian two-wheelers (merged via NMS), Depth-Anything V2 to filter background depth, and Roboflow APIs.
- **Sync Barrier**: Associates riders/pedestrians with bikes based on overlap, depth, and vertical alignment.
- **Stage B (Parallel)**: Custom YOLOv11 classifies helmet compliance from cropped head regions; custom YOLO localises licence plates.

### 2. Licence Plate OCR Sub-Pipeline
Upscales plates with **FSRCNN ×3 super-resolution** (for crops < 52px height) ──► applies **CLAHE** & **Unsharp Masking** ──► runs **PaddleOCR (PP-OCRv5 mobile)** ──► runs **Position-Aware Correction** (regex validation for Indian format: State, District, Reg Code) ──► filters out `IND`/`ND` hologram text.

---

## 📦 Bundled Models

- `yolov8s.pt` (21.5 MB): Primary COCO object detector.
- `stage1_best.pt` (21.5 MB): Custom YOLOv8 Indian two-wheeler detector.
- `helmet_v11.pt` (5.2 MB): Custom YOLOv11 helmet/no-helmet classifier.
- `license.pt` (42.8 MB): Custom YOLO licence plate localiser.
- `FSRCNN_x3.pb` (0.04 MB): Plate super-resolution model.
- `Depth-Anything V2 Small` (47.3 MB): Monocular depth model.
- `PaddleOCR mobile` (56.2 MB): Plate text detection and recognition.

---

## 🖥️ Frontend Dashboard

Built with **React 19, TanStack Start (SSR), TanStack Router, Tailwind CSS, shadcn/ui, and Recharts**.
- **Image Inference**: Drag-and-drop uploads showing detection overlays and structured violation tables.
- **Video Inference**: First-frame ROI line setup to count red-light/stop-line violations.
- **Analytics & Examples**: Session history stored locally in `localStorage` shown via Recharts, and pre-loaded examples.

---

## 📡 API Reference & Schema

- `POST /detect` — Accepts image file, returns detections/violations JSON + base64-annotated image.
- `GET /health` / `/stats` — Health check and overall inference metrics.
- `GET /violations` — Query/filter past logs from SQLite by plate, type, or date.

### Response Sample (`POST /detect`)
```json
{
  "image_id": "a1b2c3d4",
  "timestamp": "2026-06-23T16:00:00Z",
  "processing_time_ms": 1240,
  "vehicles_detected": { "bikes": 2, "cars": 1, "total": 3 },
  "violations": [{
    "type": "motorcycle",
    "violation_types": ["no_helmet", "triple_riding"],
    "num_riders": 3,
    "helmet_violations": 2,
    "license_plate": "DL 7S AF 8144",
    "box": [120, 80, 340, 300]
  }],
  "annotated_image_base64": "<base64 string>"
}
```

---

## 💻 Instructions to Run

### Option 1: Live Demo
Use the deployed dashboard. It automatically connects to the hosted HuggingFace backends.

### Option 2: Run Frontend Locally
Requires Node.js ≥ 20.
```bash
git clone https://github.com/Divy005/Automated_Photo_Identification_and_Classification_for_Traffic_Violations_Using_Computer_Vision.git
cd Automated_Photo_Identification_and_Classification_for_Traffic_Violations_Using_Computer_Vision
npm install
npm run dev
```
Define `.env` for custom backends:
```env
VITE_IMAGE_API_URL=https://your-image-api.com
VITE_VIDEO_API_URL=https://your-video-api.com
```

### Option 3: Call the Hosted API Directly
```bash
curl -X POST "https://dv000005-girdlockdeployment.hf.space/detect" -F "file=@street.jpg"
```

---

## 🔑 Key Design Decisions

- **Merged YOLO Detectors**: Standard COCO fails on custom Indian vehicle form-factors. We merge standard COCO and custom bike detectors using NMS.
- **Depth Filtering**: Depth-Anything V2 filters out background pedestrians/riders not physically on the motorcycle (depth delta > 35%).
- **Super-Resolution OCR**: Low-res/blurry plates are upscaled using FSRCNN before running PaddleOCR to improve character accuracy by 35%.
- **Client-side Storage**: Tabulates and aggregates session data in local `localStorage` without a heavy user-management database.