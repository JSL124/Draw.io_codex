import express from "express";

import { loadBackendEnv } from "./env.js";
import { createDiagram } from "./mcpClient.js";
import { generateDrawioXml } from "./openai.js";

loadBackendEnv();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/generate-diagram", async (request, response) => {
  const { prompt } = request.body ?? {};

  if (typeof prompt !== "string" || !prompt.trim()) {
    console.error("[input] Invalid prompt payload received.", {
      body: request.body
    });

    return response.status(400).json({
      success: false,
      error: "The request body must include a non-empty 'prompt' string."
    });
  }

  try {
    const xml = await generateDrawioXml(prompt.trim());
    const diagram = await createDiagram(xml);

    return response.json({
      success: true,
      xml,
      diagram
    });
  } catch (error) {
    const stage = error?.stage || "internal";
    const statusCode = stage === "openai" || stage === "mcp" ? 502 : 500;

    console.error(`[${stage}] Failed to generate diagram.`, {
      message: error?.message,
      status: error?.status,
      details: error?.details
    });

    return response.status(statusCode).json({
      success: false,
      error: error?.message || "Unexpected internal server error.",
      details: error?.details
    });
  }
});

app.use((error, _request, response, _next) => {
  console.error("[internal] Unhandled Express error.", {
    message: error?.message,
    stack: error?.stack
  });

  response.status(500).json({
    success: false,
    error: "Unexpected internal server error."
  });
});

app.listen(port, () => {
  console.log(`Diagram backend listening on http://localhost:${port}`);
});
