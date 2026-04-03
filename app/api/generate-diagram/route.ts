import { NextResponse } from "next/server";

import { loadBackendEnv } from "@/backend/env.js";
import { createDiagram } from "@/backend/mcpClient.js";
import { generateDrawioXml } from "@/backend/openai.js";
import type { DiagramErrorResponse, DiagramRequest, DiagramSuccessResponse } from "@/lib/diagram-types";

export const runtime = "nodejs";

function jsonError(
  error: string,
  status: number,
  details?: unknown
): NextResponse<DiagramErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details === undefined ? {} : { details })
    },
    { status }
  );
}

function isDiagramRequest(value: unknown): value is DiagramRequest {
  return typeof value === "object" && value !== null && "prompt" in value;
}

export async function POST(request: Request) {
  loadBackendEnv();

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  if (!isDiagramRequest(body) || typeof body.prompt !== "string" || !body.prompt.trim()) {
    return jsonError("Please enter a prompt before generating a diagram.", 400);
  }

  try {
    const xml = await generateDrawioXml(body.prompt.trim());
    const diagram = await createDiagram(xml);
    const payload: DiagramSuccessResponse = {
      success: true,
      xml,
      diagram
    };

    return NextResponse.json(payload);
  } catch (error) {
    const stage =
      typeof error === "object" && error !== null && "stage" in error && typeof error.stage === "string"
        ? error.stage
        : "internal";

    const status =
      stage === "openai" || stage === "mcp"
        ? 502
        : stage === "xml_validation"
          ? 500
          : 500;

    return jsonError(
      error instanceof Error ? error.message : "Unexpected internal server error.",
      status,
      typeof error === "object" && error !== null && "details" in error ? error.details : undefined
    );
  }
}
