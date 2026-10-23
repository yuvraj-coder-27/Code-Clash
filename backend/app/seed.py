from sqlalchemy.orm import Session
from .models import Question


SEED_QUESTIONS = [

    # ═══════════════════════════════════════════════════════════
    # ROUND 1 — C & C++ (5 FRESH MCQs + 5 FRESH Debugging)
    # ═══════════════════════════════════════════════════════════

    # --- R1: MCQs (Q1 to Q5) ---
    {
        "round": 1, "order": 1, "question_type": "mcq", "language": "c", "points": 10,
        "title": "Bitwise Shift & Precedence",
        "description": "What is the output of the following C code snippet?",
        "code_template": """\
#include <stdio.h>
int main() {
    int a = 2;
    int b = a << 1 + 2;
    printf("%d\\n", b);
    return 0;
}""",
        "mcq_options": ["16", "6", "8", "4"],
        "correct_option_index": 0,
        "test_cases": None,
    },
    {
        "round": 1, "order": 2, "question_type": "mcq", "language": "c", "points": 10,
        "title": "Ternary Operator Side Effect",
        "description": "What will be printed by this C code?",
        "code_template": """\
#include <stdio.h>
int main() {
    int x = 10, y = 20;
    int z = (x > y) ? x++ : y++;
    printf("%d %d %d\\n", x, y, z);
    return 0;
}""",
        "mcq_options": ["10 21 20", "11 20 20", "10 21 21", "11 21 20"],
        "correct_option_index": 0,
        "test_cases": None,
    },
    {
        "round": 1, "order": 3, "question_type": "mcq", "language": "c", "points": 10,
        "title": "Static Variable Persistence",
        "description": "What is the output of the following C program?",
        "code_template": """\
#include <stdio.h>
void counter() {
    static int count = 1;
    printf("%d ", count);
    count += 2;
}
int main() {
    counter();
    counter();
    counter();
    return 0;
}""",
        "mcq_options": ["1 3 5 ", "1 1 1 ", "3 5 7 ", "1 2 3 "],
        "correct_option_index": 0,
        "test_cases": None,
    },
    {
        "round": 1, "order": 4, "question_type": "mcq", "language": "cpp", "points": 10,
        "title": "Default Arguments in C++",
        "description": "What is printed by this C++ program?",
        "code_template": """\
#include <iostream>
using namespace std;
int calc(int a, int b = 5) {
    return a * b;
}
int main() {
    cout << calc(3) + calc(2, 3) << endl;
    return 0;
}""",
        "mcq_options": ["21", "20", "25", "18"],
        "correct_option_index": 0,
        "test_cases": None,
    },
    {
        "round": 1, "order": 5, "question_type": "mcq", "language": "c", "points": 10,
        "title": "Pointer Indexing on String",
        "description": "What is the output of this C code snippet?",
        "code_template": """\
#include <stdio.h>
int main() {
    char *str = "GATEWAY";
    printf("%c %c\\n", *str, *(str + 4));
    return 0;
}""",
        "mcq_options": ["G W", "G E", "A W", "G A"],
        "correct_option_index": 0,
        "test_cases": None,
    },

    # --- R1: Debugging (Q6 to Q10) ---
    {
        "round": 1, "order": 6, "question_type": "debugging", "language": "c", "points": 20,
        "title": "Celsius to Fahrenheit Converter",
        "description": "Convert Celsius temperature to Fahrenheit using the standard formula F = (9/5)*C + 32. Find and fix the error.",
        "code_template": """\
#include <stdio.h>

int main() {
    int c;
    scanf("%d", &c);
    int f = (9 / 5) * c + 32;
    printf("%d\\n", f);
    return 0;
}""",
        "test_cases": [
            {"input": "100\n", "expected_output": "212", "is_hidden": False},
            {"input": "0\n", "expected_output": "32", "is_hidden": False},
            {"input": "25\n", "expected_output": "77", "is_hidden": True},
        ],
    },
    {
        "round": 1, "order": 7, "question_type": "debugging", "language": "cpp", "points": 20,
        "title": "Prime Number Check",
        "description": "Given integer N, print YES if N is prime, otherwise print NO. Find and fix the error in the loop logic.",
        "code_template": """\
#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    if (n < 2) {
        cout << "NO" << endl;
        return 0;
    }
    for (int i = 2; i <= n; i++) {
        if (n % i == 0) {
            cout << "NO" << endl;
            return 0;
        }
    }
    cout << "YES" << endl;
    return 0;
}""",
        "test_cases": [
            {"input": "7\n", "expected_output": "YES", "is_hidden": False},
            {"input": "4\n", "expected_output": "NO", "is_hidden": False},
            {"input": "1\n", "expected_output": "NO", "is_hidden": True},
            {"input": "13\n", "expected_output": "YES", "is_hidden": True},
        ],
    },
    {
        "round": 1, "order": 8, "question_type": "debugging", "language": "c", "points": 20,
        "title": "Count Vowels in String",
        "description": "Count and print the number of lowercase vowels (a, e, i, o, u) present in the string. Find and fix the error.",
        "code_template": """\
#include <stdio.h>
#include <string.h>

int main() {
    char s[200];
    scanf("%s", s);
    int count = 0;
    for (int i = 0; i < strlen(s); i++) {
        char c = s[i];
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o') {
            count++;
        }
    }
    printf("%d\\n", count);
    return 0;
}""",
        "test_cases": [
            {"input": "programming\n", "expected_output": "3", "is_hidden": False},
            {"input": "umbrella\n", "expected_output": "3", "is_hidden": False},
            {"input": "sky\n", "expected_output": "0", "is_hidden": True},
        ],
    },
    {
        "round": 1, "order": 9, "question_type": "debugging", "language": "c", "points": 20,
        "title": "Average of Three Numbers",
        "description": "Calculate and print the average of three numbers formatted to 2 decimal places. Find and fix the operator precedence error.",
        "code_template": """\
#include <stdio.h>

int main() {
    double a, b, c;
    scanf("%lf %lf %lf", &a, &b, &c);
    double avg = a + b + c / 3.0;
    printf("%.2f\\n", avg);
    return 0;
}""",
        "test_cases": [
            {"input": "10 20 30\n", "expected_output": "20.00", "is_hidden": False},
            {"input": "5 5 5\n", "expected_output": "5.00", "is_hidden": False},
            {"input": "1 2 4\n", "expected_output": "2.33", "is_hidden": True},
        ],
    },
    {
        "round": 1, "order": 10, "question_type": "debugging", "language": "cpp", "points": 20,
        "title": "Simple Arithmetic Calculator",
        "description": "Read two integers and an operator (+, -, *), and print the calculated result. Find and fix the switch statement error.",
        "code_template": """\
#include <iostream>
using namespace std;

int main() {
    int a, b;
    char op;
    cin >> a >> b >> op;
    int res = 0;
    switch (op) {
        case '+': res = a + b; break;
        case '-': res = a - b; break;
        case '*': res = a * b;
        default: res = 0; break;
    }
    cout << res << endl;
    return 0;
}""",
        "test_cases": [
            {"input": "6 3 *\n", "expected_output": "18", "is_hidden": False},
            {"input": "10 4 +\n", "expected_output": "14", "is_hidden": False},
            {"input": "15 5 -\n", "expected_output": "10", "is_hidden": True},
        ],
    },


    # ═══════════════════════════════════════════════════════════
    # ROUND 2 — PYTHON (5 FRESH MCQs + 5 FRESH Debugging)
    # ═══════════════════════════════════════════════════════════

    # --- R2: MCQs (Q1 to Q5) ---
    {
        "round": 2, "order": 1, "question_type": "mcq", "language": "python", "points": 10,
        "title": "String Split and Join",
        "description": "What is the output of the following Python snippet?",
        "code_template": """\
s = "alpha-beta-gamma"
parts = s.split("-")
print(":".join(parts[::2]))""",
        "mcq_options": ["alpha:gamma", "alpha:beta:gamma", "beta", "alpha:beta"],
        "correct_option_index": 0,
        "test_cases": None,
    },
    {
        "round": 2, "order": 2, "question_type": "mcq", "language": "python", "points": 10,
        "title": "Nested List Inside Tuple",
        "description": "What is printed after executing this code?",
        "code_template": """\
t = (1, [2, 3], 4)
t[1].append(5)
print(len(t[1]), len(t))""",
        "mcq_options": ["3 3", "2 3", "TypeError", "3 4"],
        "correct_option_index": 0,
        "test_cases": None,
    },
    {
        "round": 2, "order": 3, "question_type": "mcq", "language": "python", "points": 10,
        "title": "Set Symmetric Difference",
        "description": "What is the output of the following set operation?",
        "code_template": """\
s1 = {1, 2, 3, 4}
s2 = {3, 4, 5, 6}
print(sorted(list(s1 ^ s2)))""",
        "mcq_options": ["[1, 2, 5, 6]", "[3, 4]", "[1, 2, 3, 4, 5, 6]", "[1, 2]"],
        "correct_option_index": 0,
        "test_cases": None,
    },
    {
        "round": 2, "order": 4, "question_type": "mcq", "language": "python", "points": 10,
        "title": "List Comprehension with Filter",
        "description": "What will be printed?",
        "code_template": """\
nums = [x * 2 for x in range(6) if x % 2 == 0]
print(sum(nums))""",
        "mcq_options": ["12", "30", "6", "18"],
        "correct_option_index": 0,
        "test_cases": None,
    },
    {
        "round": 2, "order": 5, "question_type": "mcq", "language": "python", "points": 10,
        "title": "Nested Lambda Execution",
        "description": "What does this nested lambda invocation evaluate to?",
        "code_template": """\
f = lambda a, b: a if a > b else b
print(f(15, f(25, 10)))""",
        "mcq_options": ["25", "15", "10", "50"],
        "correct_option_index": 0,
        "test_cases": None,
    },

    # --- R2: Debugging (Q6 to Q10) ---
    {
        "round": 2, "order": 6, "question_type": "debugging", "language": "python", "points": 20,
        "title": "Sum of Digits",
        "description": "Calculate and print the sum of digits of a given positive integer. Find and fix the error.",
        "code_template": """\
n = int(input())
total = 0

while n > 0:
    total += n // 10
    n //= 10

print(total)""",
        "test_cases": [
            {"input": "123\n", "expected_output": "6", "is_hidden": False},
            {"input": "405\n", "expected_output": "9", "is_hidden": False},
            {"input": "99\n", "expected_output": "18", "is_hidden": True},
        ],
    },
    {
        "round": 2, "order": 7, "question_type": "debugging", "language": "python", "points": 20,
        "title": "Multiplication Table Generator",
        "description": "Print the multiplication table of N from 1 to 5 in the exact format shown. Find and fix the error.",
        "code_template": """\
n = int(input())

for i in range(1, 6):
    print(f"{n} x {i} = {n * n}")""",
        "test_cases": [
            {"input": "3\n", "expected_output": "3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15", "is_hidden": False},
            {"input": "5\n", "expected_output": "5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25", "is_hidden": True},
        ],
    },
    {
        "round": 2, "order": 8, "question_type": "debugging", "language": "python", "points": 20,
        "title": "Find Maximum in List",
        "description": "Read space-separated integers and print the maximum value. Find and fix the initialization bug that causes failure on negative numbers.",
        "code_template": """\
nums = list(map(int, input().split()))
max_val = 0

for x in nums:
    if x > max_val:
        max_val = x

print(max_val)""",
        "test_cases": [
            {"input": "3 7 2 9 4\n", "expected_output": "9", "is_hidden": False},
            {"input": "-5 -1 -8 -3\n", "expected_output": "-1", "is_hidden": False},
            {"input": "10 20 30\n", "expected_output": "30", "is_hidden": True},
        ],
    },
    {
        "round": 2, "order": 9, "question_type": "debugging", "language": "python", "points": 20,
        "title": "Count Words in Sentence",
        "description": "Given a sentence, count and print the total number of words. Find and fix the delimiter error.",
        "code_template": """\
s = input().strip()
words = s.split(",")
print(len(words))""",
        "test_cases": [
            {"input": "Hello world this is CodeClash\n", "expected_output": "5", "is_hidden": False},
            {"input": "Coding contest\n", "expected_output": "2", "is_hidden": False},
            {"input": "Python\n", "expected_output": "1", "is_hidden": True},
        ],
    },
    {
        "round": 2, "order": 10, "question_type": "debugging", "language": "python", "points": 20,
        "title": "Check Power of Two",
        "description": "Print YES if the positive integer N is a power of 2 (1, 2, 4, 8, 16...), otherwise print NO. Find and fix the bitwise condition error.",
        "code_template": """\
n = int(input())

if n > 0 and (n & (n - 1)) != 0:
    print("YES")
else:
    print("NO")""",
        "test_cases": [
            {"input": "16\n", "expected_output": "YES", "is_hidden": False},
            {"input": "10\n", "expected_output": "NO", "is_hidden": False},
            {"input": "1\n", "expected_output": "YES", "is_hidden": True},
            {"input": "64\n", "expected_output": "YES", "is_hidden": True},
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
        "mcq_options": ["O(log N)", "O(1)", "O(N)", "O(N log N)"],
        "correct_option_index": 0,
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
        "mcq_options": ["3", "1", "2", "4"],
        "correct_option_index": 0,
        "test_cases": None,
    },
    {
        "round": 3, "order": 3, "question_type": "mcq", "language": "c", "points": 10,
        "title": "Worst-case QuickSort",
        "description": "What is the worst-case time complexity of standard QuickSort when the pivot is always the smallest or largest element?",
        "code_template": """\
// QuickSort recursion with poor pivot choice:
T(N) = T(N - 1) + O(N);""",
        "mcq_options": ["O(N^2)", "O(log N)", "O(N)", "O(N log N)"],
        "correct_option_index": 0,
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
        "mcq_options": ["2^H - 1", "2^H", "2^(H - 1)", "2H"],
        "correct_option_index": 0,
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
    # Always wipe questions table and re-seed all 30 clean questions
    db.query(Question).delete()
    for q_data in SEED_QUESTIONS:
        q = Question(**q_data)
        db.add(q)

    db.commit()
    print(f"[OK] Seeded {len(SEED_QUESTIONS)} fresh questions into database.")
