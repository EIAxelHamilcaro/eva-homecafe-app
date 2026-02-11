export function extractTokenFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const queryToken = urlObj.searchParams.get("token");
    if (queryToken) return queryToken;
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    const lastSegment = pathParts[pathParts.length - 1];
    if (lastSegment && lastSegment.length >= 20) return lastSegment;
    return null;
  } catch {
    const trimmed = url.trim();
    if (trimmed.length >= 20 && trimmed.length <= 50) return trimmed;
    return null;
  }
}

export function extractTokenFromInput(input: string): string {
  const trimmed = input.trim();
  if (trimmed.includes("://") || trimmed.startsWith("http")) {
    const token = extractTokenFromUrl(trimmed);
    if (token) return token;
    const parts = trimmed.split("/");
    const last = parts[parts.length - 1];
    if (last && last.length >= 20) return last;
  }
  return trimmed;
}
