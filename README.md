# 공명 라이트 (Resonance lite)

수업 글을 공명 엔진 HTML로 바꾸는 단일 파일 렌더러다. 빌드와 외부 라이브러리가 필요 없으며, 브라우저 코드는 ES2017 범위에서 작성했다. 입력 문법은 [SPEC.md](SPEC.md), 엔진 부품 문법은 `skills/exploragram/references/components.md`를 따른다.

- `lite.js`: 파서, 순수 렌더러, 틀 8개, CSS, 브라우저 초기화와 장 나누기, 마주온 그림 묶음 넣기.
- `majuon/rules.md`: 충남교육청 마주온 에이전트 「공명 라이트」 규칙 원본. `LITE_URL`을 아래 주소로 바꿔 붙여 넣는다.
- `majuon/knowledge/example-*.md`: 에이전트 지식에 올리는 수업 글 본보기 4개(HTML 겉틀과 덱 줄 없이 수업 글만).
- `test/parse.test.mjs`: Node 기본 모듈만 쓰는 시험. 실제 엔진 식 파서로 계산도 확인한다.
- `examples/all-parts.html`: 틀 6개와 퀴즈, 분류, 순서, 그림 두 칸 배치.
- `examples/bio-parts.html`: 엽록체와 미토콘드리아의 `[구조]`, 색소 세 종류와 광합성 속도를 함께 보는 `[스펙트럼]`.
- `examples/states.json`: 위 예제의 1~6장 조작 상태 12개. 퍼지기는 초기화한 상태와 움직이는 상태를 비교한다.
- `examples/ion-3-1.html`: 기존 본보기. 내용은 수정하지 않는다.
- `examples/_rendered-*.html`: 눈으로 볼 수 있게 미리 펼친 파일. `.gitignore`로 제외한다.

## API

```js
const { parseLesson, renderLesson } = require('./lite.js');
// Node ESM: import { parseLesson, renderLesson } from './lite.js';
const lesson = parseLesson('# 제목\n본문');
const html = renderLesson('# 제목\n본문');
```

`parseLesson`은 `{ settings: { accent, deck }, slides, warnings }`를 반환한다. 각 장은 `{ id, title, type, section, blocks }`이고, 문법 문제가 있으면 `warnings`에 1부터 센 줄 번호와 설명을 담는다. 두 함수는 DOM을 읽거나 입력을 바꾸지 않는다. `renderLesson`의 반환값은 `section.slide` 조각이며 CSS와 엔진은 포함하지 않는다.

추가 API는 `paginateLesson(lesson, measure?)`와 `css` 문자열이다. `measure`는 장 구조를 받아 본문 높이(px)를 반환한다. 측정하지 못하면 글자 수로 어림한다. `renderLesson(text, { paginate: true })`로 같은 어림 나누기를 쓸 수 있다. 브라우저에서는 CSS를 기다린 뒤 화면 밖 1280×720 장에서 실제 높이를 재어 나눈다. 활동은 통째로 유지한다. 문단이나 활동 하나만으로 한 장보다 크면 그 덩어리는 그대로 남긴다.

브라우저에서는 `window.ResonanceLite`로 API를 제공하고 자동 초기화한다. `script[data-engine]`으로 엔진 폴더를 지정하며 기본값은 `https://cdn.jsdelivr.net/gh/N-lifescience/resonance@2/engine/`다. 이미 펼친 장이 있으면 엔진만 불러오고, 엔진 스크립트는 중복 삽입하지 않는다.

그래프의 가로 변수는 한 글자 영문이어야 한다. `x`, 함수명, 상수명뿐 아니라 계산 결과에 쓰는 `y`도 `a`로 바꾸어 충돌을 막는다. 원자번호 19·20은 2, 8, 8, 2 배치에 필요한 네 번째 껍질을 추가한다.

## 마주온 에이전트에서 쓰기

공명 저장소(N-lifescience/resonance)의 `lite-renderer` 브랜치 `lite/` 폴더를 2026-11-16에 이 저장소로 옮겼다. 에이전트 규칙은 버전 태그 주소를 쓴다.

    https://cdn.jsdelivr.net/gh/N-lifescience/resonance-lite@2/lite.js

lite.js를 고치면 `2.x.y` 태그를 올리고 `https://purge.jsdelivr.net/gh/N-lifescience/resonance-lite@2/lite.js`로 캐시를 비운다. 규칙과 에이전트는 건드리지 않아도 된다. 다만 `@1` 주소는 브라우저가 최대 7일(`max-age=604800`) 동안 캐시에 두므로, 이미 열어 본 컴퓨터는 새 판을 늦게 받을 수 있다(처음 여는 컴퓨터는 바로 받는다). 문법이 바뀌어 규칙도 바꿔야 할 때만 다음 큰 판(`3.0.0`)으로 올리고 규칙 주소를 바꾼다. 2026-11-17 `@쪽`과 x-ppt를 넣으며 `2.0.0`으로 올렸다(`@1`은 1.1.1에 머물러 그 전에 만든 파일이 그대로 열린다).

마주온의 기본 모델은 HTML을 짜지 않고 수업 글만 쓴다. 코드 실행 칸은 인터넷에 닿지 않고(2026-11-16 확인, Pillow는 있음) 만든 파일은 7일짜리 링크로 나온다. 그래서 규칙의 코드 두 개가 이렇게 나눠 일한다.

1. 목록 코드: 올라온 PPT의 장마다 글과 그림 번호를 찍고, 내용 그림 후보(크기, 되풀이 횟수, 8KB 이하로 거름)를 1280px WebP로 줄여 변수 `F`에 담는다. 장마다 쓰는 틀의 배경 그림도 틀 이름(`slideLayout6`)으로 `F`에 담고, 슬라이드 XML과 틀 이름을 zlib+base64로 줄여 `X`에 담는다. 한 차례 안의 코드 실행은 같은 파이썬을 이어 쓰므로 파일로 남기지 않는다(파일을 쓰면 마주온이 그 파일까지 링크로 내보인다).
2. 파일 만들기 코드: 수업 글, `F`, `X`를 `x-lesson`, `x-figures`, `x-ppt` 스크립트에 넣어 `수업.html`을 쓴다. 링크를 누르면 바로 열린다.

2026-11-17부터 모델은 PPT 글을 옮겨 쓰지 않는다. 수업 글에 `@12`처럼 쪽 번호만 적으면 lite.js가 PPT 원문(제목, 본문, 표, 물음과 답, 그림)을 그 자리에 펼치고 PPT 틀 배경을 깐다. 모델은 표지, 모형, 확인 활동만 쓴다. 빠른 모델이 장을 빼거나 내용을 지어내던 문제를 코드 쪽에서 막는다. 자세한 규칙은 SPEC.md 7절.

실행 칸은 대화 차례마다 새로 시작하고, 모델은 앞 차례 코드에 넣은 수업 글을 기억하지 못한다. 그래서 lite.js가 고칠 때 보낼 글에 수업 글을 담는다. 엔진 「점검」의 「AI에게 보낼 말 복사」는 점검 항목만 살리고 `[지금 수업 글]`을 붙인 글로 바꿔 끼우고, ⚙ 설정 「파일」 칸에도 같은 이름의 단추를 더한다. 모델은 그 글을 고쳐 두 코드를 다시 돌린다.

lite.js는 그림 묶음을 읽어 `img[data-ppt]` 자리에 넣고(값은 WebP base64나 data URL), 묶음은 문서에서 떼어 내 엔진의 「그림 넣어 저장」이 쓴 그림만 담게 한다. 묶음에 없는 번호는 예전처럼 회색 자리로 남아 원본 PPT를 끌어다 놓으면 채워진다. `<title>`이 없으면 표지 제목을 문서 제목으로 삼아 수업마다 판서 저장 칸이 갈린다. `*.blob.core.windows.net`(마주온 파일 링크)에서 열면 링크가 사라지는 날짜와 저장 방법을 화면 위 띠로 알린다. 띠는 닫힌 그림자 루트에 그려 저장 파일에 따라가지 않는다.

## 시험

저장소 루트에서 실행한다. 엔진 식 검사는 lite.js가 쓰는 `resonance@2` 엔진을 받아 쓰고, `ENGINE=경로`로 로컬 파일을 줄 수 있다.

```sh
node test/parse.test.mjs
```

문법, 이스케이프, 결정적 퀴즈 섞기, 틀의 식과 처음·끝 계산값, 장 나누기, 초기화 순서를 검사한다. 생명과학 틀은 동의어, 경고 줄 번호, 소기관 짐작, 색 이름 경계와 곡선의 계산값도 확인한다. 초기화 검사는 Node 모의 DOM으로 수행하며 실제 브라우저 배치 검사를 대신하지 않는다.

Chrome 점검은 별도로 실행한다.

```sh
node skills/exploragram/scripts/states.mjs lite/examples/ion-3-1.html /tmp/lite-ion
node skills/exploragram/scripts/states.mjs lite/examples/all-parts.html /tmp/lite-all lite/examples/states.json
node skills/exploragram/scripts/states.mjs lite/examples/bio-parts.html /tmp/lite-bio
```

실제 화면의 넘침과 정렬, `errors 0` 여부는 위 점검에서 확인해야 한다. 엔진을 고치면 식 파서 호환 시험도 다시 돌린다.
