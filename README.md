# 📊 AI CSV QA Report Engine (AI CSV 품질 리포트 분석 엔진)

> **소프트웨어 품질 관리(QA) 포트폴리오를 위한 최고 등급의 인터랙티브 AI 품질 분석 대시보드 및 리포트 솔루션**  
> 이 프로젝트는 QA 실행 결과(Test Run) 및 결함 대장(Defect List) CSV 데이터를 업로드하고 정량적 분석 지표(Recharts 대시보드)와 Gemini AI 기반의 고품질 분석 보고서 및 1:1 QA 어시스턴트를 제공하는 풀스택 웹 애플리케이션입니다.

---

## 🌟 주요 특징 (Key Features)

1. **실시간 CSV 파싱 및 동적 감지**
   - 테스트 실행 결과 또는 버그 리포트 CSV 업로드 지원 (UTF-8 인코딩 지원).
   - 컬럼 이름(`Status`, `Priority`, `Severity` 등)을 똑똑하게 감지하여 상태 비중, 중요도 분포, 모듈별 취약점을 자동 매핑 및 필터링합니다.

2. **품질 게이트 (Quality Gate) & 실시간 릴리즈 배포 판정**
   - 품질 요구 조건인 최소 통과율(%), 허용 최대 Critical 및 High 등급 결함 개수, Blocked 테스트 허용 여부를 사용자가 슬라이더와 제어판으로 조정할 수 있습니다.
   - 설정된 한계치를 실시간으로 만족하는지 검사하여 **릴리즈 합격 여부(GO / NO-GO)**를 즉시 판정합니다.

3. **고해상도 인터랙티브 차트 (Interactive Recharts & Tailwind CSS)**
   - **상태 비율**: 합격, 실패, 보류, 생략 비중을 표현하는 파이 차트.
   - **중요도 결함 분포**: Critical, High, Medium, Low 단위의 막대그래프.
   - **모듈별 오차 비중**: 가장 불안정하고 결함 밀도가 높은 취약 모듈 Top 8 Stacked Bar 차트.
   - **시계열 품질 추이**: 날짜 흐름에 따른 실행 횟수 및 버그 추이 영역(Area) 그래프.

4. **Gemini 3.5 Flash 기반의 AI 심층 보고 기획가**
   - 업로드된 CSV 전체 행 데이터를 분석하여 **임원 보고용 요약(Executive Summary)**, **품질 타당성 논거(Justification)**, **임계 위험요소(Critical Risks & Mitigation)**, **취약 컴포넌트 진단 의견**, **개선 권장 로드맵**을 하나의 원페이지 보고서 형태로 자동 작성합니다.

5. **1:1 QA AI 어시스턴트 챗봇**
   - 업로드한 실제 데이터를 바탕으로 대화식 분석을 지원합니다. (예: *"Alice가 담당한 모듈의 통과율은?"*, *"가장 시급히 해결할 블로커 버그 3개는?"*).
   - 슬랙(Slack) 등 협업 툴 전파용 공지사항 메시지를 예의 바르고 격식 있는 문체로 자동 기안해 줍니다.

6. **인쇄 전용 미디어 쿼리 완벽 최적화 (Print & PDF Export)**
   - 대시보드의 복잡한 사이드바와 설정 필드, 불필요한 입력창을 인쇄 포맷에서 자동 숨김 처리합니다.
   - 포트폴리오 첨부 및 보고용 **PDF 다운로드** 혹은 **종이 인쇄**를 진행할 때, 흐트러짐 없는 완벽한 고해상도 리포트 레이아웃(Grid & Break)을 보장합니다.

---

## 🛠 기술 스택 (Tech Stack)

- **Frontend**: React 19, Vite 6, TypeScript, Tailwind CSS v4, Motion (애니메이션)
- **Data Visualization**: Recharts (인터랙티브 데이터 차트), PapaParse (고속 클라이언트 측 CSV 파서)
- **Backend**: Express (Node.js API 서버), Esbuild (프로덕션 서버 빌드 최적화), TSX
- **AI Engine**: `@google/genai` (Google Gemini 3.5-Flash)
- **Icons**: Lucide React

---

## 🚀 로컬 실행 방법 (How to Run Locally)

### 1. 필수 프로그램 설치
- 컴퓨터에 [Node.js](https://nodejs.org/) (LTS 버전 권장, v18 이상)가 설치되어 있어야 합니다.

### 2. 소스 코드 다운로드 및 압축 해제
- AI Studio 상단의 메뉴에서 **Export -> Download ZIP**을 선택하여 소스 코드를 다운로드한 후, 압축을 해제합니다.
- 또는 GitHub 연동을 통해 레포지토리를 복제(`git clone`)합니다.

### 3. 종속성 패키지 설치
압축을 푼 프로젝트 디렉토리 안에서 터미널을 열고 다음 명령어를 실행합니다:
```bash
npm install
```

### 4. 환경 변수 설정 (.env)
프로젝트 루트 디렉토리에 `.env` 파일을 생성하고, Gemini API 사용을 위한 키를 기입합니다.
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
*(Tip: Gemini API 키는 [Google AI Studio](https://aistudio.google.com/)에서 무료로 발급받으실 수 있습니다.)*

### 5. 개발 서버 실행 (Development Mode)
```bash
npm run dev
```
서버가 정상적으로 실행되면 브라우저를 열고 **`http://localhost:3000`**으로 접속합니다.

---

## 📦 프로덕션 빌드 및 실행 (Build & Run in Production)

포트폴리오 라이브 서버(Cloud, VPS, Render 등)에 배포하거나 배포 최적화 성능을 보려면 아래와 같이 빌드 및 실행합니다:

```bash
# 1. 프론트엔드 최적화 컴파일 및 백엔드 번들링 통합 빌드
npm run build

# 2. 빌드된 프로덕션 서버 실행 (dist/server.cjs)
npm run start
```

---

## 📂 프로젝트 폴더 구조 (Project Structure)

```text
├── src/
│   ├── components/
│   │   ├── AiAssistant.tsx      # Gemini AI 종합 보고서 및 대화형 어시스턴트
│   │   ├── CsvUploader.tsx      # CSV 파일 드래그 앤 드롭 업로더 및 샘플 데이터셋 제공
│   │   ├── ReportCharts.tsx     # Recharts 기반 인터랙티브 분석 시각화 대시보드
│   │   ├── ReportMetrics.tsx    # 릴리즈 판정 배너(GO/NO-GO) 및 핵심 KPI 카드
│   │   └── ReportSettings.tsx   # 배포 가능 한계 표준(Quality Gate) 및 정성 체크리스트 관리
│   ├── App.tsx                  # 메인 레이아웃 및 전체 탭 라우팅, 상태 관리
│   ├── index.css                # 글로벌 CSS 및 Tailwind 테마 구성
│   └── main.tsx                 # React 엔트리 포인트
├── server.ts                    # Express 및 Vite 미들웨어 기반의 풀스택 통합 API 서버
├── package.json                 # 의존성 패키지 명세 및 실행 스크립트
├── tsconfig.json                # TypeScript 컴파일 옵션 설정
└── README.md                    # 프로젝트 종합 설명서 (본 파일)
```

---

## 🎨 포트폴리오 활용 가이드 (How to use for Portfolio)

1. **포트폴리오 첨부 서류 (PDF)**:
   - 앱에 샘플 데이터를 로드한 뒤 `AI 종합 보고서 초안 생성`을 클릭하여 레포트를 작성합니다.
   - 우측 상단의 **인쇄 아이콘 (Printer)** 또는 단축키 `Ctrl + P` (`Cmd + P`)를 누릅니다.
   - 인쇄 대상을 **`PDF로 저장 (Save as PDF)`**으로 선택하고 저장하면, 완벽하게 정돈된 오프라인 QA 심층 분석 포트폴리오 문서를 바로 확보할 수 있습니다.
   
2. **깃허브(GitHub) 게시**:
   - 이 소스코드를 개인 깃허브 저장소에 업로드하고 본 `README.md`를 함께 노출하세요. 깔끔한 다크 테마 디자인과 함께 풀스택 구성, TypeScript 준수, AI API 활용 능력을 입증할 수 있는 우수한 작품이 됩니다.

3. **라이브 데모**:
   - Render.com 이나 Railway 등의 플랫폼에 업로드하여 간편하게 라이브 웹 데모 페이지를 제공할 수도 있습니다.
