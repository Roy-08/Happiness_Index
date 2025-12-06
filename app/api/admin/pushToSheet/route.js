import { google } from "googleapis";
import fs from "fs";
import { connectDB } from "@/lib/db";
import Assessment from "@/models/Assessment";

export async function POST(req) {
  try {
    await connectDB();

    // Load credentials from env path
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);


    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });

    const sheets = google.sheets({ version: "v4", auth });

    const data = await Assessment.find().sort({ createdAt: -1 });

    // Prepare values for sheet
    const values = data.map(r => [
      r.name || "N/A",
      r.email,
      new Date(r.createdAt).toLocaleDateString(),
      r.score,
      r.category
    ]);

    // Add header row
    values.unshift(["Name", "Email", "Date", "Score", "Category"]);

    const spreadsheetId = '1mC3ltFlwX-NSG9czET79cCZsX7G91zLyDx3lxuddh7M';

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "A1:E",
      valueInputOption: "RAW",
      requestBody: { values }
    });

    return new Response(JSON.stringify({ message: "Sheet updated!" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
