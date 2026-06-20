"use client";

import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [agents, setAgents] = useState<any[]>([]);
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentBranch, setNewAgentBranch] = useState("");
  const [newAgentPassword, setNewAgentPassword] = useState("");
  const [message, setMessage] = useState("");

  // 📊 SYSTEM OVERVIEW STATES
  const [systemStats, setSystemStats] = useState({
    totalSystemSales: 0,
    totalSystemPayout: 0,
    totalNetProfit: 0
  });

  // 🔄 1. DATABASE IRRAA KASSAWWAN FI STATS FIDUU
  const fetchDashboardData = async () => {
    try {
      // Kassaawwan fiduu
      const resAgents = await fetch("https://kena-dbqw.onrender.com/api/auth/agents");
      if (resAgents.ok) {
        const data = await resAgents.json();
        setAgents(data);
      }

      // Gabaasa waliigalaa fiduu
      const resStats = await fetch("https://kena-dbqw.onrender.com/api/reports/system-overview");
      if (resStats.ok) {
        const dataStats = await resStats.json();
        setSystemStats(dataStats);
      }
    } catch (error) {
      console.error("Ragaa fiduun hin danda'amne:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ➕ 2. KASSA (AGENT) HAARAA MONGO-DB KEESSATTI UUMUU
  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName || !newAgentBranch || !newAgentPassword) {
      setMessage("❌ Mee ragaa hunda guuti!");
      return;
    }

    try {
      const res = await fetch("https://kena-dbqw.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newAgentName,
          password: newAgentPassword,
          branch: newAgentBranch,
          status: "Active"
        }),
      });

      if (res.ok) {
        setMessage("✅ Agent-iinii haaraan milkiidhaan uumameera!");
        setNewAgentName("");
        setNewAgentBranch("");
        setNewAgentPassword("");
        // Ragaa fuula irratti daddafanii haaromsuu
        fetchDashboardData();
      } else {
        const err = await res.json();
        setMessage(`❌ Dadhabame: ${err.detail}`);
      }
    } catch (error) {
      setMessage("❌ Server qunnamuun hin danda'amne!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-red-800 to-amber-900 p-6 rounded-2xl flex justify-between items-center shadow-lg border border-red-700/30">
          <div>
            <h1 className="text-2xl font-black tracking-wider text-yellow-400">👑 ADMIN CONTROL PANEL</h1>
            <p className="text-xs text-red-200">Greyhound Betting | To'annoo Hojii Waliigalaa</p>
          </div>
          <div className="bg-black/40 px-4 py-2 rounded-xl text-center border border-white/5">
            <span className="text-[10px] block text-gray-400 font-bold uppercase">System Mode</span>
            <span className="text-sm font-black text-green-400">🟢 LIVE DB CONNECTED</span>
          </div>
        </div>

        {/* 📊 SYSTEM OVERVIEW CARDS (Dhugaa) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700">
            <span className="text-xs font-bold text-gray-400 uppercase block mb-1">📈 SYSTEM TOTAL SALES</span>
            <span className="text-3xl font-black text-blue-400">{systemStats.totalSystemSales.toLocaleString()} ETB</span>
          </div>
          <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700">
            <span className="text-xs font-bold text-gray-400 uppercase block mb-1">📉 SYSTEM TOTAL PAYOUT</span>
            <span className="text-3xl font-black text-red-400">{systemStats.totalSystemPayout.toLocaleString()} ETB</span>
          </div>
          <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700">
            <span className="text-xs font-bold text-gray-400 uppercase block mb-1">💰 SYSTEM NET PROFIT</span>
            <span className="text-3xl font-black text-green-400">{systemStats.totalNetProfit.toLocaleString()} ETB</span>
          </div>
        </div>

        {/* MAIN BODY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* UNKA AGENT HAARAA UUMUU */}
          <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700 h-fit">
            <h2 className="text-base font-black text-yellow-400 mb-4 uppercase tracking-wider">➕ Agent (Kassa) Haaraa Uumi</h2>
            
            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Username Kassa:</label>
                <input 
                  type="text" 
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="Fkn: chala_kassa"
                  className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Maqaa Damee (Branch):</label>
                <input 
                  type="text" 
                  value={newAgentBranch}
                  onChange={(e) => setNewAgentBranch(e.target.value)}
                  placeholder="Fkn: Nekemte Branch"
                  className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Password Kassa:</label>
                <input 
                  type="password" 
                  value={newAgentPassword}
                  onChange={(e) => setNewAgentPassword(e.target.value)}
                  placeholder="🔏 Password galchi"
                  className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-yellow-400"
                />
              </div>

              {message && <div className="text-xs font-bold p-2.5 rounded-xl bg-gray-900 border border-gray-700 text-center text-amber-400">{message}</div>}

              <button 
                type="submit"
                className="w-full p-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-black text-sm rounded-xl hover:from-yellow-400 hover:to-amber-500 transition-all shadow-md"
              >
                💾 AGENT GALMEESSI
              </button>
            </form>
          </div>

          {/* TARREE KASSAWWAN MONGO-DB IRRAA DHUFAN */}
          <div className="lg:col-span-2 bg-gray-800 p-5 rounded-2xl border border-gray-700">
            <h2 className="text-base font-black text-yellow-400 mb-4 uppercase tracking-wider">👥 Tarree Kassotaa (Database Irraa)</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-900 text-gray-400 uppercase font-bold border-b border-gray-700">
                    <th className="p-3">Username</th>
                    <th className="p-3">Damee (Branch)</th>
                    <th className="p-3">Haala Isaa</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent, i) => (
                    <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-all font-medium">
                      <td className="p-3 font-bold text-white">{agent.username}</td>
                      <td className="p-3 text-gray-300">{agent.branch}</td>
                      <td className="p-3">
                        <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                          {agent.status || "Active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}