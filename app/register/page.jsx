"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    dob: "",
    country: "",
    contact: "",
    occupation: "",
  });

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=cca2,name,flags")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data
          .map((c) => ({
            code: c.cca2,
            name: c.name.common,
            flag: c.flags?.png || "",
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sorted);
      })
      .catch(console.error);
  }, []);
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

 async function handleSubmit(e) {
  e.preventDefault();

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error("Registration failed: " + data.message);
      return;
    }

    toast.success("Registration Successful!");

    // Save to localStorage
    localStorage.setItem("registered_email", form.email);
    localStorage.setItem("registered_name", form.name); // <-- FIX

    setForm({
      name: "",
      email: "",
      dob: "",
      country: "",
      contact: "",
      occupation: "",
    });

    setSelectedCountry(null);

    setTimeout(() => {
      window.location.href = "/questions";
    }, 800);

  } catch (err) {
    console.error(err);
    toast.error("Registration failed. Check console for details.");
  }
}


  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-linear-to-br from-[#16e0c3] via-[#0bc5ea] to-[#009dff] p-4">
      <div className="relative w-full max-w-md sm:max-w-lg bg-white p-6 sm:p-12 rounded-2xl shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-semibold text-center mb-8 sm:mb-10 text-[#03A9F4]">
          • Registration Form •
        </h1>

        <form className="space-y-5 sm:space-y-7" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full pb-2 sm:pb-3 border-b border-[#00BBD4] text-black focus:outline-none"
            required
          />

          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full pb-2 sm:pb-3 border-b border-[#00BBD4] text-black focus:outline-none"
            required
          />

          <div className="w-full pb-2 sm:pb-3">
            <span className="text-gray-500 block mb-1">Date Of Birth</span>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              className="w-full pb-2 border-b border-[#00BBD4] bg-transparent text-black focus:outline-none"
              required
            />
          </div>

          {/* Country Dropdown */}
          <div className="relative w-full" ref={dropdownRef}>
            <label className="text-gray-500 block mb-1">Country</label>
            <button
              type="button"
              className="w-full pb-2 sm:pb-3 border-b border-[#00BBD4] text-black bg-transparent text-left flex items-center justify-between focus:outline-none"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {selectedCountry ? (
                <div className="flex items-center gap-2 text-black">
                  <img
                    src={selectedCountry.flag}
                    alt={selectedCountry.name}
                    className="w-5 h-3 sm:w-6 sm:h-4 object-cover"
                  />
                  <span>{selectedCountry.name}</span>
                </div>
              ) : (
                "Select Country"
              )}
              <span>{dropdownOpen ? "▲" : "▼"}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-y-auto rounded-lg shadow-lg">
                {countries.map((c) => (
                  <div
                    key={c.code}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-100 text-black"
                    onClick={() => {
                      setSelectedCountry(c);
                      setForm({ ...form, country: c.name });
                      setDropdownOpen(false);
                    }}
                  >
                    <img
                      src={c.flag}
                      alt={c.name}
                      className="w-5 h-3 sm:w-6 sm:h-4 object-cover"
                    />
                    <span>{c.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="Contact Number"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            className="w-full pb-2 sm:pb-3 border-b border-[#00BBD4] text-black focus:outline-none"
            required
          />

          <input
            type="text"
            placeholder="Occupation"
            value={form.occupation}
            onChange={(e) => setForm({ ...form, occupation: e.target.value })}
            className="w-full pb-2 sm:pb-3 border-b border-[#00BBD4] text-black focus:outline-none"
            required
          />

          <button
            type="submit"
            className="w-full py-3 sm:py-4 rounded-md font-bold text-lg sm:text-xl text-white bg-linear-to-r from-[#00E0FF] via-[#00B2FF] to-[#006CFF] shadow-lg hover:opacity-95 transition"
          >
            REGISTER
          </button>
        </form>
      </div>
    </div>
  );
}
