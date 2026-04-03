"use client";

import { useState, type ReactNode } from "react";

import type { DiagramSuccessResponse } from "@/lib/diagram-types";

import styles from "./result-panel.module.css";

type ResultPanelProps = {
  result: DiagramSuccessResponse;
  jsonViewer: ReactNode;
  onReset: () => void;
};

export function ResultPanel({ result, jsonViewer, onReset }: ResultPanelProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const editorUrl =
    typeof result.diagram === "object" &&
    result.diagram !== null &&
    "editorUrl" in result.diagram &&
    typeof result.diagram.editorUrl === "string"
      ? result.diagram.editorUrl
      : null;

  async function handleCopyXml() {
    try {
      await navigator.clipboard.writeText(result.xml);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }

    window.setTimeout(() => {
      setCopyStatus("idle");
    }, 2200);
  }

  const diagramType = Array.isArray(result.diagram)
    ? "array"
    : result.diagram === null
      ? "null"
      : typeof result.diagram;

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Generation complete</p>
          <h2 className={styles.title}>Diagram Result</h2>
          <p className={styles.meta}>
            Diagram payload type: <strong>{diagramType}</strong> · XML size:{" "}
            <strong>{result.xml.length.toLocaleString()} chars</strong>
          </p>
        </div>

        <div className={styles.actions}>
          {editorUrl ? (
            <a
              className={styles.secondaryButton}
              href={editorUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open in draw.io
            </a>
          ) : null}
          <button className={styles.secondaryButton} type="button" onClick={onReset}>
            Reset
          </button>
          <button className={styles.primaryButton} type="button" onClick={handleCopyXml}>
            Copy XML
          </button>
        </div>
      </div>

      <div className={styles.copyStatus} aria-live="polite">
        {copyStatus === "copied" ? "XML copied to clipboard." : null}
        {copyStatus === "failed" ? "Could not copy XML. Try again." : null}
      </div>

      <div className={styles.viewerBlock}>
        <div className={styles.viewerHeader}>
          <h3>Diagram Viewer</h3>
          <span>Formatted backend response</span>
        </div>
        {jsonViewer}
      </div>

      <details className={styles.xmlDetails}>
        <summary>View generated XML</summary>
        <pre className={styles.xmlViewer}>
          <code>{result.xml}</code>
        </pre>
      </details>
    </section>
  );
}
