import requests
import subprocess
import tempfile
import os
import sys

from .config import PISTON_API_URL, LANGUAGE_MAP


def run_code(language: str, code: str, stdin: str = "", timeout: int = 5) -> dict:
    """
    Execute code using Piston API first, fall back to local compiler.
    Returns: { "stdout": str, "stderr": str, "success": bool }
    """
    try:
        return _run_via_piston(language, code, stdin, timeout)
    except Exception:
        return _run_locally(language, code, stdin, timeout)


# ─── Piston Cloud Runner ───────────────────────────────────────────────────────

def _run_via_piston(language: str, code: str, stdin: str, timeout: int) -> dict:
    lang_cfg = LANGUAGE_MAP.get(language)
    if not lang_cfg:
        raise ValueError(f"Unsupported language: {language}")

    filename = {"c": "main.c", "cpp": "main.cpp", "python": "main.py"}.get(language, "main.py")

    payload = {
        "language": lang_cfg["language"],
        "version": lang_cfg["version"],
        "files": [{"name": filename, "content": code}],
        "stdin": stdin,
        "run_timeout": timeout * 1000,
        "compile_timeout": 10000,
    }

    resp = requests.post(PISTON_API_URL, json=payload, timeout=15)
    resp.raise_for_status()
    data = resp.json()

    run_data = data.get("run", {})
    compile_data = data.get("compile", {})

    stderr = compile_data.get("stderr", "") + run_data.get("stderr", "")
    stdout = run_data.get("stdout", "")

    return {"stdout": stdout, "stderr": stderr, "success": True}


# ─── Local Fallback Runner ─────────────────────────────────────────────────────

def _run_locally(language: str, code: str, stdin: str, timeout: int) -> dict:
    with tempfile.TemporaryDirectory() as tmpdir:
        if language == "python":
            src = os.path.join(tmpdir, "main.py")
            with open(src, "w") as f:
                f.write(code)
            return _exec(
                [sys.executable, src],
                stdin=stdin,
                cwd=tmpdir,
                timeout=timeout,
            )

        elif language == "c":
            src = os.path.join(tmpdir, "main.c")
            exe = os.path.join(tmpdir, "main")
            with open(src, "w") as f:
                f.write(code)
            comp = subprocess.run(
                ["gcc", src, "-o", exe, "-lm"],
                capture_output=True, text=True, cwd=tmpdir
            )
            if comp.returncode != 0:
                return {"stdout": "", "stderr": comp.stderr, "success": False}
            return _exec([exe], stdin=stdin, cwd=tmpdir, timeout=timeout)

        elif language == "cpp":
            src = os.path.join(tmpdir, "main.cpp")
            exe = os.path.join(tmpdir, "main")
            with open(src, "w") as f:
                f.write(code)
            comp = subprocess.run(
                ["g++", src, "-o", exe, "-std=c++17", "-lm"],
                capture_output=True, text=True, cwd=tmpdir
            )
            if comp.returncode != 0:
                return {"stdout": "", "stderr": comp.stderr, "success": False}
            return _exec([exe], stdin=stdin, cwd=tmpdir, timeout=timeout)

        else:
            return {"stdout": "", "stderr": f"Unknown language: {language}", "success": False}


def _exec(cmd, stdin: str, cwd: str, timeout: int) -> dict:
    try:
        proc = subprocess.run(
            cmd,
            input=stdin,
            capture_output=True,
            text=True,
            cwd=cwd,
            timeout=timeout,
        )
        return {
            "stdout": proc.stdout,
            "stderr": proc.stderr,
            "success": proc.returncode == 0,
        }
    except subprocess.TimeoutExpired:
        return {"stdout": "", "stderr": "Time Limit Exceeded", "success": False}
    except Exception as e:
        return {"stdout": "", "stderr": str(e), "success": False}


# ─── Test Case Evaluator ───────────────────────────────────────────────────────

def evaluate_against_test_cases(
    language: str, code: str, test_cases: list, show_hidden: bool = False
) -> dict:
    """
    Run code against all test cases.
    Returns aggregated results and marks ratio.
    """
    results = []
    passed = 0

    for tc in test_cases:
        is_hidden = tc.get("is_hidden", False)
        inp = tc.get("input", "")
        expected = tc.get("expected_output", "").strip()

        result = run_code(language, code, stdin=inp)
        actual = result["stdout"].strip()
        ok = actual == expected

        if ok:
            passed += 1

        results.append({
            "input": inp if not is_hidden else "🔒 Hidden",
            "expected": expected if not is_hidden else "🔒 Hidden",
            "actual": actual,
            "passed": ok,
            "stderr": result["stderr"],
            "is_hidden": is_hidden,
        })

    total = len(test_cases)
    return {
        "results": results,
        "passed": passed,
        "total": total,
        "ratio": passed / total if total else 0,
    }
