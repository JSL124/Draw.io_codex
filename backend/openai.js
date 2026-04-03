const OPENAI_API_URL = "https://api.openai.com/v1/responses";

function stripCodeFences(value) {
  return value
    .replace(/^```(?:xml)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function validateDrawioXml(xml) {
  if (!xml || typeof xml !== "string") {
    return "OpenAI returned an empty XML response.";
  }

  if (!xml.includes("<mxGraphModel")) {
    return "OpenAI response is missing <mxGraphModel.";
  }

  if (!xml.includes("</mxGraphModel>")) {
    return "OpenAI response is missing </mxGraphModel>.";
  }

  return null;
}

function extractOutputText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  const chunks = [];

  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string" && content.text.trim()) {
        chunks.push(content.text);
      }
    }
  }

  return chunks.join("\n").trim();
}

async function requestXml(prompt, attempt) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  if (!apiKey) {
    const error = new Error("Missing OPENAI_API_KEY environment variable.");
    error.stage = "openai";
    throw error;
  }

  const instructions = [
    "You are an expert in draw.io XML generation.",
    "Generate a valid mxGraphModel XML for the following system.",
    "Use proper nodes, edges, and layout.",
    "Do NOT include explanations. Output ONLY XML."
  ].join(" ");

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: instructions }]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Diagram description: ${prompt}\nReturn only mxGraphModel XML.`
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const rawBody = await response.text();
    const error = new Error(`OpenAI API request failed with status ${response.status}.`);
    error.stage = "openai";
    error.status = response.status;
    error.details = rawBody;
    throw error;
  }

  const payload = await response.json();
  const xml = stripCodeFences(extractOutputText(payload));
  const validationError = validateDrawioXml(xml);

  if (validationError) {
    const error = new Error(
      `${validationError} Attempt ${attempt} of 2 returned invalid XML.`
    );
    error.stage = "xml_validation";
    error.details = { attempt, xml };
    throw error;
  }

  return xml;
}

export async function generateDrawioXml(prompt) {
  let lastError;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return await requestXml(prompt, attempt);
    } catch (error) {
      lastError = error;

      if (error.stage !== "xml_validation" || attempt === 2) {
        throw error;
      }

      console.error("[xml_validation] Retrying after invalid XML response.", {
        attempt,
        message: error.message
      });
    }
  }

  throw lastError;
}
