export interface GeminiAction {
  id: string;
  type: 'function_call';
  name: string;
  arguments: {
    couleur: string;
  };
}

export interface GeminiResult {
  message: string;
  action: GeminiAction | null;
}

export interface GeminiResponse {
  response: GeminiResult;
}
