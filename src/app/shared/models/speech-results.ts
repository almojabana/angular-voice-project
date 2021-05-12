/**
 * SpeechResults interface
 * Divides the user's voice input into an action and a predicate for further processing
 */
export interface SpeechResults {
    action: string;
    predicate: string; 
}