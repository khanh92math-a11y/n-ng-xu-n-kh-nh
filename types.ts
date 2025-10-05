
export interface Question {
  question: string;
  answers: string[];
  correctAnswerIndex: number;
}

export enum GameState {
  START,
  LOADING,
  PLAYING,
  GAME_OVER,
  WIN,
}
