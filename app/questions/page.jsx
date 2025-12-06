"use client";

import { useState, useEffect } from "react";

export default function QuestionsPage() {
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForm() {
      const res = await fetch("/api/form/latest");
      const data = await res.json();
      setSections(data.sections || []);
      setLoading(false);
    }
    loadForm();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentSection]);

  function selectOption(sectionIndex, questionIndex, optionIndex) {
    setAnswers({ ...answers, [`${sectionIndex}-${questionIndex}`]: optionIndex });
  }
  const goNext = () => {
    if (currentSection < sections.length - 1) setCurrentSection(currentSection + 1);
  };
  const goBack = () => {
    if (currentSection > 0) setCurrentSection(currentSection - 1);
  };
  async function handleSubmit() {
    const name = localStorage.getItem("registered_name");
    const email = localStorage.getItem("registered_email");

    await fetch("/api/submitAnswers", {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        section: "Main Assessment",
        answers,
      }),
    });

    window.location.href = "/response";
  }

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center text-white text-2xl">
        Loading…
      </div>
    );

  const section = sections[currentSection];
  const isLastSection = currentSection === sections.length - 1;

  return (
    <div className="min-h-screen w-full p-4 md:p-6 bg-gray-900 flex flex-col items-center">

      {section && (
        <div className="w-full max-w-xl mb-10 p-4 rounded-2xl bg-cyan-400 text-black font-bold text-lg text-center shadow-md">
          {`Section ${section.sectionNumber}: ${section.sectionName}`}
        </div>
      )}

      <div className="w-full max-w-xl space-y-6">
        {section?.questions.map((q, qIndex) => {
          const key = `${currentSection}-${qIndex}`;
          const questionNumber = qIndex + 1;

          return (
            <div key={qIndex}
              className="w-full p-6 rounded-2xl bg-gray-900 text-white border-2 border-cyan-400 shadow-lg">
              <div className="mb-4 text-lg font-bold flex items-center gap-3">
                <span className="text-xl font-extrabold">{`Q${questionNumber}.`}</span>
                <span>{q.text}</span>
              </div>

              <div className="space-y-3">
                {q.options.map((op, oIndex) => {
                  const selected = answers[key] === oIndex;
                  const letter = String.fromCharCode(65 + oIndex);
                  
                  return (
                    <button
                      key={oIndex}
                      onClick={() => selectOption(currentSection, qIndex, oIndex)}
                      className={`relative w-full flex items-center gap-3 pl-16 pr-6 py-4 rounded-full
                        ${selected ? "bg-cyan-400 text-black" : "bg-gray-700 text-white"}`}
                    >
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-black font-bold">
                        {letter}
                      </div>
                      {op.text}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-full max-w-xl flex justify-between mt-6">
        {currentSection > 0 && (
          <button onClick={goBack} className="px-6 py-3 rounded-full bg-gray-600 text-white">
            Back
          </button>
        )}

        {!isLastSection ? (
          <button onClick={goNext} className="px-10 py-3 rounded-full bg-blue-500 text-white ml-auto">
            Next
          </button>
        ) : (
          <button onClick={handleSubmit} className="px-10 py-3 rounded-full bg-green-500 text-white ml-auto">
            Submit
          </button>
        )}
      </div>
    </div>
  );
}