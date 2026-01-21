// HoliJob v2 - 10초 데모 최적화
// "AI가 골라줌 → 버튼 한 번으로 지원 (+ 항공/숙소/비자도 버튼으로)"

// ============ 상태 관리 ============
const AppState = {
  // 화면
  currentScreen: 'splash', // splash, onboarding, matching, home, jobs, checklist, mypage, visa, flight, stay
  currentTab: 'home',
  
  // 사용자 플래그
  new_user: true,
  
  // 매칭 상태
  match_status: 'NONE', // NONE, MATCHING, READY, APPLIED
  
  // 프로필
  profile: {
    city: '',
    depart_date: null,
    name_en: '',
    nationality: '',
    passport: {
      is_verified: false,
      ocr_dummy: null
    }
  },
  
  // 이력서 (데모용)
  resume: {
    source: 'NONE',
    keywords: []
  },
  
  // 서비스 완료 상태
  services: {
    visa_demo_done: false,
    flight_demo_done: false,
    stay_demo_done: false
  },
  
  // 일자리 데이터
  matches: [],
  
  // 모달/BottomSheet
  showBottomSheet: false,
  bottomSheetType: null, // 'profile', 'passport', 'visa', 'flight', 'stay'
  bottomSheetData: null,
  
  // 토스트
  toast: null
};

// ============ 더미 데이터 ============
const DUMMY_MATCHES = [
  {
    id: 1,
    rank: 1,
    badge: 'AI 추천 1순위',
    title: 'Cafe All-rounder',
    employer: 'Sydney Coffee Culture',
    city: 'Sydney',
    wage: '$28',
    wage_unit: 'hour',
    start_date: '2026-02-03',
    start_display: '02/03',
    reason_short: '첫 워홀러·영어초급도 적응 빠른 루트',
    reasons_full: [
      '호주 최대 카페 체인, 교육 시스템 체계적',
      '영어 초급도 환영, 한국인 매니저 있음',
      '숙소 지원 + 식사 제공'
    ],
    match_score: 95,
    applied: false
  },
  {
    id: 2,
    rank: 2,
    badge: 'AI 추천 2순위',
    title: 'Kitchen Hand',
    employer: 'Sydney Restaurant Group',
    city: 'Sydney',
    wage: '$27',
    wage_unit: 'hour',
    start_date: '2026-02-05',
    start_display: '02/05',
    reason_short: '체력 필요, 영어 부담 적음',
    reasons_full: [
      '설거지·준비 업무, 영어 회화 부담 거의 없음',
      '주 5일 보장, 초과근무 가능',
      '세컨 비자 카운트 가능'
    ],
    match_score: 88,
    applied: false
  },
  {
    id: 3,
    rank: 3,
    badge: 'AI 추천 3순위',
    title: 'Retail Assistant',
    employer: 'Sydney Shopping Mall',
    city: 'Sydney',
    wage: '$29',
    wage_unit: 'hour',
    start_date: '2026-02-10',
    start_display: '02/10',
    reason_short: '영어 중급 이상, 소통 좋아하면 추천',
    reasons_full: [
      '대형 쇼핑몰, 안정적인 환경',
      '영어 중급 필요 (고객 응대)',
      '시간당 최고 수준, 커미션 있음'
    ],
    match_score: 82,
    applied: false
  }
];

const DUMMY_FLIGHTS = [
  {
    id: 'f1',
    label: '가성비',
    airline: '대한항공 + 콴타스',
    route: '인천 → 방콕 (경유) → 시드니',
    duration: '14시간 30분',
    price: '₩980,000',
    badge: '최저가'
  },
  {
    id: 'f2',
    label: '가심비',
    airline: '아시아나 + 싱가포르',
    route: '인천 → 싱가포르 (경유) → 시드니',
    duration: '12시간 20분',
    price: '₩1,280,000',
    badge: '시간 짧음'
  },
  {
    id: 'f3',
    label: '최고',
    airline: '대한항공 직항',
    route: '인천 → 시드니 (직항)',
    duration: '10시간',
    price: '₩1,850,000',
    badge: '직항/프리미엄'
  }
];

const DUMMY_STAYS = [
  {
    id: 's1',
    label: '가성비',
    name: 'Sydney Backpackers',
    type: '쉐어하우스 (4인실)',
    location: 'CBD 도보 15분',
    price_week: '₩180,000',
    badge: '최저가'
  },
  {
    id: 's2',
    label: '가심비',
    name: 'Serviced Apartment',
    type: '서비스드 아파트 (1인실)',
    location: 'CBD 도보 5분',
    price_week: '₩450,000',
    badge: '시설 좋음'
  },
  {
    id: 's3',
    label: '최고',
    name: 'Premium Hotel',
    type: '호텔 (스위트)',
    location: 'CBD 중심',
    price_week: '₩850,000',
    badge: '고급/풀옵션'
  }
];

const CHECKLIST_ITEMS = {
  beforeDeparture: [
    { id: 1, title: '여권 준비', completed: false },
    { id: 2, title: '비자 신청', completed: false },
    { id: 3, title: '항공권 예약', completed: false },
    { id: 4, title: '숙소 예약', completed: false }
  ],
  beforeWork: [
    { id: 5, title: 'TFN 발급 (자동)', completed: false },
    { id: 6, title: '은행 계좌 개설', completed: false },
    { id: 7, title: '현지 유심', completed: false }
  ]
};

// ============ LocalStorage ============
function saveState() {
  localStorage.setItem('holijob_v2', JSON.stringify(AppState));
}

function loadState() {
  const saved = localStorage.getItem('holijob_v2');
  if (saved) {
    const parsed = JSON.parse(saved);
    Object.assign(AppState, parsed);
    return true;
  }
  return false;
}

function clearState() {
  localStorage.removeItem('holijob_v2');
}

// ============ 토스트 ============
function showToast(message, duration = 1500) {
  AppState.toast = message;
  render();
  
  setTimeout(() => {
    AppState.toast = null;
    render();
  }, duration);
}

// ============ 화면 렌더링 ============

function renderSplash() {
  return `
    <div class="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-6 animate-fade-in">
      <div class="text-center text-white max-w-md">
        <div class="mb-12 animate-bounce-slow">
          <div class="w-28 h-28 mx-auto bg-white rounded-3xl flex items-center justify-center shadow-2xl">
            <span class="text-6xl">✈️</span>
          </div>
        </div>
        <h1 class="text-5xl font-bold mb-6">HoliJob</h1>
        <p class="text-2xl text-white mb-4 leading-relaxed font-light">
          도착 전에,<br/>일부터 정해드립니다
        </p>
        <p class="text-sm text-blue-100 mb-12 opacity-90">
          이력서 기반으로 AI가 골라주고,<br/>버튼 한 번이면 지원 완료
        </p>
        <button onclick="startApp()" 
          class="bg-white text-blue-600 px-16 py-5 rounded-2xl font-bold text-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95">
          시작하기
        </button>
      </div>
    </div>
  `;
}

function renderOnboarding() {
  const cities = ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Gold Coast', '기타'];
  
  return `
    <div class="min-h-screen bg-white flex items-center justify-center p-6">
      <div class="max-w-md w-full">
        <div class="text-center mb-12">
          <div class="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
            <span class="text-4xl">🌏</span>
          </div>
          <h2 class="text-3xl font-bold text-gray-800 mb-3">어디로 가나요?</h2>
          <p class="text-gray-600">도시를 선택해주세요</p>
        </div>
        
        <div class="grid grid-cols-2 gap-3 mb-8">
          ${cities.map(city => `
            <button onclick="selectCity('${city}')" 
              class="city-chip bg-white border-2 border-gray-200 rounded-2xl py-6 px-4 text-center hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-95 ${AppState.profile.city === city ? 'border-blue-500 bg-blue-50' : ''}">
              <span class="text-lg font-semibold text-gray-800">${city}</span>
            </button>
          `).join('')}
        </div>
        
        <div class="mb-6 opacity-50">
          <label class="block text-sm font-semibold text-gray-600 mb-3">출국일 (선택)</label>
          <input type="date" id="departDate" 
            class="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition">
        </div>
        
        <button onclick="submitOnboarding()" 
          class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-5 rounded-2xl font-bold text-xl hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          ${!AppState.profile.city ? 'disabled' : ''}>
          AI 매칭 시작
        </button>
        
        <p class="text-center text-sm text-gray-400 mt-4">
          평균 10초 → 지금은 1초
        </p>
      </div>
    </div>
  `;
}

function renderMatching() {
  return `
    <div class="min-h-screen bg-white flex items-center justify-center p-6">
      <div class="max-w-md w-full text-center">
        <div class="mb-8">
          <div class="inline-block">
            <div class="w-24 h-24 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-3">AI가 이력서·조건에 맞는</h2>
        <p class="text-xl text-gray-600 mb-8">일자리를 고르는 중...</p>
        
        <div class="bg-blue-50 rounded-2xl p-6 text-left">
          <div class="space-y-3">
            <div class="flex items-center gap-3 text-sm text-gray-700">
              <span class="text-green-500 text-lg">✓</span>
              <span>${AppState.profile.city} 지역 일자리 검색</span>
            </div>
            <div class="flex items-center gap-3 text-sm text-gray-700">
              <span class="text-green-500 text-lg">✓</span>
              <span>경력·조건 매칭 중</span>
            </div>
            <div class="flex items-center gap-3 text-sm text-blue-500">
              <span class="animate-pulse text-lg">⏳</span>
              <span>최적 후보 선정 중...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderHome() {
  if (AppState.match_status === 'MATCHING') {
    return renderMatching();
  }
  
  if (AppState.match_status === 'NONE' || AppState.matches.length === 0) {
    return `
      <div class="pb-20">
        <div class="p-6 text-center">
          <p class="text-gray-500">일자리 정보를 불러오는 중...</p>
        </div>
      </div>
    `;
  }
  
  const topMatch = AppState.matches[0];
  const isReady = AppState.match_status === 'READY';
  const isApplied = AppState.match_status === 'APPLIED';
  
  return `
    <div class="pb-20 min-h-screen bg-gray-50">
      ${renderHeader()}
      
      <div class="p-6">
        <!-- 상태 바 -->
        <div class="mb-6 animate-slide-up">
          ${isReady ? `
            <div class="bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-2xl p-4 text-center shadow-lg">
              <span class="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-semibold mb-2">READY</span>
              <p class="font-semibold">1순위 추천이 도착했어요</p>
            </div>
          ` : ''}
          
          ${isApplied ? `
            <div class="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-4 text-center shadow-lg">
              <span class="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-semibold mb-2">APPLIED</span>
              <p class="font-semibold">지원 완료 · 이제 인터뷰만 남았어요</p>
            </div>
          ` : ''}
        </div>
        
        <!-- 메인 카드 (1순위) -->
        <div class="bg-white rounded-3xl shadow-2xl p-6 mb-6 border-2 ${isApplied ? 'border-green-500' : 'border-blue-500'} animate-slide-up" style="animation-delay: 0.1s">
          <div class="flex items-center justify-between mb-4">
            <span class="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm px-4 py-1.5 rounded-full font-bold">
              ${topMatch.badge}
            </span>
            ${isApplied ? '<span class="text-2xl">✅</span>' : ''}
          </div>
          
          <h2 class="text-3xl font-bold text-gray-800 mb-2">${topMatch.title}</h2>
          <p class="text-gray-600 mb-4">${topMatch.employer}</p>
          
          <div class="space-y-3 mb-6">
            <div class="flex items-center gap-3">
              <span class="text-2xl">📍</span>
              <span class="text-lg text-gray-700">${topMatch.city}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-2xl">💰</span>
              <div>
                <span class="text-2xl font-bold text-blue-600">${topMatch.wage}</span>
                <span class="text-gray-500">/시간</span>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-2xl">📅</span>
              <span class="text-gray-700">시작 ${topMatch.start_display}</span>
            </div>
          </div>
          
          <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6">
            <p class="text-sm font-semibold text-blue-600 mb-2">✨ 왜 이 일자리일까요?</p>
            <p class="text-gray-700">${topMatch.reason_short}</p>
            <button onclick="toggleReasons(${topMatch.id})" class="text-sm text-blue-600 mt-2 hover:underline">
              자세히 보기 →
            </button>
          </div>
          
          ${!isApplied ? `
            <button onclick="applyJob(${topMatch.id})" 
              class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-5 rounded-2xl font-bold text-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
              <span>✨</span>
              <span>원터치 지원</span>
            </button>
            <p class="text-center text-xs text-gray-500 mt-3">
              필요한 정보가 부족하면 바로 입력할 수 있어요
            </p>
          ` : `
            <div class="bg-green-50 border-2 border-green-500 rounded-2xl p-4 text-center">
              <p class="text-green-700 font-semibold mb-2">✓ 지원 완료</p>
              <p class="text-sm text-gray-600">24-48시간 내 고용주가 검토해요</p>
            </div>
          `}
        </div>
        
        <!-- 보조 링크 -->
        ${isReady ? `
          <button onclick="switchTab('jobs')" class="w-full text-blue-600 font-semibold hover:underline animate-slide-up" style="animation-delay: 0.2s">
            후보 더 보기 →
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

function renderHeader() {
  return `
    <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-b-3xl shadow-lg">
      <h1 class="text-2xl font-bold mb-1">안녕하세요!</h1>
      <p class="text-blue-100 text-sm">${AppState.profile.city}${AppState.profile.depart_date ? ` · ${formatDateShort(AppState.profile.depart_date)} 출국` : ''}</p>
    </div>
  `;
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

// (계속 - 다음 메시지에서 나머지 화면들과 액션 함수들 작성)

function renderJobs() {
  const candidates = AppState.matches.slice(1); // 2순위부터
  
  return `
    <div class="pb-20 min-h-screen bg-gray-50">
      ${renderHeader()}
      
      <div class="p-6">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">다른 후보들</h2>
          <p class="text-sm text-gray-600">AI가 추천하는 다른 일자리들이에요</p>
        </div>
        
        <div class="space-y-4">
          ${candidates.map((job, idx) => `
            <div class="bg-white rounded-2xl shadow-lg p-5 animate-slide-up" style="animation-delay: ${idx * 0.1}s">
              <div class="flex items-center justify-between mb-3">
                <span class="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-semibold">
                  ${job.rank}순위 · ${job.match_score}% 매칭
                </span>
              </div>
              
              <h3 class="text-xl font-bold text-gray-800 mb-1">${job.title}</h3>
              <p class="text-sm text-gray-600 mb-3">${job.employer}</p>
              
              <div class="space-y-2 mb-4 text-sm">
                <div class="flex items-center gap-2 text-gray-700">
                  <span>📍</span>
                  <span>${job.city}</span>
                </div>
                <div class="flex items-center gap-2 text-gray-700">
                  <span>💰</span>
                  <span class="font-semibold text-blue-600">${job.wage}</span>
                  <span class="text-gray-500">/시간</span>
                </div>
                <div class="flex items-center gap-2 text-gray-700">
                  <span>📅</span>
                  <span>${job.start_display}</span>
                </div>
              </div>
              
              <p class="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-4">${job.reason_short}</p>
              
              ${!job.applied ? `
                <button onclick="applyJob(${job.id})" 
                  class="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all active:scale-95">
                  원터치 지원
                </button>
              ` : `
                <div class="w-full bg-green-50 border-2 border-green-500 text-green-700 py-3 rounded-xl font-semibold text-center">
                  ✓ 지원 완료
                </div>
              `}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderChecklist() {
  const allItems = [...CHECKLIST_ITEMS.beforeDeparture, ...CHECKLIST_ITEMS.beforeWork];
  const completed = allItems.filter(i => i.completed).length;
  const total = allItems.length;
  const percent = Math.floor((completed / total) * 100);
  
  return `
    <div class="pb-20 min-h-screen bg-gray-50">
      ${renderHeader()}
      
      <div class="p-6">
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">체크리스트</h2>
          <div class="flex items-center gap-4 mb-2">
            <div class="flex-1 bg-gray-200 rounded-full h-3">
              <div class="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all" style="width: ${percent}%"></div>
            </div>
            <span class="text-2xl font-bold text-blue-600">${percent}%</span>
          </div>
          <p class="text-sm text-gray-600">${completed}/${total} 완료</p>
        </div>
        
        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-bold text-gray-800 mb-3">출국 전</h3>
            <div class="space-y-2">
              ${CHECKLIST_ITEMS.beforeDeparture.map(item => `
                <div class="bg-white rounded-xl shadow p-4 flex items-center gap-3" onclick="toggleCheckItem(${item.id})">
                  <div class="w-7 h-7 rounded-full ${item.completed ? 'bg-green-500' : 'bg-gray-200'} flex items-center justify-center transition-all">
                    ${item.completed ? '<span class="text-white font-bold text-sm">✓</span>' : ''}
                  </div>
                  <span class="text-gray-700 ${item.completed ? 'line-through' : ''}">${item.title}</span>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div>
            <h3 class="text-lg font-bold text-gray-800 mb-3">근무 전</h3>
            <div class="space-y-2">
              ${CHECKLIST_ITEMS.beforeWork.map(item => `
                <div class="bg-white rounded-xl shadow p-4 flex items-center gap-3" onclick="toggleCheckItem(${item.id})">
                  <div class="w-7 h-7 rounded-full ${item.completed ? 'bg-green-500' : 'bg-gray-200'} flex items-center justify-center transition-all">
                    ${item.completed ? '<span class="text-white font-bold text-sm">✓</span>' : ''}
                  </div>
                  <span class="text-gray-700 ${item.completed ? 'line-through' : ''}">${item.title}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderMyPage() {
  return `
    <div class="pb-20 min-h-screen bg-gray-50">
      ${renderHeader()}
      
      <div class="p-6">
        <!-- 프로필 요약 -->
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 class="text-lg font-bold text-gray-800 mb-4">프로필 상태</h2>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">프로필 완성도</span>
              <span class="font-bold text-blue-600">${calculateProfileCompletion()}%</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">여권 등록</span>
              <span class="font-semibold ${AppState.profile.passport.is_verified ? 'text-green-600' : 'text-gray-400'}">
                ${AppState.profile.passport.is_verified ? '✅ 완료' : '미등록'}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Services Hub -->
        <div class="mb-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">전체 서비스</h2>
          <p class="text-sm text-gray-600 mb-4">버튼 하나로 모든 준비 완료</p>
        </div>
        
        <div class="space-y-4">
          <!-- 일자리 (활성화됨) -->
          <div class="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <span class="text-3xl">💼</span>
                <div>
                  <p class="font-bold text-gray-800">일자리 매칭</p>
                  <p class="text-xs text-gray-600">활성화됨</p>
                </div>
              </div>
              <span class="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold">사용중</span>
            </div>
          </div>
          
          <!-- 비자 -->
          <div class="bg-white rounded-2xl shadow-lg p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <span class="text-3xl">📄</span>
                <div>
                  <p class="font-bold text-gray-800">비자 자동화</p>
                  <p class="text-xs text-gray-600">n8n 연동 (데모)</p>
                </div>
              </div>
              ${AppState.services.visa_demo_done ? 
                '<span class="text-green-600 font-bold text-sm">✓ 완료</span>' : 
                '<span class="text-gray-400 text-sm">대기중</span>'
              }
            </div>
            ${!AppState.services.visa_demo_done ? `
              <button onclick="startVisaDemo()" 
                class="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95">
                워홀 비자 자동 신청
              </button>
            ` : `
              <div class="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
                비자 신청이 완료되었습니다 (데모)
              </div>
            `}
          </div>
          
          <!-- 항공권 -->
          <div class="bg-white rounded-2xl shadow-lg p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <span class="text-3xl">✈️</span>
                <div>
                  <p class="font-bold text-gray-800">항공권 자동 예매</p>
                  <p class="text-xs text-gray-600">3가지 옵션 추천</p>
                </div>
              </div>
              ${AppState.services.flight_demo_done ? 
                '<span class="text-green-600 font-bold text-sm">✓ 완료</span>' : 
                '<span class="text-gray-400 text-sm">대기중</span>'
              }
            </div>
            ${!AppState.services.flight_demo_done ? `
              <button onclick="startFlightDemo()" 
                class="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95">
                항공권 3개 추천 받기
              </button>
            ` : `
              <div class="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
                항공권 예약이 완료되었습니다 (데모)
              </div>
            `}
          </div>
          
          <!-- 숙소 -->
          <div class="bg-white rounded-2xl shadow-lg p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <span class="text-3xl">🏠</span>
                <div>
                  <p class="font-bold text-gray-800">숙소 자동 예약</p>
                  <p class="text-xs text-gray-600">3가지 옵션 추천</p>
                </div>
              </div>
              ${AppState.services.stay_demo_done ? 
                '<span class="text-green-600 font-bold text-sm">✓ 완료</span>' : 
                '<span class="text-gray-400 text-sm">대기중</span>'
              }
            </div>
            ${!AppState.services.stay_demo_done ? `
              <button onclick="startStayDemo()" 
                class="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95">
                숙소 3개 추천 받기
              </button>
            ` : `
              <div class="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
                숙소 예약이 완료되었습니다 (데모)
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

function calculateProfileCompletion() {
  let score = 0;
  if (AppState.profile.city) score += 20;
  if (AppState.profile.depart_date) score += 20;
  if (AppState.profile.name_en) score += 20;
  if (AppState.profile.nationality) score += 20;
  if (AppState.profile.passport.is_verified) score += 20;
  return score;
}

// BottomSheet 렌더링
function renderBottomSheet() {
  if (!AppState.showBottomSheet) return '';
  
  const type = AppState.bottomSheetType;
  
  if (type === 'profile') {
    return renderProfileBottomSheet();
  } else if (type === 'passport') {
    return renderPassportBottomSheet();
  } else if (type === 'visa') {
    return renderVisaBottomSheet();
  } else if (type === 'flight') {
    return renderFlightBottomSheet();
  } else if (type === 'stay') {
    return renderStayBottomSheet();
  }
  
  return '';
}

function renderProfileBottomSheet() {
  return `
    <div class="fixed inset-0 bg-black/50 flex items-end justify-center z-50 animate-fade-in" onclick="closeBottomSheet(event)">
      <div class="bg-white rounded-t-3xl w-full max-w-2xl p-6 pb-8 animate-slide-up-sheet" onclick="event.stopPropagation()">
        <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>
        
        <h3 class="text-2xl font-bold text-gray-800 mb-2">지원에 필요한 정보만 채울게요</h3>
        <p class="text-sm text-gray-600 mb-6">한 번만 입력하면 다음부턴 자동이에요</p>
        
        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">영문 이름 (여권과 동일)</label>
            <input type="text" id="nameEn" placeholder="HONG GILDONG" 
              class="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition uppercase">
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">국적</label>
            <select id="nationality" 
              class="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition">
              <option value="">선택</option>
              <option value="KR">대한민국</option>
              <option value="US">미국</option>
              <option value="JP">일본</option>
            </select>
          </div>
        </div>
        
        <button onclick="submitProfile()" 
          class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-5 rounded-2xl font-bold text-lg hover:shadow-xl transition-all active:scale-95 mb-3">
          다음 (여권 스캔)
        </button>
        
        <button onclick="closeBottomSheet()" 
          class="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all">
          나중에
        </button>
      </div>
    </div>
  `;
}

function renderPassportBottomSheet() {
  return `
    <div class="fixed inset-0 bg-black/50 flex items-end justify-center z-50 animate-fade-in" onclick="closeBottomSheet(event)">
      <div class="bg-white rounded-t-3xl w-full max-w-2xl p-6 pb-8 animate-slide-up-sheet" onclick="event.stopPropagation()">
        <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>
        
        <h3 class="text-2xl font-bold text-gray-800 mb-2">여권을 스캔해주세요</h3>
        <p class="text-sm text-gray-600 mb-6">OCR로 자동 입력됩니다</p>
        
        <div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 mb-6 text-center border-2 border-dashed border-blue-300">
          <div class="text-6xl mb-4">📷</div>
          <p class="text-gray-700 font-semibold mb-2">여권 사진면을 촬영해주세요</p>
          <p class="text-sm text-gray-500">자동으로 정보가 입력됩니다</p>
        </div>
        
        <button onclick="simulatePassportScan()" 
          class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-5 rounded-2xl font-bold text-lg hover:shadow-xl transition-all active:scale-95 mb-3">
          📷 여권 스캔하기
        </button>
        
        <button onclick="skipPassport()" 
          class="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all">
          건너뛰기
        </button>
      </div>
    </div>
  `;
}

function renderVisaBottomSheet() {
  const step = AppState.bottomSheetData?.step || 1;
  
  return `
    <div class="fixed inset-0 bg-black/50 flex items-end justify-center z-50 animate-fade-in" onclick="event.stopPropagation()">
      <div class="bg-white rounded-t-3xl w-full max-w-2xl p-6 pb-8 animate-slide-up-sheet" onclick="event.stopPropagation()">
        <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>
        
        <h3 class="text-2xl font-bold text-gray-800 mb-6">비자 자동 신청 (n8n)</h3>
        
        <!-- Stepper -->
        <div class="flex items-center justify-between mb-8">
          <div class="flex-1">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-gray-200'} flex items-center justify-center text-white font-bold">
                ${step > 1 ? '✓' : '1'}
              </div>
              <div class="flex-1 h-1 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'} mx-2"></div>
            </div>
            <p class="text-xs text-gray-600 mt-2">서류 스캔</p>
          </div>
          <div class="flex-1">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'} flex items-center justify-center text-white font-bold">
                ${step > 2 ? '✓' : '2'}
              </div>
              <div class="flex-1 h-1 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-200'} mx-2"></div>
            </div>
            <p class="text-xs text-gray-600 mt-2">자동 입력</p>
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-end">
              <div class="w-10 h-10 rounded-full ${step >= 3 ? 'bg-blue-500' : 'bg-gray-200'} flex items-center justify-center text-white font-bold">
                ${step > 3 ? '✓' : '3'}
              </div>
            </div>
            <p class="text-xs text-gray-600 mt-2 text-right">제출</p>
          </div>
        </div>
        
        <div class="bg-blue-50 rounded-2xl p-6 mb-6 text-center">
          ${step === 1 ? `
            <p class="text-lg font-semibold text-gray-800 mb-2">📄 서류를 스캔하고 있어요...</p>
            <div class="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mt-4"></div>
          ` : step === 2 ? `
            <p class="text-lg font-semibold text-gray-800 mb-2">✍️ 자동으로 입력 중...</p>
            <div class="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mt-4"></div>
          ` : `
            <p class="text-lg font-semibold text-gray-800 mb-2">🚀 n8n 자동 제출 중...</p>
            <div class="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mt-4"></div>
          `}
        </div>
      </div>
    </div>
  `;
}

function renderFlightBottomSheet() {
  return `
    <div class="fixed inset-0 bg-black/50 flex items-end justify-center z-50 animate-fade-in" onclick="closeBottomSheet(event)">
      <div class="bg-white rounded-t-3xl w-full max-w-2xl p-6 pb-8 max-h-[85vh] overflow-y-auto animate-slide-up-sheet" onclick="event.stopPropagation()">
        <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>
        
        <h3 class="text-2xl font-bold text-gray-800 mb-2">항공권 3가지 옵션</h3>
        <p class="text-sm text-gray-600 mb-6">원하는 옵션을 선택하세요</p>
        
        <div class="space-y-4 mb-6">
          ${DUMMY_FLIGHTS.map(flight => `
            <div class="border-2 border-gray-200 rounded-2xl p-5 hover:border-blue-500 transition-all">
              <div class="flex items-center justify-between mb-3">
                <span class="font-bold text-lg text-gray-800">${flight.label}</span>
                <span class="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold">${flight.badge}</span>
              </div>
              
              <p class="text-sm text-gray-700 mb-2">${flight.airline}</p>
              <p class="text-sm text-gray-600 mb-3">${flight.route}</p>
              
              <div class="flex items-center justify-between mb-4">
                <span class="text-sm text-gray-500">⏱️ ${flight.duration}</span>
                <span class="text-2xl font-bold text-blue-600">${flight.price}</span>
              </div>
              
              <button onclick="selectFlight('${flight.id}')" 
                class="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all active:scale-95">
                이 옵션으로 예매
              </button>
            </div>
          `).join('')}
        </div>
        
        <button onclick="closeBottomSheet()" 
          class="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all">
          닫기
        </button>
      </div>
    </div>
  `;
}

function renderStayBottomSheet() {
  return `
    <div class="fixed inset-0 bg-black/50 flex items-end justify-center z-50 animate-fade-in" onclick="closeBottomSheet(event)">
      <div class="bg-white rounded-t-3xl w-full max-w-2xl p-6 pb-8 max-h-[85vh] overflow-y-auto animate-slide-up-sheet" onclick="event.stopPropagation()">
        <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>
        
        <h3 class="text-2xl font-bold text-gray-800 mb-2">숙소 3가지 옵션</h3>
        <p class="text-sm text-gray-600 mb-6">원하는 옵션을 선택하세요</p>
        
        <div class="space-y-4 mb-6">
          ${DUMMY_STAYS.map(stay => `
            <div class="border-2 border-gray-200 rounded-2xl p-5 hover:border-orange-500 transition-all">
              <div class="flex items-center justify-between mb-3">
                <span class="font-bold text-lg text-gray-800">${stay.label}</span>
                <span class="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-semibold">${stay.badge}</span>
              </div>
              
              <p class="text-sm font-semibold text-gray-700 mb-1">${stay.name}</p>
              <p class="text-sm text-gray-600 mb-2">${stay.type}</p>
              <p class="text-sm text-gray-500 mb-4">📍 ${stay.location}</p>
              
              <div class="flex items-center justify-between mb-4">
                <span class="text-sm text-gray-500">주당 가격</span>
                <span class="text-2xl font-bold text-orange-600">${stay.price_week}</span>
              </div>
              
              <button onclick="selectStay('${stay.id}')" 
                class="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all active:scale-95">
                이 옵션으로 예약
              </button>
            </div>
          `).join('')}
        </div>
        
        <button onclick="closeBottomSheet()" 
          class="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all">
          닫기
        </button>
      </div>
    </div>
  `;
}

// 토스트 렌더링
function renderToast() {
  if (!AppState.toast) return '';
  
  return `
    <div class="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div class="bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl">
        <p class="font-semibold">${AppState.toast}</p>
      </div>
    </div>
  `;
}

// 하단 네비게이션
function renderBottomNav() {
  if (!['home', 'jobs', 'checklist', 'mypage'].includes(AppState.currentScreen)) {
    return '';
  }
  
  const tabs = [
    { id: 'home', label: '홈', icon: '🏠' },
    { id: 'jobs', label: '일자리', icon: '💼' },
    { id: 'checklist', label: '체크', icon: '✓' },
    { id: 'mypage', label: '마이', icon: '👤' }
  ];
  
  return `
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div class="flex justify-around items-center py-3 max-w-2xl mx-auto">
        ${tabs.map(tab => `
          <button onclick="switchTab('${tab.id}')" 
            class="flex flex-col items-center justify-center flex-1 transition-all ${AppState.currentScreen === tab.id ? 'text-blue-600' : 'text-gray-400'}">
            <span class="text-2xl mb-1 transition-transform ${AppState.currentScreen === tab.id ? 'transform scale-110' : ''}">${tab.icon}</span>
            <span class="text-xs font-semibold">${tab.label}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

// ============ 액션 함수들 ============

function startApp() {
  const hasState = loadState();
  
  if (hasState && !AppState.new_user && AppState.profile.city) {
    if (confirm('이전에 입력하신 정보가 있어요. 이어서 하시겠어요?')) {
      if (AppState.match_status === 'READY' || AppState.match_status === 'APPLIED') {
        AppState.currentScreen = 'home';
      } else {
        AppState.currentScreen = 'onboarding';
      }
    } else {
      clearState();
      AppState.currentScreen = 'onboarding';
    }
  } else {
    AppState.currentScreen = 'onboarding';
  }
  
  render();
}

function selectCity(city) {
  AppState.profile.city = city;
  render();
}

function submitOnboarding() {
  const departDate = document.getElementById('departDate')?.value;
  
  if (!AppState.profile.city) {
    alert('도시를 선택해주세요!');
    return;
  }
  
  if (departDate) {
    AppState.profile.depart_date = departDate;
  }
  
  AppState.new_user = false;
  AppState.match_status = 'MATCHING';
  AppState.currentScreen = 'matching';
  
  saveState();
  render();
  
  // 1초 후 매칭 완료
  setTimeout(() => {
    completeMatching();
  }, 1000);
}

function completeMatching() {
  AppState.matches = DUMMY_MATCHES;
  AppState.match_status = 'READY';
  AppState.currentScreen = 'home';
  AppState.currentTab = 'home';
  
  saveState();
  render();
}

function applyJob(jobId) {
  // 정보 체크
  if (!AppState.profile.name_en || !AppState.profile.nationality) {
    // 프로필 BottomSheet
    AppState.showBottomSheet = true;
    AppState.bottomSheetType = 'profile';
    AppState.bottomSheetData = { jobId };
    render();
    return;
  }
  
  if (!AppState.profile.passport.is_verified) {
    // 여권 BottomSheet
    AppState.showBottomSheet = true;
    AppState.bottomSheetType = 'passport';
    AppState.bottomSheetData = { jobId };
    render();
    return;
  }
  
  // 바로 지원
  submitApplication(jobId);
}

function submitProfile() {
  const nameEn = document.getElementById('nameEn')?.value;
  const nationality = document.getElementById('nationality')?.value;
  
  if (!nameEn || !nationality) {
    alert('모든 항목을 입력해주세요!');
    return;
  }
  
  AppState.profile.name_en = nameEn;
  AppState.profile.nationality = nationality;
  
  // 여권 스캔으로
  AppState.bottomSheetType = 'passport';
  
  saveState();
  render();
}

function simulatePassportScan() {
  // OCR 시뮬레이션
  showToast('OCR로 자동 입력 중...');
  
  setTimeout(() => {
    AppState.profile.passport.is_verified = true;
    AppState.profile.passport.ocr_dummy = {
      passport_no: 'M12345678',
      expiry: '2030-12-31'
    };
    
    AppState.showBottomSheet = false;
    saveState();
    
    showToast('여권 정보가 저장되었어요 ✓');
    
    // 지원 진행
    const jobId = AppState.bottomSheetData.jobId;
    setTimeout(() => {
      submitApplication(jobId);
    }, 800);
  }, 600);
}

function skipPassport() {
  alert('여권 정보는 나중에 마이페이지에서 등록할 수 있어요');
  AppState.showBottomSheet = false;
  render();
}

function submitApplication(jobId) {
  // 로딩
  showToast('지원서 자동 제출 중...');
  
  setTimeout(() => {
    // 지원 완료
    const job = AppState.matches.find(m => m.id === jobId);
    if (job) {
      job.applied = true;
    }
    
    // 1순위가 지원됐으면 상태 변경
    if (jobId === AppState.matches[0].id) {
      AppState.match_status = 'APPLIED';
      
      // 체크리스트 자동 완료
      CHECKLIST_ITEMS.beforeWork[0].completed = true; // TFN
    }
    
    saveState();
    render();
    
    showToast('✓ 지원 완료!');
  }, 800);
}

function closeBottomSheet(event) {
  if (event && event.target !== event.currentTarget) return;
  AppState.showBottomSheet = false;
  render();
}

function switchTab(tabId) {
  AppState.currentScreen = tabId;
  AppState.currentTab = tabId;
  saveState();
  render();
}

function toggleCheckItem(itemId) {
  const allItems = [...CHECKLIST_ITEMS.beforeDeparture, ...CHECKLIST_ITEMS.beforeWork];
  const item = allItems.find(i => i.id === itemId);
  
  if (item) {
    item.completed = !item.completed;
    saveState();
    render();
  }
}

function toggleReasons(jobId) {
  alert('상세 정보는 곧 추가될 예정이에요!');
}

// Services Hub 액션들
function startVisaDemo() {
  AppState.showBottomSheet = true;
  AppState.bottomSheetType = 'visa';
  AppState.bottomSheetData = { step: 1 };
  render();
  
  // 3단계 시뮬레이션
  setTimeout(() => {
    AppState.bottomSheetData.step = 2;
    render();
  }, 1000);
  
  setTimeout(() => {
    AppState.bottomSheetData.step = 3;
    render();
  }, 2000);
  
  setTimeout(() => {
    AppState.services.visa_demo_done = true;
    AppState.showBottomSheet = false;
    CHECKLIST_ITEMS.beforeDeparture[1].completed = true; // 비자 신청
    saveState();
    render();
    showToast('✓ 비자 신청 완료 (데모)');
  }, 3000);
}

function startFlightDemo() {
  AppState.showBottomSheet = true;
  AppState.bottomSheetType = 'flight';
  render();
}

function selectFlight(flightId) {
  showToast('항공권 예약 중...');
  
  setTimeout(() => {
    AppState.services.flight_demo_done = true;
    AppState.showBottomSheet = false;
    CHECKLIST_ITEMS.beforeDeparture[2].completed = true; // 항공권 예약
    saveState();
    render();
    showToast('✓ 항공권 예약 완료 (데모)');
  }, 800);
}

function startStayDemo() {
  AppState.showBottomSheet = true;
  AppState.bottomSheetType = 'stay';
  render();
}

function selectStay(stayId) {
  showToast('숙소 예약 중...');
  
  setTimeout(() => {
    AppState.services.stay_demo_done = true;
    AppState.showBottomSheet = false;
    CHECKLIST_ITEMS.beforeDeparture[3].completed = true; // 숙소 예약
    saveState();
    render();
    showToast('✓ 숙소 예약 완료 (데모)');
  }, 800);
}

// ============ 메인 렌더링 ============
function render() {
  const app = document.getElementById('app');
  
  let content = '';
  
  switch (AppState.currentScreen) {
    case 'splash':
      content = renderSplash();
      break;
    case 'onboarding':
      content = renderOnboarding();
      break;
    case 'matching':
      content = renderMatching();
      break;
    case 'home':
      content = renderHome();
      break;
    case 'jobs':
      content = renderJobs();
      break;
    case 'checklist':
      content = renderChecklist();
      break;
    case 'mypage':
      content = renderMyPage();
      break;
    default:
      content = renderSplash();
  }
  
  app.innerHTML = content + renderBottomNav() + renderBottomSheet() + renderToast();
}

// ============ 초기화 ============
document.addEventListener('DOMContentLoaded', () => {
  AppState.currentScreen = 'splash';
  render();
});
