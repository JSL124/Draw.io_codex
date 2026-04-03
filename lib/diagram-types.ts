export type DiagramRequest = {
  prompt: string;
};

export type DiagramSuccessResponse = {
  success: true;
  xml: string;
  diagram:
    | {
        type?: string;
        editorUrl?: string;
        source?: string;
        [key: string]: unknown;
      }
    | unknown;
};

export type DiagramErrorResponse = {
  success: false;
  error: string;
  details?: unknown;
};

export type DiagramResponse = DiagramSuccessResponse | DiagramErrorResponse;
