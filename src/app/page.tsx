"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setError("");
    try {
      const res = await fetch("https://kena-dbqw.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, branch: "N/A" }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Ragaa seensaa gadi gochuuf harka keenyatti qabanna
        localStorage.setItem("role", data.role);
        localStorage.setItem("agentId", data.agentId);
        localStorage.setItem("username", username);

        if (data.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/agentreport");
        }
      } else {
        const errData = await res.json();
        setError(errData.detail || "Maqaa ykn Password dogoggoraa!");
      }
    } catch (err) {
      setError("❌ Backend server qunnamuu hin dandeenye!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700 w-80">
        <h2 className="text-xl font-black text-yellow-400 mb-6 text-center tracking-wider">🐕 GREYHOUND LOGIN</h2>
        
        {error && <div className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded mb-4 text-center">{error}</div>}

        <input 
          type="text" 
          placeholder="Username" 
          onChange={(e) => setUsername(e.target.value)} 
          className="w-full border border-gray-700 p-2.5 bg-gray-900 rounded-xl mb-3 text-sm focus:outline-none focus:border-yellow-400 font-bold" 
        />
        <input 
          type="password" 
          placeholder="Password" 
          onChange={(e) => setPassword(e.target.value)} 
          className="w-full border border-gray-700 p-2.5 bg-gray-900 rounded-xl mb-6 text-sm focus:outline-none focus:border-yellow-400 font-bold" 
        />
        <button 
          onClick={handleLogin} 
          className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-black p-3 rounded-xl hover:from-yellow-400 hover:to-amber-500 transition-all shadow-md text-sm"
        >
          LOG IN
        </button>
      </div>
    </div>
  );
}
