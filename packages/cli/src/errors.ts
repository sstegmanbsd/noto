export type NotoErrorCode = "model-not-configured" | "model-not-found";

interface NotoErrorOptions {
  code: NotoErrorCode;
  message?: string;
}

export class NotoError extends Error {
  public code: NotoErrorCode;

  constructor(options: NotoErrorOptions) {
    super(options.message);
    this.code = options.code;

    Object.setPrototypeOf(this, NotoError.prototype);
  }
}
