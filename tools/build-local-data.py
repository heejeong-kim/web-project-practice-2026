#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
로컬(file://) 실행용 교안 데이터 번들 생성기
- data/lectures/*.md, data/secure/*.json 을 읽어 data/local-bundle.js 한 파일로 묶음
- 브라우저는 file:// 에서 fetch()를 막기 때문에, <script>로 불러오는 JS 번들로 우회함
- 교안(md)이나 보안 섹션(json)을 수정한 뒤에는 이 스크립트를 다시 실행해야 로컬에 반영됨
  (GitHub Pages 등 http(s) 환경에서는 번들을 쓰지 않고 원본 파일을 그대로 읽음)
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGETS = [('lectures', '*.md'), ('secure', '*.json')]
OUT = ROOT / 'data' / 'local-bundle.js'

def main():
    bundle = {}
    for folder, pattern in TARGETS:
        for path in sorted((ROOT / 'data' / folder).glob(pattern)):
            bundle[f'{folder}/{path.name}'] = path.read_text(encoding='utf-8')
    body = json.dumps(bundle, ensure_ascii=False, indent=0)
    # </script> 문자열이 섞여도 안전하도록 이스케이프
    body = body.replace('</', '<\\/')
    OUT.write_text(
        '/* 자동 생성 파일: tools/build-local-data.py 로 다시 만드세요. 직접 수정 금지 */\n'
        f'window.LOCAL_DATA_BUNDLE = {body};\n',
        encoding='utf-8')
    print(f'[완료] {OUT.relative_to(ROOT)} · {len(bundle)}개 파일 번들링')
    for key in bundle:
        print('  -', key)

if __name__ == '__main__':
    main()
