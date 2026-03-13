# MOTI 설정 가이드

## 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 로그인
2. **New Project** → 프로젝트명, DB 비밀번호, 리전 설정
3. 프로젝트 대시보드 → **Settings** → **API**
4. 다음 값 복사:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. DB 스키마 적용

1. Supabase 대시보드 → **SQL Editor**
2. `supabase/schema.sql` 파일 내용 전체 복사 후 실행
3. `auth.users` 트리거가 권한 오류 나면, `handle_new_user` / `on_auth_user_created` 부분은 수동으로 프로필 생성 처리하거나 Supabase 지원 문의

## 3. Google OAuth 설정

### Google Cloud Console

1. [console.cloud.google.com](https://console.cloud.google.com) 로그인
2. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `MOTI` (또는 원하는 이름)
5. **Authorized redirect URIs** 추가:
   - 로컬: `http://localhost:3000/auth/callback`
   - 프로덕션: `https://<your-domain>/auth/callback`
   - Supabase: `https://<project-ref>.supabase.co/auth/v1/callback`
6. **Create** → Client ID, Client Secret 복사

### Supabase Auth

1. Supabase 대시보드 → **Authentication** → **Providers**
2. **Google** 클릭 → Enable
3. Client ID, Client Secret 붙여넣기 → **Save**

## 4. 환경 변수

```bash
cp .env.example .env.local
```

`.env.local` 예시:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
OPENAI_API_KEY=sk-...  # 선택: RUSH "한마디 더 듣기"용
```

## 5. 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 → **Google 로그인** 클릭 → 계정 선택 후 메인 앱으로 이동.
