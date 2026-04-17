import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, QrCode, MapPin, CheckCircle, Loader2, AlertCircle, LogIn, LogOut, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { submitAttendance, AttendanceData } from '../services/api';

const AttendanceSystem: React.FC = () => {
  const [employeeId, setEmployeeId] = useState<string>('');
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [scanning, setScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const webcamRef = useRef<Webcam>(null);

  // Get location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("GPS Error:", error);
          setStatus({ type: 'error', message: 'Gagal mendapatkan lokasi GPS. Sila benarkan akses lokasi.' });
        }
      );
    }
  }, []);

  // QR Scanner logic
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    
    if (scanning) {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      
      scanner.render((decodedText) => {
        setEmployeeId(decodedText);
        setScanning(false);
        if (scanner) scanner.clear();
      }, (error) => {
        // Ignored errors during scan
      });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error("Scanner clean error:", err));
      }
    };
  }, [scanning]);

  const capturePhoto = React.useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPhoto(imageSrc);
      setIsCameraActive(false);
    }
  }, [webcamRef]);

  const handleSubmit = async (action: 'MASUK' | 'KELUAR') => {
    if (!employeeId) {
      setStatus({ type: 'error', message: 'Sila masukkan atau imbas ID Pekerja.' });
      return;
    }
    if (!photo) {
      setStatus({ type: 'error', message: 'Sila ambil gambar swafoto sebagai bukti.' });
      return;
    }
    if (!location) {
      setStatus({ type: 'error', message: 'Menunggu koordinat GPS...' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const data: AttendanceData = {
        action: action === 'MASUK' ? 'clockIn' : 'clockOut',
        id: employeeId,
        type: action,
        location: {
          lat: location.lat,
          lng: location.lng
        },
        photoBase64: photo
      };

      await submitAttendance(data);
      
      setStatus({ type: 'success', message: `Kehadiran ${action} Berjaya Disimpan!` });
      // Reset form
      setEmployeeId('');
      setPhoto(null);
    } catch (error) {
      setStatus({ type: 'error', message: 'Gagal menghantar data. Sila cuba lagi.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Search/Input Section - Integrated or subtle */}
      {!scanning && !isCameraActive && !photo && (
        <div className="flex gap-2">
          <input
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="ID Pekerja..."
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/50"
          />
          <button
            onClick={() => setScanning(true)}
            className="p-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
          >
            <QrCode size={20} />
          </button>
        </div>
      )}

      {/* Main Container for Camera / Scanner / Photo */}
      <section className="camera-container-immersive min-h-[300px]">
        {scanning ? (
          <div className="w-full h-full relative">
            <div id="qr-reader" className="w-full h-full"></div>
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="viewfinder-box">
                <div className="scan-line" />
              </div>
            </div>
            <button 
              onClick={() => setScanning(false)}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500/80 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm"
            >
              Batal
            </button>
          </div>
        ) : isCameraActive ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              className="w-full h-full object-cover"
              mirrored={false}
              imageSmoothing={true}
              forceScreenshotSourceSize={false}
              disablePictureInPicture={true}
              onUserMedia={() => {}}
              onUserMediaError={() => {}}
              screenshotQuality={0.92}
            />
            {/* Viewfinder overlay for selfie too for consistency */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="viewfinder-box opacity-50 border-white/30" />
            </div>
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <button
                onClick={capturePhoto}
                className="bg-white text-emerald-600 p-4 rounded-full shadow-lg active:scale-90 transition-all"
              >
                <Camera size={24} />
              </button>
              <button
                onClick={() => setIsCameraActive(false)}
                className="bg-red-500 text-white p-4 rounded-full shadow-lg active:scale-90 transition-all"
              >
                <RefreshCw size={24} className="rotate-45" />
              </button>
            </div>
          </div>
        ) : photo ? (
          <div className="relative w-full h-full group">
            <img src={photo} alt="Selfie" className="w-full h-full object-cover" />
            <button
              onClick={() => { setPhoto(null); setIsCameraActive(true); }}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-medium text-xs"
            >
              Ambil Semula
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsCameraActive(true)}
            className="flex flex-col items-center gap-3 text-white/50"
          >
            <Camera size={48} />
            <span className="text-[10px] uppercase font-bold tracking-widest">Sila ambil selfie</span>
          </button>
        )}
      </section>

      {/* Location Card */}
      <div className="location-card-immersive">
        <div className={`location-dot ${location ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-red-500 shadow-[0_0_8px_#ef4444]"}`} />
        <div className="flex flex-col">
          <span className="font-bold text-white/90">Lokasi Semasa</span>
          <span className="text-white/60 truncate max-w-[240px]">
            {location ? `${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E` : "Mencari lokasi..."}
          </span>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`flex items-center gap-2 justify-center py-2 px-4 rounded-full text-[11px] font-bold uppercase tracking-wider mx-auto ${status.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}
          >
            {status.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            {status.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 pb-4">
        <button
          onClick={() => handleSubmit('MASUK')}
          disabled={loading}
          className="btn-immersive-masuk group"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <LogIn size={18} />
              MASUK
            </div>
          )}
        </button>
        <button
          onClick={() => handleSubmit('KELUAR')}
          disabled={loading}
          className="btn-immersive-keluar group"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <LogOut size={18} />
              KELUAR
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default AttendanceSystem;
