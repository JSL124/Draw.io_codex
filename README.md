# AI Diagram Generator

Next.js app that turns a plain-language prompt into draw.io-compatible XML using the OpenAI Responses API, then generates a draw.io editor link you can open directly in the browser.

## How It Works

1. The UI sends a prompt to `POST /api/generate-diagram`.
2. The API route calls OpenAI to generate `mxGraphModel` XML.
3. The XML is compressed into a draw.io `#create=...` URL.
4. The UI shows the XML, raw response payload, and an `Open in draw.io` link.

## Requirements

- Node.js 20+
- An OpenAI API key

## Setup

Create a root `.env.local` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1-mini
DRAWIO_EDITOR_URL=https://app.diagrams.net/
```

Notes:

- `OPENAI_API_KEY` is required.
- `OPENAI_MODEL` is optional. Default is `gpt-4.1-mini`.
- `DRAWIO_EDITOR_URL` is optional. Default is `https://app.diagrams.net/`.

## Run Locally

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Available Scripts

- `npm run dev` starts the Next.js dev server
- `npm run build` builds the app for production
- `npm run start` runs the production build
- `npm run lint` runs ESLint

## Project Structure

```text
app/
  api/generate-diagram/route.ts   Next API route
backend/
  env.js                          Environment loading
  openai.js                       OpenAI Responses API call and XML validation
  mcpClient.js                    draw.io URL generation
components/
  diagram-generator.tsx           Main prompt UI
  result-panel.tsx                XML and result viewer
lib/
  diagram-api.ts                  Client API call helper
  diagram-types.ts                Shared response types
```

## Error Cases

Common failures:

- Missing `OPENAI_API_KEY`
- Invalid or unauthorized OpenAI key
- OpenAI returns non-XML output twice

The API route returns structured JSON errors with `error` and optional `details`.

## Backend Note

There is still an optional Express backend in `backend/server.js`, but the current app does not require it for local usage. The active flow runs directly through the Next.js API route.
