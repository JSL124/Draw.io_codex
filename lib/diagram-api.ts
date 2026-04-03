import type {
  DiagramErrorResponse,
  DiagramRequest,
  DiagramResponse
} from "@/lib/diagram-types";

export async function requestDiagramGeneration(
  payload: DiagramRequest
): Promise<DiagramResponse> {
  try {
    const response = await fetch("/api/generate-diagram", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = (await response.json()) as DiagramResponse;

    if (!response.ok) {
      return {
        success: false,
        error:
          "error" in data && typeof data.error === "string"
            ? data.error
            : "Something went wrong while generating the diagram.",
        details: "details" in data ? data.details : undefined
      } satisfies DiagramErrorResponse;
    }

    return data;
  } catch {
    return {
      success: false,
      error:
        "Unable to connect to the frontend API route. Check that the Next.js app is running and try again."
    };
  }
}
