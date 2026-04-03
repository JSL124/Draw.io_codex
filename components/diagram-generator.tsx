"use client";

import { useState, type FormEvent } from "react";

import { JsonViewer } from "@/components/json-viewer";
import { ResultPanel } from "@/components/result-panel";
import { requestDiagramGeneration } from "@/lib/diagram-api";
import type { DiagramErrorResponse, DiagramSuccessResponse } from "@/lib/diagram-types";

import styles from "./diagram-generator.module.css";

const EXAMPLE_PROMPTS = [
  "Create a microservices architecture with API gateway, 3 services, and a shared database.",
  "Show a CI/CD pipeline from GitHub to build, test, deploy, and monitoring.",
  "Design an event-driven e-commerce system with order, payment, inventory, and notification services."
];

type ResultState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: DiagramSuccessResponse }
  | { status: "error"; data: DiagramErrorResponse };

export function DiagramGenerator() {
  const [prompt, setPrompt] = useState("");
  const [resultState, setResultState] = useState<ResultState>({ status: "idle" });

  const isLoading = resultState.status === "loading";
  const errorMessage =
    resultState.status === "error" ? resultState.data.error : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setResultState({
        status: "error",
        data: {
          success: false,
          error: "Describe the diagram you want before generating it."
        }
      });
      return;
    }

    setResultState({ status: "loading" });

    const response = await requestDiagramGeneration({ prompt: trimmedPrompt });

    if (response.success) {
      setResultState({ status: "success", data: response });
      return;
    }

    setResultState({ status: "error", data: response });
  }

  function handleReset() {
    setPrompt("");
    setResultState({ status: "idle" });
  }

  function applyExamplePrompt(examplePrompt: string) {
    setPrompt(examplePrompt);

    if (resultState.status === "error") {
      setResultState({ status: "idle" });
    }
  }

  return (
    <main className={styles.pageShell}>
      <aside className={styles.sideRail} aria-label="Highlights">
        <div className={styles.brand}>AI Diagram Generator</div>
        <nav className={styles.navList}>
          <span>Architecture</span>
          <span>Systems</span>
          <span>Flows</span>
          <span>APIs</span>
          <span>Infra</span>
        </nav>
      </aside>

      <section className={styles.content}>
        <div className={styles.hero}>
          <p className={styles.eyebrow}>Next.js frontend for your diagram backend</p>
          <h1 className={styles.title}>AI Diagram Generator</h1>
          <p className={styles.subtitle}>
            Describe a system in plain language and generate a draw.io-ready diagram
            response with formatted JSON and XML output.
          </p>
        </div>

        <form className={styles.promptCard} onSubmit={handleSubmit}>
          <label className={styles.promptLabel} htmlFor="diagram-prompt">
            Diagram prompt
          </label>
          <textarea
            id="diagram-prompt"
            name="prompt"
            className={styles.promptInput}
            placeholder="Create a high-level system architecture with an API gateway, authentication service, billing service, worker queue, and PostgreSQL database."
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={6}
            disabled={isLoading}
          />

          <div className={styles.promptFooter}>
            <div className={styles.exampleList} aria-label="Example prompts">
              {EXAMPLE_PROMPTS.map((examplePrompt) => (
                <button
                  key={examplePrompt}
                  className={styles.exampleChip}
                  type="button"
                  onClick={() => applyExamplePrompt(examplePrompt)}
                  disabled={isLoading}
                >
                  {examplePrompt}
                </button>
              ))}
            </div>

            <div className={styles.actions}>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset
              </button>
              <button className={styles.primaryButton} type="submit" disabled={isLoading}>
                {isLoading ? "Generating..." : "Generate diagram"}
              </button>
            </div>
          </div>
        </form>

        {errorMessage ? (
          <section className={styles.feedbackError} aria-live="polite">
            <strong>Could not generate diagram.</strong>
            <span>{errorMessage}</span>
          </section>
        ) : null}

        {isLoading ? (
          <section className={styles.feedbackLoading} aria-live="polite">
            <span className={styles.loadingDot} />
            <div>
              <strong>Generating diagram</strong>
              <p>The backend is processing your prompt and building the draw.io response.</p>
            </div>
          </section>
        ) : null}

        {resultState.status === "success" ? (
          <ResultPanel
            result={resultState.data}
            jsonViewer={<JsonViewer data={resultState.data.diagram} />}
            onReset={handleReset}
          />
        ) : null}
      </section>
    </main>
  );
}
