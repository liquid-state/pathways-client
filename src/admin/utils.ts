export const PathwaysError = (message: string): string => `Pathways Error: ${message}`;

export const PathwaysAPIError = (
  message: string,
  response: Response,
): { message: string; response: Response } => ({
  message: `Pathways API Error: ${message}`,
  response,
});
