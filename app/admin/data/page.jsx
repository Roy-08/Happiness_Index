"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FaHome, FaRegFileAlt, FaDatabase } from "react-icons/fa";

export default function DataPage() {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false); // 🔵 loading state

  useEffect(() => {
    fetch("/api/admin/data")
      .then((res) => res.json())
      .then((data) => setRows(data))
      .catch((err) => console.error(err));
  }, []);

  if (!rows) return <p className="text-white p-10">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-[#0a1124] text-white">
      {/* Sidebar */}
      <div className="w-80 px-8 py-12 bg-[#0b1326] border-r border-white/10 flex flex-col">
        <div className="flex justify-center mb-16">
          <div className="w-32 h-32 rounded-full bg-white flex justify-center items-center overflow-hidden shadow-lg shadow-white/20">
            <Image src="/log.png" alt="logo" width={120} height={120} className="object-contain" />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <a href="/admin" className="flex items-center gap-4 px-6 py-4 rounded-xl bg-[#111a33] hover:bg-blue-500 hover:text-white transition-all text-blue-200 text-lg font-medium">
            <FaHome size={22} /> Dashboard
          </a>
          <a href="/admin/form" className="flex items-center gap-4 px-6 py-4 rounded-xl bg-[#111a33] hover:bg-blue-500 hover:text-white transition-all text-blue-200 text-lg font-medium">
            <FaRegFileAlt size={22} /> Form
          </a>
          <a href="/admin/data" className="flex items-center gap-4 px-6 py-4 rounded-xl bg-blue-500 shadow-lg shadow-blue-500/40 text-white text-lg font-medium">
            <FaDatabase size={22} /> Data
          </a>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold">User Data</h1>

          {/* Google Sheet Button */}
          <button
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              try {
                const res = await fetch("/api/admin/pushToSheet", { method: "POST" });
                const data = await res.json();
                console.log(data);

                window.open(
                  "https://docs.google.com/spreadsheets/d/1mC3ltFlwX-NSG9czET79cCZsX7G91zLyDx3lxuddh7M/edit?usp=sharing",
                  "_blank"
                );
              } catch (err) {
                console.error("Failed to update Google Sheet:", err);
                alert("Failed to update Google Sheet. See console for details.");
              }
              setLoading(false);
            }}
            className={`bg-blue-500 px-6 py-3 rounded-xl shadow-lg text-white transition-all flex items-center gap-2 
              ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-600"}`}
          >
            {loading && (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {loading ? "Updating..." : "View on Google Sheets"}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-[#131b3a] p-6 rounded-2xl shadow-lg border border-white/5">
          <table className="w-full text-left">
            <thead>
              <tr className="text-blue-300 text-lg border-b border-white/10">
                <th className="py-3">Name</th>
                <th className="py-3">Email</th>
                <th className="py-3">Date</th>
                <th className="py-3">Score</th>
                <th className="py-3">Category</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-white/5 text-white/90">
                  <td className="py-3">{r.name || "N/A"}</td>
                  <td className="py-3">{r.email}</td>
                  <td className="py-3">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">{r.score}</td>
                  <td className="py-3">{r.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
