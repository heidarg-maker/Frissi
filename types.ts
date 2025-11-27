export enum ChallengeStatus {
  LOCKED = 'LOCKED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
}

export enum ChallengeType {
  PUZZLE = 'PUZZLE',
  VIDEO = 'VIDEO',
  RIDDLE = 'RIDDLE',
  MAZE = 'MAZE'
}

export interface GameState {
  puzzle: ChallengeStatus;
  riddle: ChallengeStatus;
  maze: ChallengeStatus;
}