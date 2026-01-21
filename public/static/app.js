// HoliJob v2 - Desktop Web Version
// "AI가 골라줌 → 버튼 한 번으로 지원 (+ 항공/숙소/비자도 버튼으로)"

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
  showModal: false,
  modalType: null,
  modalData: null,
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
    // 메인 레이아웃 (좌측 사이드바 + 메인 콘텐츠)
    root.innerHTML = renderMainLayout();
  }

  if (AppState.showModal) {
    renderModalOverlay();
  }

  if (AppState.toast) {
    renderToast();
  }
}

// ============ 스플래시 화면 ============
function renderSplash() {
  return `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700">
      <div class="text-center px-8 max-w-2xl">
        <div class="text-8xl mb-8 animate-bounce">✈️</div>
        <h1 class="text-6xl font-bold text-white mb-6">HoliJob</h1>
        <p class="text-2xl text-white/90 mb-4">도착 전에 일부터 정해드립니다</p>
        <p class="text-lg text-white/80 mb-12">AI가 당신에게 맞는 일자리를 골라드려요<br/>버튼 하나로 지원 완료</p>
        <button 
          onclick="startApp()"
          class="px-12 py-5 bg-white text-blue-900 rounded-2xl font-bold text-xl hover:scale-105 transition-transform shadow-2xl">
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
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-8">
      <div class="bg-white rounded-3xl shadow-2xl p-12 max-w-3xl w-full">
        <div class="text-center mb-10">
          <div class="text-5xl mb-4">🎯</div>
          <h2 class="text-4xl font-bold text-gray-800 mb-3">일자리부터 골라드릴게요</h2>
          <p class="text-lg text-gray-600">딱 3가지만 알려주세요 (30초)</p>
        </div>

        <div class="space-y-8">
          <!-- 도시 선택 -->
          <div>
            <label class="block text-lg font-semibold text-gray-700 mb-4">어디로 가시나요?</label>
            <div class="flex flex-wrap gap-3">
              ${cities.map(city => `
                <button 
                  onclick="selectCity('${city}')"
                  class="px-8 py-4 rounded-full border-2 text-lg font-medium transition-all
                    ${AppState.profile.city === city 
                      ? 'bg-blue-900 text-white border-blue-900' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'}">
                  ${city}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- 출국일 (선택) -->
          <div>
            <label class="block text-lg font-semibold text-gray-700 mb-4">출국일 (선택)</label>
            <input 
              type="date" 
              id="departDate"
              class="w-full px-6 py-4 border-2 border-gray-300 rounded-xl text-lg focus:border-blue-900 focus:outline-none"
              value="${AppState.profile.depart_date || ''}">
          </div>

          <!-- CTA -->
          <button 
            onclick="submitOnboarding()"
            ${!AppState.profile.city ? 'disabled' : ''}
            class="w-full py-5 rounded-xl font-bold text-xl transition-all shadow-lg
              ${AppState.profile.city 
                ? 'bg-gradient-to-r from-blue-900 to-cyan-700 text-white hover:shadow-xl hover:scale-[1.02]' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}">
            AI 매칭 시작하기
          </button>
        </div>
      </div>
    </div>
  `;
}

// ============ AI 매칭 로딩 ============
function renderMatching() {
  return `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-8">
      <div class="text-center max-w-2xl">
        <div class="relative mb-8">
          <div class="w-32 h-32 mx-auto">
            <div class="absolute inset-0 border-8 border-blue-200 rounded-full"></div>
            <div class="absolute inset-0 border-8 border-blue-900 rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
        <h2 class="text-4xl font-bold text-gray-800 mb-4">AI가 당신 조건에 맞는<br/>일자리를 고르는 중...</h2>
        <p class="text-xl text-gray-600 mb-8">평균 10초 → 지금은 1초로 단축 🚀</p>
        <div class="space-y-3 text-lg text-gray-500">
          <p>✓ 비자 조건 확인</p>
          <p>✓ 출국일 기반 시작 가능 일자리 필터링</p>
          <p>✓ 첫 워홀러 맞춤 추천</p>
        </div>
      </div>
    </div>
  `;
}

// ============ 메인 레이아웃 (사이드바 + 콘텐츠) ============
function renderMainLayout() {
  return `
    <div class="flex min-h-screen bg-gray-50">
      <!-- 좌측 사이드바 -->
      <aside class="w-72 bg-white border-r border-gray-200 flex flex-col">
        <!-- 로고 -->
        <div class="p-8 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <div class="text-3xl">✈️</div>
            <div>
              <h1 class="text-2xl font-bold text-gray-800">HoliJob</h1>
              <p class="text-sm text-gray-500">AI 일자리 매칭</p>
            </div>
          </div>
        </div>

        <!-- 네비게이션 -->
        <nav class="flex-1 p-4 space-y-2">
          ${renderNavItem('home', '🏠', '홈', AppState.currentTab === 'home')}
          ${renderNavItem('jobs', '💼', '일자리', AppState.currentTab === 'jobs')}
          ${renderNavItem('checklist', '✅', '체크리스트', AppState.currentTab === 'checklist')}
          ${renderNavItem('mypage', '👤', '마이페이지', AppState.currentTab === 'mypage')}
        </nav>

        <!-- 프로필 요약 -->
        <div class="p-6 border-t border-gray-200">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-900 to-cyan-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
              ${AppState.profile.name_en ? AppState.profile.name_en.charAt(0).toUpperCase() : '?'}
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-800">${AppState.profile.name_en || '게스트'}</p>
              <p class="text-sm text-gray-500">${AppState.profile.city || '도시 미설정'}</p>
            </div>
          </div>
          ${renderProfileCompletionBar()}
        </div>
      </aside>

      <!-- 메인 콘텐츠 영역 -->
      <main class="flex-1 overflow-y-auto">
        <div class="max-w-7xl mx-auto p-8">
          ${renderMainContent()}
        </div>
      </main>
    </div>
  `;
}

function renderNavItem(tab, icon, label, active) {
  return `
    <button 
      onclick="switchTab('${tab}')"
      class="w-full flex items-center gap-4 px-6 py-4 rounded-xl text-left transition-all
        ${active 
          ? 'bg-gradient-to-r from-blue-900 to-cyan-700 text-white shadow-lg' 
          : 'text-gray-700 hover:bg-gray-100'}">
      <span class="text-2xl">${icon}</span>
      <span class="font-semibold text-lg">${label}</span>
    </button>
  `;
}

function renderProfileCompletionBar() {
  const items = [
    AppState.profile.city,
    AppState.profile.name_en,
    AppState.profile.nationality,
    AppState.profile.passport.is_verified
  ];
  const completed = items.filter(Boolean).length;
  const percent = Math.round((completed / items.length) * 100);

  return `
    <div>
      <div class="flex justify-between text-sm mb-2">
        <span class="text-gray-600">프로필 완성도</span>
        <span class="font-semibold text-blue-900">${percent}%</span>
      </div>
      <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-blue-900 to-cyan-700 transition-all" style="width: ${percent}%"></div>
      </div>
    </div>
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
    return `<div class="text-center py-20"><p class="text-2xl text-gray-600">매칭 중...</p></div>`;
  }

  if (AppState.match_status === 'NONE') {
    return `<div class="text-center py-20"><p class="text-2xl text-gray-600">온보딩을 먼저 완료해주세요</p></div>`;
  }

  const topJob = AppState.matches[0];
  const isApplied = topJob && topJob.applied;

  return `
    <div class="space-y-8">
      <!-- 상태 배너 -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-4xl font-bold text-gray-800 mb-2">
            ${isApplied ? '지원 완료!' : 'AI가 고른 당신의 일자리'}
          </h2>
          <p class="text-xl text-gray-600">
            ${isApplied 
              ? '고용주가 확인 중입니다. 보통 1~3일 내 답변이 옵니다.' 
              : '가장 적합한 일자리를 찾았어요. 지금 바로 지원하세요!'}
          </p>
        </div>
        ${isApplied ? `
          <div class="px-6 py-3 bg-green-100 text-green-700 rounded-full font-semibold text-lg">
            ✓ 지원완료
          </div>
        ` : ''}
      </div>

      <!-- 1순위 카드 -->
      <div class="bg-white rounded-3xl shadow-xl p-8 border-2 ${isApplied ? 'border-emerald-400' : 'border-blue-200'}">
        <!-- 배지 -->
        <div class="flex items-center justify-between mb-6">
          <span class="px-6 py-2 bg-gradient-to-r from-blue-900 to-cyan-700 text-white rounded-full font-bold text-lg">
            ${topJob.badge}
          </span>
          <span class="text-3xl font-bold text-blue-900">${topJob.match_score}% 매칭</span>
        </div>

        <!-- 직무 정보 -->
        <div class="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h3 class="text-3xl font-bold text-gray-800 mb-2">${topJob.title}</h3>
            <p class="text-xl text-gray-600">${topJob.employer}</p>
          </div>
          <div class="space-y-3 text-lg">
            <div class="flex items-center gap-3">
              <span class="text-gray-500">📍</span>
              <span class="font-semibold">${topJob.city}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-gray-500">💰</span>
              <span class="font-semibold">${topJob.wage}/hour</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-gray-500">📅</span>
              <span class="font-semibold">${topJob.start_display} 시작</span>
            </div>
          </div>
        </div>

        <!-- 선정 이유 -->
        <div class="bg-blue-50 rounded-2xl p-6 mb-6">
          <p class="text-gray-700 text-lg">
            <span class="font-semibold text-blue-900">💡 선정 이유:</span> ${topJob.reason_short}
          </p>
        </div>

        <!-- CTA -->
        ${!isApplied ? `
          <button 
            onclick="applyJob(${topJob.id})"
            class="w-full py-5 bg-gradient-to-r from-blue-900 to-cyan-700 text-white rounded-2xl font-bold text-2xl hover:shadow-2xl hover:scale-[1.02] transition-all">
            ⚡ 원터치 지원하기
          </button>
        ` : `
          <div class="text-center py-4">
            <p class="text-xl text-emerald-600 font-semibold">✓ 지원이 완료되었습니다</p>
          </div>
        `}
      </div>

      <!-- 보조 정보 그리드 -->
      <div class="grid grid-cols-3 gap-6">
        <!-- 체크리스트 요약 -->
        <div class="bg-white rounded-2xl shadow-md p-6">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-3xl">✅</span>
            <h3 class="text-xl font-bold text-gray-800">체크리스트</h3>
          </div>
          <p class="text-3xl font-bold text-blue-900 mb-2">${calculateChecklistProgress()}%</p>
          <p class="text-gray-600">진행률</p>
        </div>

        <!-- 비자 상태 -->
        <div class="bg-white rounded-2xl shadow-md p-6">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-3xl">🛂</span>
            <h3 class="text-xl font-bold text-gray-800">비자</h3>
          </div>
          <p class="text-lg font-semibold ${AppState.services.visa_demo_done ? 'text-emerald-600' : 'text-gray-400'}">
            ${AppState.services.visa_demo_done ? '✓ 신청완료' : '연결 예정'}
          </p>
        </div>

        <!-- 항공권 상태 -->
        <div class="bg-white rounded-2xl shadow-md p-6">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-3xl">✈️</span>
            <h3 class="text-xl font-bold text-gray-800">항공권</h3>
          </div>
          <p class="text-lg font-semibold ${AppState.services.flight_demo_done ? 'text-emerald-600' : 'text-gray-400'}">
            ${AppState.services.flight_demo_done ? '✓ 예약완료' : '연결 예정'}
          </p>
        </div>
      </div>
    </div>
  `;
}

// ============ 일자리 화면 ============
function renderJobs() {
  return `
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <h2 class="text-4xl font-bold text-gray-800">일자리 후보</h2>
        <div class="flex gap-3">
          <button class="px-6 py-3 bg-blue-900 text-white rounded-xl font-semibold">자동매칭</button>
          <button class="px-6 py-3 bg-gray-200 text-gray-600 rounded-xl font-semibold">직접찾기</button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        ${AppState.matches.map(job => `
          <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <!-- 배지 & 매칭 스코어 -->
            <div class="flex items-center justify-between mb-4">
              <span class="px-4 py-2 bg-blue-100 text-blue-900 rounded-full text-sm font-bold">
                ${job.badge}
              </span>
              <span class="text-xl font-bold text-blue-900">${job.match_score}%</span>
            </div>

            <!-- 직무 정보 -->
            <h3 class="text-2xl font-bold text-gray-800 mb-2">${job.title}</h3>
            <p class="text-gray-600 mb-4">${job.employer}</p>

            <div class="space-y-2 mb-4 text-base">
              <div class="flex items-center gap-2">
                <span class="text-gray-500">📍</span>
                <span>${job.city}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-gray-500">💰</span>
                <span>${job.wage}/hour</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-gray-500">📅</span>
                <span>${job.start_display} 시작</span>
              </div>
            </div>

            <!-- 선정 이유 -->
            <div class="bg-gray-50 rounded-xl p-4 mb-4">
              <p class="text-sm text-gray-700">${job.reason_short}</p>
            </div>

            <!-- CTA -->
            ${!job.applied ? `
              <button 
                onclick="applyJob(${job.id})"
                class="w-full py-3 bg-gradient-to-r from-blue-900 to-cyan-700 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                원터치 지원
              </button>
            ` : `
              <div class="text-center py-3 bg-emerald-100 text-emerald-700 rounded-xl font-semibold">
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
    <div class="space-y-8">
      <h2 class="text-4xl font-bold text-gray-800">체크리스트</h2>

      <!-- 출국 전 -->
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <h3 class="text-2xl font-bold text-gray-800 mb-6">출국 전 준비</h3>
        <div class="space-y-4">
          ${CHECKLIST_ITEMS.beforeDeparture.map(item => `
            <label class="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                ${item.done ? 'checked' : ''}
                onchange="toggleCheckItem('beforeDeparture', '${item.id}')"
                class="w-6 h-6 rounded border-gray-300 text-blue-900 focus:ring-blue-900">
              <span class="text-lg ${item.done ? 'line-through text-gray-400' : 'text-gray-700'}">${item.label}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- 근무 전 -->
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <h3 class="text-2xl font-bold text-gray-800 mb-6">근무 전 준비</h3>
        <div class="space-y-4">
          ${CHECKLIST_ITEMS.beforeWork.map(item => `
            <label class="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                ${item.done ? 'checked' : ''}
                onchange="toggleCheckItem('beforeWork', '${item.id}')"
                class="w-6 h-6 rounded border-gray-300 text-blue-900 focus:ring-blue-900">
              <span class="text-lg ${item.done ? 'line-through text-gray-400' : 'text-gray-700'}">${item.label}</span>
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
    <div class="space-y-8">
      <h2 class="text-4xl font-bold text-gray-800">마이페이지</h2>

      <!-- 프로필 카드 -->
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <h3 class="text-2xl font-bold text-gray-800 mb-6">프로필</h3>
        <div class="grid grid-cols-2 gap-6">
          <div>
            <p class="text-sm text-gray-500 mb-1">이름(영문)</p>
            <p class="text-xl font-semibold">${AppState.profile.name_en || '미입력'}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">국적</p>
            <p class="text-xl font-semibold">${AppState.profile.nationality || '미입력'}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">목적지</p>
            <p class="text-xl font-semibold">${AppState.profile.city || '미입력'}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">여권 인증</p>
            <p class="text-xl font-semibold ${AppState.profile.passport.is_verified ? 'text-emerald-600' : 'text-gray-400'}">
              ${AppState.profile.passport.is_verified ? '✓ 인증완료' : '미인증'}
            </p>
          </div>
        </div>
      </div>

      <!-- Services Hub -->
      <div>
        <h3 class="text-2xl font-bold text-gray-800 mb-6">Services Hub</h3>
        <div class="grid grid-cols-3 gap-6">
          <!-- 비자 자동화 -->
          <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div class="text-4xl mb-4">🛂</div>
            <h4 class="text-xl font-bold text-gray-800 mb-2">비자 자동화</h4>
            <p class="text-gray-600 mb-4">n8n 기반 자동 신청</p>
            <button 
              onclick="startVisaDemo()"
              class="w-full py-3 ${AppState.services.visa_demo_done ? 'bg-emerald-600' : 'bg-blue-900'} text-white rounded-xl font-semibold hover:opacity-90 transition-opacity">
              ${AppState.services.visa_demo_done ? '✓ 완료' : '시작하기'}
            </button>
          </div>

          <!-- 항공권 추천 -->
          <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div class="text-4xl mb-4">✈️</div>
            <h4 class="text-xl font-bold text-gray-800 mb-2">항공권 추천</h4>
            <p class="text-gray-600 mb-4">3가지 옵션 제시</p>
            <button 
              onclick="startFlightDemo()"
              class="w-full py-3 ${AppState.services.flight_demo_done ? 'bg-emerald-600' : 'bg-blue-900'} text-white rounded-xl font-semibold hover:opacity-90 transition-opacity">
              ${AppState.services.flight_demo_done ? '✓ 완료' : '시작하기'}
            </button>
          </div>

          <!-- 숙소 추천 -->
          <div class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div class="text-4xl mb-4">🏠</div>
            <h4 class="text-xl font-bold text-gray-800 mb-2">숙소 추천</h4>
            <p class="text-gray-600 mb-4">3가지 옵션 제시</p>
            <button 
              onclick="startStayDemo()"
              class="w-full py-3 ${AppState.services.stay_demo_done ? 'bg-emerald-600' : 'bg-blue-900'} text-white rounded-xl font-semibold hover:opacity-90 transition-opacity">
              ${AppState.services.stay_demo_done ? '✓ 완료' : '시작하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============ 모달 렌더링 ============
function renderModalOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8';
  overlay.onclick = (e) => {
    if (e.target === overlay) closeModal();
  };

  let content = '';
  
  if (AppState.modalType === 'profile') {
    content = `
      <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full" onclick="event.stopPropagation()">
        <h3 class="text-3xl font-bold text-gray-800 mb-6">프로필 정보 입력</h3>
        <div class="space-y-6">
          <div>
            <label class="block text-lg font-semibold text-gray-700 mb-2">이름(영문)</label>
            <input 
              type="text" 
              id="profileName"
              placeholder="HONG GILDONG"
              class="w-full px-6 py-4 border-2 border-gray-300 rounded-xl text-lg focus:border-blue-900 focus:outline-none">
          </div>
          <div>
            <label class="block text-lg font-semibold text-gray-700 mb-2">국적</label>
            <select 
              id="profileNationality"
              class="w-full px-6 py-4 border-2 border-gray-300 rounded-xl text-lg focus:border-blue-900 focus:outline-none">
              <option value="">선택하세요</option>
              <option value="South Korea">South Korea</option>
              <option value="Japan">Japan</option>
              <option value="Taiwan">Taiwan</option>
            </select>
          </div>
          <button 
            onclick="submitProfile()"
            class="w-full py-4 bg-gradient-to-r from-blue-900 to-cyan-700 text-white rounded-xl font-bold text-xl hover:shadow-lg transition-all">
            다음
          </button>
        </div>
      </div>
    `;
  } else if (AppState.modalType === 'passport') {
    content = `
      <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full text-center" onclick="event.stopPropagation()">
        <div class="text-6xl mb-6">📸</div>
        <h3 class="text-3xl font-bold text-gray-800 mb-4">여권 정보 스캔</h3>
        <p class="text-xl text-gray-600 mb-8">여권 사진면을 스캔하면<br/>자동으로 정보가 입력됩니다</p>
        <div class="space-y-4">
          <button 
            onclick="simulatePassportScan()"
            class="w-full py-4 bg-gradient-to-r from-blue-900 to-cyan-700 text-white rounded-xl font-bold text-xl hover:shadow-lg transition-all">
            여권 스캔하기
          </button>
          <button 
            onclick="skipPassport()"
            class="w-full py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-300 transition-all">
            나중에 하기
          </button>
        </div>
      </div>
    `;
  } else if (AppState.modalType === 'visa') {
    content = `
      <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-3xl w-full" onclick="event.stopPropagation()">
        <h3 class="text-3xl font-bold text-gray-800 mb-6">비자 자동화 (n8n)</h3>
        
        <!-- 3단계 스테퍼 -->
        <div class="flex items-center justify-between mb-8">
          <div class="flex-1 text-center">
            <div class="w-12 h-12 mx-auto bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-xl mb-2">1</div>
            <p class="text-sm font-semibold">서류 스캔</p>
          </div>
          <div class="flex-1 h-1 bg-gray-300"></div>
          <div class="flex-1 text-center">
            <div class="w-12 h-12 mx-auto bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-xl mb-2">2</div>
            <p class="text-sm font-semibold">자동 입력</p>
          </div>
          <div class="flex-1 h-1 bg-gray-300"></div>
          <div class="flex-1 text-center">
            <div class="w-12 h-12 mx-auto bg-gray-300 text-white rounded-full flex items-center justify-center font-bold text-xl mb-2">3</div>
            <p class="text-sm font-semibold">제출</p>
          </div>
        </div>

        <div class="text-center py-8">
          <div class="text-5xl mb-4 animate-pulse">🔄</div>
          <p class="text-xl text-gray-600">n8n이 자동으로 비자 신청을 처리 중...</p>
        </div>
      </div>
    `;

    // 3초 후 완료
    setTimeout(() => {
      AppState.services.visa_demo_done = true;
      CHECKLIST_ITEMS.beforeDeparture.find(i => i.id === 'visa').done = true;
      closeModal();
      showToast('✓ 비자 신청이 완료되었습니다!', 'success');
    }, 3000);

  } else if (AppState.modalType === 'flight') {
    content = `
      <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full" onclick="event.stopPropagation()">
        <h3 class="text-3xl font-bold text-gray-800 mb-6">항공권 추천</h3>
        <div class="grid grid-cols-3 gap-6">
          ${FLIGHT_OPTIONS.map(f => `
            <div class="border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-900 transition-all cursor-pointer" onclick="selectFlight('${f.id}')">
              <div class="text-center mb-4">
                <span class="px-4 py-2 bg-blue-100 text-blue-900 rounded-full text-sm font-bold">${f.type}</span>
              </div>
              <p class="text-2xl font-bold text-center text-gray-800 mb-2">${f.price}</p>
              <p class="text-lg font-semibold text-gray-700 mb-1">${f.airline}</p>
              <p class="text-sm text-gray-600 mb-1">${f.route}</p>
              <p class="text-sm text-gray-600 mb-3">${f.duration}</p>
              <p class="text-sm text-blue-900 font-semibold">${f.highlight}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (AppState.modalType === 'stay') {
    content = `
      <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full" onclick="event.stopPropagation()">
        <h3 class="text-3xl font-bold text-gray-800 mb-6">숙소 추천</h3>
        <div class="grid grid-cols-3 gap-6">
          ${STAY_OPTIONS.map(s => `
            <div class="border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-900 transition-all cursor-pointer" onclick="selectStay('${s.id}')">
              <div class="text-center mb-4">
                <span class="px-4 py-2 bg-blue-100 text-blue-900 rounded-full text-sm font-bold">${s.type}</span>
              </div>
              <p class="text-2xl font-bold text-center text-gray-800 mb-2">${s.price}</p>
              <p class="text-lg font-semibold text-gray-700 mb-1">${s.name}</p>
              <p class="text-sm text-gray-600 mb-1">${s.location}</p>
              <p class="text-sm text-gray-600 mb-3">${s.rooms}</p>
              <p class="text-sm text-blue-900 font-semibold">${s.highlight}</p>
            </div>
          `).join('')}
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
  el.className = `fixed top-8 right-8 px-8 py-4 rounded-2xl shadow-2xl text-white font-semibold text-lg z-50 animate-slide-down
    ${AppState.toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`;
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

  // 1초 후 매칭 완료
  setTimeout(() => {
    AppState.matches = DUMMY_MATCHES;
    AppState.match_status = 'READY';
    AppState.currentScreen = 'home';
    AppState.currentTab = 'home';
    render();
  }, 1000);
}

function applyJob(jobId) {
  // 정보 체크
  if (!AppState.profile.name_en || !AppState.profile.nationality) {
    AppState.showModal = true;
    AppState.modalType = 'profile';
    AppState.modalData = { jobId };
    render();
    return;
  }

  if (!AppState.profile.passport.is_verified) {
    AppState.showModal = true;
    AppState.modalType = 'passport';
    AppState.modalData = { jobId };
    render();
    return;
  }

  // 지원 제출
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

  // 여권 체크
  if (!AppState.profile.passport.is_verified) {
    AppState.modalType = 'passport';
    render();
  } else {
    const jobId = AppState.modalData.jobId;
    closeModal();
    submitApplication(jobId);
  }
}

function simulatePassportScan() {
  const modal = document.querySelector('#modal-overlay > div');
  modal.innerHTML = `
    <div class="text-center py-12">
      <div class="text-6xl mb-4 animate-pulse">📸</div>
      <p class="text-2xl text-gray-700">여권 스캔 중...</p>
    </div>
  `;

  setTimeout(() => {
    AppState.profile.passport.is_verified = true;
    AppState.profile.passport.ocr_dummy = {
      name: AppState.profile.name_en,
      number: 'M12345678',
      expiry: '2030-12-31'
    };

    const jobId = AppState.modalData.jobId;
    closeModal();
    submitApplication(jobId);
  }, 600);
}

function skipPassport() {
  closeModal();
}

function submitApplication(jobId) {
  const job = AppState.matches.find(j => j.id === jobId);
  if (!job) return;

  // 로딩 표시
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-3xl shadow-2xl p-12 text-center">
      <div class="text-6xl mb-4 animate-pulse">⚡</div>
      <p class="text-2xl text-gray-700">지원서 자동 제출 중...</p>
    </div>
  `;
  document.body.appendChild(modal);

  setTimeout(() => {
    modal.remove();
    job.applied = true;
    AppState.match_status = 'APPLIED';
    CHECKLIST_ITEMS.beforeWork.find(i => i.id === 'tfn').done = true;
    showToast('✓ 지원이 완료되었습니다!', 'success');
    render();
  }, 800);
}

function closeModal() {
  AppState.showModal = false;
  AppState.modalType = null;
  AppState.modalData = null;
  const overlay = document.getElementById('modal-overlay');
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
  AppState.showModal = true;
  AppState.modalType = 'visa';
  render();
}

function startFlightDemo() {
  AppState.showModal = true;
  AppState.modalType = 'flight';
  render();
}

function selectFlight(flightId) {
  AppState.services.flight_demo_done = true;
  CHECKLIST_ITEMS.beforeDeparture.find(i => i.id === 'flight').done = true;
  closeModal();
  showToast('✓ 항공권 예약이 완료되었습니다!', 'success');
}

function startStayDemo() {
  AppState.showModal = true;
  AppState.modalType = 'stay';
  render();
}

function selectStay(stayId) {
  AppState.services.stay_demo_done = true;
  closeModal();
  showToast('✓ 숙소 예약이 완료되었습니다!', 'success');
}

function showToast(message, type = 'success') {
  AppState.toast = { message, type };
  render();
}

// ============ 초기화 ============
document.addEventListener('DOMContentLoaded', () => {
  render();
});
