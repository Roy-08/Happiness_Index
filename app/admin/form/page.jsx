"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaHome,
  FaRegFileAlt,
  FaBirthdayCake,
  FaDatabase,
  FaEye,
  FaArrowLeft,
} from "react-icons/fa";
import toast from "react-hot-toast";
// TOP OF FILE (before component)
const mkId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function AdminFormPage() {
  const [formStarted, setFormStarted] = useState(false);
  const [headline, setHeadline] = useState("");
  const [sections, setSections] = useState([]); // new: sections instead of flat questions
  const [editingFormId, setEditingFormId] = useState(null);
  const [savedForms, setSavedForms] = useState([]);
  const [viewMode, setViewMode] = useState(false); // view-only toggle
  const [deleteConfirmId, setDeleteConfirmId] = useState(null); // for delete confirmation

  useEffect(() => {
    async function loadForms() {
      try {
        const res = await fetch("/api/form");
        const data = await res.json();
        if (res.ok) setSavedForms(data.forms);
      } catch (err) {
        console.error("Load error:", err);
      }
    }
    loadForms();
  }, []);

  const startForm = () => {
    setFormStarted(true);
    setHeadline("");
    setSections([]);
    setEditingFormId(null);
    setViewMode(false);
  };

  // helper: create local IDs for UI (not stored in DB)

  // convert saved form to UI sections structure when viewing
  const viewForm = (form) => {
    setFormStarted(true);
    setViewMode(true);
    setEditingFormId(null);
    setHeadline(form.headline || "");

    const converted = (form.sections || form.questions || []).map((sec, sIdx) => {
      // Support old structure where form.questions existed (backwards compat)
      if (sec.questions) {
        return {
          id: mkId(),
          sectionNumber: sec.sectionNumber ?? sIdx + 1,
          sectionName: sec.sectionName ?? `Section ${sIdx + 1}`,
          questions: sec.questions.map((q) => ({
            id: mkId(),
            text: q.text,
            options: (q.options || []).map((o) => ({
              id: mkId(),
              text: o.text,
              marks: o.marks ?? 0,
            })),
          })),
        };
      } else {
        // old flat question format -> wrap each question into a default section
        return {
          id: mkId(),
          sectionNumber: 1,
          sectionName: "Section 1",
          questions: (form.questions || []).map((q) => ({
            id: mkId(),
            text: q.text,
            options: (q.options || []).map((o) => ({
              id: mkId(),
              text: o.text,
              marks: o.marks ?? 0,
            })),
          })),
        };
      }
    });

    // If no sections, but form.questions exist:
    if (converted.length === 0 && form.questions) {
      const fallback = {
        id: mkId(),
        sectionNumber: 1,
        sectionName: "Section 1",
        questions: form.questions.map((q) => ({
          id: mkId(),
          text: q.text,
          options: (q.options || []).map((o) => ({
            id: mkId(),
            text: o.text,
            marks: o.marks ?? 0,
          })),
        })),
      };
      setSections([fallback]);
    } else {
      setSections(converted);
    }
  };

  // convert saved form to UI sections structure when loading to edit
  const loadToEdit = (form) => {
    setFormStarted(true);
    setViewMode(false);
    setHeadline(form.headline || "");
    setEditingFormId(form._id);

    const converted = (form.sections || form.questions || []).map((sec, sIdx) => {
      if (sec.questions) {
        return {
          id: mkId(),
          sectionNumber: sec.sectionNumber ?? sIdx + 1,
          sectionName: sec.sectionName ?? `Section ${sIdx + 1}`,
          questions: sec.questions.map((q) => ({
            id: mkId(),
            text: q.text,
            options: (q.options || []).map((o) => ({
              id: mkId(),
              text: o.text,
              marks: o.marks ?? 0,
            })),
          })),
        };
      } else {
        return {
          id: mkId(),
          sectionNumber: 1,
          sectionName: "Section 1",
          questions: (form.questions || []).map((q) => ({
            id: mkId(),
            text: q.text,
            options: (q.options || []).map((o) => ({
              id: mkId(),
              text: o.text,
              marks: o.marks ?? 0,
            })),
          })),
        };
      }
    });

    if (converted.length === 0 && form.questions) {
      const fallback = {
        id: mkId(),
        sectionNumber: 1,
        sectionName: "Section 1",
        questions: form.questions.map((q) => ({
          id: mkId(),
          text: q.text,
          options: (q.options || []).map((o) => ({
            id: mkId(),
            text: o.text,
            marks: o.marks ?? 0,
          })),
        })),
      };
      setSections([fallback]);
    } else {
      setSections(converted);
    }
  };

  const submitForm = async () => {
    // Build payload with sections -> questions -> options
    const payload = {
      id: editingFormId,
      headline,
      sections: sections.map((s, i) => ({
        sectionNumber: i + 1,
        sectionName: s.sectionName || `Section ${i + 1}`,
        questions: (s.questions || []).map((q) => ({
          text: q.text,
          options: (q.options || []).map((o) => ({
            text: o.text,
            marks: Number(o.marks) || 0,
          })),
        })),
      })),
    };
    const method = editingFormId ? "PUT" : "POST";

    try {
      const res = await fetch("/api/form", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(editingFormId ? "Form updated!" : "Form created!");
        if (editingFormId) {
          setSavedForms((prev) =>
            prev.map((f) => (f._id === editingFormId ? data.form : f))
          );
        } else {
          setSavedForms([data.form, ...savedForms]);
        }

        setFormStarted(false);
        setHeadline("");
        setSections([]);
        setEditingFormId(null);
      } else {
        toast.error(data?.message || "Save failed!");
      }
    } catch (err) {
      console.error("submit error:", err);
      toast.error("Save failed!");
    }
  };

  const deleteForm = async (id) => {
    try {
      const res = await fetch(`/api/form?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Form deleted!");
        setSavedForms(savedForms.filter((f) => f._id !== id));
      }
    } catch {
      toast.error("Delete failed!");
    }
  };

  const confirmDelete = (id) => setDeleteConfirmId(id);
  const cancelDelete = () => setDeleteConfirmId(null);
  const letterFor = (i) => `${String.fromCharCode(65 + i)}.`;

  const goBack = () => {
    setFormStarted(false);
    setViewMode(false);
    setHeadline("");
    setSections([]);
  };

  // -------------------------
  // Section / Question / Option handlers
  // -------------------------
  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: mkId(),
        sectionNumber: prev.length + 1,
        sectionName: `Section ${prev.length + 1}`,
        questions: [],
      },
    ]);
  };

  const removeSection = (sectionId) => {
    setSections((prev) => {
      const filtered = prev.filter((s) => s.id !== sectionId);
      // re-number sections
      return filtered.map((s, idx) => ({ ...s, sectionNumber: idx + 1 }));
    });
  };

  const updateSectionName = (sectionId, value) => {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, sectionName: value } : s)));
  };

  const addQuestion = (sectionId) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: [
                ...s.questions,
                { id: mkId(), text: "", options: [] },
              ],
            }
          : s
      )
    );
  };

  const removeQuestion = (sectionId, qId) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, questions: s.questions.filter((q) => q.id !== qId) }
          : s
      )
    );
  };

  const updateQuestionText = (sectionId, qId, text) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) => (q.id === qId ? { ...q, text } : q)),
            }
          : s
      )
    );
  };

  const addOption = (sectionId, qId) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.id === qId
                  ? {
                      ...q,
                      options: [
                        ...q.options,
                        { id: mkId(), text: "", marks: 0 },
                      ],
                    }
                  : q
              ),
            }
          : s
      )
    );
  };

  const removeOption = (sectionId, qId, oId) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.id === qId ? { ...q, options: q.options.filter((o) => o.id !== oId) } : q
              ),
            }
          : s
      )
    );
  };

  const updateOptionText = (sectionId, qId, oId, text) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.id === qId
                  ? { ...q, options: q.options.map((o) => (o.id === oId ? { ...o, text } : o)) }
                  : q
              ),
            }
          : s
      )
    );
  };

  const updateOptionMarks = (sectionId, qId, oId, marks) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.id === qId
                  ? { ...q, options: q.options.map((o) => (o.id === oId ? { ...o, marks: Number(marks) } : o)) }
                  : q
              ),
            }
          : s
      )
    );
  };

  return (
    <div className="flex min-h-screen bg-animated text-white">
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
          <a href="/admin/form" className="flex items-center gap-4 px-6 py-4 rounded-xl bg-blue-500 hover:bg-blue-500 hover:text-white transition-all text-blue-200 text-lg font-medium"><FaRegFileAlt size={22} />Form</a>
          <a href="/admin/data" className="flex items-center gap-4 px-6 py-4 rounded-xl bg-[#111a33] hover:bg-blue-500 hover:text-white transition-all text-blue-200 text-lg font-medium"><FaDatabase size={22} />Data</a>
        </div>
      </div>

      <main className="flex-1 p-10 overflow-y-auto">
        <h1 className="text-5xl font-bold mb-8 text-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          Form Builder
        </h1>

        {!formStarted && savedForms.length > 0 && (
          <div className="bg-[#141a32] p-8 rounded-2xl shadow-lg border border-white/10 mb-10">
            <h2 className="text-2xl font-semibold mb-4">Saved Forms</h2>
            <table className="w-full">
              <thead>
                <tr className="text-blue-300 border-b border-white/10">
                  <th className="py-3 text-center">Headline</th>
                  <th className="py-3 text-center">Created At</th>
                  <th className="py-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {savedForms.map((form) => (
                  <tr key={form._id} className="border-b border-white/10">
                    <td className="py-4 text-center">{form.headline}</td>
                    <td className="py-4 text-center">
                      {new Date(form.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-4 text-center">
                      <div className="flex items-center gap-3 justify-center">
                        <button
                          onClick={() => viewForm(form)}
                          className="px-3 py-2 bg-blue-500 rounded-md flex items-center gap-2"
                        >
                          <FaEye /> View
                        </button>

                        <button
                          onClick={() => loadToEdit(form)}
                          className="px-3 py-2 bg-yellow-500 rounded-md text-black flex items-center gap-2"
                        >
                          <FaEdit /> Edit
                        </button>

                        <button
                          onClick={() => confirmDelete(form._id)}
                          className="px-3 py-2 bg-red-500 rounded-md flex items-center gap-2"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={startForm}
              className="mt-6 px-6 py-3 bg-green-600 rounded-xl whitespace-nowrap"
            >
              + Add New Form
            </button>
          </div>
        )}

        {!formStarted && savedForms.length === 0 && (
          <div className="bg-[#141a32] p-10 rounded-2xl">
            <p className="text-blue-200 mb-6">No form created yet.</p>

            <button
              onClick={startForm}
              className="px-6 py-3 bg-green-600 rounded-xl whitespace-nowrap"
            >
              <FaPlus /> Add New Form
            </button>
          </div>
        )}

        {formStarted && (
          <div className="relative min-h-[80vh]">
            {/* Form Container */}
            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-lg border-2 border-gradient-to-r from-purple-500 via-pink-500 to-red-500">
              {/* HEADLINE */}
              {!viewMode ? (
                <input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Enter headline e.g. Happiness Index Question"
                  className="w-full text-4xl font-bold mb-6 bg-transparent border-b border-blue-400 text-white p-2 text-center"
                />
              ) : (
                <h2 className="text-4xl font-bold mb-6 text-center text-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                  {headline}
                </h2>
              )}

              {/* SECTIONS */}
              <div className="space-y-6">
                {sections.map((sec, sIdx) => (
                  <div
                    key={sec.id}
                    className="p-6 rounded-xl bg-white/10 backdrop-blur-md border-l-4 border-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-slide-in"
                  >
                    <div className="flex justify-between items-center mb-4">
                      {!viewMode ? (
                        <div className="flex-1">
                          <input
                            value={sec.sectionName}
                            onChange={(e) => updateSectionName(sec.id, e.target.value)}
                            placeholder={`Section ${sec.sectionNumber} Name`}
                            className="w-full text-2xl font-bold bg-transparent border-b border-blue-400 p-2"
                          />
                          <div className="mt-2 text-sm text-blue-200">Section {sIdx + 1}</div>
                        </div>
                      ) : (
                        <h3 className="text-2xl font-bold">
                          Section {sec.sectionNumber}: {sec.sectionName}
                        </h3>
                      )}

                      {!viewMode && (
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => addQuestion(sec.id)}
                            className="px-3 py-2 bg-green-600 rounded-md"
                          >
                            + Add Question
                          </button>
                          <button
                            onClick={() => removeSection(sec.id)}
                            className="px-3 py-2 bg-red-600 rounded-md"
                          >
                            Remove Section
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Questions in this section */}
                    <div className="space-y-4">
                      {sec.questions.map((q, qIdx) => (
                        <div key={q.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                          {!viewMode ? (
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <input
                                  value={q.text}
                                  onChange={(e) => updateQuestionText(sec.id, q.id, e.target.value)}
                                  placeholder={`Question ${qIdx + 1}`}
                                  className="w-full text-lg font-semibold bg-transparent border-b border-blue-400 p-2"
                                />
                                <div className="text-sm text-blue-200 mt-2">Question {qIdx + 1} in Section {sec.sectionNumber}</div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => removeQuestion(sec.id, q.id)}
                                  className="px-3 py-1 bg-red-600 rounded-md"
                                >
                                  Delete Q
                                </button>
                              </div>
                            </div>
                          ) : (
                            <h4 className="text-lg font-semibold mb-3">Question {qIdx + 1}: {q.text}</h4>
                          )}

                          {/* Options */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            {q.options.map((opt, oi) =>
                              !viewMode ? (
                                <div
                                  key={opt.id}
                                  className="flex items-center gap-2 p-3 bg-white/10 rounded-lg border border-white/20"
                                >
                                  <span className="font-bold text-blue-200">{letterFor(oi)}</span>
                                  <input
                                    value={opt.text}
                                    onChange={(e) => updateOptionText(sec.id, q.id, opt.id, e.target.value)}
                                    placeholder="Option text"
                                    className="flex-1 bg-transparent border-b border-blue-400 p-1"
                                  />
                                  <input
                                    type="number"
                                    value={opt.marks}
                                    onChange={(e) => updateOptionMarks(sec.id, q.id, opt.id, e.target.value)}
                                    className="w-20 bg-transparent border-b border-green-400 p-1 text-green-300"
                                  />
                                  <button
                                    onClick={() => removeOption(sec.id, q.id, opt.id)}
                                    className="px-2 py-1 bg-red-600 rounded-md"
                                  >
                                    X
                                  </button>
                                </div>
                              ) : (
                                <div
                                  key={opt.id}
                                  className="p-3 bg-white/10 rounded-lg border border-white/20"
                                >
                                  <span className="font-bold text-blue-200">{letterFor(oi)}</span>{" "}
                                  {opt.text}{" "}
                                  <span className="text-green-300 font-semibold">({opt.marks} pts)</span>
                                </div>
                              )
                            )}
                          </div>

                          {!viewMode && (
                            <div className="mt-3">
                              <button
                                onClick={() => addOption(sec.id, q.id)}
                                className="px-4 py-2 bg-green-600 rounded-md"
                              >
                                + Add Option
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Section button */}
              {!viewMode && (
                <div className="mt-6">
                  <button
                    onClick={addSection}
                    className="px-6 py-3 bg-blue-600 rounded-xl"
                  >
                    + Add Section
                  </button>
                </div>
              )}
            </div>

            {/* Floating Buttons at bottom-right */}
            <div className="mt-6 flex justify-between w-full ">
              {/* Save/Submit Button — only in create/edit mode */}
              {!viewMode && (
                <button
                  onClick={submitForm}
                  className="px-6 py-3 bg-blue-600 rounded-xl whitespace-nowrap"
                >
                  {editingFormId ? "Update Form" : "Save Form"}
                </button>
              )}

              {/* Back Button */}
              <button
                onClick={goBack}
                className="flex items-center gap-2 px-4 py-3 bg-gray-600 rounded-xl"
              >
                <FaArrowLeft /> Back
              </button>
            </div>
          </div>
        )}

        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#0b1126] p-8 rounded-2xl shadow-xl space-y-6">
              <h2 className="text-2xl font-bold">Confirm Delete</h2>
              <p>Are you sure you want to delete this form? This action cannot be undone.</p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => {
                    deleteForm(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }}
                  className="px-6 py-2 bg-red-600 rounded-xl"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="px-6 py-2 bg-gray-500 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
