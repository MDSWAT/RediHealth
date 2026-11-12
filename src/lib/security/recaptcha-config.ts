/** Use the same activation policy for the server verifier and page provider. */
export function isRecaptchaEnabled(): boolean {
  const enabled = process.env.RECAPTCHA_ENABLED?.trim();
  if (enabled === "true") return true;
  if (enabled === "false") return false;
  return process.env.NODE_ENV === "production";
}
