const fs = require("fs/promises");
const path = require("path");

const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/interactions";

function getApiKey() {
  const key = process.env.GEMINI_API_KEY?.trim();

  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is missing. Add GEMINI_API_KEY to server/.env and restart the server."
    );
  }

  return key;
}

function getFilePath(file) {
  if (!file) return null;

  if (file.path) {
    return path.resolve(file.path);
  }

  if (file.destination && file.filename) {
    return path.resolve(file.destination, file.filename);
  }

  return null;
}

async function fileToBase64(file) {
  if (!file) {
    throw new Error("Uploaded image information is missing.");
  }

  const mime = file.mimetype || "image/jpeg";

  if (!mime.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }

  if (file.buffer) {
    return {
      mimeType: mime,
      data: file.buffer.toString("base64"),
    };
  }

  const filePath = getFilePath(file);

  if (!filePath) {
    throw new Error("Uploaded image path is unavailable.");
  }

  const buffer = await fs.readFile(filePath);

  return {
    mimeType: mime,
    data: buffer.toString("base64"),
  };
}

function extractText(data) {
  if (
    typeof data?.output_text === "string" &&
    data.output_text.trim()
  ) {
    return data.output_text.trim();
  }

  const steps = Array.isArray(data?.steps)
    ? data.steps
    : [];

  const texts = [];

  for (const step of steps) {
    if (step?.type !== "model_output") continue;

    const content = Array.isArray(step.content)
      ? step.content
      : [];

    for (const item of content) {
      if (
        item?.type === "text" &&
        typeof item.text === "string"
      ) {
        texts.push(item.text);
      }
    }
  }

  return texts.join("\n").trim();
}

function parseJson(text) {
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  let cleaned = String(text).trim();

  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (_) {}

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error(
      "Gemini returned an invalid review format. Please try again."
    );
  }

  try {
    return JSON.parse(
      cleaned.slice(start, end + 1)
    );
  } catch (error) {
    console.error(
      "[GEMINI AI REVIEW] JSON parse error:",
      error.message
    );

    console.error(
      "[GEMINI AI REVIEW] Raw response:",
      cleaned
    );

    throw new Error(
      "Gemini review response could not be processed. Please try again."
    );
  }
}

function normalizeResult(result, type) {
  const isPhysique = type === "physique";

  const summary =
    typeof result?.summary === "string" &&
    result.summary.trim()
      ? result.summary.trim()
      : isPhysique
        ? "The uploaded image was reviewed for general visible wellness observations."
        : "The uploaded meal image was reviewed for visible food and meal composition.";

  const observations = Array.isArray(
    result?.observations
  )
    ? result.observations
        .filter(Boolean)
        .map((item) => String(item).trim())
        .filter(Boolean)
        .slice(0, 6)
    : [];

  const suggestions = Array.isArray(
    result?.suggestions
  )
    ? result.suggestions
        .filter(Boolean)
        .map((item) => String(item).trim())
        .filter(Boolean)
        .slice(0, 6)
    : [];

  const disclaimer =
    typeof result?.disclaimer === "string" &&
    result.disclaimer.trim()
      ? result.disclaimer.trim()
      : "AI photo analysis is approximate and is not medical advice. Use recorded wellness measurements for exact values and consult a qualified professional when appropriate.";

  return {
    summary,
    observations,
    suggestions,
    disclaimer,
  };
}

async function generateAiReview({
  type,
  notes = "",
  files = [],
}) {
  console.log("========================================");
  console.log("[GEMINI AI REVIEW] Starting");
  console.log("[GEMINI AI REVIEW] Type:", type);
  console.log(
    "[GEMINI AI REVIEW] Files:",
    files?.length || 0
  );
  console.log(
    "[GEMINI AI REVIEW] Model:",
    MODEL
  );
  console.log("========================================");

  if (!["physique", "diet"].includes(type)) {
    throw new Error(
      "Invalid AI review type. Use 'physique' or 'diet'."
    );
  }

  if (
    !Array.isArray(files) ||
    files.length === 0
  ) {
    throw new Error(
      "Please upload at least one image for AI review."
    );
  }

  const apiKey = getApiKey();

  const selectedFiles = files.slice(0, 4);

  const images = await Promise.all(
    selectedFiles.map((file) =>
      fileToBase64(file)
    )
  );

  console.log(
    "[GEMINI AI REVIEW] Images prepared:",
    images.length
  );

  let focus;

  if (type === "physique") {
    focus = `
Analyze the uploaded physique photo(s) for general,
NON-DIAGNOSTIC wellness observations.

Only discuss things visibly supported by the image.

You may discuss:
- visible posture
- visible symmetry
- exercise presentation
- general progress-photo quality
- visible fitness-related observations

Do NOT:
- diagnose diseases
- estimate exact body-fat percentage
- estimate exact BMI
- estimate exact muscle mass
- estimate medical conditions
- infer mental health
- infer sensitive personal traits
- make claims that cannot be visually supported
`;
  } else {
    focus = `
Analyze the uploaded food/meal photo(s) for general,
NON-DIAGNOSTIC nutrition observations.

You may discuss:
- foods that are visibly identifiable
- general meal composition
- visible protein sources
- visible vegetables/fruits
- visible carbohydrate sources
- general meal balance

Do NOT claim:
- exact calories
- exact macros
- exact serving weight
- exact ingredients when uncertain
- allergies
- diseases
- medical conditions

If food or portion size is uncertain, clearly say so.
Recommend using the Calorie Counter for exact nutrition logging.
`;
  }

  const prompt = `
${focus}

Return ONLY one JSON object.

The JSON must have exactly these keys:

{
  "summary": "short summary",
  "observations": [
    "observation 1",
    "observation 2"
  ],
  "suggestions": [
    "suggestion 1",
    "suggestion 2"
  ],
  "disclaimer": "short disclaimer"
}

Rules:
- Give 2 to 6 observations.
- Give 2 to 6 practical suggestions.
- Do not invent information.
- Do not use diagnostic language.
- Keep the language simple and useful.
- Do not wrap the JSON in markdown.
- Do not add text before or after the JSON.

${
  notes
    ? `User notes (context only, not verified facts):
${String(notes).slice(0, 2000)}`
    : ""
}
`;

  const input = [];

  // Images first
  for (const image of images) {
    input.push({
      type: "image",
      mime_type: image.mimeType,
      data: image.data,
    });
  }

  // Prompt after images
  input.push({
    type: "text",
    text: prompt,
  });

  let response;

  try {
    response = await fetch(
      GEMINI_URL,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },

        body: JSON.stringify({
          model: MODEL,
          input,
        }),
      }
    );
  } catch (error) {
    console.error(
      "========================================"
    );

    console.error(
      "[GEMINI AI REVIEW] NETWORK ERROR"
    );

    console.error(
      "Name:",
      error?.name
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Cause:",
      error?.cause
    );

    console.error(
      "Stack:",
      error?.stack
    );

    console.error(
      "========================================"
    );

    throw new Error(
      `Gemini connection failed: ${
        error?.message ||
        "Unknown network error"
      }`
    );
  }

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    console.error(
      "[GEMINI AI REVIEW] API ERROR:"
    );

    console.error(
      JSON.stringify(
        data,
        null,
        2
      )
    );

    const apiMessage =
      data?.error?.message ||
      data?.message ||
      `Gemini request failed with status ${response.status}.`;

    throw new Error(apiMessage);
  }

  const text = extractText(data);

  console.log(
    "[GEMINI AI REVIEW] Response received:",
    Boolean(text)
  );

  if (!text) {
    console.error(
      "[GEMINI AI REVIEW] Full response:"
    );

    console.error(
      JSON.stringify(
        data,
        null,
        2
      )
    );

    throw new Error(
      "Gemini returned no review. Please try again."
    );
  }

  const parsed = parseJson(text);

  const result = normalizeResult(
    parsed,
    type
  );

  console.log(
    "[GEMINI AI REVIEW] Completed successfully."
  );

  return result;
}

module.exports = {
  generateAiReview,
};