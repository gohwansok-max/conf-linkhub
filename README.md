# 코엔에프(CONF) 제품 홍보 허브

포션커피·꿀생강차·꿀대추차 소개와 공식 구매처, SNS, 담당자 연락처, 홍보자료를 제공하는 GitHub Pages 정적 사이트입니다. 제품 선택에 따라 사진·영상·설명·색감·구매 링크가 함께 바뀝니다.

- 운영 주소: https://conf3.qaplus.kr (`CNAME` 파일 및 기존 DNS 유지)
- 기본 주소: https://gohwansok-max.github.io/conf-linkhub/
- 배포: 기존 저장소 `main` 브랜치 루트 → GitHub Pages 자동 배포

## 수정 위치

| 파일 | 역할 |
|---|---|
| `data/links.csv` | 기존 SNS·공식 구매처·담당자·자료실 링크 관리 |
| `data/products.json` | 대표 제품의 직접 구매 URL·사진·영상·문구 |
| `index.html` | 정적 본문·구매 링크·공유 메타데이터 |
| `style.css` | 기존 설치 안내·연락처·자료실 기본 스타일 |
| `experience.css` / `experience.js` | 제품 경험·반응형·애니메이션·공유·행사 종료 처리 |
| `assets/share-card.html` | 1200×630 공유 이미지의 편집 가능한 HTML 원본 |
| `assets/og-products.png` | 실제 공유 미리보기 이미지 |
| `assets/qr.svg` | 기존 운영 주소 QR 코드 |
| `service-worker.js` | 설치형 앱의 버전별 네트워크 우선 캐시 |
| `signature.html` | 기존 메일 서명 페이지, 수정하지 않음 |

제품 정보를 변경할 때 `data/products.json`과 `index.html`의 정적 제품 링크·이미지도 함께 맞춥니다. 제품 데이터 요청 실패 또는 JavaScript 비활성 환경에서는 정적 HTML 링크를 사용합니다. 가격·혜택을 새로 추정해 추가하지 않습니다.

## 링크 입력 방법 (엑셀)

`data/links.csv`를 엑셀에서 열고 CSV UTF-8 형식으로 저장합니다. 기존 열·행 순서를 유지합니다. `group`은 sns / shop / contact / resource / drive, `title`·`subtitle`은 표시 문구, `url`은 연결 주소입니다. 비어 있는 URL은 클릭 불가능한 준비 중 상태가 됩니다. `use`가 `사용`인 행만 표시합니다. `note`는 화면에 표시되지 않습니다.

연락처는 `010-1234-5678` 또는 이메일만 입력해도 자동 연결됩니다. 같은 `group`의 행을 추가하면 목록에 반영됩니다. 대량구매 버튼은 CSV의 첫 번째 영업 담당 연락처와 연결됩니다. 기존 방문 알림과 방문 제외 `?me=1`·재포함 `?me=0` 기능을 유지합니다. 검증용 호스트에서는 운영 방문 알림을 발송하지 않습니다.

## 행사 종료 관리

이번 블랙프라이데이는 `experience.js`의 `promotionEnd = Date.parse('2026-12-01T00:00:00+09:00')`를 기준으로 종료합니다. 즉 2026년 11월 30일 한국 시간까지 표시됩니다. 이후 행사 영역·이미지·스마트스토어 행사 안내를 숨기며 대표 제품과 일반 구매처는 계속 표시합니다. 탭을 열어 둔 경우에도 종료 타이머와 재활성화 시 갱신합니다. 행사 조건을 변경할 때 HTML의 가격·혜택·종료 문구와 종료 상수를 함께 갱신합니다. 판단 기준은 방문 기기의 시간입니다.

## 미디어·접근성

GIF 원본은 삭제하지 않았습니다. 웹에서는 원본 224×398 해상도를 유지한 H.264/yuv420p/faststart/무음 MP4와 정지 포스터를 사용합니다. 선택한 제품 영상 하나만 재생하고 화면 밖·숨겨진 탭·움직임 멈춤 시 정지합니다. 영상 오류 시 포스터를 표시합니다. 움직임 줄이기 또는 데이터 절약 설정에서는 자동재생을 하지 않습니다. 제품 선택은 방향키·Home·End로도 사용할 수 있습니다. 모바일 구매 버튼은 기기 하단 안전영역과 본문 여백을 고려합니다.

## 제품·사진 근거

확인일: 2026-11-28. 제품 구매는 아래 공식몰 상세페이지에서 진행합니다.

- 포션커피 아메리카노 블랙 30개입: https://confshop.kr/product/detail.html?product_no=19
- 꿀생강차: https://confshop.kr/product/detail.html?product_no=227
- 꿀대추차: https://confshop.kr/product/detail.html?product_no=226

사용한 사진은 기존 저장소의 `resource-ad.jpg`와 공식몰 상세페이지 자산입니다. 새 제품·라벨·인증을 생성하지 않았으며 원본을 업스케일하지 않았습니다.

- 커피: https://ecimg.cafe24img.com/pg386b65045721048/copotion1/web/upload/NNEditor/20260612/fc81f7de2b80d62969813d3e32b3c56b.jpg
- 꿀생강차: https://ecimg.cafe24img.com/pg386b65045721048/copotion1/web/upload/NNEditor/20261111/ED8BB0EC95A4EB939CEBA1AD_EABF80EC839DEAB095ECB0A8_01_ECB2ABED9994EBA9B4.png
- 꿀대추차: https://ecimg.cafe24img.com/pg386b65045721048/copotion1/web/upload/NNEditor/20261111/ED8BB0EC95A4EB939CEBA1AD_EABF80EB8C80ECB694ECB0A8_01_ECB2ABED9994EBA9B4.png

## 로컬 실행·캐시 갱신

`python3 -m http.server 8000` 실행 후 `http://localhost:8000`에서 확인합니다. 파일을 직접 열면 CSV 요청이 막힙니다. 화면과 동작 변경 시 HTML의 CSS·JS 버전 쿼리와 `service-worker.js`의 CACHE 이름·ASSETS를 함께 갱신합니다. 동영상 범위 요청과 MP4는 캐시 가로채기를 하지 않습니다. 새로운 분석 도구·광고 픽셀·개인정보 수집 기능은 추가하지 않았습니다.
