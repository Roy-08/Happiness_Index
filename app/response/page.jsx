"use client";

import { useEffect, useState } from "react";

export default function ResponsePage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

useEffect(() => {
  Promise.resolve().then(() => {
    const savedEmail = localStorage.getItem("registered_email");
    const savedName = localStorage.getItem("registered_name");

    setEmail(savedEmail || "Not Available");
    setName(savedName || "Participant");
  });
}, []);


  return (
    <div className="w-screen h-screen relative overflow-hidden">
      {/* BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/sky.png')" }}
      ></div>

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* CENTER CONTENT */}
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        {/* CARD */}
        <div className="w-full max-w-full sm:max-w-2xl rounded-3xl overflow-hidden shadow-[0_15px_80px_rgba(0,0,0,0.7)] bg-gray-900/80 backdrop-blur-2xl border border-cyan-400">

          {/* HEADER */}
          <div className="py-10 sm:py-16 px-6 sm:px-14 text-center bg-gradient-to-b from-[#6a11cb] via-[#2575fc] to-[#4ac7ff] shadow-[inset_0_-25px_50px_rgba(0,0,0,0.35)]">
            <h1 className="text-white text-4xl sm:text-5xl font-extrabold tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]">
              Thank You!
            </h1>
            <p className="text-white text-base sm:text-lg mt-4 sm:mt-6 px-2 sm:px-8 leading-relaxed drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]">
              Your responses have been successfully recorded.
            </p>
          </div>

          {/* BODY */}
          <div className="p-6 sm:p-14 text-center">
            <p className="text-white text-base sm:text-lg font-medium mb-2 leading-relaxed drop-shadow-[0_3px_6px_rgba(0,0,0,0.7)]">
              Hello, {name}!
            </p>
            <p className="text-white text-base sm:text-lg font-medium mb-2 leading-relaxed drop-shadow-[0_3px_6px_rgba(0,0,0,0.7)]">
              Your report has been sent to your email:
            </p>
            <p className="text-cyan-400 font-semibold text-lg sm:text-xl break-words drop-shadow-[0_3px_6px_rgba(0,0,0,0.7)]">
              {email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
