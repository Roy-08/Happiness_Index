"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-screen h-screen relative overflow-hidden">
      {/* BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/sky.png')" }}
      ></div>

      {/* DARK OVERLAY FOR VISIBILITY */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* CENTER CONTENT */}
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        {/* RESPONSIVE PREMIUM CARD */}
        <div
          className="
            w-full max-w-full sm:max-w-2xl
            rounded-3xl overflow-hidden
            shadow-[0_15px_80px_rgba(0,0,0,0.55)]
            bg-white/25 backdrop-blur-2xl border border-white/40
          "
        >
          {/* PREMIUM HEADER */}
          <div className="
            py-10 sm:py-16 px-6 sm:px-14 text-center
            bg-gradient-to-b from-[#6a11cb] via-[#2575fc] to-[#4ac7ff]
            shadow-[inset_0_-25px_50px_rgba(0,0,0,0.25)]
          ">
            <h1 className="text-white text-3xl sm:text-5xl font-extrabold tracking-wide drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
              HELLO & WELCOME
            </h1>
            <p className="text-white/95 text-sm sm:text-lg mt-4 sm:mt-6 px-4 sm:px-8 leading-relaxed drop-shadow-[0_3px_6px_rgba(0,0,0,0.6)]">
              Track your emotional well-being, reflect on your mood,
              and take meaningful steps toward a happier and healthier life.
            </p>
          </div>

          {/* PREMIUM BODY */}
          <div className="p-6 sm:p-14 text-center">
            <p className="text-white text-sm sm:text-lg font-medium mb-8 sm:mb-12 leading-relaxed drop-shadow-[0_3px_6px_rgba(0,0,0,0.6)]">
              Begin your transformative journey toward a more mindful,
              balanced, and positive lifestyle.
            </p>

            <Link href="/register">
              <button
                className="
                  w-full py-3 sm:py-5 rounded-xl font-extrabold text-lg sm:text-xl text-white
                  bg-gradient-to-r from-[#8e2de2] to-[#4a00e0]
                  hover:from-[#a543f0] hover:to-[#5b0ff0]
                  shadow-[0_10px_25px_rgba(74,0,224,0.45)]
                  transition-all
                "
              >
                Register
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
