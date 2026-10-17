import {buildingFences} from './content.js';
import {cornerCover} from './cornerCover.js';
import {collatz} from './collatz.js';
export const problems = [buildingFences,cornerCover,collatz];
export const problemById = id => problems.find(problem=>problem.problemId===id);
