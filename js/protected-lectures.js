/* 비밀번호·복호화 결과는 저장하지 않는다. 입력값은 이 화면의 메모리에서만 사용한다. */
(() => {
  const bytes = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));
  async function decrypt(password, payload) {
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({name:'PBKDF2',salt:bytes(payload.salt),iterations:payload.iterations,hash:'SHA-256'}, material, {name:'AES-GCM',length:256}, false, ['decrypt']);
    return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(payload.iv)},key,bytes(payload.data)));
  }
  window.unlockProtectedLecture = async function (week) {
    const response = await fetch(`../data/secure/lecture-${String(week).padStart(2,'0')}.enc.json`, {cache:'no-store'});
    if (!response.ok) throw new Error('잠긴 교안을 불러오지 못했습니다.');
    const payload = await response.json();
    if (!crypto.subtle) throw new Error('HTTPS 또는 localhost에서 교안을 열어 주세요.');
    const root = document.querySelector('#lecture-content');
    const panel = document.createElement('section');
    panel.className = 'protected-lecture';
    panel.innerHTML = `<h2>${week}주차 강의교안 잠금</h2><p>비밀번호를 입력해 교안을 열어 주세요.</p><form><label for="lecture-password">비밀번호</label><input id="lecture-password" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" required><button type="submit">교안 열기</button><p role="status" aria-live="polite"></p></form>`;
    root.replaceChildren(panel);
    const form = panel.querySelector('form'), input = panel.querySelector('input');
    const button = panel.querySelector('button'), status = panel.querySelector('[role="status"]');
    return new Promise(resolve => {
      form.addEventListener('submit',async event => {
        event.preventDefault(); button.disabled = true; status.textContent = '확인 중…';
        let password = input.value; input.value = '';
        try { const markdown = await decrypt(password,payload); password = ''; form.reset(); panel.remove(); resolve(markdown); }
        catch { password = ''; status.textContent = '비밀번호가 올바르지 않습니다.'; button.disabled = false; input.focus(); }
      });
    });
  };
})();
