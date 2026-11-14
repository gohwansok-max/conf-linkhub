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
      return a;
    },
    resource: function (d, href) {
      var a = link(href, "resource");
      var thumb = el("div", d.icon === "video" ? "video-thumb" : "flyer-thumb thumb-" + d.icon);
      if (d.icon === "video") thumb.appendChild(el("span", null, "▶"));
      else thumb.innerHTML = {flyer: "CONF<br>제품소개서", "ad-image": "광고<br>이미지", logo: "CONF<br>LOGO"}[d.icon] || d.title;
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
})();
