/* 제품 경험만 담당한다. 기존 CSV 관리와 방문 알림은 script.js에 유지한다. */
(function () {
  'use strict';
  var promotionEnd = Date.parse('2026-12-01T00:00:00+09:00');
  function isPromotionActive(now) { return (now == null ? Date.now() : Number(now)) < promotionEnd; }
  window.ConfExperience = { isPromotionActive: isPromotionActive, promotionEnd: promotionEnd };

  var keys = ['coffee', 'ginger', 'jujube'];
  var names = { coffee: '포션커피', ginger: '꿀생강차', jujube: '꿀대추차' };
  var descriptions = {
    coffee: '집에서도, 사무실에서도. 물에 붓고 간편하게 즐기는 커피.',
    ginger: '생강차가 생각날 때. 한 개씩 꺼내 간편하게 즐기는 꿀생강차.',
    jujube: '차 한 잔의 여유가 필요할 때. 나만의 시간에 함께하는 꿀대추차.'
  };
  var kickers = { coffee: '커피가 생각나는 순간', ginger: '생강차가 생각날 때', jujube: '차 한 잔의 여유' };
  var products = {};
  keys.forEach(function (key) {
    var link = document.querySelector('[data-product-link="' + key + '"]');
    var image = document.querySelector('[data-product-image="' + key + '"]');
    products[key] = {
      name: names[key], description: descriptions[key], kicker: kickers[key],
      url: link.getAttribute('href'), image: image.getAttribute('src'), alt: image.alt,
      width: Number(image.width), height: Number(image.height),
      poster: 'assets/potion-' + key + '-poster.jpg', video: 'assets/potion-' + key + '.mp4'
    };
  });
  var selected = 'coffee';
  var root = document.documentElement;
  var mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = mediaQuery.matches;
  var saveData = Boolean(navigator.connection && navigator.connection.saveData);
  var userPaused = reduced || saveData;
  var filmVisible = true;
  var video = document.getElementById('hero-video');
  var image = document.getElementById('hero-product-image');
  var panel = document.getElementById('product-panel');
  var control = document.getElementById('motion-toggle');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.product-tab'));
  var videoFailed = false;
  var fallback = document.createElement('img');
  fallback.className = 'film-fallback';
  fallback.width = 224; fallback.height = 398; fallback.hidden = true;
  video.insertAdjacentElement('afterend', fallback);

  function updateControl() {
    root.classList.toggle('motion-paused', userPaused);
    control.setAttribute('aria-pressed', String(userPaused));
    control.setAttribute('aria-label', userPaused ? '화면 움직임 재생하기' : '화면 움직임 멈추기');
    control.textContent = userPaused ? '움직임 재생' : '움직임 멈춤';
    control.disabled = reduced;
    if (reduced) {
      control.textContent = '정지 화면';
      control.setAttribute('aria-label', '기기의 움직임 줄이기 설정 사용 중');
    }
  }
  function syncPlayback() {
    if (userPaused || reduced || !filmVisible || document.hidden || videoFailed) {
      video.pause(); return;
    }
    if (!video.getAttribute('src')) {
      video.src = products[selected].video;
      video.load();
    }
    var play = video.play();
    if (play && play.catch) play.catch(function () { /* 자동재생 제한 시 포스터는 그대로 유지한다. */ });
  }
  function setProduct(key, animate) {
    if (!products[key]) return;
    var product = products[key];
    selected = key;
    document.body.dataset.product = key;
    panel.setAttribute('aria-labelledby', 'tab-' + key);
    tabs.forEach(function (tab) {
      var active = tab.dataset.product === key;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    image.src = product.image; image.alt = product.alt;
    image.width = product.width || 900; image.height = product.height || 600;
    image.classList.remove('is-changing');
    if (animate && !userPaused && !reduced) {
      void image.offsetWidth;
      image.classList.add('is-changing');
    }
    document.getElementById('hero-product-name').textContent = product.name;
    document.getElementById('hero-product-kicker').textContent = product.kicker;
    document.getElementById('selected-description').textContent = product.description;
    document.querySelectorAll('[data-selected-buy]').forEach(function (a) { a.href = product.url; });
    document.getElementById('selected-buy').innerHTML = product.name + ' 구매하기 <span aria-hidden="true">↗</span>';
    document.querySelector('#mobile-buy strong').innerHTML = product.name + ' <span aria-hidden="true">↗</span>';
    video.pause(); video.removeAttribute('src');
    video.poster = product.poster;
    video.setAttribute('aria-label', product.name + '를 컵에 붓는 모습');
    fallback.src = product.poster; fallback.alt = product.name + '를 컵에 붓는 정지 장면';
    video.hidden = false; fallback.hidden = true; videoFailed = false;
    video.load();
    syncPlayback();
  }
  image.addEventListener('error', function () {
    var poster = products[selected].poster;
    if (image.getAttribute('src') !== poster) {
      image.src = poster; image.width = 224; image.height = 398;
      image.alt = products[selected].name + '를 컵에 붓는 모습';
    }
  });
  video.addEventListener('error', function () {
    if (!video.getAttribute('src')) return;
    videoFailed = true; video.hidden = true; fallback.hidden = false;
  });
  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { setProduct(tab.dataset.product, true); });
    tab.addEventListener('keydown', function (e) {
      var next = index;
      if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      else return;
      e.preventDefault(); tabs[next].focus(); setProduct(tabs[next].dataset.product, true);
    });
  });
  control.addEventListener('click', function () {
    userPaused = !userPaused;
    updateControl(); syncPlayback();
  });
  function motionPreferenceChanged(e) {
    reduced = e.matches;
    if (reduced) userPaused = true;
    root.classList.toggle('js-motion', !reduced);
    updateControl(); syncPlayback();
  }
  if (mediaQuery.addEventListener) mediaQuery.addEventListener('change', motionPreferenceChanged);
  else if (mediaQuery.addListener) mediaQuery.addListener(motionPreferenceChanged);

  // 지원하지 않는 브라우저에서는 처음부터 모든 콘텐츠를 표시한다.
  if ('IntersectionObserver' in window) {
    root.classList.toggle('js-motion', !reduced);
    var reveals = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveals.unobserve(entry.target); }
      });
    }, { threshold: .08 });
    document.querySelectorAll('.reveal').forEach(function (section) { reveals.observe(section); });
    var filmObserver = new IntersectionObserver(function (entries) {
      filmVisible = entries[0].isIntersecting; syncPlayback();
    }, { threshold: .1 });
    filmObserver.observe(video.parentElement);
  }
  var tilt = document.getElementById('product-tilt');
  tilt.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || reduced || userPaused) return;
    var box = tilt.getBoundingClientRect();
    tilt.style.setProperty('--tilt-y', ((e.clientX - box.left) / box.width - .5) * 5 + 'deg');
    tilt.style.setProperty('--tilt-x', -((e.clientY - box.top) / box.height - .5) * 4 + 'deg');
  });
  tilt.addEventListener('pointerleave', function () { tilt.style.setProperty('--tilt-y', '0deg'); tilt.style.setProperty('--tilt-x', '0deg'); });
  var steps = document.querySelector('.how-steps');
  var scrollPending = false;
  function updateSteps() {
    scrollPending = false;
    var rect = steps.getBoundingClientRect();
    var progress = Math.min(1, Math.max(0, (window.innerHeight * .88 - rect.top) / (rect.height + window.innerHeight * .25)));
    steps.style.setProperty('--step-progress', reduced || userPaused ? '1' : String(progress));
  }
  window.addEventListener('scroll', function () {
    if (!scrollPending) { scrollPending = true; window.requestAnimationFrame(updateSteps); }
  }, { passive: true });
  window.addEventListener('resize', updateSteps);

  function updatePromotion() {
    var active = isPromotionActive();
    var promotion = document.querySelector('[data-promotion]');
    promotion.hidden = !active;
    promotion.querySelectorAll('[data-promo-src]').forEach(function (img) {
      if (active) img.src = img.dataset.promoSrc;
      else img.removeAttribute('src');
    });
    var subtitle = document.querySelector('.purchase .ic-smartstore + .txt em');
    if (subtitle) subtitle.textContent = active ? '블랙프라이데이 특가전 · 11/30까지' : '코엔에프 공식 스마트스토어';
  }
  // 탭을 열어 둔 채 종료 시각이 지나도 행사와 안내를 갱신한다.
  var remaining = promotionEnd - Date.now();
  if (remaining > 0 && remaining < 2147483647) window.setTimeout(updatePromotion, remaining + 100);
  document.addEventListener('visibilitychange', function () { updatePromotion(); syncPlayback(); });
  // 대량구매 번호는 index.html의 지정 담당자를 유지하며 CSV 목록 순서에 영향받지 않는다.
  document.addEventListener('conf:links-ready', updatePromotion);

  document.getElementById('share-btn').addEventListener('click', async function () {
    var status = document.getElementById('share-status');
    var share = { title: '코엔에프 포션커피·꿀생강차·꿀대추차', text: '톡 까서 붓는 간편한 한 잔. 코엔에프 제품을 만나보세요.', url: 'https://conf3.qaplus.kr/' };
    try {
      if (navigator.share) { await navigator.share(share); status.textContent = '공유 창을 열었습니다.'; }
      else if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(share.url); status.textContent = '주소를 복사했습니다. 메시지에 붙여 넣어 주세요.'; }
      else { status.textContent = '공유 주소: ' + share.url; }
    } catch (e) {
      if (e.name !== 'AbortError') status.textContent = '공유 주소: ' + share.url;
    }
  });
  updateControl(); updatePromotion(); setProduct('coffee', false); updateSteps();
  fetch('data/products.json', { cache: 'no-cache' }).then(function (r) {
    if (!r.ok) throw new Error('제품 데이터 읽기 실패'); return r.json();
  }).then(function (data) {
    keys.forEach(function (key) {
      if (!data[key] || !/^https:\/\//.test(data[key].url)) return;
      products[key] = Object.assign(products[key], data[key]);
      var link = document.querySelector('[data-product-link="' + key + '"]');
      var cardImage = document.querySelector('[data-product-image="' + key + '"]');
      link.href = products[key].url;
      cardImage.src = products[key].image; cardImage.alt = products[key].alt;
      cardImage.width = products[key].width; cardImage.height = products[key].height;
    });
    setProduct(selected, false);
  }).catch(function () { /* 네트워크 실패 시 정적 HTML의 검증된 제품 링크를 사용한다. */ });
})();
