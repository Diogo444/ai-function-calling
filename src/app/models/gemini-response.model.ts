export interface GeminiAction {
  id: string;
  name: string;
  arguments: unknown;
}
export interface GeminiTurn {
  message: string;
  actions: GeminiAction[];
  interactionId: string;
}
export interface GeminiResponse { response: GeminiTurn }
