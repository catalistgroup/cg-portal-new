export function parseUser(str: string) {
  try {
    return JSON.parse(str);
  } catch (error) {
    return null;
  }
}
