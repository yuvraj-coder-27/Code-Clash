from datetime import datetime
from sqlalchemy.orm import Session
from .models import Question


SEED_QUESTIONS = [

    # ═══════════════════════════════════════════════════════════
    # ROUND 1 — Bug Finding & Fixing (C / C++)
    # Only 2 questions. No hints or BUG comments in code.
    # ═══════════════════════════════════════════════════════════

    {
        "round": 1, "order": 1, "language": "c", "points": 20,
        "title": "Array Sum",
        "description": "The function below should return the sum of all elements in the array of size n. Find and fix the error in the code.",
        "code_template": """\
#include <stdio.h>

int arraySum(int arr[], int n) {
    int sum = 0;
    for (int i = 0; i <= n; i++) {
        sum += arr[i];
    }
    return sum;
}

int main() {
    int n;
    scanf("%d", &n);
    int arr[100];
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    printf("%d\\n", arraySum(arr, n));
    return 0;
}""",
        "test_cases": [
            {"input": "5\n1 2 3 4 5\n", "expected_output": "15", "is_hidden": False},
            {"input": "3\n10 20 30\n", "expected_output": "60", "is_hidden": True},
        ],
    },

    {
        "round": 1, "order": 2, "language": "cpp", "points": 20,
        "title": "Factorial Function",
        "description": "The recursive factorial function below is not working correctly for all inputs. Identify the bug and fix it.",
        "code_template": """\
#include <iostream>
using namespace std;

int factorial(int n) {
    if (n == 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    int n;
    cin >> n;
    cout << factorial(n) << endl;
    return 0;
}""",
        "test_cases": [
            {"input": "0\n", "expected_output": "1", "is_hidden": False},
            {"input": "5\n", "expected_output": "120", "is_hidden": False},
            {"input": "1\n", "expected_output": "1", "is_hidden": True},
        ],
    },

    # ═══════════════════════════════════════════════════════════
    # ROUND 2 — Guess the Output (MCQ: C only)
    # Removed all Python questions. Added a new C question.
    # ═══════════════════════════════════════════════════════════

    {
        "round": 2, "order": 1, "language": "c", "points": 10,
        "title": "Pre/Post Increment",
        "description": "What is the output of the following C code?",
        "code_template": """\
#include <stdio.h>
int main() {
    int x = 5;
    printf("%d %d\\n", x++, ++x);
    return 0;
}""",
        "mcq_options": ["5 7", "6 7", "5 6", "6 6"],
        "correct_option_index": 0,
        "test_cases": None,
    },

    {
        "round": 2, "order": 2, "language": "c", "points": 10,
        "title": "Integer Division",
        "description": "What does this C code output?",
        "code_template": """\
#include <stdio.h>
int main() {
    int a = 7, b = 2;
    printf("%.1f\\n", a / b);
    return 0;
}""",
        "mcq_options": ["3.5", "3.0", "0.0", "3"],
        "correct_option_index": 1,
        "test_cases": None,
    },

    {
        "round": 2, "order": 3, "language": "c", "points": 10,
        "title": "Pointer Arithmetic",
        "description": "What is the output of the following C program?",
        "code_template": """\
#include <stdio.h>
int main() {
    int arr[] = {10, 20, 30, 40, 50};
    int *p = arr;
    p += 2;
    printf("%d\\n", *p);
    return 0;
}""",
        "mcq_options": ["10", "20", "30", "40"],
        "correct_option_index": 2,
        "test_cases": None,
    },

    # ═══════════════════════════════════════════════════════════
    # ROUND 3 — Reverse Coding
    # Only 1 question. Starter code with comment to write output.
    # ═══════════════════════════════════════════════════════════

    {
        "round": 3, "order": 1, "language": "python", "points": 30,
        "title": "Number Pattern Printer",
        "description": """\
Given a number N, print the following pattern:
1
1 2
1 2 3
...
1 2 3 ... N

Input: A single integer N.
Output: N lines as shown above.

Sample:
Input: 3
Output:
1
1 2
1 2 3""",
        "code_template": """\
# ─────────────────────────────────────────
# Reverse Coding Challenge
# Read the input below and study the
# sample output shown on the left panel.
# Write your logic to produce the same output.
# ─────────────────────────────────────────

n = int(input())

# Write your output here:
""",
        "test_cases": [
            {"input": "3\n", "expected_output": "1\n1 2\n1 2 3", "is_hidden": False},
            {"input": "1\n", "expected_output": "1", "is_hidden": False},
            {"input": "5\n", "expected_output": "1\n1 2\n1 2 3\n1 2 3 4\n1 2 3 4 5", "is_hidden": True},
        ],
    },
]


def seed_database(db: Session):
    if db.query(Question).count() > 0:
        return  # already seeded

    for q_data in SEED_QUESTIONS:
        q = Question(**q_data)
        db.add(q)

    db.commit()
    print(f"[OK] Seeded {len(SEED_QUESTIONS)} questions into database.")
