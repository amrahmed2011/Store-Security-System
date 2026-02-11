
import React, { useEffect, useState } from 'react';
import { db, ref, onValue, off } from './firebase';
import { 
  Wifi, 
  WifiOff,
  Activity,
  Cpu,
  RefreshCw
} from 'lucide-react';

const App: React.FC = () => {
  const [rawData, setRawData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    // Listen to the root of the database
    const dbRef = ref(db, '/');
    
    setLoading(true);
    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        const val = snapshot.val();
        
        // Helper to find the actual value inside potential objects
        const extractValue = (data: any): any => {
          if (data === null || typeof data !== 'object') return data;
          
          // If it's an object, try to find known keys or the first child
          const target = data.pirStatus ?? data.status ?? data.value ?? Object.values(data)[0];
          
          if (target !== null && typeof target === 'object') {
            return extractValue(target);
          }
          return target;
        };

        const finalValue = extractValue(val);
        setRawData(finalValue);
        setConnected(true);
        setLoading(false);
        setLastUpdate(new Date().toLocaleTimeString());
      },
      (err) => {
        console.error("Firebase Error:", err);
        setConnected(false);
        setLoading(false);
      }
    );

    const connectedRef = ref(db, '.info/connected');
    const connUnsubscribe = onValue(connectedRef, (snap) => {
      setConnected(snap.val() === true);
    });

    return () => {
      off(dbRef);
      connUnsubscribe();
    };
  }, []);

  const checkMotion = (data: any) => {
    if (data === null || data === undefined) return false;
    const strVal = String(data).toUpperCase();
    return strVal === 'HIGH' || strVal === '1' || data === 1 || data === true;
  };

  const isMotion = checkMotion(rawData);

  const renderValue = (data: any) => {
    if (data === null || data === undefined) return 'N/A';
    if (typeof data === 'object') return JSON.stringify(data);
    return String(data).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-4 overflow-hidden font-sans">
      
      {/* Real-time Status Header */}
      <div className="fixed top-10 flex items-center gap-6 px-5 py-2.5 bg-slate-900/40 border border-slate-800 rounded-full backdrop-blur-xl shadow-2xl z-50">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>
        <div className="h-4 w-px bg-slate-800" />
        <div className="flex items-center gap-2 text-slate-500">
          <RefreshCw size={12} className={connected ? "animate-spin-slow" : ""} />
          <span className="text-[10px] font-mono">{lastUpdate || '--:--:--'}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <Cpu className="absolute inset-0 m-auto text-blue-500 opacity-50" size={16} />
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col items-center w-full max-w-2xl">
          {/* Background Glow */}
          <div className={`absolute -inset-40 blur-[120px] rounded-full transition-colors duration-1000 ${isMotion ? 'bg-rose-500/20' : 'bg-emerald-500/10'}`} />
          
          <div className="relative z-10 flex flex-col items-center text-center w-full">
            {/* Displaying only the value as requested */}
            <div className={`bg-slate-900/60 p-16 md:p-24 rounded-[4rem] border-2 backdrop-blur-md shadow-2xl transition-all duration-700 ${
              isMotion ? 'border-rose-500/30' : 'border-emerald-500/20'
            }`}>
              <h2 className={`text-8xl md:text-[12rem] font-black tracking-tighter transition-all duration-500 ${
                isMotion ? 'text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              }`}>
                {renderValue(rawData)}
              </h2>
            </div>

            {/* Subtle Activity indicator */}
            <div className="mt-12 flex items-center gap-3 opacity-40">
              <Activity size={20} className={isMotion ? "text-rose-500 animate-pulse" : "text-emerald-500"} />
            </div>
          </div>
        </div>
      )}

      {/* Footer System Info */}
      <div className="fixed bottom-10 flex flex-col items-center gap-2">
        <p className="text-[9px] font-mono text-slate-600 tracking-widest uppercase opacity-40">
          {new URL(db.app.options.databaseURL || '').hostname}
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}} />
    </div>
  );
};

export default App;
