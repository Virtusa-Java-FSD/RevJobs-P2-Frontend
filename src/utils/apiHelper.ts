export const safeJsonParse = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  return await safeJsonParse(response);
};