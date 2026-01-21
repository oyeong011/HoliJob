// HoliJob v3 - Mobile First Design
// "AI가 골라줌 → 버튼 한 번으로 지원"

// ============ 상태 관리 ============
const AppState = {
  currentScreen: 'splash',
  currentTab: 'home',
  new_user: true,
  match_status: 'NONE',
  profile: {
    city: '',
    depart_date: null,
    name_en: '',
    nationality: '',
    passport: { is_verified: false, ocr_dummy: null }
  },
  resume: { source: 'NONE', uploaded: false },
  services: {
    visa_demo_done: false,
    flight_demo_done: false,
    stay_demo_done: false
  },
  matches: [],
  showBottomSheet: false,
  bottomSheetType: null,
  bottomSheetData: null,
  toast: null
};

// ============ 더미 데이터 ============
const DUMMY_MATCHES = [
  {
    id: 1, rank: 1, badge: 'AI 추천 1순위',
    title: 'Cafe All-rounder', employer: 'Sydney Coffee Culture',
    city: 'Sydney', wage: '$28', start_display: '02/03',
    reason_short: '첫 워홀러·영어초급도 적응 빠른 루트',
    match_score: 95, applied: false
  },
  {
    id: 2, rank: 2, badge: 'AI 추천 2순위',
    title: 'Kitchen Hand', employer: 'Sydney Restaurant Group',
    city: 'Sydney', wage: '$27', start_display: '02/05',
    reason_short: '체력 필요, 영어 부담 적음',
    match_score: 88, applied: false
  },
  {
    id: 3, rank: 3, badge: 'AI 추천 3순위',
    title: 'Retail Assistant', employer: 'Sydney Shopping Mall',
    city: 'Sydney', wage: '$29', start_display: '02/10',
    reason_short: '영어 중급 이상, 소통 좋아하면 추천',
    match_score: 82, applied: false
  }
];

const CHECKLIST_ITEMS = {
  beforeDeparture: [
    { id: 'passport', label: '여권 발급/갱신', done: false },
    { id: 'visa', label: '워킹홀리데이 비자 신청', done: false },
    { id: 'flight', label: '항공권 예약', done: false },
    { id: 'insurance', label: '해외 여행자 보험', done: false }
  ],
  beforeWork: [
    { id: 'tfn', label: 'TFN(세금번호) 신청', done: false },
    { id: 'bank', label: '현지 은행 계좌 개설', done: false },
    { id: 'sim', label: '휴대폰 유심 구매', done: false }
  ]
};

const FLIGHT_OPTIONS = [
  {
    id: 'f1', type: '가성비', airline: '진에어', price: '₩980,000',
    route: '인천 → 시드니 (경유 1회)', duration: '18시간',
    highlight: '가장 저렴한 옵션'
  },
  {
    id: 'f2', type: '가심비', airline: '대한항공', price: '₩1,280,000',
    route: '인천 → 시드니 (직항)', duration: '10시간',
    highlight: '편안한 여행 + 합리적 가격'
  },
  {
    id: 'f3', type: '최고', airline: 'Qantas', price: '₩1,850,000',
    route: '인천 → 시드니 (직항 비즈니스)', duration: '10시간',
    highlight: '프리미엄 비즈니스 클래스'
  }
];

const STAY_OPTIONS = [
  {
    id: 's1', type: '가성비', name: 'Sydney Backpackers', price: '₩180,000/주',
    location: 'CBD 도보 15분', rooms: '8인실 도미토리',
    highlight: '저렴하게 시작'
  },
  {
    id: 's2', type: '가심비', name: 'City Share House', price: '₩450,000/주',
    location: 'CBD 도보 5분', rooms: '2인실 세어하우스',
    highlight: '편리한 위치 + 프라이버시'
  },
  {
    id: 's3', type: '최고', name: 'Premium Studio', price: '₩850,000/주',
    location: 'CBD 중심가', rooms: '1인실 스튜디오',
    highlight: '완벽한 독립 생활'
  }
];

// ============ 렌더링 함수 ============
function render() {
  const root = document.getElementById('app');
  root.innerHTML = '';

  if (AppState.currentScreen === 'splash') {
    root.innerHTML = renderSplash();
  } else if (AppState.currentScreen === 'onboarding') {
    root.innerHTML = renderOnboarding();
  } else if (AppState.currentScreen === 'matching') {
    root.innerHTML = renderMatching();
  } else {
    root.innerHTML = renderMainLayout();
  }

  if (AppState.showBottomSheet) {
    renderBottomSheet();
  }

  if (AppState.toast) {
    renderToast();
  }
}

// ============ 스플래시 화면 ============
function renderSplash() {
  return `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 px-6">
      <div class="text-center">
        <div class="text-7xl mb-6 animate-bounce">✈️</div>
        <h1 class="text-5xl font-bold text-white mb-4">HoliJob</h1>
        <p class="text-xl text-white/90 mb-3">도착 전에 일부터 정해드립니다</p>
        <p class="text-base text-white/70 mb-12 leading-relaxed">AI가 당신에게 맞는 일자리를 골라드려요<br/>버튼 하나로 지원 완료</p>
        <button 
          onclick="startApp()"
          class="px-10 py-4 bg-white text-blue-900 rounded-full font-bold text-lg shadow-2xl active:scale-95 transition-transform">
          시작하기
        </button>
      </div>
    </div>
  `;
}

// ============ 온보딩 화면 ============
function renderOnboarding() {
  const cities = ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'];
  
  return `
    <div class="min-h-screen bg-gray-50 px-6 py-8 flex flex-col">
      <div class="text-center mb-8">
        <div class="text-5xl mb-3">🎯</div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">일자리부터 골라드릴게요</h2>
        <p class="text-sm text-gray-600">딱 3가지만 알려주세요</p>
      </div>

      <div class="space-y-6 flex-1">
        <!-- 도시 선택 -->
        <div>
          <label class="block text-base font-semibold text-gray-700 mb-3">어디로 가시나요?</label>
          <div class="flex flex-wrap gap-2">
            ${cities.map(city => `
              <button 
                onclick="selectCity('${city}')"
                class="px-6 py-3 rounded-full border-2 text-sm font-medium transition-all active:scale-95
                  ${AppState.profile.city === city 
                    ? 'bg-blue-900 text-white border-blue-900' 
                    : 'bg-white text-gray-700 border-gray-300'}">
                ${city}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- 출국일 (선택) -->
        <div>
          <label class="block text-base font-semibold text-gray-700 mb-3">출국일 (선택)</label>
          <input 
            type="date" 
            id="departDate"
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-base focus:border-blue-900 focus:outline-none"
            value="${AppState.profile.depart_date || ''}">
        </div>
      </div>

      <!-- CTA -->
      <button 
        onclick="submitOnboarding()"
        ${!AppState.profile.city ? 'disabled' : ''}
        class="w-full py-4 rounded-full font-bold text-lg transition-all active:scale-95
          ${AppState.profile.city 
            ? 'bg-gradient-to-r from-blue-900 to-cyan-700 text-white shadow-lg' 
            : 'bg-gray-300 text-gray-500'}">
        AI 매칭 시작하기
      </button>
    </div>
  `;
}

// ============ AI 매칭 로딩 ============
function renderMatching() {
  return `
    <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div class="text-center">
        <!-- 로딩 스피너 -->
        <div class="relative w-20 h-20 mx-auto mb-8">
          <div class="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-blue-900 rounded-full border-t-transparent animate-spin"></div>
        </div>
        
        <h2 class="text-2xl font-bold text-gray-800 mb-3">AI가 당신 조건에 맞는<br/>일자리를 고르는 중...</h2>
        <p class="text-base text-gray-600 mb-6">평균 10초</p>
        
        <div class="space-y-2 text-sm text-gray-500">
          <p>✓ 비자 조건 확인</p>
          <p>✓ 출국일 기반 필터링</p>
          <p>✓ 첫 워홀러 맞춤 추천</p>
        </div>
      </div>
    </div>
  `;
}

// ============ 메인 레이아웃 ============
function renderMainLayout() {
  return `
    <div class="flex flex-col min-h-screen bg-gray-50">
      <!-- 메인 콘텐츠 -->
      <main class="flex-1 overflow-y-auto pb-20">
        ${renderMainContent()}
      </main>

      <!-- 하단 탭바 -->
      ${renderBottomTabBar()}
    </div>
  `;
}

// ============ 하단 탭바 ============
function renderBottomTabBar() {
  const tabs = [
    { id: 'home', icon: '🏠', label: '홈' },
    { id: 'jobs', icon: '💼', label: '일자리' },
    { id: 'checklist', icon: '✅', label: '체크리스트' },
    { id: 'mypage', icon: '👤', label: '마이페이지' }
  ];

  return `
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
      <div class="flex items-center justify-around px-2 py-2">
        ${tabs.map(tab => `
          <button 
            onclick="switchTab('${tab.id}')"
            class="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all active:scale-95
              ${AppState.currentTab === tab.id ? 'text-blue-900' : 'text-gray-500'}">
            <span class="text-2xl">${tab.icon}</span>
            <span class="text-xs font-medium">${tab.label}</span>
          </button>
        `).join('')}
      </div>
    </nav>
  `;
}

// ============ 메인 콘텐츠 라우팅 ============
function renderMainContent() {
  if (AppState.currentTab === 'home') return renderHome();
  if (AppState.currentTab === 'jobs') return renderJobs();
  if (AppState.currentTab === 'checklist') return renderChecklist();
  if (AppState.currentTab === 'mypage') return renderMyPage();
  return '<div>Unknown tab</div>';
}

// ============ 홈 화면 ============
function renderHome() {
  if (AppState.match_status === 'MATCHING') {
    return `<div class="text-center py-20 px-6"><p class="text-lg text-gray-600">매칭 중...</p></div>`;
  }

  if (AppState.match_status === 'NONE') {
    return `<div class="text-center py-20 px-6"><p class="text-lg text-gray-600">온보딩을 먼저 완료해주세요</p></div>`;
  }

  const topJob = AppState.matches[0];
  const isApplied = topJob && topJob.applied;

  return `
    <div class="px-4 py-6 space-y-4">
      <!-- 헤더 -->
      <div class="mb-2">
        <h2 class="text-2xl font-bold text-gray-800 mb-1">
          ${isApplied ? '지원 완료!' : 'AI가 고른 일자리'}
        </h2>
        <p class="text-sm text-gray-600">
          ${isApplied 
            ? '고용주가 확인 중입니다. 보통 1~3일 내 답변이 옵니다.' 
            : '가장 적합한 일자리를 찾았어요'}
        </p>
      </div>

      <!-- 1순위 카드 -->
      <div class="bg-white rounded-3xl shadow-lg p-5 ${isApplied ? 'border-2 border-emerald-400' : ''}">
        <!-- 배지 -->
        <div class="flex items-center justify-between mb-4">
          <span class="px-4 py-1.5 bg-gradient-to-r from-blue-900 to-cyan-700 text-white rounded-full text-xs font-bold">
            ${topJob.badge}
          </span>
          <span class="text-xl font-bold text-blue-900">${topJob.match_score}%</span>
        </div>

        <!-- 직무 정보 -->
        <h3 class="text-xl font-bold text-gray-800 mb-1">${topJob.title}</h3>
        <p class="text-sm text-gray-600 mb-4">${topJob.employer}</p>

        <div class="space-y-2 mb-4">
          <div class="flex items-center gap-2 text-sm">
            <span class="text-gray-500">📍</span>
            <span class="font-medium">${topJob.city}</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <span class="text-gray-500">💰</span>
            <span class="font-medium">${topJob.wage}/hour</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <span class="text-gray-500">📅</span>
            <span class="font-medium">${topJob.start_display} 시작</span>
          </div>
        </div>

        <!-- 선정 이유 -->
        <div class="bg-blue-50 rounded-2xl p-3 mb-4">
          <p class="text-sm text-gray-700">
            <span class="font-semibold text-blue-900">💡 선정 이유:</span><br/>
            ${topJob.reason_short}
          </p>
        </div>

        <!-- CTA -->
        ${!isApplied ? `
          <button 
            onclick="applyJob(${topJob.id})"
            class="w-full py-3.5 bg-gradient-to-r from-blue-900 to-cyan-700 text-white rounded-full font-bold text-base shadow-lg active:scale-95 transition-all">
            ⚡ 원터치 지원하기
          </button>
        ` : `
          <div class="text-center py-3 bg-emerald-50 rounded-full">
            <p class="text-base text-emerald-700 font-semibold">✓ 지원 완료</p>
          </div>
        `}
      </div>

      <!-- 요약 카드 -->
      <div class="grid grid-cols-3 gap-3">
        <!-- 체크리스트 -->
        <div class="bg-white rounded-2xl shadow-md p-4 text-center">
          <div class="text-2xl mb-2">✅</div>
          <p class="text-2xl font-bold text-blue-900 mb-1">${calculateChecklistProgress()}%</p>
          <p class="text-xs text-gray-600">체크리스트</p>
        </div>

        <!-- 비자 -->
        <div class="bg-white rounded-2xl shadow-md p-4 text-center">
          <div class="text-2xl mb-2">🛂</div>
          <p class="text-xs font-semibold ${AppState.services.visa_demo_done ? 'text-emerald-600' : 'text-gray-400'}">
            ${AppState.services.visa_demo_done ? '✓ 완료' : '대기'}
          </p>
          <p class="text-xs text-gray-600">비자</p>
        </div>

        <!-- 항공 -->
        <div class="bg-white rounded-2xl shadow-md p-4 text-center">
          <div class="text-2xl mb-2">✈️</div>
          <p class="text-xs font-semibold ${AppState.services.flight_demo_done ? 'text-emerald-600' : 'text-gray-400'}">
            ${AppState.services.flight_demo_done ? '✓ 완료' : '대기'}
          </p>
          <p class="text-xs text-gray-600">항공권</p>
        </div>
      </div>
    </div>
  `;
}

// ============ 일자리 화면 ============
function renderJobs() {
  return `
    <div class="px-4 py-6 space-y-4">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">일자리 후보</h2>

      <div class="space-y-3">
        ${AppState.matches.map(job => `
          <div class="bg-white rounded-2xl shadow-md p-4">
            <!-- 배지 & 스코어 -->
            <div class="flex items-center justify-between mb-3">
              <span class="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-bold">
                ${job.badge}
              </span>
              <span class="text-lg font-bold text-blue-900">${job.match_score}%</span>
            </div>

            <!-- 직무 -->
            <h3 class="text-lg font-bold text-gray-800 mb-1">${job.title}</h3>
            <p class="text-sm text-gray-600 mb-3">${job.employer}</p>

            <div class="space-y-1.5 mb-3">
              <div class="flex items-center gap-2 text-sm">
                <span class="text-gray-500">📍</span>
                <span>${job.city}</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <span class="text-gray-500">💰</span>
                <span>${job.wage}/hour</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <span class="text-gray-500">📅</span>
                <span>${job.start_display} 시작</span>
              </div>
            </div>

            <!-- 이유 -->
            <div class="bg-gray-50 rounded-xl p-2.5 mb-3">
              <p class="text-xs text-gray-700">${job.reason_short}</p>
            </div>

            <!-- CTA -->
            ${!job.applied ? `
              <button 
                onclick="applyJob(${job.id})"
                class="w-full py-3 bg-gradient-to-r from-blue-900 to-cyan-700 text-white rounded-full font-bold text-sm active:scale-95 transition-all">
                원터치 지원
              </button>
            ` : `
              <div class="text-center py-2.5 bg-emerald-100 text-emerald-700 rounded-full font-semibold text-sm">
                ✓ 지원완료
              </div>
            `}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ============ 체크리스트 화면 ============
function renderChecklist() {
  return `
    <div class="px-4 py-6 space-y-4">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">체크리스트</h2>

      <!-- 출국 전 -->
      <div class="bg-white rounded-2xl shadow-md p-4">
        <h3 class="text-lg font-bold text-gray-800 mb-3">출국 전 준비</h3>
        <div class="space-y-2">
          ${CHECKLIST_ITEMS.beforeDeparture.map(item => `
            <label class="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 active:bg-gray-100 cursor-pointer">
              <input 
                type="checkbox" 
                ${item.done ? 'checked' : ''}
                onchange="toggleCheckItem('beforeDeparture', '${item.id}')"
                class="w-5 h-5 rounded border-gray-300 text-blue-900 focus:ring-blue-900">
              <span class="text-sm flex-1 ${item.done ? 'line-through text-gray-400' : 'text-gray-700'}">${item.label}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- 근무 전 -->
      <div class="bg-white rounded-2xl shadow-md p-4">
        <h3 class="text-lg font-bold text-gray-800 mb-3">근무 전 준비</h3>
        <div class="space-y-2">
          ${CHECKLIST_ITEMS.beforeWork.map(item => `
            <label class="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 active:bg-gray-100 cursor-pointer">
              <input 
                type="checkbox" 
                ${item.done ? 'checked' : ''}
                onchange="toggleCheckItem('beforeWork', '${item.id}')"
                class="w-5 h-5 rounded border-gray-300 text-blue-900 focus:ring-blue-900">
              <span class="text-sm flex-1 ${item.done ? 'line-through text-gray-400' : 'text-gray-700'}">${item.label}</span>
            </label>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ============ 마이페이지 화면 ============
function renderMyPage() {
  return `
    <div class="px-4 py-6 space-y-4">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">마이페이지</h2>

      <!-- 프로필 -->
      <div class="bg-white rounded-2xl shadow-md p-4">
        <h3 class="text-lg font-bold text-gray-800 mb-3">프로필</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">이름(영문)</span>
            <span class="font-semibold">${AppState.profile.name_en || '미입력'}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">국적</span>
            <span class="font-semibold">${AppState.profile.nationality || '미입력'}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">목적지</span>
            <span class="font-semibold">${AppState.profile.city || '미입력'}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">여권 인증</span>
            <span class="font-semibold ${AppState.profile.passport.is_verified ? 'text-emerald-600' : 'text-gray-400'}">
              ${AppState.profile.passport.is_verified ? '✓ 인증완료' : '미인증'}
            </span>
          </div>
        </div>

        <!-- 진행바 -->
        <div class="mt-4">
          <div class="flex justify-between text-xs mb-1.5">
            <span class="text-gray-600">프로필 완성도</span>
            <span class="font-semibold text-blue-900">${calculateProfileProgress()}%</span>
          </div>
          <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-blue-900 to-cyan-700 transition-all" style="width: ${calculateProfileProgress()}%"></div>
          </div>
        </div>
      </div>

      <!-- Services Hub -->
      <div class="bg-white rounded-2xl shadow-md p-4">
        <h3 class="text-lg font-bold text-gray-800 mb-3">Services Hub</h3>
        <div class="space-y-2">
          <!-- 비자 -->
          <button 
            onclick="startVisaDemo()"
            class="w-full flex items-center justify-between p-3 rounded-xl border-2 border-gray-200 active:bg-gray-50 transition-all">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🛂</span>
              <div class="text-left">
                <p class="text-sm font-bold text-gray-800">비자 자동화</p>
                <p class="text-xs text-gray-500">n8n 기반 자동 신청</p>
              </div>
            </div>
            <span class="text-xs px-3 py-1 rounded-full font-semibold ${AppState.services.visa_demo_done ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}">
              ${AppState.services.visa_demo_done ? '✓ 완료' : '시작'}
            </span>
          </button>

          <!-- 항공권 -->
          <button 
            onclick="startFlightDemo()"
            class="w-full flex items-center justify-between p-3 rounded-xl border-2 border-gray-200 active:bg-gray-50 transition-all">
            <div class="flex items-center gap-3">
              <span class="text-2xl">✈️</span>
              <div class="text-left">
                <p class="text-sm font-bold text-gray-800">항공권 추천</p>
                <p class="text-xs text-gray-500">3가지 옵션 제시</p>
              </div>
            </div>
            <span class="text-xs px-3 py-1 rounded-full font-semibold ${AppState.services.flight_demo_done ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}">
              ${AppState.services.flight_demo_done ? '✓ 완료' : '시작'}
            </span>
          </button>

          <!-- 숙소 -->
          <button 
            onclick="startStayDemo()"
            class="w-full flex items-center justify-between p-3 rounded-xl border-2 border-gray-200 active:bg-gray-50 transition-all">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🏠</span>
              <div class="text-left">
                <p class="text-sm font-bold text-gray-800">숙소 추천</p>
                <p class="text-xs text-gray-500">3가지 옵션 제시</p>
              </div>
            </div>
            <span class="text-xs px-3 py-1 rounded-full font-semibold ${AppState.services.stay_demo_done ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}">
              ${AppState.services.stay_demo_done ? '✓ 완료' : '시작'}
            </span>
          </button>
        </div>
      </div>
    </div>
  `;
}

// ============ BottomSheet 렌더링 ============
function renderBottomSheet() {
  const overlay = document.createElement('div');
  overlay.id = 'bottomsheet-overlay';
  overlay.className = 'fixed inset-0 bg-black/40 z-50 flex items-end';
  overlay.onclick = (e) => {
    if (e.target === overlay) closeBottomSheet();
  };

  let content = '';
  
  if (AppState.bottomSheetType === 'profile') {
    content = `
      <div class="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="px-6 py-5 border-b border-gray-200">
          <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <h3 class="text-xl font-bold text-gray-800">프로필 정보 입력</h3>
        </div>
        <div class="px-6 py-5 space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">이름(영문)</label>
            <input 
              type="text" 
              id="profileName"
              placeholder="HONG GILDONG"
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-base focus:border-blue-900 focus:outline-none">
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">국적</label>
            <select 
              id="profileNationality"
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl text-base focus:border-blue-900 focus:outline-none">
              <option value="">선택하세요</option>
              <option value="South Korea">South Korea</option>
              <option value="Japan">Japan</option>
              <option value="Taiwan">Taiwan</option>
            </select>
          </div>
          <button 
            onclick="submitProfile()"
            class="w-full py-3.5 bg-gradient-to-r from-blue-900 to-cyan-700 text-white rounded-full font-bold text-base active:scale-95 transition-all">
            다음
          </button>
        </div>
      </div>
    `;
  } else if (AppState.bottomSheetType === 'passport') {
    content = `
      <div class="bg-white rounded-t-3xl w-full" onclick="event.stopPropagation()">
        <div class="px-6 py-5 border-b border-gray-200">
          <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <h3 class="text-xl font-bold text-gray-800 text-center">여권 정보 스캔</h3>
        </div>
        <div class="px-6 py-6 text-center">
          <div class="text-6xl mb-4">📸</div>
          <p class="text-base text-gray-600 mb-6">여권 사진면을 스캔하면<br/>자동으로 정보가 입력됩니다</p>
          <div class="space-y-3">
            <button 
              onclick="simulatePassportScan()"
              class="w-full py-3.5 bg-gradient-to-r from-blue-900 to-cyan-700 text-white rounded-full font-bold text-base active:scale-95 transition-all">
              여권 스캔하기
            </button>
            <button 
              onclick="skipPassport()"
              class="w-full py-3.5 bg-gray-200 text-gray-700 rounded-full font-semibold text-base active:scale-95 transition-all">
              나중에 하기
            </button>
          </div>
        </div>
      </div>
    `;
  } else if (AppState.bottomSheetType === 'visa') {
    content = `
      <div class="bg-white rounded-t-3xl w-full" onclick="event.stopPropagation()">
        <div class="px-6 py-5">
          <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <h3 class="text-xl font-bold text-gray-800 mb-4">비자 자동화</h3>
          
          <!-- 스테퍼 -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex-1 text-center">
              <div class="w-10 h-10 mx-auto bg-blue-900 text-white rounded-full flex items-center justify-center font-bold mb-1">1</div>
              <p class="text-xs font-medium">서류 스캔</p>
            </div>
            <div class="flex-1 h-0.5 bg-blue-900"></div>
            <div class="flex-1 text-center">
              <div class="w-10 h-10 mx-auto bg-blue-900 text-white rounded-full flex items-center justify-center font-bold mb-1">2</div>
              <p class="text-xs font-medium">자동 입력</p>
            </div>
            <div class="flex-1 h-0.5 bg-gray-300"></div>
            <div class="flex-1 text-center">
              <div class="w-10 h-10 mx-auto bg-gray-300 text-white rounded-full flex items-center justify-center font-bold mb-1">3</div>
              <p class="text-xs font-medium">제출</p>
            </div>
          </div>

          <div class="text-center py-8">
            <div class="text-5xl mb-3 animate-pulse">🔄</div>
            <p class="text-base text-gray-600">n8n이 자동으로 처리 중...</p>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      AppState.services.visa_demo_done = true;
      CHECKLIST_ITEMS.beforeDeparture.find(i => i.id === 'visa').done = true;
      closeBottomSheet();
      showToast('✓ 비자 신청이 완료되었습니다!');
    }, 3000);

  } else if (AppState.bottomSheetType === 'flight') {
    content = `
      <div class="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="px-6 py-5 border-b border-gray-200">
          <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <h3 class="text-xl font-bold text-gray-800">항공권 추천</h3>
        </div>
        <div class="px-6 py-5 space-y-3">
          ${FLIGHT_OPTIONS.map(f => `
            <button 
              onclick="selectFlight('${f.id}')" 
              class="w-full border-2 border-gray-200 rounded-2xl p-4 text-left active:bg-gray-50 transition-all">
              <div class="flex items-center justify-between mb-2">
                <span class="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-bold">${f.type}</span>
                <span class="text-lg font-bold text-gray-800">${f.price}</span>
              </div>
              <p class="text-base font-semibold text-gray-700 mb-1">${f.airline}</p>
              <p class="text-sm text-gray-600 mb-1">${f.route}</p>
              <p class="text-sm text-gray-600 mb-2">${f.duration}</p>
              <p class="text-sm text-blue-900 font-semibold">${f.highlight}</p>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  } else if (AppState.bottomSheetType === 'stay') {
    content = `
      <div class="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="px-6 py-5 border-b border-gray-200">
          <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <h3 class="text-xl font-bold text-gray-800">숙소 추천</h3>
        </div>
        <div class="px-6 py-5 space-y-3">
          ${STAY_OPTIONS.map(s => `
            <button 
              onclick="selectStay('${s.id}')" 
              class="w-full border-2 border-gray-200 rounded-2xl p-4 text-left active:bg-gray-50 transition-all">
              <div class="flex items-center justify-between mb-2">
                <span class="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-bold">${s.type}</span>
                <span class="text-lg font-bold text-gray-800">${s.price}</span>
              </div>
              <p class="text-base font-semibold text-gray-700 mb-1">${s.name}</p>
              <p class="text-sm text-gray-600 mb-1">${s.location}</p>
              <p class="text-sm text-gray-600 mb-2">${s.rooms}</p>
              <p class="text-sm text-blue-900 font-semibold">${s.highlight}</p>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  overlay.innerHTML = content;
  document.body.appendChild(overlay);
  
  // 애니메이션
  setTimeout(() => {
    overlay.querySelector('.bg-white').classList.add('animate-slide-up');
  }, 10);
}

// ============ 토스트 렌더링 ============
function renderToast() {
  const toast = document.getElementById('toast');
  if (toast) toast.remove();

  const el = document.createElement('div');
  el.id = 'toast';
  el.className = 'fixed top-safe-top left-4 right-4 px-5 py-3 rounded-2xl shadow-2xl text-white font-semibold text-sm z-50 bg-emerald-600 animate-slide-down';
  el.textContent = AppState.toast.message;
  document.body.appendChild(el);

  setTimeout(() => {
    el.remove();
    AppState.toast = null;
  }, 2000);
}

// ============ 액션 함수 ============
function startApp() {
  AppState.currentScreen = 'onboarding';
  render();
}

function selectCity(city) {
  AppState.profile.city = city;
  render();
}

function submitOnboarding() {
  const departDateInput = document.getElementById('departDate');
  if (departDateInput && departDateInput.value) {
    AppState.profile.depart_date = departDateInput.value;
  }

  AppState.currentScreen = 'matching';
  AppState.match_status = 'MATCHING';
  render();

  setTimeout(() => {
    AppState.matches = DUMMY_MATCHES;
    AppState.match_status = 'READY';
    AppState.currentScreen = 'home';
    AppState.currentTab = 'home';
    render();
  }, 1000);
}

function applyJob(jobId) {
  if (!AppState.profile.name_en || !AppState.profile.nationality) {
    AppState.showBottomSheet = true;
    AppState.bottomSheetType = 'profile';
    AppState.bottomSheetData = { jobId };
    render();
    return;
  }

  if (!AppState.profile.passport.is_verified) {
    AppState.showBottomSheet = true;
    AppState.bottomSheetType = 'passport';
    AppState.bottomSheetData = { jobId };
    render();
    return;
  }

  submitApplication(jobId);
}

function submitProfile() {
  const name = document.getElementById('profileName').value.trim();
  const nationality = document.getElementById('profileNationality').value;

  if (!name || !nationality) {
    alert('모든 정보를 입력해주세요');
    return;
  }

  AppState.profile.name_en = name;
  AppState.profile.nationality = nationality;

  if (!AppState.profile.passport.is_verified) {
    AppState.bottomSheetType = 'passport';
    render();
  } else {
    const jobId = AppState.bottomSheetData.jobId;
    closeBottomSheet();
    submitApplication(jobId);
  }
}

function simulatePassportScan() {
  const sheet = document.querySelector('#bottomsheet-overlay .bg-white');
  sheet.innerHTML = `
    <div class="px-6 py-12 text-center">
      <div class="text-6xl mb-4 animate-pulse">📸</div>
      <p class="text-lg text-gray-700">여권 스캔 중...</p>
    </div>
  `;

  setTimeout(() => {
    AppState.profile.passport.is_verified = true;
    AppState.profile.passport.ocr_dummy = {
      name: AppState.profile.name_en,
      number: 'M12345678',
      expiry: '2030-12-31'
    };

    const jobId = AppState.bottomSheetData.jobId;
    closeBottomSheet();
    submitApplication(jobId);
  }, 600);
}

function skipPassport() {
  closeBottomSheet();
}

function submitApplication(jobId) {
  const job = AppState.matches.find(j => j.id === jobId);
  if (!job) return;

  // 로딩
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
  overlay.innerHTML = `
    <div class="bg-white rounded-3xl shadow-2xl p-8 text-center mx-6">
      <div class="text-5xl mb-3 animate-pulse">⚡</div>
      <p class="text-lg text-gray-700">지원서 자동 제출 중...</p>
    </div>
  `;
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
    job.applied = true;
    AppState.match_status = 'APPLIED';
    CHECKLIST_ITEMS.beforeWork.find(i => i.id === 'tfn').done = true;
    showToast('✓ 지원이 완료되었습니다!');
    render();
  }, 800);
}

function closeBottomSheet() {
  AppState.showBottomSheet = false;
  AppState.bottomSheetType = null;
  AppState.bottomSheetData = null;
  const overlay = document.getElementById('bottomsheet-overlay');
  if (overlay) overlay.remove();
}

function switchTab(tab) {
  AppState.currentTab = tab;
  render();
}

function toggleCheckItem(category, itemId) {
  const item = CHECKLIST_ITEMS[category].find(i => i.id === itemId);
  if (item) {
    item.done = !item.done;
    render();
  }
}

function calculateChecklistProgress() {
  const all = [...CHECKLIST_ITEMS.beforeDeparture, ...CHECKLIST_ITEMS.beforeWork];
  const done = all.filter(i => i.done).length;
  return Math.round((done / all.length) * 100);
}

function calculateProfileProgress() {
  const items = [
    AppState.profile.city,
    AppState.profile.name_en,
    AppState.profile.nationality,
    AppState.profile.passport.is_verified
  ];
  const completed = items.filter(Boolean).length;
  return Math.round((completed / items.length) * 100);
}

function startVisaDemo() {
  AppState.showBottomSheet = true;
  AppState.bottomSheetType = 'visa';
  render();
}

function startFlightDemo() {
  AppState.showBottomSheet = true;
  AppState.bottomSheetType = 'flight';
  render();
}

function selectFlight(flightId) {
  AppState.services.flight_demo_done = true;
  CHECKLIST_ITEMS.beforeDeparture.find(i => i.id === 'flight').done = true;
  closeBottomSheet();
  showToast('✓ 항공권 예약이 완료되었습니다!');
}

function startStayDemo() {
  AppState.showBottomSheet = true;
  AppState.bottomSheetType = 'stay';
  render();
}

function selectStay(stayId) {
  AppState.services.stay_demo_done = true;
  closeBottomSheet();
  showToast('✓ 숙소 예약이 완료되었습니다!');
}

function showToast(message) {
  AppState.toast = { message };
  render();
}

// ============ 초기화 ============
document.addEventListener('DOMContentLoaded', () => {
  render();
});
