import type { Level } from "./types";
import { chapter1Levels } from "./chapter1";
import { chapter2Levels } from "./chapter2";
import { chapter3Levels } from "./chapter3";
import { chapter4Levels } from "./chapter4";
import { chapter5Levels } from "./chapter5";
import { chapter6Levels } from "./chapter6";
import { chapter7Levels } from "./chapter7";

export type { Level, KnowledgeCard, Progress } from "./types";

export const LEVELS: Level[] = [
  ...chapter1Levels,
  ...chapter2Levels,
  ...chapter3Levels,
  ...chapter4Levels,
  ...chapter5Levels,
  ...chapter6Levels,
  ...chapter7Levels,
];
