// Week 3 revisits only the core skills taught in Weeks 1 and 2.
// Full reference programs live in test fixtures, never in this student bundle.
export const curriculum = "weeks-1-2-practice-v1";
export const levels = [
  "Pre-Bronze",
  "Bronze",
  "Silver",
  "Gold"
];
export const stages = [
  {
    "id": "ready",
    "label": "Return & goal",
    "time": "0–2",
    "title": "Familiar skills, new scenarios"
  },
  {
    "id": "donow",
    "label": "Do Now",
    "time": "2–8",
    "title": "Make a club sign"
  },
  {
    "id": "focus",
    "label": "Types of Learning",
    "time": "8–10",
    "title": "Choose your focus"
  },
  {
    "id": "formats",
    "label": "Week 1 reminder",
    "time": "10–14",
    "title": "Input, calculate, output"
  },
  {
    "id": "main1",
    "label": "Main Task 1",
    "time": "14–27",
    "title": "Week 1 programming challenges"
  },
  {
    "id": "pitstop1",
    "label": "Learning Pit Stop 1",
    "time": "27–30",
    "title": "Explain one test"
  },
  {
    "id": "condition",
    "label": "Week 2 reminder",
    "time": "30–35",
    "title": "One item, count or total?"
  },
  {
    "id": "main2",
    "label": "Main Task 2",
    "time": "35–50",
    "title": "Week 2 programming challenges"
  },
  {
    "id": "pitstop2",
    "label": "Learning Pit Stop 2",
    "time": "50–54",
    "title": "Explain one loop"
  },
  {
    "id": "plenary",
    "label": "Plenary & save",
    "time": "54–60",
    "title": "One fresh program and your report"
  }
];
export const main1 = [
  {
    "id": "rev-w1-1",
    "group": "main1",
    "level": "Pre-Bronze",
    "title": "Festival welcome",
    "skills": "Week 1 · input, variables and print",
    "scenario": "The school festival needs a screen that welcomes each visitor by name.",
    "learn": "The school festival needs a screen that welcomes each visitor by name.",
    "goal": "Read one name. Print Welcome followed by one space and that name.",
    "inputHelp": "One line: a visitor name (1–30 letters or spaces).",
    "sampleInput": "Aisha\n",
    "sampleOutput": "Welcome Aisha",
    "sampleExplanation": "The input name Aisha appears after Welcome. A different name must change the message.",
    "starter": "# Read the visitor name.\n# Display the welcome message.\n",
    "hints": [
      "Store the answer from input() in a variable.",
      "Use the variable when you print the message. Check the capital W and the space."
    ],
    "kind": "code",
    "check": "w3-rev-w1-1",
    "needsInput": true,
    "tests": [
      {
        "input": "Aisha\n",
        "expected": "Welcome Aisha"
      },
      {
        "input": "Ben\n",
        "expected": "Welcome Ben"
      },
      {
        "input": "Mei Lin\n",
        "expected": "Welcome Mei Lin"
      }
    ],
    "teacher": "Ask the learner to explain one calculation and test different data."
  },
  {
    "id": "rev-w1-2",
    "group": "main1",
    "level": "Bronze",
    "title": "Juice stall",
    "skills": "Week 1 · integer input and multiplication",
    "scenario": "A stall sells every juice carton at the same price. Help a helper work out one order.",
    "learn": "A stall sells every juice carton at the same price. Help a helper work out one order.",
    "goal": "Read the number of cartons and the price of one carton. Print the total cost as a whole number.",
    "inputHelp": "Line 1: carton count (0–100). Line 2: price per carton in RM (1–20).",
    "sampleInput": "4\n3\n",
    "sampleOutput": "12",
    "sampleExplanation": "4 cartons at RM3 each cost RM12. Print 12, without RM or extra words.",
    "starter": "# Read the carton count and price.\n# Calculate and print the cost.\n",
    "hints": [
      "Convert each number using int(input()).",
      "Ask yourself which calculation finds the cost of several equal-price items."
    ],
    "kind": "code",
    "check": "w3-rev-w1-2",
    "needsInput": true,
    "tests": [
      {
        "input": "4\n3\n",
        "expected": "12"
      },
      {
        "input": "2\n5\n",
        "expected": "10"
      },
      {
        "input": "0\n4\n",
        "expected": "0"
      },
      {
        "input": "1\n8\n",
        "expected": "8"
      }
    ],
    "teacher": "Ask the learner to explain one calculation and test different data."
  },
  {
    "id": "rev-w1-3",
    "group": "main1",
    "level": "Bronze",
    "title": "Game tokens",
    "skills": "Week 1 · multiplication and subtraction",
    "scenario": "A visitor buys several game tokens, then wants to know how much money is left.",
    "learn": "A visitor buys several game tokens, then wants to know how much money is left.",
    "goal": "Read starting money, token count and token price. Print the money left after buying the tokens.",
    "inputHelp": "Three lines: starting RM (0–500), token count (0–50), price per token (1–10). There is always enough money.",
    "sampleInput": "20\n3\n4\n",
    "sampleOutput": "8",
    "sampleExplanation": "3 tokens cost RM12. Starting with RM20 leaves RM8.",
    "starter": "# Read the three whole numbers.\n# Work out the cost, then the money left.\n# Print the money left.\n",
    "hints": [
      "Keep each input in a different variable.",
      "First find the total token cost. Then subtract it from the starting money."
    ],
    "kind": "code",
    "check": "w3-rev-w1-3",
    "needsInput": true,
    "tests": [
      {
        "input": "20\n3\n4\n",
        "expected": "8"
      },
      {
        "input": "12\n3\n4\n",
        "expected": "0"
      },
      {
        "input": "7\n0\n3\n",
        "expected": "7"
      },
      {
        "input": "40\n2\n5\n",
        "expected": "30"
      }
    ],
    "teacher": "Ask the learner to explain one calculation and test different data."
  },
  {
    "id": "rev-w1-4",
    "group": "main1",
    "level": "Silver",
    "title": "Sponsored walk",
    "skills": "Week 1 · a calculation with three inputs",
    "scenario": "A sponsor pays for every completed lap and adds a fixed donation at the end.",
    "learn": "A sponsor pays for every completed lap and adds a fixed donation at the end.",
    "goal": "Read completed laps, donation per lap and the extra donation. Print the total raised.",
    "inputHelp": "Three lines: laps (0–100), RM per lap (1–50), extra RM (0–500).",
    "sampleInput": "6\n4\n10\n",
    "sampleOutput": "34",
    "sampleExplanation": "The laps raise RM24. Adding the RM10 donation gives RM34.",
    "starter": "# Read the three inputs.\n# Work out the total raised.\n# Print one whole number.\n",
    "hints": [
      "Separate the amount earned from laps from the fixed donation.",
      "The extra donation is added once."
    ],
    "kind": "code",
    "check": "w3-rev-w1-4",
    "needsInput": true,
    "tests": [
      {
        "input": "6\n4\n10\n",
        "expected": "34"
      },
      {
        "input": "0\n5\n8\n",
        "expected": "8"
      },
      {
        "input": "3\n2\n0\n",
        "expected": "6"
      },
      {
        "input": "10\n3\n5\n",
        "expected": "35"
      }
    ],
    "teacher": "Ask the learner to explain one calculation and test different data.",
    "stretch": true
  },
  {
    "id": "rev-w1-5",
    "group": "main1",
    "level": "Silver",
    "title": "Picnic budget",
    "skills": "Week 1 · several variables and two outputs",
    "scenario": "Children and adults buy different picnic packs. The organiser needs the total cost and the money left.",
    "learn": "Children and adults buy different picnic packs. The organiser needs the total cost and the money left.",
    "goal": "Read all five values. Print the total cost on line 1, then the money left on line 2.",
    "inputHelp": "Five lines: child count, adult count, child-pack price, adult-pack price, budget. Counts are 0–100, prices RM1–50 and budget RM0–10000. The budget covers the cost.",
    "sampleInput": "4\n2\n3\n5\n30\n",
    "sampleOutput": "22\n8",
    "sampleExplanation": "Child packs cost RM12 and adult packs cost RM10. The total is RM22, leaving RM8.",
    "starter": "# Read counts, prices and budget.\n# Find each group’s cost.\n# Print total cost, then money left.\n",
    "hints": [
      "Calculate the two group costs separately.",
      "Print exactly two lines, in the requested order."
    ],
    "kind": "code",
    "check": "w3-rev-w1-5",
    "needsInput": true,
    "tests": [
      {
        "input": "4\n2\n3\n5\n30\n",
        "expected": "22\n8"
      },
      {
        "input": "0\n2\n3\n5\n10\n",
        "expected": "10\n0"
      },
      {
        "input": "1\n0\n4\n7\n9\n",
        "expected": "4\n5"
      },
      {
        "input": "0\n0\n2\n3\n6\n",
        "expected": "0\n6"
      }
    ],
    "teacher": "Ask the learner to explain one calculation and test different data.",
    "stretch": true
  }
];
export const main2 = [
  {
    "id": "rev-w2-1",
    "group": "main2",
    "level": "Pre-Bronze",
    "title": "Club name badges",
    "skills": "Week 2 · lists and for loops",
    "scenario": "The club needs one badge for every name on its list. Two people may have the same name.",
    "learn": "The club needs one badge for every name on its list. Two people may have the same name.",
    "goal": "Use a for loop to print every name in visitorNames on its own line, in the same order.",
    "inputHelp": "No typed input. The supplied list contains 1–20 names. Keep its variable name so the checker can try other lists.",
    "sampleInput": "",
    "sampleOutput": "Mia\nSam\nZara",
    "sampleExplanation": "There are three names, so the program prints three lines.",
    "starter": "visitorNames = [\"Mia\", \"Sam\", \"Zara\"]\n\n# Write your loop below.\n",
    "hints": [
      "A loop visits one item at a time.",
      "Print the current name inside the loop."
    ],
    "kind": "code",
    "check": "w3-rev-w2-1",
    "needsInput": false,
    "tests": [
      {
        "input": "",
        "expected": "Mia\nSam\nZara",
        "data": [
          "Mia",
          "Sam",
          "Zara"
        ]
      },
      {
        "input": "",
        "expected": "Kai\nKai",
        "data": [
          "Kai",
          "Kai"
        ]
      },
      {
        "input": "",
        "expected": "Lea",
        "data": [
          "Lea"
        ]
      }
    ],
    "teacher": "Ask the learner to explain one calculation and test different data.",
    "dataName": "visitorNames",
    "requireLoop": true,
    "dataDisplay": "visitorNames = [\"Mia\", \"Sam\", \"Zara\"]"
  },
  {
    "id": "rev-w2-2",
    "group": "main2",
    "level": "Bronze",
    "title": "Ribbon packs",
    "skills": "Week 2 · calculate for every list item",
    "scenario": "Each ribbon pack contains 3 ribbons. A helper lists how many packs each class ordered.",
    "learn": "Each ribbon pack contains 3 ribbons. A helper lists how many packs each class ordered.",
    "goal": "Use a for loop. For each value in packCounts, print the number of ribbons for that class on its own line.",
    "inputHelp": "No typed input. packCounts contains 1–20 whole numbers from 0–50. Each pack always has 3 ribbons.",
    "sampleInput": "",
    "sampleOutput": "6\n0\n12",
    "sampleExplanation": "The orders are 2, 0 and 4 packs. They need 6, 0 and 12 ribbons.",
    "starter": "packCounts = [2, 0, 4]\n\n# Calculate and print each class’s ribbons.\n",
    "hints": [
      "Use the current item, rather than the entire list, in your calculation.",
      "Both the calculation and its output should happen for every class."
    ],
    "kind": "code",
    "check": "w3-rev-w2-2",
    "needsInput": false,
    "tests": [
      {
        "input": "",
        "expected": "6\n0\n12",
        "data": [
          2,
          0,
          4
        ]
      },
      {
        "input": "",
        "expected": "3\n3",
        "data": [
          1,
          1
        ]
      },
      {
        "input": "",
        "expected": "0",
        "data": [
          0
        ]
      },
      {
        "input": "",
        "expected": "15\n9",
        "data": [
          5,
          3
        ]
      }
    ],
    "teacher": "Ask the learner to explain one calculation and test different data.",
    "dataName": "packCounts",
    "requireLoop": true,
    "dataDisplay": "packCounts = [2, 0, 4]"
  },
  {
    "id": "rev-w2-3",
    "group": "main2",
    "level": "Bronze",
    "title": "Library returns",
    "skills": "Week 2 · a running total",
    "scenario": "The librarian records how many books each class returned. Find the number of books returned altogether.",
    "learn": "The librarian records how many books each class returned. Find the number of books returned altogether.",
    "goal": "Use a for loop to add every number in returnedBooks. Print the final total once.",
    "inputHelp": "No typed input. returnedBooks contains 1–20 whole numbers from 0–100.",
    "sampleInput": "",
    "sampleOutput": "11",
    "sampleExplanation": "The classes returned 4, 0, 5 and 2 books. Altogether that is 11 books.",
    "starter": "returnedBooks = [4, 0, 5, 2]\n\n# Build a running total.\n# Print the final total.\n",
    "hints": [
      "Start the total before the loop so it can remember earlier classes.",
      "Add the current item each time. Display the final total after the loop."
    ],
    "kind": "code",
    "check": "w3-rev-w2-3",
    "needsInput": false,
    "tests": [
      {
        "input": "",
        "expected": "11",
        "data": [
          4,
          0,
          5,
          2
        ]
      },
      {
        "input": "",
        "expected": "0",
        "data": [
          0,
          0
        ]
      },
      {
        "input": "",
        "expected": "7",
        "data": [
          7
        ]
      },
      {
        "input": "",
        "expected": "6",
        "data": [
          1,
          2,
          3
        ]
      }
    ],
    "teacher": "Ask the learner to explain one calculation and test different data.",
    "dataName": "returnedBooks",
    "requireLoop": true,
    "dataDisplay": "returnedBooks = [4, 0, 5, 2]"
  },
  {
    "id": "rev-w2-4",
    "group": "main2",
    "level": "Silver",
    "title": "Food bank boxes",
    "skills": "Week 2 · counting and totalling",
    "scenario": "Each number tells you how many cans are inside one box. The food bank needs both the number of boxes and the number of cans. Empty boxes still count.",
    "learn": "Each number tells you how many cans are inside one box. The food bank needs both the number of boxes and the number of cans. Empty boxes still count.",
    "goal": "Use a for loop. Print the number of boxes on line 1 and the total number of cans on line 2.",
    "inputHelp": "No typed input. canCounts contains 1–20 whole numbers from 0–100.",
    "sampleInput": "",
    "sampleOutput": "4\n10",
    "sampleExplanation": "The four boxes contain 3, 0, 5 and 2 cans. There are 4 boxes and 10 cans.",
    "starter": "canCounts = [3, 0, 5, 2]\n\n# Keep a box count and a can total.\n# Print both results in the requested order.\n",
    "hints": [
      "Use separate variables for boxes and cans.",
      "A counter adds 1 for each box. A total adds the number inside that box."
    ],
    "kind": "code",
    "check": "w3-rev-w2-4",
    "needsInput": false,
    "tests": [
      {
        "input": "",
        "expected": "4\n10",
        "data": [
          3,
          0,
          5,
          2
        ]
      },
      {
        "input": "",
        "expected": "2\n0",
        "data": [
          0,
          0
        ]
      },
      {
        "input": "",
        "expected": "1\n8",
        "data": [
          8
        ]
      },
      {
        "input": "",
        "expected": "3\n6",
        "data": [
          2,
          2,
          2
        ]
      }
    ],
    "teacher": "Ask the learner to explain one calculation and test different data.",
    "dataName": "canCounts",
    "requireLoop": true,
    "dataDisplay": "canCounts = [3, 0, 5, 2]",
    "stretch": true
  },
  {
    "id": "rev-w2-5",
    "group": "main2",
    "level": "Gold",
    "title": "Festival delivery bill",
    "skills": "Weeks 1 + 2 · input, a loop and a running total",
    "scenario": "Each group orders some activity packs. Every pack has the same price. One delivery fee covers the whole order, including an order of zero packs.",
    "learn": "Each group orders some activity packs. Every pack has the same price. One delivery fee covers the whole order, including an order of zero packs.",
    "goal": "Read the pack price and delivery fee. Use a for loop to total orderQuantities. Print total packs on line 1 and the full bill on line 2.",
    "inputHelp": "Line 1: price per pack (RM1–50). Line 2: delivery fee (RM0–30). orderQuantities already contains 1–20 group orders, each 0–50 packs.",
    "sampleInput": "4\n5\n",
    "sampleOutput": "6\n29",
    "sampleExplanation": "The groups order 2 + 0 + 3 + 1 = 6 packs. At RM4 each they cost RM24. One RM5 delivery fee makes RM29.",
    "starter": "orderQuantities = [2, 0, 3, 1]\n\n# Read the pack price and delivery fee.\n# Total the packs using a loop.\n# Work out the bill and print both results.\n",
    "hints": [
      "Finish counting the packs before calculating the full bill.",
      "The delivery fee belongs to the whole order. Add it once."
    ],
    "kind": "code",
    "check": "w3-rev-w2-5",
    "needsInput": true,
    "tests": [
      {
        "input": "4\n5\n",
        "expected": "6\n29",
        "data": [
          2,
          0,
          3,
          1
        ]
      },
      {
        "input": "2\n0\n",
        "expected": "4\n8",
        "data": [
          1,
          3
        ]
      },
      {
        "input": "7\n3\n",
        "expected": "0\n3",
        "data": [
          0,
          0
        ]
      },
      {
        "input": "5\n2\n",
        "expected": "1\n7",
        "data": [
          1
        ]
      }
    ],
    "teacher": "Ask the learner to explain one calculation and test different data.",
    "dataName": "orderQuantities",
    "requireLoop": true,
    "dataDisplay": "orderQuantities = [2, 0, 3, 1]",
    "stretch": true
  }
];
export const warmups = [
  {
    "id": "rev-warmup",
    "group": "donow",
    "level": null,
    "title": "My club sign",
    "skills": "Week 1 · a variable and print",
    "scenario": "The club needs a sign with its name on it.",
    "learn": "The club needs a sign with its name on it.",
    "goal": "Store the text Code Club in a variable. Print the value of that variable.",
    "inputHelp": "No typed input.",
    "sampleInput": "",
    "sampleOutput": "Code Club",
    "sampleExplanation": "The screen should show the two words on one line.",
    "starter": "# Store the club name in a variable.\n# Print its value.\n",
    "hints": [
      "Words need quotation marks when you store them. Use the variable name when you print."
    ],
    "kind": "code",
    "check": "w3-rev-warmup",
    "needsInput": false,
    "tests": [
      {
        "input": "",
        "expected": "Code Club"
      }
    ],
    "teacher": "Ask the learner to explain one calculation and test different data."
  }
];
export const plenary = {
  "id": "rev-exit",
  "group": "plenary",
  "level": null,
  "title": "Book collection",
  "skills": "Week 2 · an independent total",
  "scenario": "Three classes add books to a shared collection. Work out how many books they donated altogether.",
  "learn": "Three classes add books to a shared collection. Work out how many books they donated altogether.",
  "goal": "Use a for loop to total donatedBooks. Print the total once, then explain one update.",
  "inputHelp": "No typed input. donatedBooks contains 1–20 whole numbers from 0–100.",
  "sampleInput": "",
  "sampleOutput": "5",
  "sampleExplanation": "The sample has 3, 0 and 2 books. Together these make 5.",
  "starter": "donatedBooks = [3, 0, 2]\n\n# Write your own total program.\n",
  "hints": [
    "Keep the total outside the loop until you start adding items."
  ],
  "kind": "code",
  "check": "w3-rev-exit",
  "needsInput": false,
  "tests": [
    {
      "input": "",
      "expected": "5",
      "data": [
        3,
        0,
        2
      ]
    },
    {
      "input": "",
      "expected": "0",
      "data": [
        0,
        0
      ]
    },
    {
      "input": "",
      "expected": "9",
      "data": [
        4,
        1,
        4
      ]
    }
  ],
  "teacher": "Ask the learner to explain one calculation and test different data.",
  "dataName": "donatedBooks",
  "requireLoop": true,
  "dataDisplay": "donatedBooks = [3, 0, 2]"
};
export const challenges = [...main1, ...main2];
export const tasks = [...challenges, ...warmups, plenary];
export const coreChallenges = [...main1.slice(0,3), ...main2.slice(0,3)];
export const taskById = id => tasks.find(t=>t.id===id);
export const checkSpec = task => ({tests:task.tests||[],dataName:task.dataName,requireLoop:!!task.requireLoop});
