export async function createDiagram(xml) {
  const baseUrl = process.env.DRAWIO_MCP_BASE_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/create_diagram`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ xml })
  });

  const rawBody = await response.text();
  let parsedBody = rawBody;

  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    // Keep raw text when MCP does not return JSON.
  }

  if (!response.ok) {
    const error = new Error(`drawio-mcp request failed with status ${response.status}.`);
    error.stage = "mcp";
    error.status = response.status;
    error.details = parsedBody;
    throw error;
  }

  return parsedBody;
}
