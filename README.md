# PosiSense

Real-time AI interview coach that tracks behavioral signals (blinks, talking, composure) during mock interviews and provides live feedback and post-session scorecards.

---

## Project Structure

```
posi-sense/
├── frontend/          # React + Vite web app
├── backend/           # Node.js backend
├── main.cc            # Presage SmartSpectra C++ sensing app
└── README.md
```

---

## Running the Website (No C++ Required)

The website runs fully standalone with a realistic simulation — no Presage or Docker needed.

### Prerequisites
- Node.js 18+
- npm

### Steps

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in Chrome.

---

## Running the Full C++ Presage Integration (Optional)

This enables real blink, talking, and nervousness detection via the Presage SmartSpectra SDK.

### Prerequisites

- Windows with WSL2 (Ubuntu 22.04)
- Docker installed in WSL2
- [usbipd-win](https://github.com/dorssel/usbipd-win/releases) installed on Windows

---

### Step 1 — Attach webcam to WSL (every time)

Open **PowerShell as Administrator**:

```powershell
# Find your camera's BUSID
usbipd list
# Look for "Integrated Camera" — note the BUSID (e.g. 1-6)

# Attach it to WSL
usbipd bind --busid 1-6 --force
usbipd attach --wsl --busid 1-6
```

Verify in WSL:
```bash
ls /dev/video*
# Should show /dev/video0
```

---

### Step 2 — Start Docker container

```bash
docker run -it \
  --name smartspectra \
  --privileged \
  --device=/dev/video0 \
  -e DISPLAY=$DISPLAY \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  -v ~/smartspectra_project:/workspace \
  ubuntu:22.04 bash
```

---

### Step 3 — Install dependencies (first time only, inside container)

```bash
apt update && apt install -y build-essential git lsb-release \
  libcurl4-openssl-dev libssl-dev pkg-config libv4l-dev \
  libgles2-mesa-dev libunwind-dev wget gnupg \
  software-properties-common curl sudo && \
  wget -O - https://apt.kitware.com/keys/kitware-archive-latest.asc 2>/dev/null | gpg --dearmor - | tee /etc/apt/trusted.gpg.d/kitware.gpg >/dev/null && \
  echo "deb https://apt.kitware.com/ubuntu/ $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/kitware.list >/dev/null && \
  apt update && apt install -y cmake ninja-build && \
  curl -s "https://presage-security.github.io/PPA/KEY.gpg" | gpg --dearmor | tee /etc/apt/trusted.gpg.d/presage-technologies.gpg >/dev/null && \
  curl -s --compressed -o /etc/apt/sources.list.d/presage-technologies.list \
  "https://presage-security.github.io/PPA/presage-technologies.list" && \
  apt update && apt install -y libsmartspectra-dev libopencv-dev libgoogle-glog-dev
```

---

### Step 4 — Build (first time only, inside container)

```bash
cd /workspace/SmartSpectra/cpp
mkdir -p build && cd build
cmake ..
cmake --build . --target rest_continuous_sample
```

---

### Step 5 — Run Presage

```bash
cd /workspace/SmartSpectra/cpp/build
./samples/rest_continuous_example/rest_continuous_example \
  --also_log_to_stderr \
  --camera_device_index=0 \
  --auto_lock=false \
  --api_key=YOUR_API_KEY \
  --enable_edge_metrics=true \
  --enable_dense_facemesh_points=true \
  --verbosity=2
```

Get your API key at: https://physiology.presagetech.com/auth/register

---

### Step 6 — Free camera when done

When you want to use the website camera after running Presage:

```powershell
# PowerShell as Administrator
usbipd detach --busid 1-6
```

```bash
# WSL
docker stop smartspectra
```

---

### Returning to the container later

```bash
# PowerShell — reattach camera
usbipd attach --wsl --busid 1-6

# WSL — restart container
docker start smartspectra
docker exec -it smartspectra bash
cd /workspace/SmartSpectra/cpp/build
./samples/rest_continuous_example/rest_continuous_example --api_key=YOUR_API_KEY ...
```

---

## Troubleshooting

**Camera not found in browser**
- Make sure Docker is stopped: `docker stop smartspectra`
- Detach from usbipd: `usbipd detach --busid 1-6`
- Check Windows Camera app works first

**`/dev/video0` not found in WSL**
- Re-run: `usbipd attach --wsl --busid 1-6` in PowerShell as Admin

**GTK display error in Docker**
- Make sure you passed `-e DISPLAY=$DISPLAY -v /tmp/.X11-unix:/tmp/.X11-unix` in the docker run command

**Camera works in Docker but not browser**
- Only one app can use the camera at a time — stop Docker first