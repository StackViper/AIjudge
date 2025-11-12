declare module "pdf-parse" {
  interface PdfParseResult {
    text: string;
    // Allow extra fields without strict typing to keep this lightweight
    [key: string]: unknown;
  }

  function pdf(input: Buffer | ArrayBuffer | Uint8Array): Promise<PdfParseResult>;
  // pdf-parse is CJS; using export = ensures compatibility with NodeNext and esModuleInterop
  export = pdf;
}

declare module "uuid" {
  // Minimal typing for only what's used in this repo
  export function v4(): string;
}
