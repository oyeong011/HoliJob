# HoliJob - 도착 전에 일부터 정해드립니다

## 🎯 프로젝트 개요

**HoliJob**은 워킹홀리데이 출국 전에 AI가 자동으로 일자리를 매칭하고, **원터치로 지원**할 수 있는 혁신적인 데모 웹앱입니다.

### 핵심 가치
> "AI가 골라줌 → 버튼 한 번으로 지원 (+ 항공/숙소/비자도 버튼으로)"

- **검색이 아닌 결정**: 사용자가 직접 찾지 않아도 AI가 최적의 일자리를 추천
- **원터치 지원**: 버튼 하나로 모든 지원 절차 완료
- **통합 서비스**: 일자리뿐만 아니라 비자, 항공권, 숙소까지 한 곳에서 해결

## 🌐 데모 URL

- **샌드박스**: https://3000-ibjb0vfijw83h3yekl9l8-b9b802c4.sandbox.novita.ai
- **GitHub**: https://github.com/oyeong011/HoliJob
- **프로덕션**: (Cloudflare Pages 배포 대기중)

## ✨ 주요 기능

### P0 기능 (핵심)
- ✅ **스플래시 & 온보딩**: 도시 칩 선택 (6개 도시)
- ✅ **AI 매칭**: 1초 로딩 후 1순위 일자리 카드 표시
- ✅ **원터치 지원**: 정보 부족 시 BottomSheet로 즉시 보완
  - 영문 이름 입력
  - 국적 선택
  - 여권 OCR 스캔 시뮬레이션
- ✅ **상태 변화**: READY → APPLIED 자동 전환
- ✅ **마이크로 인터랙션**: 카드 등장, 버튼 탭, 토스트 알림

### P1 기능 (확장)
- ✅ **Services Hub**: 마이페이지에서 통합 관리
  - **비자 자동화 (n8n)**: 3단계 Stepper (서류 스캔 → 자동 입력 → 제출)
  - **항공권 자동 예매**: 3가지 옵션 (가성비/가심비/최고)
  - **숙소 자동 예약**: 3가지 옵션 (쉐어하우스/서비스드 아파트/호텔)
- ✅ **일자리 탭**: 2~3개 후보 표시 + 각각 원터치 지원
- ✅ **체크리스트**: 자동 완료 반영 (출국 전/근무 전)

### P2 기능 (디테일)
- ✅ LocalStorage 기반 이탈 복구
- ✅ 지원 후 체크리스트 항목 자동 완료
- ✅ 프로필 완성도 계산

## 🎨 디자인 철학

### 한 화면 = 한 메시지
- **홈**: "AI가 1순위 골랐고, 지금 바로 지원 가능"
- **일자리**: "후보 2~3개가 있고, 어디서든 원터치"
- **체크리스트**: "지원하면 자동으로 체크된다"
- **마이페이지**: "비자/항공/숙소 자동화가 연결돼 있다"

### 마이크로 인터랙션
- 카드 등장: 아래에서 12px 올라오며 200ms
- 버튼 탭: 95%로 살짝 눌리는 스케일 80ms
- 토스트: 상단 1.5초
- 로딩: 0.8~1초 (데모 안정성)

## 📱 데모 시나리오

### 10초 데모 (최소 시나리오)
1. 앱 첫 진입 - "시작하기" 버튼
2. 도시 선택 (예: Sydney)
3. "AI 매칭 시작" - 1초 로딩
4. 홈에 1순위 카드 노출
5. **"원터치 지원"** 버튼 탭
6. 정보 보완 BottomSheet (영문 이름 + 국적 + 여권 스캔)
7. "지원 완료" 토스트 + 상태 변경

### 30초 데모 (확장 시나리오)
- 마이페이지 → Services Hub
- 비자 자동화 (n8n) → 3단계 진행
- 항공권 3개 추천 → 선택
- 숙소 3개 추천 → 선택
- 체크리스트 자동 완료 확인

## 🏗️ 기술 스택

### Frontend
- **프레임워크**: Vanilla JavaScript (상태 관리)
- **스타일링**: Tailwind CSS (CDN)
- **애니메이션**: Custom CSS animations

### Backend
- **프레임워크**: Hono (Cloudflare Workers)
- **배포**: Cloudflare Pages
- **데이터**: LocalStorage (클라이언트)

### 상태 관리
```javascript
AppState = {
  currentScreen: 'splash',
  match_status: 'NONE' | 'MATCHING' | 'READY' | 'APPLIED',
  profile: { city, name_en, nationality, passport },
  services: { visa_demo_done, flight_demo_done, stay_demo_done }
}
```

## 📊 더미 데이터

### 일자리 매칭 (3개)
1. **Cafe All-rounder** - Sydney - $28/h (95% 매칭)
2. **Kitchen Hand** - Sydney - $27/h (88% 매칭)
3. **Retail Assistant** - Sydney - $29/h (82% 매칭)

### 항공권 (3옵션)
- **가성비**: 대한항공 + 콴타스 (경유) - ₩980,000
- **가심비**: 아시아나 + 싱가포르 (경유) - ₩1,280,000
- **최고**: 대한항공 직항 - ₩1,850,000

### 숙소 (3옵션)
- **가성비**: Sydney Backpackers (쉐어하우스) - ₩180,000/주
- **가심비**: Serviced Apartment (1인실) - ₩450,000/주
- **최고**: Premium Hotel (스위트) - ₩850,000/주

## 🚀 로컬 개발

### 빌드 및 실행
```bash
# 빌드
npm run build

# PM2로 개발 서버 시작
pm2 start ecosystem.config.cjs

# 테스트
npm test

# 로그 확인
pm2 logs holijob-demo --nostream
```

### 포트 정리
```bash
npm run clean-port
```

## 📁 프로젝트 구조

```
webapp/
├── src/
│   ├── index.tsx          # Hono 메인 애플리케이션
│   └── renderer.tsx       # JSX 렌더러
├── public/
│   └── static/
│       ├── app.js         # 메인 JavaScript (24KB+)
│       └── style.css      # 커스텀 CSS 애니메이션
├── dist/                  # 빌드 출력
├── ecosystem.config.cjs   # PM2 설정
├── wrangler.jsonc         # Cloudflare 설정
├── package.json
└── README.md
```

## 🎯 데모 성공 기준

✅ **10초 안에 이해 가능**
- "아, 이건 도착 전에 일부터 정해주는 앱이구나."
- "버튼 하나 누르면 바로 지원되네."
- "비자, 항공, 숙소도 버튼으로 되네."

## 🔮 향후 개발 계획

### 실제 서비스로 확장
- [ ] 실제 고용주 데이터베이스 연동
- [ ] 이력서 업로드 및 파싱
- [ ] 실제 비자 신청 API 연동 (n8n)
- [ ] 항공권/숙소 실시간 검색 API
- [ ] 사용자 인증 및 프로필 관리
- [ ] 푸시 알림 (지원 결과)
- [ ] 결제 시스템 (수수료)

### 추가 기능
- [ ] 직접찾기 상세 화면
- [ ] 이력서 빌더
- [ ] 고용주 채팅
- [ ] 리뷰 시스템

## 📝 라이선스

이 프로젝트는 데모 목적으로 개발되었습니다.

## 👥 팀

- **개발**: AI Assistant
- **디자인**: Flow Logic v1 스펙 기반
- **GitHub**: [oyeong011](https://github.com/oyeong011)

---

**데모를 경험하고 싶으신가요?**

샌드박스 URL에서 지금 바로 체험해보세요: https://3000-ibjb0vfijw83h3yekl9l8-b9b802c4.sandbox.novita.ai

**10초 안에 "원터치 지원"의 마법을 경험할 수 있습니다!** ✨
