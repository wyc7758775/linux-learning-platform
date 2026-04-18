import type { ValidationRule } from '../types.js'
import { chapter1Rules } from './chapter1.js'
import { chapter2Rules } from './chapter2.js'
import { chapter3Rules } from './chapter3.js'
import { chapter4Rules } from './chapter4.js'
import { chapter5Rules } from './chapter5.js'
import { chapter6Rules } from './chapter6.js'
import { chapter7Rules } from './chapter7.js'

export const LEVEL_VALIDATIONS: Record<number, ValidationRule> = {
  ...chapter1Rules,
  ...chapter2Rules,
  ...chapter3Rules,
  ...chapter4Rules,
  ...chapter5Rules,
  ...chapter6Rules,
  ...chapter7Rules,
}
