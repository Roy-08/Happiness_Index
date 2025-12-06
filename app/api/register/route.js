import {connectDB} from "@/lib/db";
import Registration from "@/models/Registration";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const newUser = await Registration.create({
      name: body.name,
      email: body.email,
      dob: body.dob,
      country: body.country,
      contact: body.contact,
      occupation: body.occupation,
    });
    return Response.json({ success: true, data: newUser });
  } catch (err) {
    console.error(err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}