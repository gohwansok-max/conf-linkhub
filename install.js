// 상단 "앱 설치" 버튼 — Android/Chromium은 브라우저 네이티브 설치창을 바로 띄우고,
// iOS와 카카오톡 등 인앱 브라우저는 에스프레소·베이지 톤 안내 시트로 단계별 안내를 보여준다.
(function () {
  "use strict";

  var SITE_URL = "https://conf3.qaplus.kr/";

  var btn = document.getElementById("install-btn");
  var dialog = document.getElementById("install-dialog");
  var titleEl = document.getElementById("install-title");
  var leadEl = document.getElementById("install-lead");
  var stepsEl = document.getElementById("install-steps");
  var linkBox = document.getElementById("install-link-box");
  var urlEl = document.getElementById("install-url");
  var copyBtn = document.getElementById("install-copy");
  var noteEl = document.getElementById("install-note");
  var closeBtn = document.getElementById("install-close");
  if (!btn || !dialog) return;

  var deferredPrompt = null;
  var installed = window.__confInstalled === true;

  var ua = navigator.userAgent || "";
  var isIOS = /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/i.test(ua);
  var isInApp = /KAKAOTALK|NAVER\(|DaumApps|Instagram|FBAN|FBAV|Line\/|Twitter|Snapchat|Pinterest|everytime/i.test(ua);

  /* ---------- 버튼 노출 제어 ---------- */
  function isStandalone() {
    return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      window.navigator.standalone === true;
  }
  function syncButton() {
    var hide = installed || isStandalone();
    if (hide) {
      btn.setAttribute("hidden", "");
      btn.setAttribute("aria-hidden", "true");
    } else {
      btn.removeAttribute("hidden");
      btn.removeAttribute("aria-hidden");
    }
  }
  syncButton();
  if (window.matchMedia) {
    var mq = window.matchMedia("(display-mode: standalone)");
    var onChange = function () { syncButton(); };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ---------- Android / Chromium 네이티브 설치창 ---------- */
  function rememberPrompt(event) {
    if (!event || !event.prompt) return;
    deferredPrompt = event;
    installed = false;
    syncButton();
    btn.classList.add("is-ready");
  }

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    rememberPrompt(event);
  });

  // index.html <head>에서 먼저 잡아둔 프롬프트(install.js 로드 전에 발생한 경우)
  if (window.__confInstallPrompt) rememberPrompt(window.__confInstallPrompt);
  window.addEventListener("conf-install-prompt", function () {
    if (window.__confInstallPrompt) rememberPrompt(window.__confInstallPrompt);
  });

  function markInstalled() {
    installed = true;
    deferredPrompt = null;
    btn.classList.remove("is-ready");
    syncButton();
    closeDialog();
  }

  window.addEventListener("appinstalled", markInstalled);
  window.addEventListener("conf-installed", markInstalled);

  /* ---------- 안내 시트 ---------- */
  function guideFor() {
    if (isIOS) {
      if (isInApp) {
        return {
          title: "홈 화면에 추가",
          lead: "지금은 카카오톡 같은 앱 안에서 보고 계셔서 바로 설치할 수 없어요. Safari로 열면 10초면 끝납니다.",
          steps: [
            "오른쪽 위 <b>⋯</b>(또는 아래쪽 메뉴)를 누르고 <b>Safari로 열기</b>를 선택하세요.",
            "Safari 아래쪽 가운데의 <b>공유(□↑)</b> 버튼을 누르세요.",
            "목록을 조금 내려 <b>홈 화면에 추가</b>를 선택하세요.",
            "오른쪽 위 <b>추가</b>를 누르면 홈 화면에 코엔에프 앱이 생깁니다."
          ],
          note: "아래 주소를 복사해 Safari 주소창에 붙여 넣어도 됩니다."
        };
      }
      return {
        title: "홈 화면에 추가",
        lead: "아이폰·아이패드는 Safari의 공유 버튼으로 설치합니다.",
        steps: [
          "Safari 아래쪽 가운데의 <b>공유(□↑)</b> 버튼을 누르세요.",
          "목록을 조금 내려 <b>홈 화면에 추가</b>를 선택하세요.",
          "오른쪽 위 <b>추가</b>를 누르면 홈 화면에 코엔에프 앱이 생깁니다."
        ],
        note: "설치하면 주소창 없이 앱처럼 열리고, 홈 화면 아이콘으로 바로 접속할 수 있습니다."
      };
    }
    if (isAndroid) {
      if (isInApp) {
        return {
          title: "앱 설치",
          lead: "지금은 카카오톡 같은 앱 안에서 보고 계셔서 바로 설치할 수 없어요. Chrome이나 삼성 인터넷으로 열면 바로 설치됩니다.",
          steps: [
            "오른쪽 위 <b>⋮</b>(또는 아래쪽 메뉴)를 누르고 <b>다른 브라우저로 열기</b>를 선택하세요.",
            "<b>Chrome</b> 또는 <b>삼성 인터넷</b>을 선택하세요.",
            "열린 화면 위쪽의 <b>앱 설치</b> 버튼을 누르세요.",
            "설치 창이 뜨면 <b>설치</b>를 누르면 끝납니다."
          ],
          note: "아래 주소를 복사해 Chrome 주소창에 붙여 넣어도 됩니다."
        };
      }
      return {
        title: "앱 설치",
        lead: "브라우저 메뉴에서 바로 설치할 수 있어요.",
        steps: [
          "오른쪽 위 <b>⋮</b> 버튼을 누르세요.",
          "<b>앱 설치</b> 또는 <b>홈 화면에 추가</b>를 선택하세요.",
          "<b>설치</b>를 누르면 홈 화면에 코엔에프 앱이 생깁니다."
        ],
        note: "설치 창이 자동으로 뜨면 그때 <b>설치</b>를 눌러도 됩니다."
      };
    }
    return {
      title: "앱 설치",
      lead: "브라우저 주소창 오른쪽의 설치 아이콘을 누르거나, 메뉴에서 앱 설치를 선택하세요.",
      steps: [
        "주소창 오른쪽의 <b>설치 아이콘</b>(모니터 ⤓ 모양)을 누르세요.",
        "아이콘이 없으면 오른쪽 위 <b>⋮</b> 메뉴에서 <b>앱 설치</b>를 선택하세요.",
        "설치 창에서 <b>설치</b>를 누르면 앱으로 열립니다."
      ],
      note: "휴대전화에서는 아래 주소로 접속해 설치해 주세요."
    };
  }

  function renderSteps(items) {
    stepsEl.textContent = "";
    items.forEach(function (html, i) {
      var li = document.createElement("li");
      var num = document.createElement("span");
      num.className = "install-num";
      num.setAttribute("aria-hidden", "true");
      num.textContent = String(i + 1);
      var txt = document.createElement("span");
      txt.className = "install-text";
      txt.innerHTML = html;
      li.appendChild(num);
      li.appendChild(txt);
      stepsEl.appendChild(li);
    });
  }

  function openGuide() {
    var g = guideFor();
    titleEl.textContent = g.title;
    leadEl.textContent = g.lead;
    renderSteps(g.steps);
    if (g.note) {
      noteEl.innerHTML = g.note;
      noteEl.removeAttribute("hidden");
    } else {
      noteEl.setAttribute("hidden", "");
    }
    // 인앱 브라우저처럼 주소를 옮겨 적어야 하는 경우에만 주소 복사 영역을 강조 노출
    if (isInApp) linkBox.removeAttribute("hidden");
    else linkBox.setAttribute("hidden", "");

    if (typeof dialog.showModal === "function") {
      try { dialog.showModal(); return; } catch (err) { /* fall through */ }
    }
    dialog.setAttribute("open", "");
    dialog.classList.add("fallback");
    document.body.classList.add("install-fallback");
  }

  function closeDialog() {
    if (typeof dialog.close === "function" && dialog.open) {
      try { dialog.close(); } catch (err) { /* ignore */ }
    }
    dialog.removeAttribute("open");
    dialog.classList.remove("fallback");
    document.body.classList.remove("install-fallback");
  }

  btn.addEventListener("click", function () {
    if (deferredPrompt) {
      var promptEvent = deferredPrompt;
      deferredPrompt = null; // 한 번 쓰면 재사용 불가 — 새 이벤트가 오면 다시 저장된다
      btn.classList.remove("is-ready");
      try {
        promptEvent.prompt();
        if (promptEvent.userChoice && promptEvent.userChoice.then) {
          promptEvent.userChoice.then(function (choice) {
            if (choice && choice.outcome === "accepted") {
              installed = true;
              syncButton();
            }
          }).catch(function () { /* ignore */ });
        }
      } catch (err) {
        openGuide();
      }
      return;
    }
    openGuide();
  });

  copyBtn.addEventListener("click", function () {
    var text = SITE_URL;
    var done = function () {
      copyBtn.textContent = "복사됨 ✓";
      copyBtn.classList.add("is-copied");
      window.setTimeout(function () {
        copyBtn.textContent = "주소 복사";
        copyBtn.classList.remove("is-copied");
      }, 1800);
    };
    var manual = function () {
      urlEl.textContent = text;
      copyBtn.textContent = "길게 눌러 복사";
      if (window.getSelection && document.createRange) {
        try {
          var range = document.createRange();
          range.selectNodeContents(urlEl);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        } catch (err) { /* ignore */ }
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
      fallback();
    }

    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      var ok = false;
      try {
        ta.select();
        ta.setSelectionRange(0, text.length);
        ok = document.execCommand("copy");
      } catch (err) { ok = false; }
      document.body.removeChild(ta);
      if (ok) done();
      else manual();
    }
  });

  closeBtn.addEventListener("click", closeDialog);

  // 바깥(백드롭) 클릭 시 닫기
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) {
      var r = dialog.getBoundingClientRect();
      var inside = event.clientX >= r.left && event.clientX <= r.right &&
        event.clientY >= r.top && event.clientY <= r.bottom;
      if (!inside) closeDialog();
    }
  });

  // ESC로 닫을 때도 상태 정리 (dialog가 open 속성을 자동 제거하므로 클래스만 정리)
  dialog.addEventListener("close", function () {
    dialog.classList.remove("fallback");
    document.body.classList.remove("install-fallback");
  });
})();
