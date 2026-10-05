(() => {
  let installEvent = null;
  const standalone = window.matchMedia('(display-mode: standalone)');
  const isInstalled = () => standalone.matches || navigator.standalone === true;
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const banner = document.createElement('section');
  banner.className = 'install-banner';
  banner.setAttribute('aria-label', '숫자 숲 앱 설치');
  banner.innerHTML = '<img src="icon-192.png" alt="" width="48" height="48"><div><strong>숫자 숲을 내 폰에 쏙!</strong><p id="install-status" role="status">홈 화면에서 바로 시작해요.</p></div><button id="install-app" class="primary">앱 설치</button>';
  document.querySelector('#home .section-heading').before(banner);
  const button = document.getElementById('install-app');
  const status = document.getElementById('install-status');
  const dialog = document.createElement('dialog');
  dialog.id = 'install-help';
  dialog.setAttribute('aria-labelledby', 'install-title');
  dialog.innerHTML = '<h2 id="install-title">홈 화면에 숫자 숲 추가하기</h2><p id="install-intro"></p><ol id="install-steps"></ol><p class="muted">카카오톡·네이버 등의 앱 안에서 열었다면 먼저 Safari 또는 Chrome으로 열어 주세요. 설치 전후 기록은 브라우저에 따라 따로 보일 수 있어요.</p><form method="dialog"><button class="primary">알겠어요</button></form>';
  document.body.append(dialog);
  function updateInstalled() {
    button.hidden = isInstalled();
    if (isInstalled()) status.textContent = '홈 화면 앱으로 실행 중이에요.';
  }
  function showHelp() {
    document.getElementById('install-intro').textContent = ios ? '아이폰·아이패드에서는 공유 메뉴로 설치할 수 있어요.' : '설치 창이 아직 준비되지 않았어요. 브라우저 메뉴에서도 설치할 수 있어요.';
    const steps = ios ? ['Safari에서 이 게임 주소를 열어요.', '공유 버튼(위쪽 화살표 모양)을 누르고 “홈 화면에 추가”를 골라요.', '“웹 앱으로 열기”가 보이면 켜고 “추가”를 눌러요.'] : ['Chrome 또는 Samsung Internet에서 이 게임 주소를 열어요.', '브라우저 메뉴(⋮ 또는 ☰)에서 “앱 설치”나 “홈 화면에 추가”를 골라요.', '설치를 완료하고 홈 화면의 숫자 숲 아이콘을 눌러요.'];
    const list = document.getElementById('install-steps');
    list.replaceChildren(...steps.map(text => {const li = document.createElement('li');li.textContent = text;return li;}));
    dialog.showModal();
  }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();installEvent = event;
    button.textContent = '앱 설치';
    if (!isInstalled()) status.textContent = '설치 버튼을 누르면 홈 화면에 추가할 수 있어요.';
  });
  button.addEventListener('click', async () => {
    if (!installEvent) {showHelp();return;}
    const event = installEvent;installEvent = null;button.disabled = true;
    try {
      await event.prompt();
      const choice = await event.userChoice;
      status.textContent = choice.outcome === 'accepted' ? '설치를 요청했어요. 완료되면 홈 화면에서 열어 주세요.' : '나중에 설치해도 괜찮아요. 지금 바로 게임을 즐겨요!';
    } catch {showHelp();}
    finally {button.disabled = false;}
  });
  window.addEventListener('appinstalled', () => {installEvent = null;button.hidden = true;status.textContent = '설치했어요! 홈 화면에서 숫자 숲을 찾아보세요.';});
  standalone.addEventListener('change', updateInstalled);
  updateInstalled();
  const style = document.createElement('style');
  style.textContent = '.install-banner{display:flex;align-items:center;gap:14px;padding:20px 22px;margin:0 0 30px;background:#e7eddf;border:1px solid #d5e0c9;border-radius:18px}.install-banner img{border-radius:12px;flex-shrink:0}.install-banner>div{flex:1}.install-banner strong{font-size:15px}.install-banner p{font-size:12px;color:#60735b;margin:6px 0 0;line-height:1.6}.install-banner button{white-space:nowrap;font-size:13px}#install-help h2{font-size:22px}#install-help p,#install-help li{font-size:14px;line-height:1.9}#install-help li{margin-bottom:12px}#install-help ol{padding-left:22px}#install-help form{text-align:right;margin-top:22px}@media(max-width:480px){.install-banner{padding:16px;gap:12px;flex-wrap:wrap}.install-banner button{width:100%}.install-banner strong{font-size:14px}.hero{grid-template-columns:1fr;position:relative;padding-right:0}.hero h1{font-size:32px}.hero .illustration{display:none}}';
  document.head.append(style);
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js').then(() => navigator.serviceWorker.ready).then(() => {
      if (!isInstalled() && !installEvent) status.textContent = '오프라인 준비 완료 · 홈 화면에서 바로 시작해요.';
    }).catch(() => {if (!isInstalled()) status.textContent = '홈 화면에서 바로 시작해요. 첫 실행에는 인터넷이 필요해요.';});
  }
})();
