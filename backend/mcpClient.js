import { deflateRawSync } from "zlib";

function compressDrawioXml(xml) {
  const encodedXml = encodeURIComponent(xml);
  const compressed = deflateRawSync(Buffer.from(encodedXml, "utf8"));

  return compressed.toString("base64");
}

export async function createDiagram(xml) {
  if (!xml || typeof xml !== "string") {
    const error = new Error("Cannot create a draw.io link without XML content.");
    error.stage = "mcp";
    throw error;
  }

  const editorBaseUrl = process.env.DRAWIO_EDITOR_URL || "https://app.diagrams.net/";
  const payload = {
    type: "xml",
    compressed: true,
    data: compressDrawioXml(xml)
  };
  const createHash = encodeURIComponent(JSON.stringify(payload));

  return {
    type: "drawio_link",
    editorUrl: `${editorBaseUrl}?pv=0&grid=1#create=${createHash}`,
    source: "local-url-generator"
  };
}
