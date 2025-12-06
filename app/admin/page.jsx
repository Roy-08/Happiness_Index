    "use client";

    import { useEffect, useState } from "react";
    import { Doughnut, Bar } from "react-chartjs-2";
    import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
    import { FaHome, FaRegFileAlt, FaBirthdayCake, FaDatabase } from "react-icons/fa";
    import Image from "next/image";

    ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

    export default function AdminPage() {
      const [counts, setCounts] = useState(null);

      useEffect(() => {
        fetch("/api/admin/counts")
          .then((res) => res.json())
          .then((data) => setCounts(data))
          .catch((err) => console.error(err));
      }, []);

      if (!counts) return <p className="text-white p-10">Loading...</p>;

      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { color: "white", font: { size: 12 } } },
          tooltip: { enabled: true },
        },
      };

      const barOptions = {
        ...chartOptions,
        scales: {
          x: { stacked: true, ticks: { color: "white" }, grid: { color: "rgba(255,255,255,0.1)" } },
          y: { stacked: true, ticks: { color: "white" }, grid: { color: "rgba(255,255,255,0.1)" } },
        },
      };

      // Fake gradient colors (array of slightly different shades)
      const doughnutColors = ["#4cc9ff", "#7b5bff", "#b84bff", "#ff6b6b", "#ffb86b"];
      const barColors = ["#4cc9ff", "#7b5bff", "#b84bff", "#ff6b6b", "#ffb86b"];

      const doughnutData = {
        labels: ["Luminary", "Creator", "Innovator", "Prodigy", "Seeker"],
        datasets: [
          {
            data: [counts.luminary, counts.creator, counts.innovator, counts.prodigy, counts.seeker],
            backgroundColor: doughnutColors,
            borderColor: "#0a1124",
            borderWidth: 2,
          },
        ],
      };

      const barData = {
        labels: ["Luminary", "Creator", "Innovator", "Prodigy", "Seeker"],
        datasets: [
          {
            label: "Users",
            data: [counts.luminary, counts.creator, counts.innovator, counts.prodigy, counts.seeker],
            backgroundColor: barColors,
          },
        ],
      };

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
    <a href="/admin" className="flex items-center gap-4 px-6 py-4 rounded-xl bg-blue-500 shadow-lg shadow-blue-500/40 text-white text-lg font-medium">
      <FaHome size={22} /> Dashboard
    </a>      <a href="/admin/form" className="flex items-center gap-4 px-6 py-4 rounded-xl bg-[#111a33] hover:bg-blue-500 hover:text-white transition-all text-blue-200 text-lg font-medium"><FaRegFileAlt size={22} />Form</a>
              <a href="/admin/data" className="flex items-center gap-4 px-6 py-4 rounded-xl bg-[#111a33] hover:bg-blue-500 hover:text-white transition-all text-blue-200 text-lg font-medium"><FaDatabase size={22} />Data</a>
            </div>
            
          </div>

          {/* Main Area */}
          <div className="flex-1 p-10 flex flex-col justify-start">
            <h1 className="text-4xl font-bold mb-6">Admin Dashboard</h1>

            {/* Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-10">
              {[
                { title: "Total Users", count: counts.totalUsers },
                { title: "Total Luminary", count: counts.luminary },
                { title: "Total Creator", count: counts.creator },
                { title: "Total Innovator", count: counts.innovator },
                { title: "Total Prodigy", count: counts.prodigy },
                { title: "Total Seeker", count: counts.seeker },
              ].map((box, i) => (
                <div key={i} className="p-5 rounded-2xl bg-[#131b3a] shadow-xl border border-white/5 flex flex-col justify-between">
                  <h3 className="text-blue-300 text-sm font-semibold">{box.title}</h3>
                  <p className="text-blue-200 text-xs opacity-70 mb-3">Registered</p>
                  <p className="text-4xl font-bold mb-4">{box.count}</p>
                  <div className="w-full h-14 overflow-hidden rounded-xl">
                    <svg viewBox="0 0 500 100" preserveAspectRatio="none" className="w-full h-full">
                      <path
                        d="M0,50 C150,90 350,10 500,50 L500,100 L0,100 Z"
                        fill="url(#waveGradient)"
                      />
                      <defs>
                        <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4cc9ff" />
                          <stop offset="50%" stopColor="#7b5bff" />
                          <stop offset="100%" stopColor="#b84bff" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
              
            {/* Charts Section */}
            <div className="flex flex-col lg:flex-row gap-8 flex-1">
              {/* Doughnut Chart */}
              <div className="w-full lg:max-w-md bg-[#131b3a] p-8 rounded-2xl shadow-xl border border-white/5 flex flex-col">
                <h2 className="text-xl font-bold text-blue-300 mb-6 text-center">Category Distribution</h2>
                <div className="flex-1">
                  <Doughnut data={doughnutData} options={chartOptions} />
                </div>
              </div>

              {/* Stacked Bar Chart */}
              <div className="w-full lg:flex-1 bg-[#131b3a] p-8 rounded-2xl shadow-xl border border-white/5 flex flex-col">
                <h2 className="text-xl font-bold text-blue-300 mb-6 text-center">Category Counts</h2>
                <div className="flex-1">
                  <Bar data={barData} options={barOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>
      );  
    }
