# API 설정 가이드

HoliJob은 실제 항공권, 일자리, 숙소 데이터를 제공하기 위해 다음 무료 API를 사용합니다.

## 1. Amadeus Flight API (항공권 검색)

### 무료 티어
- 월 2,000 API 호출
- 실제 항공권 데이터 제공
- 전 세계 항공사 검색

### 설정 방법
1. [Amadeus for Developers](https://developers.amadeus.com/) 접속
2. "Sign up" 클릭 → 무료 계정 생성
3. "Self-Service" 선택
4. API Key 발급:
   - Client ID 복사
   - Client Secret 복사

## 2. Adzuna Job API (호주 일자리 검색)

### 무료 티어
- 무료 사용 가능
- 호주 전역 일자리 검색
- 실시간 채용 공고

### 설정 방법
1. [Adzuna Developer](https://developer.adzuna.com/) 접속
2. "Sign up" 클릭 → 무료 계정 생성
3. "Create an App" 클릭
4. API Key 발급:
   - App ID 복사
   - API Key 복사

## 3. 숙소 API (현재 더미 데이터)

숙소는 현재 더미 데이터를 사용하며, 추후 다음 API 중 하나로 연동 가능:
- Hostelworld API (제한적)
- Booking.com via RapidAPI (유료)
- Airbnb API (제한적)

## 환경 변수 설정

### 로컬 개발 (.dev.vars)
```bash
# .dev.vars.example 파일을 .dev.vars로 복사
cp .dev.vars.example .dev.vars

# 발급받은 API 키 입력
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
```

### Cloudflare Pages 배포
```bash
# Cloudflare에 Secret 등록
wrangler secret put AMADEUS_CLIENT_ID
wrangler secret put AMADEUS_CLIENT_SECRET
wrangler secret put ADZUNA_APP_ID
wrangler secret put ADZUNA_APP_KEY
```

## API 작동 방식

### 1. 일자리 검색
온보딩에서 도시 선택 후 매칭 시:
- **우선**: Adzuna API로 실제 일자리 검색
- **폴백**: API 실패 시 더미 데이터 사용

### 2. 항공권 검색
마이페이지 > 항공권 탭에서:
- **우선**: Amadeus API로 실시간 항공권 검색
- **폴백**: API 실패 시 더미 데이터 사용

### 3. 숙소 검색
마이페이지 > 숙소 탭에서:
- **현재**: 더미 데이터 사용
- **추후**: 실제 API 연동 예정

## 테스트 방법

### API 없이 테스트 (더미 데이터)
API 키 없이도 앱이 정상 작동하며, 더미 데이터가 자동으로 사용됩니다.

### API 연동 테스트
1. `.dev.vars` 파일 생성 및 API 키 입력
2. 로컬 서버 재시작:
   ```bash
   npm run build
   pm2 restart holijob-demo
   ```
3. 브라우저에서 테스트:
   - 온보딩 완료 → 실제 일자리 표시
   - 마이페이지 > 항공권 → 실시간 검색
   - 개발자 도구 > Network 탭에서 API 호출 확인

## 비용 분석

### 무료 사용 범위
- **Amadeus**: 월 2,000 API 호출 (충분)
- **Adzuna**: 무료 무제한
- **총 비용**: $0

### 예상 사용량
- 일자리 검색: 온보딩당 1회 (월 ~100회)
- 항공권 검색: 사용자당 1~2회 (월 ~50회)
- **총합**: 월 ~150 API 호출 (무료 범위 내)

## 주의사항

⚠️ **API 키 보안**
- `.dev.vars` 파일은 Git에 커밋하지 마세요 (.gitignore에 이미 추가됨)
- 공개 저장소에 API 키를 노출하지 마세요
- Cloudflare에서는 Secret 관리를 사용하세요

✅ **API 키 없이도 작동**
- API 키 없이도 앱이 정상 작동합니다
- 더미 데이터가 자동으로 사용됩니다
- 실제 서비스 전에만 API 키를 설정하세요

## 문제 해결

### API 호출 실패 시
1. `.dev.vars` 파일 확인
2. API 키 유효성 검증
3. 브라우저 콘솔에서 에러 메시지 확인
4. 네트워크 탭에서 API 응답 확인

### 더미 데이터가 계속 표시되는 경우
- API 키가 올바르게 설정되었는지 확인
- 서버를 재시작했는지 확인
- 브라우저 캐시를 삭제하고 새로고침

## 향후 개선 계획

1. **페이스북 마켓플레이스 연동**
   - Facebook Graph API 사용
   - 일자리 그룹 크롤링

2. **오지잡/호주나라 크롤링**
   - 크롤링 서비스 (ScrapingBee 등) 사용
   - 주기적 데이터 수집 및 캐싱

3. **실시간 숙소 API**
   - Booking.com API 연동
   - Hostelworld 데이터 통합

4. **캐싱 시스템**
   - Cloudflare KV로 API 응답 캐싱
   - 비용 절감 및 속도 향상
