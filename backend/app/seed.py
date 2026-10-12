from datetime import datetime
from sqlalchemy.orm import Session
from .models import Question


SEED_QUESTIONS = [

    # ═══════════════════════════════════════════════════════════
    # ROUND 1 — Bug Finding & Fixing (C / C++)
    # ═══════════════════════════════════════════════════════════

    {
        "round": 1, "order": 1, "language": "c", "points": 20,
        "title": "Array Sum Off-By-One",
        "description": "The function below should return the sum of all elements in the array of size n. Fix the bug.",
        "code_template": """\
#include <stdio.h>

int arraySum(int arr[], int n) {
    int sum = 0;
    for (int i = 0; i <= n; i++) {  // BUG: off-by-one
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
        "title": "Factorial Null Pointer",
        "description": "Fix the recursive factorial function below. It crashes for n=0.",
        "code_template": """\
#include <iostream>
using namespace std;

int factorial(int n) {
    if (n == 1) return 1;  // BUG: should handle n == 0
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

    {
        "round": 1, "order": 3, "language": "c", "points": 20,
        "title": "String Reverse Wrong Index",
        "description": "The code below tries to reverse a string in-place. Fix the bug so it correctly reverses the input.",
        "code_template": """\
#include <stdio.h>
#include <string.h>

void reverseStr(char s[], int len) {
    for (int i = 0; i < len; i++) {   // BUG: should stop at len/2
        char tmp = s[i];
        s[i] = s[len - 1 - i];
        s[len - 1 - i] = tmp;
    }
}

int main() {
    char s[200];
    scanf("%s", s);
    reverseStr(s, strlen(s));
    printf("%s\\n", s);
    return 0;
}""",
        "test_cases": [
            {"input": "hello\n", "expected_output": "olleh", "is_hidden": False},
            {"input": "abcde\n", "expected_output": "edcba", "is_hidden": True},
        ],
    },

    # ═══════════════════════════════════════════════════════════
    # ROUND 2 — Guess the Output (MCQ: C & Python)
    # ═══════════════════════════════════════════════════════════

    {
        "round": 2, "order": 1, "language": "c", "points": 10,
        "title": "C Pre/Post Increment Puzzle",
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
        "round": 2, "order": 2, "language": "python", "points": 10,
        "title": "Python Mutable Default Argument",
        "description": "What does this Python code print?",
        "code_template": """\
def add(val, lst=[]):
    lst.append(val)
    return lst

print(add(1))
print(add(2))""",
        "mcq_options": ["[1]\n[2]", "[1]\n[1, 2]", "[1, 2]\n[1, 2]", "Error"],
        "correct_option_index": 1,
        "test_cases": None,
    },

    {
        "round": 2, "order": 3, "language": "python", "points": 10,
        "title": "Python List Slicing",
        "description": "What is the output of the following Python snippet?",
        "code_template": """\
a = [1, 2, 3, 4, 5]
print(a[1:4:2])""",
        "mcq_options": ["[2, 4]", "[2, 3, 4]", "[1, 3, 5]", "[2, 4, 5]"],
        "correct_option_index": 0,
        "test_cases": None,
    },

    {
        "round": 2, "order": 4, "language": "c", "points": 10,
        "title": "C Integer Division",
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

    # ═══════════════════════════════════════════════════════════
    # ROUND 3 — Reverse Coding (C / C++ / Python)
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
        "code_template": "# Write your solution in C, C++, or Python\n",
        "test_cases": [
            {"input": "3\n", "expected_output": "1\n1 2\n1 2 3", "is_hidden": False},
            {"input": "1\n", "expected_output": "1", "is_hidden": False},
            {"input": "5\n", "expected_output": "1\n1 2\n1 2 3\n1 2 3 4\n1 2 3 4 5", "is_hidden": True},
        ],
    },

    {
        "round": 3, "order": 2, "language": "python", "points": 30,
        "title": "Sum of Digits",
        "description": """\
Given a positive integer N, compute the sum of its digits.

Sample:
Input: 1234
Output: 10

Input: 99
Output: 18""",
        "code_template": "# Write your solution in C, C++, or Python\n",
        "test_cases": [
            {"input": "1234\n", "expected_output": "10", "is_hidden": False},
            {"input": "99\n", "expected_output": "18", "is_hidden": False},
            {"input": "1000\n", "expected_output": "1", "is_hidden": True},
            {"input": "9999\n", "expected_output": "36", "is_hidden": True},
        ],
    },

    {
        "round": 3, "order": 3, "language": "python", "points": 30,
        "title": "Palindrome Check",
        "description": """\
Given a string, print YES if it is a palindrome, otherwise print NO.
Ignore case.

Sample:
Input: racecar
Output: YES

Input: hello
Output: NO""",
        "code_template": "# Write your solution in C, C++, or Python\n",
        "test_cases": [
            {"input": "racecar\n", "expected_output": "YES", "is_hidden": False},
            {"input": "hello\n", "expected_output": "NO", "is_hidden": False},
            {"input": "Madam\n", "expected_output": "YES", "is_hidden": True},
            {"input": "OpenAI\n", "expected_output": "NO", "is_hidden": True},
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
