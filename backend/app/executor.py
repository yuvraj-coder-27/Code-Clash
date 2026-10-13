import subprocess
import tempfile
import os
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from .config import PISTON_API_URL, LANGUAGE_MAP

# --- Persistent HTTP session with connection pooling + retries ---

_session = requests.Session()
_retry = Retry(total=2, backoff_factor=0.2, status_forcelist=[500, 502, 503])
_adapter = HTTPAdapter(
    max_retries=_retry,
    pool_connections=10,
    pool_maxsize=20,
)
_session.mount("https://", _adapter)
_session.mount("http://", _adapter)

# Thread pool for parallel test-case execution
_executor = ThreadPoolExecutor(max_workers=8)


def run_code(language: str, code: str, stdin: str = "", timeout: int = 5) -> dict:
    """
    Execute code using Piston API first, fall back to local compiler.
    Returns: { "stdout": str, "stderr": str, "success": bool }
    """
    try:
        return _run_via_piston(language, code, stdin, timeout)
    except Exception:
        return _run_locally(language, code, stdin, timeout)


# --- Piston Cloud Runner ---

def _run_via_piston(language: str, code: str, stdin: str, timeout: int) -> dict:
    lang_cfg = LANGUAGE_MAP.get(language)
    if not lang_cfg:
        raise ValueError(f"Unsupported language: {language}")

    filename = {"c": "main.c", "cpp": "main.cpp", "python": "main.py"}.get(language, "main.py")

    payload = {
        "language": lang_cfg["language"],
        "version":  lang_cfg["version"],
        "files":    [{"name": filename, "content": code}],
        "stdin":    stdin,
        "run_timeout":     timeout * 1000,
        "compile_timeout": 10000,
    }

    resp = _session.post(PISTON_API_URL, json=payload, timeout=12)
    resp.raise_for_status()
    data = resp.json()

    run_data     = data.get("run", {})
    compile_data = data.get("compile", {})

    stderr = compile_data.get("stderr", "") + run_data.get("stderr", "")
    stdout = run_data.get("stdout", "")

    return {"stdout": stdout, "stderr": stderr, "success": True}


# --- Local Fallback Runner ---

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
            "stdout":  proc.stdout,
            "stderr":  proc.stderr,
            "success": proc.returncode == 0,
        }
    except subprocess.TimeoutExpired:
        return {"stdout": "", "stderr": "Time Limit Exceeded", "success": False}
    except Exception as e:
        return {"stdout": "", "stderr": str(e), "success": False}


# --- Output Normalizer ---

def _normalize(text: str) -> str:
    """
    Normalize program output for comparison:
    - Unify line endings (CRLF / CR -> LF)
    - Strip trailing whitespace from each line
    - Remove trailing blank lines
    This prevents false failures due to platform differences.
    """
    lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    lines = [line.rstrip() for line in lines]
    while lines and lines[-1] == "":
        lines.pop()
    return "\n".join(lines)


# --- Test Case Evaluator (parallel) ---

def _run_single(tc: dict, language: str, code: str) -> dict:
    """Run one test case and return its result dict."""
    is_hidden = tc.get("is_hidden", False)
    inp       = tc.get("input", "")
    expected  = _normalize(tc.get("expected_output", ""))

    result = run_code(language, code, stdin=inp)
    actual = _normalize(result["stdout"])
    ok     = actual == expected

    return {
        "input":     inp      if not is_hidden else "[Hidden]",
        "expected":  expected if not is_hidden else "[Hidden]",
        "actual":    actual,
        "passed":    ok,
        "stderr":    result["stderr"],
        "is_hidden": is_hidden,
        "_order":    id(tc),
    }


def evaluate_against_test_cases(
    language: str, code: str, test_cases: list, show_hidden: bool = False
) -> dict:
    """
    Run code against all test cases in parallel.
    Returns aggregated results and marks ratio.
    """
    if not test_cases:
        return {"results": [], "passed": 0, "total": 0, "ratio": 0}

    # Submit all test cases concurrently
    future_to_idx = {
        _executor.submit(_run_single, tc, language, code): i
        for i, tc in enumerate(test_cases)
    }

    ordered = [None] * len(test_cases)
    for future in as_completed(future_to_idx):
        idx = future_to_idx[future]
        ordered[idx] = future.result()

    # Clean up internal ordering key
    for r in ordered:
        r.pop("_order", None)

    passed = sum(1 for r in ordered if r["passed"])
    total  = len(test_cases)

    return {
        "results": ordered,
        "passed":  passed,
        "total":   total,
        "ratio":   passed / total if total else 0,
    }
