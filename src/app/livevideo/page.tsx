"use client";

import { useState, useEffect, useRef } from "react";

export default function LiveRaceDisplay() {
  const [timeLeft, setTimeLeft] = useState(300);
  const [gameStatus, setGameStatus] = useState("Open");
  const [dogsData, setDogsData] = useState<any[]>([]);
  const [results, setResults] = useState<number[]>([]);
  const [currentVideo, setCurrentVideo] = useState("");
  const [isMuted, setIsMuted] = useState(true); 
  const [detailedResults ,setDetaileResults]=useState<any>({})
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const socket = new WebSocket("wss://kena-dbqw.onrender.com/ws/live");
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.time_left !== undefined) setTimeLeft(data.time_left);
      if (data.status !== undefined) setGameStatus(data.status);
      if (data.dogs_data) setDogsData(data.dogs_data);
      if (data.results) setResults(data.results);
      if (data.current_video !== undefined) setCurrentVideo(data.current_video);
      if(data.detailed_results !== undefined) setDetaileResults(data.detailed_results)
    };

    return () => socket.close();
  }, []);

  useEffect(() => {
    if (videoRef.current && currentVideo) {
      videoRef.current.load();
      videoRef.current.play().catch(err => console.log(err));
    }
  }, [currentVideo]);

  // 🎯 SEERA ODDS ADDAAN BAASU (HIGHEST & LOWEST)
  // Odds hunda keessaa isa guddaa fi gadi aanaa addan baafna
  const oddsValues = dogsData.map(dog => Number(dog.odds || 0));
  const maxOdds = oddsValues.length > 0 ? Math.max(...oddsValues) : 0;
  const minOdds = oddsValues.length > 0 ? Math.min(...oddsValues) : 0;

  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col justify-between font-sans select-none overflow-hidden relative">
      
      {/* 1️⃣ PRE-RACE STATE (YEROO BETTING BIFAMU QOFA) */}
      {(gameStatus === "Open" || gameStatus === "Closed") && (
        <div className="w-full h-full p-6 flex flex-col justify-between">
          {/* HEADER */}
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center shadow-md">
            <div>
              <h1 className="text-xl font-black text-yellow-400 tracking-widest">🐕 LIVE GREYHOUND RACING</h1>
              <p className="text-xs text-zinc-400 font-bold">VIRTUAL SIMULATION SCREEN</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsMuted(!isMuted)} 
                className={`px-4 py-2 rounded-lg font-black text-xs ${isMuted ? "bg-red-600 animate-bounce" : "bg-green-600"}`}
              >
                {isMuted ? "🔊 OPEN" : "🔇 CLOSD"}
              </button>
              <div className="bg-black border border-zinc-700 px-6 py-2 rounded-xl text-center">
                <span className="text-[10px] block text-zinc-400 font-black">STATUS</span>
                <span className={`text-lg font-black ${gameStatus === "Open" ? "text-green-400" : "text-amber-500"}`}>{gameStatus}</span>
              </div>
            </div>
          </div>

          {/* TIMER & RUNNERS */}
          <div className="my-auto space-y-6">
            <div className="text-center bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 max-w-sm mx-auto">
              <span className="text-xs text-zinc-400 font-black block mb-1">RACE STARTS IN</span>
              <span className="text-6xl font-black text-yellow-400 font-mono">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </span>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 max-w-5xl mx-auto w-full">
              <h2 className="text-sm font-black text-zinc-400 uppercase mb-3 pl-2">🐕 Upcoming Runners </h2>
              <div className="grid grid-cols-2 gap-3">
                {dogsData.map((dog) => {
                  const currentOdds = Number(dog.odds || 0);
                  
                  // 🎨 Haala bifa odds ittiin addaan baasnu
                  let oddsColorClass = "text-white"; // Default: Ifaa Addii
                  let borderClass = "border-zinc-800";
                  
                  if (currentOdds === maxOdds && maxOdds !== minOdds) {
                    oddsColorClass = "text-red-500 font-black text-base animate-pulse"; // Guddaa: Diimaa
                    borderClass = "border-red-600/30 bg-red-950/5";
                  } else if (currentOdds === minOdds && maxOdds !== minOdds) {
                    oddsColorClass = "text-green-400 font-black text-base"; // Xinnaa: Magariisa
                    borderClass = "border-green-600/30 bg-green-950/5";
                  }

                  return (
                    <div key={dog.id} className={`p-3 rounded-xl flex items-center justify-between border transition-all duration-300 ${borderClass}`}>
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 rounded-lg bg-yellow-500 text-black font-black text-lg flex items-center justify-center shadow-inner">
                          {dog.id}
                        </span>
                        <div className="font-black text-sm uppercase text-zinc-100">{dog.name}</div>
                      </div>
                      <div className="bg-black/40 px-5 py-1 rounded-lg border border-zinc-800 text-center min-w-[70px]">
                        <span className="text-[9px] block text-zinc-500 font-black tracking-wider">ODDS</span>
                        <span className={`text-sm font-mono ${oddsColorClass}`}>
                          {dog.odds}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 text-center text-[10px] text-zinc-500">
            ⚡ Powered by Greyhound Betting Engine Live Node 🟢
          </div>
        </div>
      )}

      {/* 2️⃣ RUNNING STATE (SCREEN GUUTUU VIIDIYOO QOFA) */}
      {gameStatus === "Running" && (
        <div className="w-screen h-screen absolute inset-0 z-50 bg-black">
          {currentVideo && (
            <video 
              ref={videoRef}
              src={currentVideo} 
              autoPlay 
              muted={isMuted} 
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute top-6 right-6 bg-black/80 border-2 border-red-600 px-6 py-2 rounded-xl font-mono text-xl text-red-500 font-black animate-pulse">
            🏁 LIVE: {timeLeft}s
          </div>
        </div>
      )}
{/* 🏁 Next.js Irratti Bu'aa Gosa Bet Hunda Akka Feetetti Argisiisuu */}
{gameStatus === "Finished" && detailedResults && (
  <div className=" w-screen h-screen mt-4 p-5 rounded-lg bg-black text-white font-mono border-2 border-yellow-500 shadow-2xl max-w-md mx-auto">
    <h3 className="text-center text-yellow-400 text-lg font-bold uppercase mb-4 tracking-wider border-b border-gray-800 pb-2">
      RACE RESULTS 🏆
    </h3>
    
    <div className="space-y-3 text-base md:text-lg">
      <div className="flex justify-between items-center bg-gray-900 p-2 rounded">
        <span className="text-yellow-500 font-bold">WIN:</span>
        <span className="font-bold text-green-400">{detailedResults.WIN}</span>
      </div>
      
      <div className="flex justify-between items-center bg-gray-900 p-2 rounded">
        <span className="text-yellow-500 font-bold">EXACTA:</span>
        <span className="font-bold text-white">{detailedResults.EXACTA}</span>
      </div>
      
      <div className="flex justify-between items-center bg-gray-900 p-2 rounded">
        <span className="text-yellow-500 font-bold">QUINELLA:</span>
        <span className="font-bold text-white">
          {detailedResults.QUINELLA}
        </span>
      </div>
      
      <div className="flex justify-between items-center bg-gray-900 p-2 rounded">
        <span className="text-yellow-500 font-bold">TRIFECTA:</span>
        <span className="font-bold text-white">{detailedResults.TRIFECTA}</span>
      </div>
    </div>
  </div>
)}

    </div>
  );
}