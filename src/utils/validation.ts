export function validateEmpty(value: string): Boolean {
  if (value === undefined || value === null || value === "") {
    return true;
  }
  return false;
}
