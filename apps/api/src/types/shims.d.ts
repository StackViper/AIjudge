declare module "pdf-parse" {
  interface PdfParseResult {
    text: string;
    [key: string]: unknown;
  }
  function pdf(input: Buffer | ArrayBuffer | Uint8Array): Promise<PdfParseResult>;
  export default pdf;
}

declare module "uuid" {
  export function v4(): string;
}
