import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Form from "@/models/Form";
import Assessment from "@/models/Assessment";
import nodemailer from "nodemailer";
import path from "path";

export async function POST(req) {
  await connectDB();

  try {
    const { name, email, section, answers } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const form = await Form.findOne();
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // -------------------------------
    // SCORE CALCULATION
    // -------------------------------
    let totalScore = 0;

    for (const key in answers) {
      const [sectionIndex, questionIndex] = key.split("-");
      const selectedOptionIndex = answers[key];

      const sectionObj = form.sections[sectionIndex];
      if (!sectionObj) continue;

      const questionObj = sectionObj.questions[questionIndex];
      if (!questionObj) continue;

      const optionObj = questionObj.options[selectedOptionIndex];
      if (!optionObj) continue;

      totalScore += optionObj.marks;
    }

    // -------------------------------
    // CATEGORY SELECTION
    // -------------------------------
    const category = getCategory(totalScore);

    // -------------------------------
    // SAVE IN ASSESSMENT MODEL ONLY
    // -------------------------------
    const assess = new Assessment({
      name,
      email,
      section,
      answers,
      score: totalScore,
      category,
    });

    await assess.save();

    // -------------------------------
    // SEND RESPONSE IMMEDIATELY
    // -------------------------------
    const response = NextResponse.json({
      message: "submitted",
      score: totalScore,
      category,
    });

    // -------------------------------
    // BACKGROUND EMAIL SENDING
    // -------------------------------
    (async () => {
      try {
        const pdfFileName = getPdfName(totalScore);
        const pdfPath = path.join(process.cwd(), "public", pdfFileName);

        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

       await transporter.sendMail({
  from: 'Dr. Vrushali Saraswat <drvrushali9@gmail.com>',
  to: email,
  subject: "Your Happiness Index Score & Report",
  html: generateHTMLEmail(name, totalScore),
  attachments: [
    {
      filename: pdfFileName,
      path: pdfPath,
      contentType: "application/pdf",
    },
  ],
});


        console.log("Email sent to:", email);
      } catch (err) {
        console.error("Email failed:", err);
      }
    })();

    return response;

  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* -----------------------------
   CATEGORY HELPERS
----------------------------- */

function getCategory(score) {
  if (score < 45) return "seeker";
  if (score <= 59) return "creator";
  if (score <= 74) return "innovator";
  if (score <= 89) return "prodigy";
  return "luminary";
}

function getPdfName(score) {
  if (score < 45) return "Seeker.pdf";
  if (score <= 59) return "Creator.pdf";
  if (score <= 74) return "Innovator.pdf";
  if (score <= 89) return "Prodigy.pdf";
  return "Luminary.pdf";
}

function getHappinessCategory(score) {
  if (score < 45) return "Low Happiness";
  if (score <= 59) return "Moderate Happiness";
  if (score <= 74) return "Good Happiness";
  if (score <= 89) return "High Happiness";
  return "Exceptional Happiness";
}

function getExplanation(score) {
  if (score < 45)
    return "Your score reflects emotional strain or dissatisfaction. It suggests challenges in life that may be affecting your well-being and inner balance.";
  if (score <= 59)
    return "This range reflects a balanced yet inconsistent emotional state. You may feel positive at times but also experience noticeable dips.";
  if (score <= 74)
    return "This score reflects a generally positive outlook. You're doing well emotionally, but there are a few areas that can be strengthened.";
  if (score <= 89)
    return "You show strong emotional well-being and a stable sense of satisfaction. Your habits and mindset support a healthy level of happiness.";
  return "Your emotional health is exceptional. You demonstrate resilience, gratitude, and fulfillment at a very high level.";
}

function getFeedback(score) {
  if (score < 45)
    return "This is an important moment to invest in emotional support and inner healing. Our Happiness Reset program can guide you toward rebuilding balance and joy.";
  if (score <= 59)
    return "Small but powerful improvements in lifestyle, habits, and mindset can meaningfully raise your overall happiness.";
  if (score <= 74)
    return "You're on a great path. Explore deeper purpose and meaningful emotional practices.";
  if (score <= 89)
    return "You're doing well! Maintaining this level of emotional health is important.";
  return "You’re thriving at an exceptional level.";
}

/* -----------------------------
   EMAIL TEMPLATE
----------------------------- */

function generateHTMLEmail(name, score) {
  const category = getHappinessCategory(score);
  const explanation = getExplanation(score);
  const feedback = getFeedback(score);

 return `
<html>
  <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #dfe9f3 0%, #ffffff 100%); padding: 40px;">
    <div style="max-width: 650px; margin: auto; background: #ffffff; padding: 0; border-radius: 18px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.12);">

      <!-- Header -->
      <div style="background: linear-gradient(135deg, #4a90e2, #0052cc); padding: 35px 25px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px; letter-spacing: 1px;">Happiness Assessment Report</h1>
        <p style="margin-top: 10px; font-size: 16px; opacity: 0.9;">
          Your personalized emotional wellness insights
        </p>
      </div>

      <!-- Body -->
      <div style="padding: 35px;">
        <p style="font-size: 17px; color: #333;">
          Hello <strong>${name}</strong>,
        </p>

        <!-- Score Panel -->
        <div style="background: #f3f8ff; padding: 25px; border-radius: 14px; margin: 30px 0; border-left: 7px solid #4a90e2; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
          <h2 style="margin: 0; color: #2563eb; font-size: 24px;">
            Overall Score: ${score}
          </h2>
          <h3 style="margin-top: 10px; color: #1e3a8a; font-size: 20px;">
            Category: ${category}
          </h3>
        </div>

        <!-- Explanation -->
        <h2 style="color: #111; margin-top: 25px; font-size: 22px; display: flex; align-items: center; gap: 8px;">
          📘 Explanation
        </h2>
        <p style="font-size: 16px; color: #444; line-height: 1.7;">
          ${explanation}
        </p>

        <!-- Feedback -->
        <h2 style="color: #111; margin-top: 30px; font-size: 22px; display: flex; align-items: center; gap: 8px;">
          💡 Feedback
        </h2>
        <p style="font-size: 16px; color: #444; line-height: 1.7;">
          ${feedback}
        </p>

        <!-- Signature -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            Warm regards,<br/>
            <strong style="color: #000; font-size: 17px;">Dr. Vrushali Saraswat</strong>
          </p>
        </div>
      </div>
    </div>
  </body>
</html>
`

}
