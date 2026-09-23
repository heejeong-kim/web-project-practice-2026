/*
 * 로컬(file://) 실행 지원용 fetch 보조 스크립트
 * - file:// 에서는 브라우저 보안 정책상 fetch()로 md/json 파일을 읽을 수 없음
 * - 이때만 data/local-bundle.js 에 미리 묶어 둔 내용을 fetch 응답처럼 돌려줌
 * - http(s) 환경(GitHub Pages, 로컬 서버)에서는 아무 동작도 하지 않음
 */
(function () {
  if (location.protocol !== 'file:') return;
  var bundle = window.LOCAL_DATA_BUNDLE;
  if (!bundle) {
    console.warn('[local-data] data/local-bundle.js 가 없습니다. build-local-data.command 를 실행해 주세요.');
    return;
  }
  var nativeFetch = window.fetch ? window.fetch.bind(window) : null;
  var PATTERN = /\/data\/((?:lectures\/[^\/]+\.md)|(?:secure\/[^\/]+\.json))$/;

  window.fetch = function (input, init) {
    var raw = typeof input === 'string' ? input : (input && input.url) || '';
    var path = '';
    try { path = decodeURIComponent(new URL(raw, location.href).pathname); } catch (_) {}
    var match = path.match(PATTERN);
    if (match) {
      var key = match[1];
      if (Object.prototype.hasOwnProperty.call(bundle, key)) {
        var type = /\.json$/.test(key) ? 'application/json' : 'text/markdown';
        return Promise.resolve(new Response(bundle[key], { status: 200, headers: { 'Content-Type': type + '; charset=utf-8' } }));
      }
      return Promise.resolve(new Response('', { status: 404, statusText: 'Not in local bundle' }));
    }
    if (!nativeFetch) return Promise.reject(new Error('fetch를 사용할 수 없습니다.'));
    return nativeFetch(input, init);
  };
})();
