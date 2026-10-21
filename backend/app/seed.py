from sqlalchemy.orm import Session
from .models import Question


SEED_QUESTIONS = [

    # ═══════════════════════════════════════════════════════════
    # ROUND 1 — C & C++ (5 MCQs + 5 Debugging)
    # ═══════════════════════════════════════════════════════════

    # --- R1: MCQs (Q1 to Q5) ---
    {
        "round": 1, "order": 1, "question_type": "mcq", "language": "c", "points": 10,
        "title": "Pre/Post Increment Puzzle",
        "description": "What is the output of the following C code snippet?",
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
        "round": 1, "order": 2, "question_type": "mcq", "language": "c", "points": 10,
        "title": "Integer Division in C",
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
        "round": 1, "order": 3, "question_type": "mcq", "language": "c", "points": 10,
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
    {
        "round": 1, "order": 4, "question_type": "mcq", "language": "c", "points": 10,
        "title": "sizeof String Literal",
        "description": "What is printed by this C code?",
        "code_template": """\
#include <stdio.h>
int main() {
    char s[] = "hello";
    printf("%d\\n", (int)sizeof(s));
    return 0;
}""",
        "mcq_options": ["5", "6", "4", "8"],
        "correct_option_index": 1,
        "test_cases": None,
    },
    {
        "round": 1, "order": 5, "question_type": "mcq", "language": "cpp", "points": 10,
        "title": "C++ Reference Variable",
        "description": "What is the output of this C++ program?",
        "code_template": """\
#include <iostream>
using namespace std;
int main() {
    int a = 10, b = 20;
    int &r = a;
    r = b;
    b = 30;
    cout << a << " " << r << endl;
    return 0;
}""",
        "mcq_options": ["10 10", "20 20", "20 30", "30 30"],
        "correct_option_index": 1,
        "test_cases": None,
    },

    # --- R1: Debugging (Q6 to Q10) ---
    {
        "round": 1, "order": 6, "question_type": "debugging", "language": "c", "points": 20,
        "title": "Array Sum Off-By-One",
        "description": "The function below should return the sum of all elements in the array of size n. Find and fix the error.",
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
        "round": 1, "order": 7, "question_type": "debugging", "language": "cpp", "points": 20,
        "title": "Factorial Crash for Zero",
        "description": "The recursive factorial function below does not handle n = 0 properly. Fix the base case so it returns 1 for n = 0.",
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
    {
        "round": 1, "order": 8, "question_type": "debugging", "language": "c", "points": 20,
        "title": "Swap Two Numbers",
        "description": "The swap function below attempts to swap two integers using pointers, but fails. Find and fix the error.",
        "code_template": """\
#include <stdio.h>

void swap(int *a, int *b) {
    *a = *b;
    *b = *a;
}

int main() {
    int x, y;
    scanf("%d %d", &x, &y);
    swap(&x, &y);
    printf("%d %d\\n", x, y);
    return 0;
}""",
        "test_cases": [
            {"input": "3 7\n", "expected_output": "7 3", "is_hidden": False},
            {"input": "10 20\n", "expected_output": "20 10", "is_hidden": True},
        ],
    },
    {
        "round": 1, "order": 9, "question_type": "debugging", "language": "c", "points": 20,
        "title": "Reverse an Integer",
        "description": "The program should reverse the digits of a given positive integer. Find and fix the error causing incorrect output or timeout.",
        "code_template": """\
#include <stdio.h>

int main() {
    int n, rev = 0;
    scanf("%d", &n);
    while (n > 0) {
        rev = rev * 10 + n % 10;
    }
    printf("%d\\n", rev);
    return 0;
}""",
        "test_cases": [
            {"input": "1234\n", "expected_output": "4321", "is_hidden": False},
            {"input": "500\n", "expected_output": "5", "is_hidden": True},
        ],
    },
    {
        "round": 1, "order": 10, "question_type": "debugging", "language": "cpp", "points": 20,
        "title": "Find Minimum in Array",
        "description": "The program should find and print the smallest number in an array. Find and fix the error.",
        "code_template": """\
#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int arr[100];
    for (int i = 0; i < n; i++) cin >> arr[i];

    int minVal = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] > minVal) {
            minVal = arr[i];
        }
    }
    cout << minVal << endl;
    return 0;
}""",
        "test_cases": [
            {"input": "5\n8 3 9 1 6\n", "expected_output": "1", "is_hidden": False},
            {"input": "3\n12 5 20\n", "expected_output": "5", "is_hidden": True},
        ],
    },


    # ═══════════════════════════════════════════════════════════
    # ROUND 2 — PYTHON (5 MCQs + 5 Debugging)
    # ═══════════════════════════════════════════════════════════

    # --- R2: MCQs (Q1 to Q5) ---
    {
        "round": 2, "order": 1, "question_type": "mcq", "language": "python", "points": 10,
        "title": "Mutable Default Arguments",
        "description": "What is the output of the following Python code?",
        "code_template": """\
def add_item(val, lst=[]):
    lst.append(val)
    return lst

print(add_item(1))
print(add_item(2))""",
        "mcq_options": ["[1]\n[2]", "[1]\n[1, 2]", "[1, 2]\n[1, 2]", "Error"],
        "correct_option_index": 1,
        "test_cases": None,
    },
    {
        "round": 2, "order": 2, "question_type": "mcq", "language": "python", "points": 10,
        "title": "List Step Slicing",
        "description": "What is the output of this Python snippet?",
        "code_template": """\
a = [10, 20, 30, 40, 50, 60]
print(a[1:5:2])""",
        "mcq_options": ["[20, 40]", "[20, 30, 40]", "[10, 30, 50]", "[20, 40, 60]"],
        "correct_option_index": 0,
        "test_cases": None,
    },
    {
        "round": 2, "order": 3, "question_type": "mcq", "language": "python", "points": 10,
        "title": "Boolean Arithmetic in Python",
        "description": "What does this Python expression output?",
        "code_template": """\
result = True + True * 3
print(result)""",
        "mcq_options": ["True", "6", "4", "Error"],
        "correct_option_index": 2,
        "test_cases": None,
    },
    {
        "round": 2, "order": 4, "question_type": "mcq", "language": "python", "points": 10,
        "title": "List Identity vs Equality",
        "description": "What will be printed?",
        "code_template": """\
a = [1, 2, 3]
b = a[:]
print(a == b, a is b)""",
        "mcq_options": ["True True", "True False", "False True", "False False"],
        "correct_option_index": 1,
        "test_cases": None,
    },
    {
        "round": 2, "order": 5, "question_type": "mcq", "language": "python", "points": 10,
        "title": "Dictionary Keys Type Coercion",
        "description": "What is the output of this dictionary operation?",
        "code_template": """\
d = {}
d[1] = "alpha"
d[1.0] = "beta"
print(len(d), d[1])""",
        "mcq_options": ["2 alpha", "2 beta", "1 beta", "1 alpha"],
        "correct_option_index": 2,
        "test_cases": None,
    },

    # --- R2: Debugging (Q6 to Q10) ---
    {
        "round": 2, "order": 6, "question_type": "debugging", "language": "python", "points": 20,
        "title": "Sum of Even Numbers",
        "description": "The program should compute the sum of all even numbers from a space-separated list of integers. Find and fix the error.",
        "code_template": """\
nums = list(map(int, input().split()))
total = 0

for x in nums:
    if x % 2 != 0:
        total += x

print(total)""",
        "test_cases": [
            {"input": "1 2 3 4 5 6\n", "expected_output": "12", "is_hidden": False},
            {"input": "7 9 11\n", "expected_output": "0", "is_hidden": True},
        ],
    },
    {
        "round": 2, "order": 7, "question_type": "debugging", "language": "python", "points": 20,
        "title": "Case-Insensitive Palindrome",
        "description": "The program should print YES if the given string is a palindrome (ignoring uppercase/lowercase), otherwise NO. Find and fix the error.",
        "code_template": """\
s = input().strip()

if s == s[::-1]:
    print("YES")
else:
    print("NO")""",
        "test_cases": [
            {"input": "Racecar\n", "expected_output": "YES", "is_hidden": False},
            {"input": "hello\n", "expected_output": "NO", "is_hidden": False},
            {"input": "Madam\n", "expected_output": "YES", "is_hidden": True},
        ],
    },
    {
        "round": 2, "order": 8, "question_type": "debugging", "language": "python", "points": 20,
        "title": "Count Vowels in String",
        "description": "Count how many vowels (a, e, i, o, u) are present in the lowercase input string. Find and fix the error.",
        "code_template": """\
s = input().strip().lower()
vowels = "aeio"
count = 0

for char in s:
    if char in vowels:
        count += 1

print(count)""",
        "test_cases": [
            {"input": "programming\n", "expected_output": "3", "is_hidden": False},
            {"input": "universe\n", "expected_output": "4", "is_hidden": True},
        ],
    },
    {
        "round": 2, "order": 9, "question_type": "debugging", "language": "python", "points": 20,
        "title": "Average of List",
        "description": "Calculate and print the average of a list of floats formatted to 2 decimal places. Find and fix the error.",
        "code_template": """\
vals = list(map(float, input().split()))
avg = sum(vals) // len(vals)
print(f"{avg:.2f}")""",
        "test_cases": [
            {"input": "10 20 30\n", "expected_output": "20.00", "is_hidden": False},
            {"input": "5 10\n", "expected_output": "7.50", "is_hidden": True},
        ],
    },
    {
        "round": 2, "order": 10, "question_type": "debugging", "language": "python", "points": 20,
        "title": "Remove Duplicates Preserve Order",
        "description": "Print the elements of the list without duplicates, in the order of their first appearance. Find and fix the error.",
        "code_template": """\
items = input().split()
unique = []

for item in items:
    if item not in unique:
        unique.append(items)

print(" ".join(unique))""",
        "test_cases": [
            {"input": "apple banana apple cherry\n", "expected_output": "apple banana cherry", "is_hidden": False},
            {"input": "a b c a b\n", "expected_output": "a b c", "is_hidden": True},
        ],
    },


    # ═══════════════════════════════════════════════════════════
    # ROUND 3 — DATA STRUCTURES & ALGORITHMS (5 MCQs + 5 Debugging)
    # ═══════════════════════════════════════════════════════════

    # --- R3: MCQs (Q1 to Q5) ---
    {
        "round": 3, "order": 1, "question_type": "mcq", "language": "c", "points": 10,
        "title": "Binary Search Time Complexity",
        "description": "What is the worst-case time complexity of Binary Search on a sorted array of size N?",
        "code_template": """\
// Binary Search divides the search space in half each step:
int binarySearch(int arr[], int n, int target);""",
        "mcq_options": ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
        "correct_option_index": 1,
        "test_cases": None,
    },
    {
        "round": 3, "order": 2, "question_type": "mcq", "language": "c", "points": 10,
        "title": "Stack LIFO Execution",
        "description": "If operations push(1), push(2), pop(), push(3), push(4), pop() are executed on an empty stack, what is the top element?",
        "code_template": """\
// Stack operations:
push(1); push(2); pop(); push(3); push(4); pop();
// What is on top?""",
        "mcq_options": ["1", "2", "3", "4"],
        "correct_option_index": 2,
        "test_cases": None,
    },
    {
        "round": 3, "order": 3, "question_type": "mcq", "language": "c", "points": 10,
        "title": "Worst-case QuickSort",
        "description": "What is the worst-case time complexity of standard QuickSort when the pivot is always the smallest or largest element?",
        "code_template": """\
// QuickSort recursion with poor pivot choice:
T(N) = T(N - 1) + O(N);""",
        "mcq_options": ["O(log N)", "O(N)", "O(N log N)", "O(N^2)"],
        "correct_option_index": 3,
        "test_cases": None,
    },
    {
        "round": 3, "order": 4, "question_type": "mcq", "language": "c", "points": 10,
        "title": "Queue FIFO Property",
        "description": "In a standard queue (FIFO), where are insertions and deletions performed?",
        "code_template": """\
// Queue Operations:
// Insert at Rear, Remove from Front""",
        "mcq_options": [
            "Insert at Rear, Remove from Front",
            "Insert at Front, Remove from Rear",
            "Both at Front",
            "Both at Rear"
        ],
        "correct_option_index": 0,
        "test_cases": None,
    },
    {
        "round": 3, "order": 5, "question_type": "mcq", "language": "c", "points": 10,
        "title": "Binary Tree Node Count",
        "description": "What is the maximum number of nodes in a binary tree of height H (where height of root node is 1)?",
        "code_template": """\
// Binary tree max nodes formula:
// Level 1: 1, Level 2: 2, Level 3: 4...""",
        "mcq_options": ["2^H", "2^H - 1", "2^(H - 1)", "2H"],
        "correct_option_index": 1,
        "test_cases": None,
    },

    # --- R3: Debugging (Q6 to Q10) ---
    {
        "round": 3, "order": 6, "question_type": "debugging", "language": "cpp", "points": 20,
        "title": "Binary Search Condition",
        "description": "Search for target in sorted array of size N. Print the 0-based index or -1 if not found. Find and fix the error.",
        "code_template": """\
#include <iostream>
using namespace std;

int binarySearch(int arr[], int n, int target) {
    int lo = 0, hi = n - 1;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}

int main() {
    int n, target;
    cin >> n >> target;
    int arr[100];
    for (int i = 0; i < n; i++) cin >> arr[i];
    cout << binarySearch(arr, n, target) << endl;
    return 0;
}""",
        "test_cases": [
            {"input": "5 3\n1 2 3 4 5\n", "expected_output": "2", "is_hidden": False},
            {"input": "5 5\n1 2 3 4 5\n", "expected_output": "4", "is_hidden": False},
            {"input": "4 9\n2 4 6 8\n", "expected_output": "-1", "is_hidden": True},
        ],
    },
    {
        "round": 3, "order": 7, "question_type": "debugging", "language": "python", "points": 20,
        "title": "Linear Search Early Return",
        "description": "Find target in list. Output index or -1 if not present. Find and fix the error.",
        "code_template": """\
items = list(map(int, input().split()))
target = int(input())

def search(items, target):
    for i in range(len(items)):
        if items[i] == target:
            return i
        else:
            return -1
    return -1

print(search(items, target))""",
        "test_cases": [
            {"input": "10 20 30 40\n30\n", "expected_output": "2", "is_hidden": False},
            {"input": "5 10 15\n20\n", "expected_output": "-1", "is_hidden": True},
        ],
    },
    {
        "round": 3, "order": 8, "question_type": "debugging", "language": "c", "points": 20,
        "title": "Check if Array is Sorted",
        "description": "Print YES if the array is sorted in non-decreasing order, otherwise NO. Find and fix the error.",
        "code_template": """\
#include <stdio.h>

int isSorted(int arr[], int n) {
    for (int i = 0; i <= n - 1; i++) {
        if (arr[i] > arr[i + 1]) {
            return 0;
        }
    }
    return 1;
}

int main() {
    int n;
    scanf("%d", &n);
    int arr[100];
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    if (isSorted(arr, n)) printf("YES\\n");
    else printf("NO\\n");
    return 0;
}""",
        "test_cases": [
            {"input": "4\n1 2 3 4\n", "expected_output": "YES", "is_hidden": False},
            {"input": "4\n1 3 2 4\n", "expected_output": "NO", "is_hidden": False},
            {"input": "5\n2 2 3 4 5\n", "expected_output": "YES", "is_hidden": True},
        ],
    },
    {
        "round": 3, "order": 9, "question_type": "debugging", "language": "python", "points": 20,
        "title": "Fibonacci Number Sequence",
        "description": "Return the Nth Fibonacci number (where N=0 is 0, N=1 is 1, N=2 is 1, N=3 is 2, etc.). Find and fix the error.",
        "code_template": """\
n = int(input())

def fib(n):
    if n == 0:
        return 0
    if n == 1:
        return 0
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

print(fib(n))""",
        "test_cases": [
            {"input": "1\n", "expected_output": "1", "is_hidden": False},
            {"input": "6\n", "expected_output": "8", "is_hidden": False},
            {"input": "0\n", "expected_output": "0", "is_hidden": True},
        ],
    },
    {
        "round": 3, "order": 10, "question_type": "debugging", "language": "cpp", "points": 20,
        "title": "Matrix Main Diagonal Sum",
        "description": "Compute and print the sum of elements on the main diagonal of an N x N matrix. Find and fix the error.",
        "code_template": """\
#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int mat[10][10];
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            cin >> mat[i][j];
        }
    }

    int diagSum = 0;
    for (int i = 0; i < n; i++) {
        diagSum += mat[i][n - 1 - i];
    }
    cout << diagSum << endl;
    return 0;
}""",
        "test_cases": [
            {"input": "3\n1 2 3\n4 5 6\n7 8 9\n", "expected_output": "15", "is_hidden": False},
            {"input": "2\n10 20\n30 40\n", "expected_output": "50", "is_hidden": True},
        ],
    },
]


def seed_database(db: Session):
    # If 30 questions already seeded, skip
    if db.query(Question).count() >= len(SEED_QUESTIONS):
        return

    # Clear any old questions and re-seed clean 30 questions
    db.query(Question).delete()
    for q_data in SEED_QUESTIONS:
        q = Question(**q_data)
        db.add(q)

    db.commit()
    print(f"[OK] Seeded {len(SEED_QUESTIONS)} questions into database.")
