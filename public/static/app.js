// HoliJob v4 - Toss-like Simple Design
// "간편함이 철학"

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
    id: 1, rank: 1, badge: 'AI 추천',
    title: 'Cafe All-rounder', employer: 'Sydney Coffee Culture',
    city: 'Sydney', wage: '$28', start_display: '02/03',
    reason_short: '첫 워홀러·영어초급도 적응 빠른 루트',
    match_score: 95, applied: false
  },
  {
    id: 2, rank: 2, badge: 'AI 추천',
    title: 'Kitchen Hand', employer: 'Sydney Restaurant Group',
    city: 'Sydney', wage: '$27', start_display: '02/05',
    reason_short: '체력 필요, 영어 부담 적음',
    match_score: 88, applied: false
  },
  {
    id: 3, rank: 3, badge: 'AI 추천',
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
  { id: 'f1', type: '가성비', airline: '진에어', price: '₩980,000', route: '인천 → 시드니 (경유 1회)', duration: '18시간' },
  { id: 'f2', type: '가심비', airline: '대한항공', price: '₩1,280,000', route: '인천 → 시드니 (직항)', duration: '10시간' },
  { id: 'f3', type: '최고', airline: 'Qantas', price: '₩1,850,000', route: '인천 → 시드니 (직항 비즈니스)', duration: '10시간' }
];

const STAY_OPTIONS = [
  { id: 's1', type: '가성비', name: 'Sydney Backpackers', price: '₩180,000/주', location: 'CBD 도보 15분', rooms: '8인실 도미토리' },
  { id: 's2', type: '가심비', name: 'City Share House', price: '₩450,000/주', location: 'CBD 도보 5분', rooms: '2인실 세어하우스' },
  { id: 's3', type: '최고', name: 'Premium Studio', price: '₩850,000/주', location: 'CBD 중심가', rooms: '1인실 스튜디오' }
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
    <div class="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div class="text-center mb-12">
        <div class="text-6xl mb-6">✈️</div>
        <h1 class="text-3xl font-bold text-gray-900 mb-4">도착 전에<br/>일부터 정해드립니다</h1>
        <p class="text-lg text-gray-600 leading-relaxed">AI가 당신에게 맞는 일자리를 찾아<br/>버튼 하나로 지원까지 완료해요</p>
      </div>
      <button 
        onclick="startApp()"
        class="w-full max-w-sm py-4 bg-blue-600 text-white rounded-xl font-bold text-lg active:bg-blue-700 transition-colors">
        시작하기
      </button>
    </div>
  `;
}

// ============ 온보딩 화면 ============
function renderOnboarding() {
  const cities = ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'];
  
  return `
    <div class="min-h-screen bg-white px-6 py-8 flex flex-col">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-3">어디로 가시나요?</h2>
        <p class="text-base text-gray-600">AI가 지금부터 일자리를 찾아드릴게요</p>
      </div>

      <div class="flex-1">
        <div class="space-y-3">
          ${cities.map(city => `
            <button 
              onclick="selectCity('${city}')"
              class="w-full py-5 rounded-xl font-semibold text-lg transition-all border-2
                ${AppState.profile.city === city 
                  ? 'bg-blue-50 border-blue-600 text-blue-600' 
                  : 'bg-white border-gray-200 text-gray-900 active:bg-gray-50'}">
              ${city}
            </button>
          `).join('')}
        </div>
      </div>

      <button 
        onclick="submitOnboarding()"
        ${!AppState.profile.city ? 'disabled' : ''}
        class="w-full py-4 rounded-xl font-bold text-lg transition-colors
          ${AppState.profile.city 
            ? 'bg-blue-600 text-white active:bg-blue-700' 
            : 'bg-gray-200 text-gray-400'}">
        다음
      </button>
    </div>
  `;
}

// ============ AI 매칭 로딩 (토스 스타일) ============
function renderMatching() {
  return `
    <div class="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div class="text-center">
        <!-- 토스 스타일 로딩 -->
        <div class="mb-8">
          <div class="inline-flex items-center justify-center">
            <div class="flex gap-1.5">
              <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
            </div>
          </div>
        </div>
        
        <h2 class="text-2xl font-bold text-gray-900 mb-3">AI가 일자리를<br/>찾는 중이에요</h2>
        <p class="text-base text-gray-600">잠시만 기다려주세요</p>
      </div>
    </div>
  `;
}

// ============ 메인 레이아웃 ============
function renderMainLayout() {
  return `
    <div class="flex flex-col min-h-screen bg-gray-50">
      <main class="flex-1 overflow-y-auto pb-20">
        ${renderMainContent()}
      </main>
      ${renderBottomTabBar()}
    </div>
  `;
}

// ============ 하단 탭바 (토스 스타일) ============
function renderBottomTabBar() {
  const tabs = [
    { id: 'home', icon: '🏠', label: '홈' },
    { id: 'jobs', icon: '💼', label: '일자리' },
    { id: 'checklist', icon: '✅', label: '준비' },
    { id: 'mypage', icon: '👤', label: '전체' }
  ];

  return `
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div class="flex items-center justify-around py-2 pb-safe">
        ${tabs.map(tab => `
          <button 
            onclick="switchTab('${tab.id}')"
            class="flex-1 flex flex-col items-center gap-1 py-2 transition-colors
              ${AppState.currentTab === tab.id ? 'text-blue-600' : 'text-gray-500'}">
            <span class="text-xl">${tab.icon}</span>
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
  return '';
}

// ============ 홈 화면 (토스 스타일) ============
function renderHome() {
  if (AppState.match_status === 'NONE') {
    return `<div class="flex items-center justify-center h-full px-6"><p class="text-gray-600">온보딩을 먼저 완료해주세요</p></div>`;
  }

  const topJob = AppState.matches[0];
  const isApplied = topJob && topJob.applied;

  return `
    <div class="bg-white min-h-screen">
      <!-- 헤더 -->
      <div class="px-6 pt-12 pb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          ${isApplied ? '지원 완료' : 'AI가 찾은<br/>당신의 일자리'}
        </h1>
        <p class="text-base text-gray-600">
          ${isApplied ? '고용주가 확인 중이에요' : '가장 적합한 일자리예요'}
        </p>
      </div>

      <!-- 1순위 카드 -->
      <div class="px-6 pb-6">
        <div class="bg-gray-50 rounded-2xl p-6">
          <!-- 직무명 -->
          <h3 class="text-2xl font-bold text-gray-900 mb-2">${topJob.title}</h3>
          <p class="text-base text-gray-600 mb-6">${topJob.employer}</p>

          <!-- 정보 -->
          <div class="space-y-3 mb-6">
            <div class="flex items-center gap-3">
              <span class="text-gray-500">📍</span>
              <span class="text-base font-medium text-gray-900">${topJob.city}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-gray-500">💰</span>
              <span class="text-base font-medium text-gray-900">${topJob.wage}/시간</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-gray-500">📅</span>
              <span class="text-base font-medium text-gray-900">${topJob.start_display} 시작</span>
            </div>
          </div>

          <!-- 선정 이유 -->
          <div class="bg-white rounded-xl p-4 mb-4">
            <p class="text-sm text-gray-700 leading-relaxed">${topJob.reason_short}</p>
          </div>

          <!-- 매칭률 -->
          <div class="flex items-center justify-between pt-2">
            <span class="text-sm text-gray-600">매칭률</span>
            <span class="text-lg font-bold text-blue-600">${topJob.match_score}%</span>
          </div>
        </div>
      </div>

      <!-- CTA -->
      ${!isApplied ? `
        <div class="px-6 pb-safe">
          <button 
            onclick="applyJob(${topJob.id})"
            class="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg active:bg-blue-700 transition-colors">
            원터치 지원하기
          </button>
        </div>
      ` : `
        <div class="px-6 pb-safe">
          <div class="w-full py-4 bg-green-50 text-green-600 rounded-xl font-bold text-lg text-center">
            ✓ 지원 완료
          </div>
        </div>
      `}

      <!-- 요약 -->
      <div class="px-6 pt-8 pb-safe">
        <div class="flex gap-3">
          <div class="flex-1 bg-white rounded-xl p-4 text-center">
            <p class="text-2xl font-bold text-blue-600 mb-1">${calculateChecklistProgress()}%</p>
            <p class="text-xs text-gray-600">준비 완료</p>
          </div>
          <div class="flex-1 bg-white rounded-xl p-4 text-center">
            <p class="text-xs ${AppState.services.visa_demo_done ? 'text-green-600' : 'text-gray-400'} font-semibold mb-1">
              ${AppState.services.visa_demo_done ? '✓ 완료' : '대기중'}
            </p>
            <p class="text-xs text-gray-600">비자</p>
          </div>
          <div class="flex-1 bg-white rounded-xl p-4 text-center">
            <p class="text-xs ${AppState.services.flight_demo_done ? 'text-green-600' : 'text-gray-400'} font-semibold mb-1">
              ${AppState.services.flight_demo_done ? '✓ 완료' : '대기중'}
            </p>
            <p class="text-xs text-gray-600">항공</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============ 일자리 화면 ============
function renderJobs() {
  return `
    <div class="bg-white min-h-screen">
      <div class="px-6 pt-12 pb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">추천 일자리</h1>
        <p class="text-base text-gray-600">AI가 선택한 후보들이에요</p>
      </div>

      <div class="px-6 space-y-4 pb-safe">
        ${AppState.matches.map((job, idx) => `
          <div class="bg-gray-50 rounded-2xl p-5">
            <div class="flex items-start justify-between mb-3">
              <h3 class="text-xl font-bold text-gray-900">${job.title}</h3>
              <span class="text-base font-bold text-blue-600">${job.match_score}%</span>
            </div>
            
            <p class="text-sm text-gray-600 mb-4">${job.employer}</p>

            <div class="space-y-2 mb-4">
              <div class="flex items-center gap-2 text-sm text-gray-700">
                <span>📍</span>
                <span>${job.city}</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-700">
                <span>💰</span>
                <span>${job.wage}/시간</span>
              </div>
            </div>

            ${!job.applied ? `
              <button 
                onclick="applyJob(${job.id})"
                class="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-base active:bg-blue-700 transition-colors">
                지원하기
              </button>
            ` : `
              <div class="w-full py-3 bg-green-50 text-green-600 rounded-xl font-semibold text-base text-center">
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
    <div class="bg-white min-h-screen">
      <div class="px-6 pt-12 pb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">준비 체크리스트</h1>
        <p class="text-base text-gray-600">하나씩 완료해보세요</p>
      </div>

      <div class="px-6 space-y-6 pb-safe">
        <!-- 출국 전 -->
        <div>
          <h3 class="text-lg font-bold text-gray-900 mb-3">출국 전</h3>
          <div class="space-y-2">
            ${CHECKLIST_ITEMS.beforeDeparture.map(item => `
              <label class="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-xl active:bg-gray-100">
                <input 
                  type="checkbox" 
                  ${item.done ? 'checked' : ''}
                  onchange="toggleCheckItem('beforeDeparture', '${item.id}')"
                  class="w-5 h-5 rounded border-gray-300 text-blue-600">
                <span class="flex-1 text-base ${item.done ? 'line-through text-gray-400' : 'text-gray-900'}">${item.label}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- 근무 전 -->
        <div>
          <h3 class="text-lg font-bold text-gray-900 mb-3">근무 전</h3>
          <div class="space-y-2">
            ${CHECKLIST_ITEMS.beforeWork.map(item => `
              <label class="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-xl active:bg-gray-100">
                <input 
                  type="checkbox" 
                  ${item.done ? 'checked' : ''}
                  onchange="toggleCheckItem('beforeWork', '${item.id}')"
                  class="w-5 h-5 rounded border-gray-300 text-blue-600">
                <span class="flex-1 text-base ${item.done ? 'line-through text-gray-400' : 'text-gray-900'}">${item.label}</span>
              </label>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============ 마이페이지 화면 ============
function renderMyPage() {
  return `
    <div class="bg-white min-h-screen">
      <div class="px-6 pt-12 pb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">전체</h1>
        <p class="text-base text-gray-600">서비스를 관리해보세요</p>
      </div>

      <div class="px-6 space-y-3 pb-safe">
        <!-- 비자 -->
        <button 
          onclick="startVisaDemo()"
          class="w-full flex items-center justify-between py-5 px-5 bg-gray-50 rounded-xl active:bg-gray-100">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🛂</span>
            <div class="text-left">
              <p class="text-base font-bold text-gray-900">비자 자동화</p>
              <p class="text-sm text-gray-600">n8n 기반 자동 신청</p>
            </div>
          </div>
          <span class="text-xs px-3 py-1.5 rounded-full font-semibold ${AppState.services.visa_demo_done ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}">
            ${AppState.services.visa_demo_done ? '완료' : '시작'}
          </span>
        </button>

        <!-- 항공권 -->
        <button 
          onclick="startFlightDemo()"
          class="w-full flex items-center justify-between py-5 px-5 bg-gray-50 rounded-xl active:bg-gray-100">
          <div class="flex items-center gap-3">
            <span class="text-2xl">✈️</span>
            <div class="text-left">
              <p class="text-base font-bold text-gray-900">항공권 추천</p>
              <p class="text-sm text-gray-600">3가지 옵션</p>
            </div>
          </div>
          <span class="text-xs px-3 py-1.5 rounded-full font-semibold ${AppState.services.flight_demo_done ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}">
            ${AppState.services.flight_demo_done ? '완료' : '시작'}
          </span>
        </button>

        <!-- 숙소 -->
        <button 
          onclick="startStayDemo()"
          class="w-full flex items-center justify-between py-5 px-5 bg-gray-50 rounded-xl active:bg-gray-100">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🏠</span>
            <div class="text-left">
              <p class="text-base font-bold text-gray-900">숙소 추천</p>
              <p class="text-sm text-gray-600">3가지 옵션</p>
            </div>
          </div>
          <span class="text-xs px-3 py-1.5 rounded-full font-semibold ${AppState.services.stay_demo_done ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}">
            ${AppState.services.stay_demo_done ? '완료' : '시작'}
          </span>
        </button>
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
      <div class="bg-white rounded-t-3xl w-full" onclick="event.stopPropagation()">
        <div class="px-6 py-6">
          <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
          <h3 class="text-2xl font-bold text-gray-900 mb-6">정보를 입력해주세요</h3>
          
          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">이름 (영문)</label>
              <input 
                type="text" 
                id="profileName"
                placeholder="HONG GILDONG"
                class="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-base focus:border-blue-600 focus:outline-none">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">국적</label>
              <select 
                id="profileNationality"
                class="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-base focus:border-blue-600 focus:outline-none">
                <option value="">선택하세요</option>
                <option value="South Korea">South Korea</option>
                <option value="Japan">Japan</option>
                <option value="Taiwan">Taiwan</option>
              </select>
            </div>
          </div>
          
          <button 
            onclick="submitProfile()"
            class="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg active:bg-blue-700 transition-colors">
            다음
          </button>
        </div>
      </div>
    `;
  } else if (AppState.bottomSheetType === 'passport') {
    content = `
      <div class="bg-white rounded-t-3xl w-full" onclick="event.stopPropagation()">
        <div class="px-6 py-8 text-center">
          <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
          <div class="text-6xl mb-4">📸</div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">여권을 스캔해주세요</h3>
          <p class="text-base text-gray-600 mb-8">사진면을 스캔하면<br/>자동으로 입력돼요</p>
          
          <div class="space-y-3">
            <button 
              onclick="simulatePassportScan()"
              class="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg active:bg-blue-700 transition-colors">
              스캔하기
            </button>
            <button 
              onclick="skipPassport()"
              class="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold text-base active:bg-gray-200 transition-colors">
              나중에 할게요
            </button>
          </div>
        </div>
      </div>
    `;
  } else if (AppState.bottomSheetType === 'visa') {
    content = `
      <div class="bg-white rounded-t-3xl w-full" onclick="event.stopPropagation()">
        <div class="px-6 py-8 text-center">
          <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
          
          <!-- 토스 스타일 로딩 -->
          <div class="mb-6">
            <div class="inline-flex items-center justify-center">
              <div class="flex gap-1.5">
                <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
              </div>
            </div>
          </div>
          
          <h3 class="text-2xl font-bold text-gray-900 mb-2">비자 신청 중</h3>
          <p class="text-base text-gray-600">잠시만 기다려주세요</p>
        </div>
      </div>
    `;

    setTimeout(() => {
      AppState.services.visa_demo_done = true;
      CHECKLIST_ITEMS.beforeDeparture.find(i => i.id === 'visa').done = true;
      closeBottomSheet();
      showToast('비자 신청이 완료됐어요');
    }, 2000);

  } else if (AppState.bottomSheetType === 'flight') {
    content = `
      <div class="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="px-6 py-6">
          <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
          <h3 class="text-2xl font-bold text-gray-900 mb-6">항공권을 선택하세요</h3>
          
          <div class="space-y-3">
            ${FLIGHT_OPTIONS.map(f => `
              <button 
                onclick="selectFlight('${f.id}')" 
                class="w-full text-left border-2 border-gray-200 rounded-xl p-5 active:bg-gray-50 transition-all">
                <div class="flex items-start justify-between mb-3">
                  <span class="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">${f.type}</span>
                  <span class="text-xl font-bold text-gray-900">${f.price}</span>
                </div>
                <p class="text-base font-bold text-gray-900 mb-1">${f.airline}</p>
                <p class="text-sm text-gray-600 mb-1">${f.route}</p>
                <p class="text-sm text-gray-600">${f.duration}</p>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  } else if (AppState.bottomSheetType === 'stay') {
    content = `
      <div class="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="px-6 py-6">
          <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
          <h3 class="text-2xl font-bold text-gray-900 mb-6">숙소를 선택하세요</h3>
          
          <div class="space-y-3">
            ${STAY_OPTIONS.map(s => `
              <button 
                onclick="selectStay('${s.id}')" 
                class="w-full text-left border-2 border-gray-200 rounded-xl p-5 active:bg-gray-50 transition-all">
                <div class="flex items-start justify-between mb-3">
                  <span class="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">${s.type}</span>
                  <span class="text-xl font-bold text-gray-900">${s.price}</span>
                </div>
                <p class="text-base font-bold text-gray-900 mb-1">${s.name}</p>
                <p class="text-sm text-gray-600 mb-1">${s.location}</p>
                <p class="text-sm text-gray-600">${s.rooms}</p>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  overlay.innerHTML = content;
  document.body.appendChild(overlay);
}

// ============ 토스트 렌더링 ============
function renderToast() {
  const toast = document.getElementById('toast');
  if (toast) toast.remove();

  const el = document.createElement('div');
  el.id = 'toast';
  el.className = 'fixed top-8 left-6 right-6 px-5 py-4 rounded-xl shadow-lg bg-gray-900 text-white text-sm font-medium z-50';
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
  AppState.currentScreen = 'matching';
  AppState.match_status = 'MATCHING';
  render();

  setTimeout(() => {
    AppState.matches = DUMMY_MATCHES;
    AppState.match_status = 'READY';
    AppState.currentScreen = 'home';
    AppState.currentTab = 'home';
    render();
  }, 1500);
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
      <div class="mb-6">
        <div class="inline-flex items-center justify-center">
          <div class="flex gap-1.5">
            <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
          </div>
        </div>
      </div>
      <p class="text-lg font-bold text-gray-900">스캔 중이에요</p>
    </div>
  `;

  setTimeout(() => {
    AppState.profile.passport.is_verified = true;
    const jobId = AppState.bottomSheetData.jobId;
    closeBottomSheet();
    submitApplication(jobId);
  }, 800);
}

function skipPassport() {
  closeBottomSheet();
}

function submitApplication(jobId) {
  const job = AppState.matches.find(j => j.id === jobId);
  if (!job) return;

  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-white flex items-center justify-center z-50';
  overlay.innerHTML = `
    <div class="text-center px-6">
      <div class="mb-6">
        <div class="inline-flex items-center justify-center">
          <div class="flex gap-1.5">
            <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
          </div>
        </div>
      </div>
      <p class="text-lg font-bold text-gray-900">지원서를 제출하는 중이에요</p>
    </div>
  `;
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
    job.applied = true;
    AppState.match_status = 'APPLIED';
    CHECKLIST_ITEMS.beforeWork.find(i => i.id === 'tfn').done = true;
    showToast('지원이 완료됐어요');
    render();
  }, 1000);
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
  showToast('항공권 예약이 완료됐어요');
}

function startStayDemo() {
  AppState.showBottomSheet = true;
  AppState.bottomSheetType = 'stay';
  render();
}

function selectStay(stayId) {
  AppState.services.stay_demo_done = true;
  closeBottomSheet();
  showToast('숙소 예약이 완료됐어요');
}

function showToast(message) {
  AppState.toast = { message };
  render();
}

// ============ 초기화 ============
document.addEventListener('DOMContentLoaded', () => {
  render();
});
