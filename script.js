// data/links.csv(엑셀 → "CSV UTF-8"로 저장)를 읽어 화면을 그린다.
// url이 비어 있으면 "준비 중" 상태로 표시되어 클릭되지 않는다.
(function () {
  "use strict";

  // 그룹별 기본 아이콘 글자 (icon 열 값 → 표시 글자). 스타일은 style.css의 .ic-<icon>
  var GLYPH = {
    instagram: "◎", facebook: "f", threads: "@", youtube: "▶",
    "naver-clip": "N", "naver-blog": "N", blogger: "B", x: "X", tiktok: "♪",
    smartstore: "N", coupang: "C", mall: "C"
  };

  function parseCSV(text) {
    text = text.replace(/^﻿/, ""); // 엑셀 BOM 제거
    var rows = [], row = [], cur = "", q = false, i, c;
    for (i = 0; i < text.length; i++) {
      c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
        else cur += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cur); rows.push(row); row = []; cur = "";
      } else cur += c;
    }
    if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
    var head = rows.shift().map(function (h) { return h.trim(); });
    return rows
      .filter(function (r) { return r.some(function (v) { return v.trim(); }); })
      .map(function (r) {
        var o = {};
        head.forEach(function (h, k) { o[h] = (r[k] || "").trim(); });
        return o;
      });
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // 전화/이메일/URL 자동 판별 (연락처 칸에 010-1234-5678 또는 a@b.com 만 적어도 동작)
  function normalizeHref(url) {
    if (!url) return "";
    if (/^(https?:|tel:|mailto:|sms:)/i.test(url)) return url;
    if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(url)) return "mailto:" + url;
    if (/^[\d\s\-+()]{8,}$/.test(url)) return "tel:" + url.replace(/[^\d+]/g, "");
    return "https://" + url;
  }
  function isExternal(href) { return /^https?:/i.test(href); }

  function link(href, cls) {
    var a = el(href ? "a" : "div", cls + (href ? "" : " disabled"));
    if (href) {
      a.href = href;
      if (isExternal(href)) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
    } else a.setAttribute("aria-disabled", "true");
    return a;
  }

  function iconBox(base, d) {
    var s = el("span", base + " ic-" + (d.icon || "default"), GLYPH[d.icon] || (d.title || "?").charAt(0));
    s.setAttribute("aria-hidden", "true");
    return s;
  }

  function textBox(d) {
    var s = el("span", "txt");
    s.appendChild(el("b", null, d.title));
    if (d.subtitle) s.appendChild(el("em", null, d.subtitle));
    return s;
  }

  // 담당자 프로필 사진 (assets/ 폴더, 이름 기준 매칭)
  var PHOTOS = {
    "김덕용 부장": "assets/profile-kim-deokyong.png",
    "고환석 차장": "assets/profile-ko-hwanseok.png",
    "임이랑 과장": "assets/profile-im-irang.png"
  };

  // 홍보자료 카드 썸네일 이미지 (assets/ 폴더, icon 열 값 기준 매칭).
  // 이미지가 없거나 로드에 실패하면 아래 RES_LABEL 문구가 대신 보인다.
  var RES_THUMB = {
    video: "assets/resource-video.jpg",
    flyer: "assets/resource-flyer.jpg",
    "ad-image": "assets/resource-ad.jpg",
    logo: "assets/resource-logo.png"
  };
  var RES_LABEL = {
    flyer: "CONF<br>제품소개서",
    "ad-image": "광고<br>이미지",
    logo: "CONF<br>LOGO"
  };

  var builders = {
    sns: function (d, href) {
      var a = link(href, "card");
      a.append(iconBox("icon", d), textBox(d));
      return a;
    },
    shop: function (d, href) {
      var a = link(href, "card purchase");
      a.append(iconBox("purchase-icon", d), textBox(d), el("strong", null, href ? "›" : "준비 중"));
      return a;
    },
    contact: function (d, href) {
      var a = el("article", "contact-card");
      a.append(el("small", null, d.subtitle), el("b", null, d.title));
      var isMail = /^mailto:/i.test(href);
      var btn = link(href, "contact-btn");
      btn.textContent = !href ? "준비 중" : (isMail ? "✉ 문의하기" : "☎ 전화 연결");
      a.appendChild(btn);
      var photo = PHOTOS[d.title];
      if (photo) {
        a.classList.add("has-photo");
        var img = el("img", "contact-photo");
        img.src = photo; img.alt = d.title + " 프로필";
        a.appendChild(img);
      }
      if (href) {
        // 카드 전체를 버튼처럼: 어디를 눌러도 전화/메일 연결
        a.setAttribute("role", "link");
        a.setAttribute("tabindex", "0");
        a.setAttribute("aria-label", d.title + " " + d.subtitle + " 연결");
        a.addEventListener("click", function (e) { if (!e.target.closest("a")) window.location.href = href; });
        a.addEventListener("keydown", function (e) { if (e.key === "Enter") window.location.href = href; });
      }
      return a;
    },
    resource: function (d, href) {
      var a = link(href, "resource");
      var thumb = el("div", "res-thumb thumb-" + (d.icon || "default"));
      if (d.icon === "video") thumb.classList.add("is-video");
      var label = el("span", "res-label");
      label.innerHTML = RES_LABEL[d.icon] || "";
      thumb.appendChild(label);
      var src = RES_THUMB[d.icon];
      if (src) {
        var img = el("img", "res-img");
        img.src = src;
        img.alt = d.title + " 대표 이미지";
        img.loading = "lazy";
        img.decoding = "async";
        img.addEventListener("error", function () { thumb.classList.add("img-missing"); });
        thumb.appendChild(img);
      } else thumb.classList.add("img-missing");
      if (d.icon === "video") thumb.appendChild(el("span", "res-play", "▶"));
      var meta = el("div", "res-meta");
      meta.appendChild(el("b", null, d.title));
      if (d.subtitle) meta.appendChild(el("small", null, d.subtitle));
      a.append(thumb, meta);
      return a;
    },
    drive: function (d, href) {
      var a = link(href, "drive-button");
      a.append(document.createTextNode(d.title + " "), el("b", null, "›"));
      return a;
    }
  };

  function render(rows) {
    document.querySelectorAll("[data-group]").forEach(function (box) {
      var g = box.getAttribute("data-group");
      box.textContent = "";
      rows.filter(function (r) { return r.group === g && (!r.use || r.use === "사용"); }).forEach(function (r) {
        box.appendChild(builders[g](r, normalizeHref(r.url)));
      });
    });
  }

  fetch("data/links.csv", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (t) { render(parseCSV(t)); })
    .catch(function () {
      document.querySelector(".content").insertAdjacentHTML("afterbegin",
        '<p class="load-error">링크 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>');
    });

  (function notifyVisit() {
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.get("me") === "1") {
        localStorage.setItem("conf3_ignore_visit", "1");
        params.delete("me");
        var clean = window.location.pathname + (params.toString() ? "?" + params.toString() : "") + window.location.hash;
        window.history.replaceState(null, "", clean);
        return;
      }
      if (params.get("me") === "0") {
        localStorage.removeItem("conf3_ignore_visit");
      }
      if (localStorage.getItem("conf3_ignore_visit") === "1") return;
      if (navigator.webdriver || /bot|crawler|spider|kakaotalk|facebookexternalhit|slackbot|telegrambot|whatsapp|headless/i.test(navigator.userAgent)) return;
      if (sessionStorage.getItem("conf3_visit_sent") === "1") return;
      sessionStorage.setItem("conf3_visit_sent", "1");

      fetch("https://qaplus-telegram-webhook.gohwansok.workers.dev/conf3-visit", {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          ref: document.referrer || "직접 접속",
          path: window.location.pathname + window.location.search
        })
      }).catch(function () {});
    } catch (e) {}
  })();
})();
