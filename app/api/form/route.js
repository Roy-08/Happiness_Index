// app/api/form/route.js
import {connectDB } from "@/lib/db";
import Form from "@/models/Form";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();
    const forms = await Form.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ forms }, { status: 200 });
  } catch (err) {
    console.error("GET /api/form error:", err);
    return NextResponse.json({ message: "Failed to load forms" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate basic shape
    if (!body.headline || !Array.isArray(body.sections)) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    // Ensure required fields and sanitize
    const sections = body.sections.map((s, i) => ({
      sectionNumber: s.sectionNumber ?? i + 1,
      sectionName: s.sectionName ?? `Section ${i + 1}`,
      questions: (s.questions || []).map((q) => ({
        text: q.text ?? "",
        options: (q.options || []).map((o) => ({
          text: o.text ?? "",
          marks: Number(o.marks) || 0,
        })),
      })),
    }));

    const form = await Form.create({
      headline: body.headline,
      sections,
    });

    return NextResponse.json({ form }, { status: 201 });
  } catch (err) {
    console.error("POST /api/form error:", err);
    return NextResponse.json({ message: "Failed to create form" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();

    const id = body.id;
    if (!id) {
      return NextResponse.json({ message: "Missing form id" }, { status: 400 });
    }

    // Build sections (same sanitization as POST)
    const sections = (body.sections || []).map((s, i) => ({
      sectionNumber: s.sectionNumber ?? i + 1,
      sectionName: s.sectionName ?? `Section ${i + 1}`,
      questions: (s.questions || []).map((q) => ({
        text: q.text ?? "",
        options: (q.options || []).map((o) => ({
          text: o.text ?? "",
          marks: Number(o.marks) || 0,
        })),
      })),
    }));

    const updated = await Form.findByIdAndUpdate(
      id,
      {
        headline: body.headline ?? "",
        sections,
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ message: "Form not found" }, { status: 404 });
    }

    return NextResponse.json({ form: updated }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/form error:", err);
    return NextResponse.json({ message: "Failed to update form" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "Missing id" }, { status: 400 });
    }

    const deleted = await Form.findByIdAndDelete(id).lean();
    if (!deleted) {
      return NextResponse.json({ message: "Form not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/form error:", err);
    return NextResponse.json({ message: "Failed to delete" }, { status: 500 });
  }
}
