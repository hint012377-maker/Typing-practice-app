# 🌍 GeoPlayroom (세계시민과 지리 플레이룸)

> **"외우는 세계에서, 경험하는 세계로."**  
> **GeoPlayroom**은 2022 개정 교육과정 「세계시민과 지리」 과목을 기반으로, 타자 연습, 물리 합성 게임, 리듬 게임을 통해 세계의 국가와 기후를 손끝으로 익히는 웹 기반 인터랙티브 지리 학습 플랫폼입니다.

---

## 🎮 주요 게임 및 기능 (Games & Features)

### 1. ⌨️ 나라 이름 타자 연습 (Country Typing)
- **실시간 위치 연동 지도**: 구글 지도(Google Maps Embed API)를 통해 해당 국가의 실제 위치와 윤곽을 직접 확인하며 타자 입력
- **다양한 학습 모드**: 한국어/영어 입력 전환, 일반/위성 지도 변경, 넓은 뷰/상세 확대 뷰 지원
- **실시간 통계**: 소요 시간, 분당 타수(CPM), 정확도(%), 정답 수 실시간 계산 및 표시
- **인터랙티브 피드백**: Web Audio API를 활용한 타자 입력음 및 정답 사운드 효과

### 2. ☀️ 쾨펜 기후 수박게임 (Climate Merge)
- **2D 물리 엔진 적용**: `Matter.js`를 기반으로 기후 공을 바구니에 떨어뜨리고 합성하는 피지컬 캐주얼 게임
- **기후 합성 트리**: 열대(A), 건조(B), 온대(C), 냉대(D), 한대(E) 기후를 단계별로 합성하여 최종 **'지구(ABCDE)'** 완성
- **학습 도우미**: 기후 조합 경로를 한눈에 볼 수 있는 **기후 도감(Climate Atlas)** 및 게임 가이드 제공
- **점수 시스템**: 콤보 점수, 실시간 점수 산출 및 `localStorage`를 통한 최고 기록 저장

### 3. ♫ 나라 리듬게임 (Country Rhythm)
- **4레인 리듬 비트**: 세계 국가 데이터를 노트로 생성하여 판정선에 맞춰 타이밍을 맞추는 4키(D, F, J, K) 리듬 게임
- **커스텀 음원 지원**: 내장 트랙(오리지널/클래식 아케이드) 외에도 사용자 MP3/WAV 파일 업로드 지원 (BPM 및 오프셋 수동 설정 가능)
- **동적 채보 알고리즘**: 음원의 BPM과 길이에 맞춰 4개의 레인에 국가 데이터를 중복 없이 무작위 배정하여 일반 노트 및 롱노트 자동 생성
- **맞춤형 설정 & 퍼포먼스**: 단축키 커스텀 설정(브라우저 저장 가능) 및 Canvas 2D API 기반의 파티클 스파크 애니메이션 렌더링

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend Core:** React 18, TypeScript, React Router v7
- **Physics Engine:** Matter.js (2D Physics Engine)
- **Graphics & Audio:** HTML5 Canvas 2D API, Web Audio API, Web Worker
- **Styling:** Tailwind CSS v4, Custom CSS Variables
- **Fonts:** IBM Plex Sans KR, JetBrains Mono, Outfit
- **Build Tool:** Vite

---

## 📂 프로젝트 구조 (Project Structure)

```text
Typing-practice-app/
├── src/
│   ├── App.tsx               # 메인 라우터, GeoPlayroom 홈, 국가 타자 연습, 기후 수박게임 로직
│   ├── RhythmGame.tsx        # 4레인 리듬게임 컴포넌트 (Canvas 렌더링, 키 입력 판정)
│   ├── rhythmSongs.ts        # 리듬게임 내장 음원 트랙 및 맵셋 프리셋
│   ├── rhythmSongWorker.ts   # 음원 파일 처리 및 디코딩을 위한 Web Worker
│   ├── countries.ts          # 전 세계 국가 지리 데이터 (위도, 경도, 줌레벨, 한국어/영어명)
│   ├── index.css             # Tailwind CSS 설정 및 글로벌 테마/스타일
│   └── main.tsx              # 앱 엔트리 포인트
├── public/                   # 정적 리소스 (아이콘 등)
├── index.html
├── package.json
└── README.md
