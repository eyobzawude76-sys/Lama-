"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG} from "qrcode.react";
export default function AgentDashboard() {
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameStatus, setGameStatus] = useState("Open");
  const [selectedDogs, setSelectedDogs] = useState<number[]>([]);
  const [betType, setBetType] = useState("WIN");
  const [stake, setStake] = useState(100);
  const [message, setMessage] = useState("");
  const [payoutTicketId, setPayoutTicketId] = useState("");
  
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [reports, setReports] = useState({ totalSales: 0, totalPayout: 0, netCash: 0 });
  const [lastTicket, setLastTicket] = useState<any>(null);

  // Kassa amma seene localStorage irraa fiduu
  const [agentInfo, setAgentInfo] = useState({ id: "", username: "", branch: "Nekemte Branch" });

  // 📊 GABAASA KASSA KANAA DATABASE IRRAA FIDUU
  const fetchAgentData = async (storedId: string) => {
    if (!storedId || storedId === "anonymous") return;
    try {
      const res = await fetch(`https://kena-dbqw.onrender.com/api/reports/agent/${storedId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.recent_tickets) setRecentTickets(data.recent_tickets);
        else if (data.recentTickets) setRecentTickets(data.recentTickets);
        
        if (data.reports) setReports(data.reports);
      }
    } catch (error) {
      console.error("Ragaa fiduun hin danda'amne:", error);
    }
  };

  useEffect(() => {
    const storedId = localStorage.getItem("agentId") || "anonymous";
    const storedName = localStorage.getItem("username") || "Kassa";
    setAgentInfo({ id: storedId, username: storedName, branch: "Nekemte Branch" });
    
    if (storedId !== "anonymous") {
      fetchAgentData(storedId);
    }

    // 🔄 WEBSOCKET ENGINE FAANA WAL-QUNNAMSUU
    const socket = new WebSocket("ws://localhost:8000/ws/live");
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.time_left !== undefined) setTimeLeft(data.time_left);
      if (data.status !== undefined) setGameStatus(data.status);
      
      // Yoo dorgommiin haaraan eegale gabaasa kassa sanas refresh gochuuf
      if (data.status === "Open" && data.time_left === 120) {
         fetchAgentData(storedId);
      }
    };
    
    return () => socket.close();
  }, []);

  const handleDogSelect = (num: number) => {
    if (selectedDogs.includes(num)) {
      setSelectedDogs(selectedDogs.filter((id) => id !== num));
    } else {
      if (betType === "WIN" && selectedDogs.length >= 1) return;
      if ((betType === "QUINELLA" || betType === "EXACTA") && selectedDogs.length >= 2) return;
      if (betType === "TRIFECTA" && selectedDogs.length >= 3) return;
      setSelectedDogs([...selectedDogs, num]);
    }
  };

  // 🎟️ TIKKEETTII KUTUU FI DATABASE'TTI ERGUU
  const handleSellTicket = async () => {
    if (gameStatus === "Closed" || gameStatus === "Running") {
      setMessage("❌ Dog is Runnig.");
      return;
    }
    if (selectedDogs.length === 0) {
      setMessage("❌ first select dog!");
      return;
    }

    const ticketPayload = {
      agentId: agentInfo.id,
      betType: betType,
      dogs: selectedDogs,
      stake: stake
    };

    try {
      const res = await fetch("https://kena-dbqw.onrender.com/api/tickets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketPayload)
      });

      if (!res.ok) throw new Error();

      const savedTicket = await res.json();

      setMessage("✅ The ticket has been successfully cut");
      setSelectedDogs([]);
      
      fetchAgentData(agentInfo.id);

      setLastTicket({
        id: savedTicket.id,
        betType: savedTicket.betType,
        dogs: savedTicket.dogs.join(" ➔ "),
        stake: savedTicket.stake,
        payout: savedTicket.potentialPayout,
        date: new Date().toLocaleString()
      });

      setTimeout(() => { window.print(); }, 300);

    } catch (error) {
      setMessage("❌ control your Server .");
    }
  };

  // 💰 KAFFALTII RAAWWACHUU (PAYOUT)
  const handlePayout = async () => {
    if (!payoutTicketId) return;
    try {
      const res = await fetch(`https://kena-dbqw.onrender.com/api/tickets/payout/${payoutTicketId}`, {
        method: "PUT"
      });

      if (res.ok) {
        setMessage(`💰 The payment was completed ${payoutTicketId} successfully.`);
        setPayoutTicketId("");
        fetchAgentData(agentInfo.id);
      } else {
        const err = await res.json();
        setMessage(`❌ ${err.detail}`);
      }
    } catch (error) {
      setMessage("❌ Payout not found.");
    }
  };

  // ❌ TIKKEETTII CANCEL (HAQUU) GOCHUU
  const handleCancelTicket = async (ticketId: string) => {
    if (gameStatus === "Closed" || gameStatus === "Running") {
      setMessage("⚠️ Dog is run now");
      return;
    }

    if (!confirm("Are sure cancelled ticket")) return;

    try {
      const res = await fetch(`https://kena-dbqw.onrender.com/api/tickets/cancel/${ticketId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ticket is cancelled.");
        fetchAgentData(agentInfo.id);
      } else {
        // Backend kee yoo seera sekendii 15 qabaate, ergaa backend irraa dhufu qofa asitti mullisa
        setMessage(`${data.detail || "❌ not cancelled ticket"}`);
      }
    } catch (error) {
      setMessage("❌ Server is not connet.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 text-gray-800 font-sans">
      <div className="print:hidden max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-4 rounded-xl flex justify-between items-center shadow-md">
          <div>
            <h1 className="text-xl font-black tracking-wider">👨‍💼 AGENT DASHBOARD</h1>
            <p className="text-xs text-blue-200">{agentInfo.branch} | Agent: {agentInfo.username}</p>
          </div>
          <div className="bg-black/30 px-5 py-1.5 rounded-lg text-center border border-white/10">
            <span className="text-[10px] block text-gray-400 font-bold uppercase tracking-widest">COUNTDOWN</span>
            <span className={`text-2xl font-black ${timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-yellow-400"}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* 📊 LIVE DAILY REPORTS PANEL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <span className="text-xs font-bold text-gray-400 block mb-1">💰 TOTAL SALES </span>
            <span className="text-2xl font-black text-blue-600">{reports.totalSales.toLocaleString()} ETB</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <span className="text-xs font-bold text-gray-400 block mb-1">💸 TOTAL PAYOUT </span>
            <span className="text-2xl font-black text-red-600">{reports.totalPayout.toLocaleString()} ETB</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <span className="text-xs font-bold text-gray-400 block mb-1">📊 NET CASH-IN-HAND</span>
            <span className="text-2xl font-black text-green-600">{reports.netCash.toLocaleString()} ETB</span>
          </div>
        </div>

        {/* MAIN BODY AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* GOSA BET */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h2 className="font-bold text-sm mb-3 text-gray-500 uppercase tracking-wider">Type Bet</h2>
                <div className="grid grid-cols-2 gap-2">
                  {["WIN", "QUINELLA", "EXACTA", "TRIFECTA"].map((type) => (
                    <button
                      key={type}
                      onClick={() => { setBetType(type); setSelectedDogs([]); }}
                      className={`p-3 rounded-lg font-bold text-xs transition-all ${betType === type ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* FILANNOO SARROOTAA */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h2 className="font-bold text-sm mb-3 text-gray-500 uppercase tracking-wider">chose dog</h2>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleDogSelect(num)}
                      className={`p-3 rounded-lg font-black text-base border transition-all ${selectedDogs.includes(num) ? "bg-yellow-500 text-white" : "bg-gray-5 text-gray-700 hover:bg-gray-100"}`}
                    >
                      🐕 {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 🎟️ RECENT TICKETS TABLE */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <h2 className="font-bold text-sm mb-3 text-gray-500 uppercase tracking-wider">📜 The recent ticket has been cut</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 uppercase font-bold border-b">
                      <th className="p-2">Ticket ID</th>
                      <th className="p-2">Type Bet</th>
                      <th className="p-2">Dog</th>
                      <th className="p-2">Stake</th>
                      <th className="p-2">Status</th>
                      <th className="p-2 text-center"> Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTickets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-gray-400 italic">The sold ticket was is not avilable</td>
                      </tr>
                    ) : (
                      recentTickets.map((ticket, i) => (
                        <tr key={ticket.id || i} className="border-b hover:bg-gray-50 font-medium">
                          <td className="p-2 font-bold text-blue-900">{ticket.id}</td>
                          <td className="p-2"><span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-bold">{ticket.betType}</span></td>
                          <td className="p-2 font-mono text-gray-600">{Array.isArray(ticket.dogs) ? ticket.dogs.join(" ➔ ") : ticket.dogs}</td>
                          <td className="p-2 font-bold">{ticket.stake} ETB</td>
                          <td className="p-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              ticket.status === "Won" ? "bg-green-100 text-green-700" :
                              ticket.status === "Paid" ? "bg-blue-100 text-blue-700" : 
                              ticket.status === "Canceled" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td className="p-1 text-center">
                            {/* 🔥 FIX: Sa'aatii frontend dhiifnee yoo Pending ta'e qofa button 'Haqi' ni mullata, cuqaasuu ni dandeessa */}
                            {ticket.status === "Pending" && gameStatus === "Open" ? (
                              <button 
                                onClick={() => handleCancelTicket(ticket.id)}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] px-2 py-1 rounded transition-all uppercase shadow-sm"
                              >
                                ❌ cancelled
                              </button>
                            ) : (
                              <span className="text-gray-400 text-[10px]">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ACTION SIDEBAR */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <h2 className="font-bold text-sm mb-3 text-gray-500 uppercase tracking-wider">3 Ticket</h2>
              <div className="mb-3">
                <label className="text-xs font-bold text-gray-400 block mb-1">Stake Amount (ETB):</label>
                <input type="number" value={stake} onChange={(e) => setStake(Number(e.target.value))} className="w-full p-2 border rounded font-black text-gray-700" />
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1 mb-4 border border-dashed">
                <div className="flex justify-between"><span>Gosa Bet:</span> <strong>{betType}</strong></div>
                <div className="flex justify-between"><span>Dog:</span> <strong className="text-blue-600">{selectedDogs.join(" ➔ ") || "Hale"}</strong></div>
              </div>
              {message && <div className=" bg-blue-600 text-4xl font-bold p-2 mb-2 rounded  text-amber-800 text-center ">{message}</div>}
              <button onClick={handleSellTicket} className="w-full p-3 bg-green-600 text-white font-bold rounded-xl text-sm hover:bg-green-700 shadow-sm">
                🖨️ PRINT ticket
              </button>
            </div>

<div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
  <h2 className="font-bold text-sm mb-3 text-gray-500 uppercase tracking-wider">💰 payment</h2>
  <div className="space-y-2">
    <input 
      type="text" 
      placeholder="Ticket ID Fkn: TK-1234" 
      value={payoutTicketId} 
      onChange={(e) => setPayoutTicketId(e.target.value.toUpperCase())} 
      // 🔥 FIX: Scanner-riin gaafa scan godhu ofumaan "Enter" waan cuqaasuuf yeroma sana kaffaltii fida
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handlePayout();
        }
      }}
      className="w-full p-2 border rounded font-mono text-center tracking-widest uppercase focus:ring-2 focus:ring-blue-500 outline-none" 
    />
    <button onClick={handlePayout} className="w-full p-2 bg-blue-600 text-white font-bold rounded-lg text-xs hover:bg-blue-700">
      💵 SCAN ticket
    </button>
  </div>
</div>
           
          </div>
        </div>
      </div>

     {/* 🖨️ THERMAL PRINTER LAYOUT KAN SIRREEFFAME */}
{/* 🖨️ THERMAL PRINTER LAYOUT */}
{lastTicket && (
  <div className="hidden print:block w-[72mm] mx-auto text-black p-4 font-mono text-xs border border-black">
    <div className="text-center font-bold text-sm border-b border-dashed pb-2 mb-2">🐕 GREYHOUND RACING 🐕<br />NEKEMTE BRANCH</div>
    <div className="space-y-1 border-b border-dashed pb-2 mb-2">
      <div>TICKET ID: {lastTicket.id}</div>
      <div>DATE: {lastTicket.date}</div>
      <div>AGENT: {agentInfo.username}</div>
    </div>
    <div className="space-y-1 border-b border-dashed pb-2 mb-2">
      <div className="flex justify-between"><span>BET TYPE:</span> <strong>{lastTicket.betType}</strong></div>
      <div className="flex justify-between"><span>DOGS:</span> <strong>{lastTicket.dogs}</strong></div>
      <div className="flex justify-between"><span>STAKE:</span> <strong>{lastTicket.stake} ETB</strong></div>
      <div className="flex justify-between font-bold text-sm"><span>MAX PAYOUT:</span> <span>{lastTicket.payout} ETB</span></div>
    </div>
    
    {/* 🔥 FIX: QR CODE INTERNET MALEE OFfLINE AKKA HOJJETU GOCHUUF */}
    <div className="flex flex-col items-center justify-center my-3 pb-2 border-b border-dashed">
      <QRCodeSVG value={lastTicket.id} size={120} />
      <span className="text-[9px] mt-1 text-gray-500">SCAN TO PAYOUT</span>
    </div>

    <div className="text-center pt-1 text-[10px]">*****</div>
  </div>
)}

      
    </div>
  );
}