
#!/usr/bin/env bash
set -euo pipefail

echo "=== Q-Ontic cautious site reorganization ==="

if [ ! -d ".git" ]; then
  echo "ERROR: Run this from the repository top directory."
  exit 1
fi

if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "ERROR: Working tree is not clean."
  echo "Commit, stash, or reset changes before running."
  git status
  exit 1
fi

BRANCH="site-structure-cleanup"

git checkout main
git pull origin main

if git rev-parse --verify "$BRANCH" >/dev/null 2>&1; then
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH"
fi

mkdir -p apps/comparative apps/pilot-wave notebooks

move_dir () {
  SRC="$1"
  DST="$2"

  if [ -d "$SRC" ]; then
    mkdir -p "$(dirname "$DST")"
    echo "Moving $SRC -> $DST"
    git mv "$SRC" "$DST"
  else
    echo "Skipping missing directory: $SRC"
  fi
}

move_file () {
  SRC="$1"
  DST="$2"

  if [ -f "$SRC" ]; then
    mkdir -p "$(dirname "$DST")"
    echo "Moving $SRC -> $DST"
    git mv "$SRC" "$DST"
  else
    echo "Skipping missing file: $SRC"
  fi
}

# Comparative / multiview apps
move_dir "double-slit-analytical" "apps/comparative/double-slit-analytical"
move_dir "stern-gerlach" "apps/comparative/stern-gerlach"
move_dir "bell-experiment" "apps/comparative/bell-experiment"
move_dir "measurement" "apps/comparative/measurement"
move_dir "free-particle" "apps/comparative/free-particle"

# Pilot-wave apps
move_dir "bohmian-double-slit-webgl" "apps/pilot-wave/double-slit-webgl"
move_dir "bohmian-tunneling" "apps/pilot-wave/tunneling"
move_dir "bohmian-free-packet-2d" "apps/pilot-wave/free-packet-2d"
move_dir "bohmian-free-particle-box-3d" "apps/pilot-wave/particle-box-3d"
move_dir "hydrogen-atom" "apps/pilot-wave/hydrogen-atom"
move_dir "2slit-wavepacket" "apps/pilot-wave/double-slit-numerical"

# Notebooks
move_dir "delayed-choice" "notebooks/delayed-choice"
move_dir "double-slit-notebook" "notebooks/double-slit"

# Remove failed temporary workflow if present
if [ -f ".github/workflows/reorganize-double-slit-analytical.yml" ]; then
  git rm ".github/workflows/reorganize-double-slit-analytical.yml"
fi

# Update homepage links
python3 - <<'PY'
from pathlib import Path

path = Path("index.html")
html = path.read_text(encoding="utf-8")

replacements = {
    "url:'double-slit-analytical/'": "url:'apps/comparative/double-slit-analytical/'",
    "url:'double-slit-analytical/qsf-v1.html'": "url:'apps/comparative/double-slit-analytical/'",
    "url:'qsf-v1.html'": "url:'apps/comparative/double-slit-analytical/'",

    "url:'stern-gerlach/'": "url:'apps/comparative/stern-gerlach/'",
    "url:'bell-experiment/'": "url:'apps/comparative/bell-experiment/'",
    "url:'measurement/'": "url:'apps/comparative/measurement/'",
    "url:'free-particle/free-particle.html'": "url:'apps/comparative/free-particle/free-particle.html'",

    "url:'bohmian-double-slit-webgl/'": "url:'apps/pilot-wave/double-slit-webgl/'",
    "url:'bohmian-tunneling/'": "url:'apps/pilot-wave/tunneling/'",
    "url:'bohmian-free-packet-2d/'": "url:'apps/pilot-wave/free-packet-2d/'",
    "url:'bohmian-free-particle-box-3d/'": "url:'apps/pilot-wave/particle-box-3d/'",
    "url:'hydrogen-atom/hydrogen-3d.html'": "url:'apps/pilot-wave/hydrogen-atom/hydrogen-3d.html'",
    "url:'2slit-wavepacket/'": "url:'apps/pilot-wave/double-slit-numerical/'",
}

for old, new in replacements.items():
    html = html.replace(old, new)

path.write_text(html, encoding="utf-8")
PY

echo
echo "=== Reorganization staged but not committed ==="
git status

echo
echo "Now test locally:"
echo "  python3 -m http.server 8000"
echo
echo "Then open:"
echo "  http://localhost:8000/"
echo
echo "If everything works:"
echo "  git add ."
echo "  git commit -m \"Reorganize apps and notebooks site structure\""
echo "  git push -u origin site-structure-cleanup"
