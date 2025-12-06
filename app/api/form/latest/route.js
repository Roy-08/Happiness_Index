import Form from "@/models/Form";
import { connectDB } from "@/lib/db";
export async function GET() {
  await connectDB();
  const form = await Form.findOne().sort({ createdAt: -1 }); // latest form
  return Response.json(form);
}
