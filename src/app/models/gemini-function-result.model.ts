import { GeminiTurn } from './gemini-response.model';
export interface ToolResult {
  callId: string;
  name: string;
  output: { success: boolean; error?: string; [key: string]: unknown };
}
export interface GeminiFunctionResult {
  interactionId: string;
  results: ToolResult[];
}
export interface GeminiFunctionResultResponse { response: GeminiTurn }
