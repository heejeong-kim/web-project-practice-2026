#!/bin/zsh
# 교안(md)·보안 섹션(json) 수정 후 더블클릭 → 로컬(file://) 표시용 번들 갱신
cd "$(dirname "$0")"
python3 tools/build-local-data.py
echo ""
echo "이제 lecture/index.html 을 더블클릭해도 최신 교안이 표시됩니다."
