import {binarySorting} from './binarySorting.js';
import {winningStreak} from './winningStreak.js';
import {binarySortingOutput,winningStreakOutput} from './answerFiles.js';
import {blockBishop} from './blockBishop.js';
export const practiceCourses=[{...binarySorting,track:'code',sourceFolder:'binary-sorting'},binarySortingOutput,winningStreak,winningStreakOutput,blockBishop];
export const practiceCourse=id=>practiceCourses.find(course=>course.problemId===id);
export const practiceTotal=practiceCourses.reduce((n,course)=>n+course.tasks.length,0);
