import {buildingFences} from './content.js';
import {cornerCover} from './cornerCover.js';
export const problems = [buildingFences,cornerCover];
export const problemById = id => problems.find(problem=>problem.problemId===id);
