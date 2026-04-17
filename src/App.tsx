import { Clock } from 'lucide-react';
import AttendanceSystem from './components/AttendanceSystem';
import { motion } from 'motion/react';

export default function App() {
  return (
    <div className="app-frame">
      <div className="status-bar">
        <span>9:41</span>
        <span>SIM 1 • 5G • 🔋 88%</span>
      </div>

      <header className="mb-6 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[18px] font-bold text-white tracking-wide"
        >
          Sistem Kehadiran Pintar
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[11px] text-white/70 uppercase tracking-widest mt-1"
        >
          Rekod Kehadiran Pekerja
        </motion.p>
      </header>

      <main className="flex-grow overflow-y-auto no-scrollbar py-2">
        <AttendanceSystem />
      </main>

      <footer className="mt-auto pt-4 border-t border-white/20 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-immersive-secondary to-immersive-primary shadow-lg" />
        <div className="flex flex-col">
          <span className="text-[13px] font-medium text-white leading-tight">Zubair Sofian</span>
          <span className="text-[10px] text-white/60 leading-tight">Software Developer</span>
        </div>
        <div className="ml-auto opacity-40">
          <Clock size={18} />
        </div>
      </footer>
    </div>
  );
}

