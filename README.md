# 코엔에프(CO.EN.F) 공식 링크 허브

공식 SNS, 구매처, 담당자 연락처, 홍보자료를 한 곳에 모은 GitHub Pages 정적 사이트.

- 운영 주소: https://conf3.qaplus.kr (`CNAME` 파일 + 가비아 CNAME `conf3` → `gohwansok-max.github.io`)
- 기본 주소: https://gohwansok-max.github.io/conf-linkhub/

## 구조

| 파일 | 역할 |
|---|---|
| `data/links.csv` | **링크·연락처 데이터 (여기만 수정)** |
| `index.html` / `style.css` / `script.js` | 화면 (수정 불필요) |
| `assets/qr.svg` | QR 이미지 (없으면 "QR" 빈 칸 표시) |

## 링크 입력 방법 (엑셀)

1. 엑셀에서 `data/links.csv`를 열어 `url` 열만 채움 (열·행 순서 유지)
2. **다른 이름으로 저장 → CSV UTF-8(쉼표로 분리)** 로 저장해 덮어쓰기
3. 커밋/푸시 → 1~2분 후 반영

| 열 | 설명 |
|---|---|
| `group` | sns / shop / contact / resource / drive (변경 금지) |
| `icon` | 아이콘 종류 (변경 금지) |
| `title`, `subtitle` | 화면 표시 문구 |
| `url` | 링크. 비우면 "준비 중"(클릭 불가) 표시 |
| `use` | `사용`만 화면에 표시 (보류/미사용은 숨김) |
| `note` | 메모 (화면 미표시) |

- 연락처는 `010-1234-5678` 또는 `name@example.com` 만 적으면 전화/메일로 자동 연결
- `https://` 생략 가능 (자동 보완)
- 행 추가: 같은 `group`으로 한 줄 추가하면 해당 섹션에 표시됨

## 로컬 미리보기

`python3 -m http.server` 실행 후 http://localhost:8000 (파일 직접 열기는 CSV 로드가 막힘)
