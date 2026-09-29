const fs = require("fs/promises");

/**
 * Real AI vision reviewer for Wellness.
 *
 * This module sends uploaded images to the OpenAI Responses API from the
 * backend only. The API key is never exposed to the browser.
 *
 * The review is intentionally non-diagnostic:
 * - Physique: visible, general wellness observations only.
 * - Diet: visible foods/meal composition and approximate qualitative guidance.
 * - It does NOT diagnose disease or claim exact body-fat, muscle mass, calories,
 *   or medical conditions from a photograph.
 */

const MODEL = process.env.OPENAI_VISION_MODEL || "gpt-5.6-luna";
const OPENAI_URL = "https://api.openai.com/v1/responses";

function getApiKey() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new Error("OPENAI_API_KEY is not configured on the server.");
  }
  return key;
}

function getFilePath(file) {
  if (file?.path) return file.path;
  if (file?.destination && file?.filename) {
    return require("path").join(file.destination, file.filename);
  }
  return null;
}

async function fileToDataUrl(file) {
  if (file?.buffer) {
    return `data:${file.mimetype || "image/jpeg"};base64,${file.buffer.toString("base64")}`;
  }

  const filePath = getFilePath(file);
  if (!filePath) throw new Error("Uploaded image path is unavailable.");

  const buffer = await fs.readFile(filePath);
  return `data:${file.mimetype || "image/jpeg"};base64,${buffer.toString("base64")}`;
}

function extractJson(text) {
  const cleaned = String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI did not return a valid JSON review.");
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}

function normalizeResult(result, type) {
  const fallbackSummary =
    type === "physique"
      ? "The image was reviewed for general, visible wellness observations."
      : "The meal image was reviewed for visible food items and general meal composition.";

  return {
    summary: String(result?.summary || fallbackSummary),
    observations: Array.isArray(result?.observations)
      ? result.observations.map(String).slice(0, 6)
      : [],
    suggestions: Array.isArray(result?.suggestions)
      ? result.suggestions.map(String).slice(0, 6)
      : [],
    disclaimer:
      String(result?.disclaimer ||
        "AI photo analysis is approximate and not medical advice. For exact measurements, use recorded wellness metrics and consult a qualified professional when appropriate."),
  };
}

async function generateAiReview({ type, notes = "", files = [] }) {
  const apiKey = getApiKey();
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("Upload at least one image for AI review.");
  }

  // Keep requests reasonably small and predictable.
  const selectedFiles = files.slice(0, 4);
  const images = await Promise.all(selectedFiles.map(fileToDataUrl));

  const focus =
    type === "physique"
      ? `Review the uploaded physique photos for NON-DIAGNOSTIC wellness observations only.
Discuss only what is visibly supported by the images, such as posture, visible symmetry,
exercise-related presentation, and general progress-photo consistency. Do not infer age,
race, ethnicity, sex, gender identity, disease, disability, mental state, or other sensitive
traits. Do not estimate exact body-fat percentage, muscle mass, BMI, or medical status from
appearance. If the image quality/angle is insufficient, say so.`
      : `Review the uploaded meal photo(s) for NON-DIAGNOSTIC nutrition/wellness observations.
Identify visible foods when reasonably confident, describe meal composition, and suggest
practical balanced-meal improvements. Do not claim exact calories, macros, ingredients,
portion weights, allergies, diseases, or medical conditions from the photo alone. If food
or portion size is uncertain, clearly say it is uncertain and recommend logging the actual
food/serving in the calorie counter for accurate numbers.`;

  const prompt = `${focus}

Return exactly ONE JSON object with these keys:
{
  "summary": "string",
  "observations": ["string", "string"],
  "suggestions": ["string", "string"],
  "disclaimer": "string"
}

Rules:
- observations: 2 to 6 concise points grounded in the image.
- suggestions: 2 to 6 practical, non-medical wellness suggestions.
- Do not invent details that are not visible.
- Do not use diagnostic language.
- Keep the response useful and easy to understand.
${notes ? `\nUser notes (treat as context, not as verified facts): ${String(notes).slice(0, 2000)}` : ""}`;

  const content = [
    { type: "input_text", text: prompt },
    ...images.map((image_url) => ({ type: "input_image", image_url })),
  ];

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      input: [
        {
          role: "user",
          content,
        },
      ],
      max_output_tokens: 900,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error?.message || `OpenAI request failed with status ${response.status}.`;
    throw new Error(message);
  }

  const text = data?.output_text;
  if (!text) {
    throw new Error("OpenAI returned no review text.");
  }

  return normalizeResult(extractJson(text), type);
}

module.exports = { generateAiReview };
