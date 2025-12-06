import {connectDB} from "@/lib/db";
import Assessment from "@/models/Assessment";
    
export async function GET() {
  await connectDB();

  const data = await Assessment.find().sort({ createdAt: -1 });

  return Response.json(data);
}
