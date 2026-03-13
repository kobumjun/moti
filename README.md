# MOTI

노션처럼 기록하고, AI 캐릭터(RUSH)와 함께 밀어붙이는 메모 툴.

## 핵심 기능

- **Google OAuth 로그인** (Supabase Auth)
- **페이지 + 하위 페이지** 계층 구조
- **제목/본문 텍스트** 편집
- **RUSH AI 캐릭터** - 사용자 액션에 애니메이션으로 반응
- **로컬 템플릿 반응** - API 없이 빠른 피드백
- **선택적 OpenAI 연동** - "RUSH에게 한마디 더 듣기" 버튼

## 로컬 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env.local
# .env.local에 Supabase, OpenAI 키 입력

# 3. 개발 서버 실행
npm run dev
```

## Supabase 설정

### 1. 프로젝트 생성

1. [Supabase](https://supabase.com) 가입/로그인
2. New Project 생성
3. 프로젝트 URL, anon key 복사 → `.env.local`에 설정

### 2. Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. OAuth 2.0 Client ID 생성 (Web application)
3. Authorized redirect URIs 추가:  
   `https://<project-ref>.supabase.co/auth/v1/callback`  
   로컬: `http://localhost:3000/auth/callback`
4. Client ID, Client Secret 복사
5. Supabase Dashboard → Authentication → Providers → Google  
   Enable → Client ID, Secret 입력 → Save

### 3. DB 스키마 적용

Supabase SQL Editor에서 `supabase/schema.sql` 내용 실행.

## 디렉터리 구조

```
app/
  page.tsx          # 랜딩 (비로그인) / 리다이렉트
  app/              # 로그인 후 메인 앱
    layout.tsx
    page.tsx
  auth/
    callback/       # OAuth 콜백
    error/          # 인증 에러 페이지
  api/rush/         # OpenAI "한마디 듣기" API
components/
  LandingPage.tsx   # 랜딩
  AppShell.tsx      # 앱 레이아웃 (상단 바)
  AppContent.tsx    # 사이드바 + 에디터 + RUSH
  Sidebar.tsx       # 페이지 트리
  PageEditor.tsx    # 제목/본문 편집
  RushCharacter.tsx # AI 캐릭터 UI
lib/
  supabase/         # Supabase 클라이언트
  rush-responses.ts # 로컬 반응 템플릿
  openai.ts         # RUSH system prompt + API
  types.ts          # 타입 정의
supabase/
  schema.sql        # DB 스키마
```

## 환경 변수

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `OPENAI_API_KEY` | (선택) RUSH "한마디 더 듣기" 기능용 |
