"use client";

import { useState, useEffect } from "react";

export default function AgentDashboard() {
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameStatus, setGameStatus] = useState("Open");
  const [selectedDogs, setSelectedDogs] = useState<number[]>([]);
  const [betType, setBetType] = useState("WIN");
  const [stake, setStake] = useState(100);
  const [message, setMessage] = useState("");
  
  // Ragaa Tikkeettii Dhuma Kutamee (Print Gochuuf)
  const [lastTicket, setLastTicket] = useState<any>(null);

  // Fake Agent Session (Diagram kee irratti akka dhowwamuuf)
  const currentAgent = {
    id: "65d1a2b3c4e5f6a7b8c9d002",
    name: "Chala Abebe",
    branch: "Nekemte Branch"
  };

  // ==================== WEBSOCKET LIVE TIMER ====================
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws/live");
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.time_left !== undefined) setTimeLeft(data.time_left);
      if (data.status !== undefined) setGameStatus(data.status);
    };
    return () => socket.close();
  }, []);

  // ==================== TRIFECTA FI GOSA BET BADDANNEESSUU ====================
  const handleDogSelect = (dogId: number) => {
    if (selectedDogs.includes(dogId)) {
      setSelectedDogs(selectedDogs.filter((id) => id !== dogId));
    } else {
      if (betType === "WIN" && selectedDogs.length >= 1) return;
      if ((betType === "QUINELLA" || betType === "EXACTA") && selectedDogs.length >= 2) return;
      if (betType === "TRIFECTA" && selectedDogs.length >= 3) return; // Sarree 3 qofa!
      setSelectedDogs([...selectedDogs, dogId]);
    }
  };

  const isButtonDisabled = () => {
    if (betType === "WIN" && selectedDogs.length !== 1) return true;
    if ((betType === "QUINELLA" || betType === "EXACTA") && selectedDogs.length !== 2) return true;
    if (betType === "TRIFECTA" && selectedDogs.length !== 3) return true;
    return false;
  };

  // ==================== TIKKEETTII KUTUU (SELL TICKET) ====================
  const handleSellTicket = async () => {
    if (timeLeft <= 10) {
      setMessage("❌ Sa'aatiin dhumateera! Tikkeettii kutuun hin danda'amu.");
      return;
    }

    const ticketData = {
      agent_id: currentAgent.id, 
      race_id: "65d1a2b3c4e5f6a7b8c9d001",
      bet_type: betType,
      selected_dogs: selectedDogs,
      stake_amount: stake,
      potential_payout: stake * 4.5,
      time_left: timeLeft
    };

    try {
      const res = await fetch("http://localhost:8000/api/agent/sell-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketData),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage("✅ Tikkeettiin seeraan kutameera!");
        
        // Ragaa printii qopheessi
        setLastTicket({
          id: data.ticket_id,
          betType: betType,
          dogs: selectedDogs.join(", "),
          stake: stake,
          payout: stake * 4.5,
          date: new Date().toLocaleString()
        });

        setSelectedDogs([]); // Qulqulleessi

        // Ofumaan maashinii printii kakaasi
        setTimeout(() => {
          window.print();
        }, 500);

      } else {
        setMessage(`❌ Error: ${data.detail}`);
      }
    } catch (err) {
      setMessage("❌ Server wajjin wal quunnamuun hin danda'amne.");
    }
  };

  // ==================== TIKKEETTII HAQUU (CANCEL TICKET) ====================
  const handleCancelTicket = async () => {
    if (!lastTicket) return;
    
    try {
      const res = await fetch(`http://localhost:8000/api/agent/cancel-ticket/${lastTicket.id}`, {
        method: "POST"
      });
      if (res.ok) {
        setMessage("🗑️ Tikkeettiin dhuma kutame sun milkiidhaan haqameera!");
        setLastTicket(null);
      } else {
        const data = await res.json();
        setMessage(`❌ Error: ${data.detail}`);
      }
    } catch (err) {
      setMessage("❌ Haquun hin danda'amne.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 print:bg-white print:p-0 text-gray-800">
      
      {/* 🖥️ SKIRIINII AGENT (Yeroo print ta'u ofumaan dhokata) */}
      <div className="print:hidden max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="bg-blue-900 text-white p-4 rounded-xl flex justify-between items-center shadow mb-6">
          <div>
            <h1 className="text-xl font-bold">👨‍💼 AGENT DASHBOARD</h1>
            <p className="text-xs text-blue-200">{currentAgent.branch} | Agent: {currentAgent.name}</p>
          </div>
          <div className="bg-black/20 px-4 py-2 rounded-lg text-center">
            <span className="text-xs block text-gray-300">TIMER</span>
            <span className={`text-2xl font-black ${timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-yellow-400"}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. GOSA BETINGII */}
          <div className="bg-white p-4 rounded-xl shadow border">
            <h2 className="font-bold text-lg mb-3 border-b pb-1">1. Gosa Bet Filadhu</h2>
            <div className="grid grid-cols-2 gap-2">
              {["WIN", "QUINELLA", "EXACTA", "TRIFECTA"].map((type) => (
                <button
                  key={type}
                  onClick={() => { setBetType(type); setSelectedDogs([]); setMessage(""); }}
                  className={`p-3 rounded-lg font-bold text-xs transition-all ${betType === type ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
                >
                  {type}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-blue-600 mt-3 bg-blue-50 p-2 rounded">
              ℹ️ Gosa {betType} irratti sarree {betType === "WIN" ? "1" : (betType === "TRIFECTA" ? "3" : "2")} filadhu.
            </p>
          </div>

          {/* 2. SARREE FILADHU */}
          <div className="bg-white p-4 rounded-xl shadow border">
            <h2 className="font-bold text-lg mb-3 border-b pb-1">2. Sarree Filadhu</h2>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => handleDogSelect(num)}
                  className={`p-4 rounded-lg font-black text-lg border transition-all ${selectedDogs.includes(num) ? "bg-yellow-500 text-white" : "bg-gray-50 hover:bg-gray-100"}`}
                >
                  🐕 {num}
                </button>
              ))}
            </div>
          </div>

          {/* 3. TIKKEETTII KUTUU & HAQUU */}
          <div className="bg-white p-4 rounded-xl shadow border flex flex-col justify-between">
            <div>
              <h2 className="font-bold text-lg mb-3 border-b pb-1">3. Tikkeettii Kutuu</h2>
              <div className="mb-3">
                <label className="text-xs font-bold block mb-1">Stake Amount (ETB):</label>
                <input 
                  type="number" 
                  value={stake} 
                  onChange={(e) => setStake(Number(e.target.value))} 
                  className="w-full p-2 border rounded font-bold text-base" 
                />
              </div>
              <div className="bg-gray-50 p-2 rounded text-xs space-y-1 mb-3">
                <div className="flex justify-between"><span>Gosa Bet:</span> <strong>{betType}</strong></div>
                <div className="flex justify-between"><span>Sarroota:</span> <strong>{selectedDogs.join(" ➔ ") || "Hale"}</strong></div>
              </div>
            </div>

            <div className="space-y-2">
              {message && <div className="text-xs font-bold p-2 rounded bg-amber-100 text-center">{message}</div>}
              
              <button 
                onClick={handleSellTicket} 
                disabled={isButtonDisabled()} 
                className={`w-full p-3 rounded-lg font-bold text-white transition-all ${isButtonDisabled() ? "bg-gray-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
              >
                🖨️ TIKKEETTII KUTA & PRINT
              </button>

              {lastTicket && (
                <button 
                  onClick={handleCancelTicket} 
                  className="w-full p-2 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition-all"
                >
                  🗑️ Tikkeettii Dhuma Kutame Haqi (Cancel)
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ==================== 🖨️ THERMAL PRINTER LAYOUT (Yeroo print dhiibamu qofa ba'a) ==================== */}
      {lastTicket && (
        <div className="hidden print:block w-[72mm] mx-auto text-black p-4 font-mono text-xs border border-black">
          <div className="text-center font-bold text-sm border-b border-dashed pb-2 mb-2">
            🐕 GREYHOUND RACING 🐕<br />
            NEKEMTE BRANCH
          </div>
          <div className="space-y-1 border-b border-dashed pb-2 mb-2">
            <div>TICKET ID: {lastTicket.id}</div>
            <div>DATE: {lastTicket.date}</div>
            <div>AGENT: {currentAgent.name}</div>
          </div>
          <div className="space-y-1 border-b border-dashed pb-2 mb-2">
            <div className="flex justify-between"><span>BET TYPE:</span> <strong>{lastTicket.betType}</strong></div>
            <div className="flex justify-between"><span>DOGS:</span> <strong>{lastTicket.dogs}</strong></div>
            <div className="flex justify-between"><span>STAKE:</span> <strong>{lastTicket.stake} ETB</strong></div>
            <div className="flex justify-between font-bold text-sm"><span>MAX PAYOUT:</span> <span>{lastTicket.payout} ETB</span></div>
          </div>
          <div className="text-center pt-2 text-[10px]">
            <p>***********************************</p>
            <p>Tikkeettii kee eeggannoon qabadhu!</p>
          </div>
        </div>
      )}

    </div>
  );
}