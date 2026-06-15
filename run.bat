@echo off
echo ===================================================
echo     Menyiapkan Deepfake Detector...
echo ===================================================
echo.

echo [1/4] Mengecek dan menginstal dependensi Backend...
cd backend
pip install -r requirements.txt
cd ..
echo.

echo [2/4] Mengecek dan menginstal dependensi Frontend...
cd frontend
:: Catatan: Di Windows, kita harus pakai 'call' untuk menjalankan npm 
:: agar script .bat tidak berhenti di tengah jalan.
call npm install
cd ..
echo.

echo [3/4] Menjalankan Backend (FastAPI)...
start cmd /k "cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo [4/4] Menjalankan Frontend (Vite)...
start cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo Semua server sedang berjalan di jendela terpisah!
echo Kamu bisa menutup jendela hitam ini.
echo ===================================================
pause