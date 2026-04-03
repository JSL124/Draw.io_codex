import styles from "./json-viewer.module.css";

type JsonViewerProps = {
  data: unknown;
};

export function JsonViewer({ data }: JsonViewerProps) {
  const formatted = JSON.stringify(data, null, 2);

  if (!formatted) {
    return <p className={styles.emptyState}>No diagram payload returned.</p>;
  }

  return (
    <pre className={styles.viewer} aria-label="Diagram JSON">
      <code>{formatted}</code>
    </pre>
  );
}
