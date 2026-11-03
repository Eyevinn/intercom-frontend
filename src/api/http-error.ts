export type HttpError = Error & { status: number };

export const isHttpError = (e: unknown): e is HttpError =>
  e instanceof Error && typeof (e as { status?: unknown }).status === "number";

export const createHttpError = (message: string, status: number): HttpError =>
  Object.assign(new Error(message), { status });
