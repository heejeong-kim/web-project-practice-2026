#!/bin/zsh
set -e
cd "$(dirname "$0")"
PORT=8000
echo "웹프로젝트 실습 로컬 교안을 엽니다: http://localhost:${PORT}/"
open "http://localhost:${PORT}/"
python3 -m http.server "$PORT"
