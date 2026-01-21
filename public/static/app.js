// HoliJob v2 - Enhanced Flow Logic
// 목표: 사용자가 '생각'하지 않고도, 결정 → 지원 → 준비가 자동으로 흘러가게

// ============ 상태 관리 시스템 ============
const AppState = {
  // 화면 상태
  currentScreen: 'splash', // splash, onboarding, matching, home, jobs, checklist, mypage, infoModal, complete
  currentTab: 'home',
  
  // 사용자 상태
  user_status: 'NEW', // NEW, BASIC_READY, PROFILE_COMPLETE
  
  // 매칭 상태
  match_status: 'NONE', // NONE, MATCHING, READY_TO_APPLY, APPLIED, PRE_INTERVIEW
  
  // 지원 상태
  application_status: 'NONE', // NONE, SUBMITTED, VIEWED, REQUEST_INFO, PRE_INTERVIEW, REJECTED
  
  // 사용자 기본 정보
  userInput: {
    country: '',
    city: '',
    departureDate: '',
    workStartDate: ''
  },
  
  // 프로필 정보 (원터치 지원에 필요)
  profile: {
    nameEn: '',
    nationality: '',
    passportNumber: '',
    passportExpiry: '',
    email: '',
    phone: ''
  },
  
  // 일자리 데이터
  topJob: null,
  candidateJobs: [],
  
  // 임시 저장 (이탈 복구용)
  tempSave: null,
  
  // 모달 상태
  modalData: null
};

// ============ 더미 데이터 ============
const DUMMY_JOBS = [
  {
    id: 1,
    title: 'Barista',
    employer: 'Sydney Coffee Co.',
    city: 'Sydney',
    country: 'Australia',
    wage: '$29.5',
    wageType: 'hour',
    startDate: '2026-05-15',
    startDateDisplay: '5월 15일',
    reason: '숙소 지원 + 즉시 시작 가능',
    matchScore: 95,
    workType: '카페',
    accommodation: true,
    requirements: ['영어 기본 회화', 'RSA 자격증 우대'],
    benefits: ['숙소 제공', '식사 제공', '주 25시간 보장']
  },
  {
    id: 2,
    title: 'Kitchen Hand',
    employer: 'Melbourne Restaurant Group',
    city: 'Melbourne',
    country: 'Australia',
    wage: '$28.0',
    wageType: 'hour',
    startDate: '2026-05-20',
    startDateDisplay: '5월 20일',
    reason: '경력 무관 + 주 5일 보장',
    matchScore: 88,
    workType: '레스토랑',
    accommodation: false,
    requirements: ['성실성', '체력'],
    benefits: ['주 5일 근무', '초과 근무 가능']
  },
  {
    id: 3,
    title: 'Farm Worker',
    employer: 'Brisbane Fresh Farm',
    city: 'Brisbane',
    country: 'Australia',
    wage: '$27.5',
    wageType: 'hour',
    startDate: '2026-05-18',
    startDateDisplay: '5월 18일',
    reason: '2차 비자 가능 + 보너스',
    matchScore: 82,
    workType: '농장',
    accommodation: true,
    requirements: ['체력', '야외 활동 가능'],
    benefits: ['2차 비자 카운트', '성과 보너스', '숙소 제공']
  }
];

const CHECKLIST_ITEMS = {
  beforeDeparture: [
    { id: 1, title: '여권 준비', completed: false, auto: false },
    { id: 2, title: '비자 신청', completed: false, auto: false },
    { id: 3, title: '항공권 예약', completed: false, auto: false },
    { id: 4, title: '여행자 보험', completed: false, auto: false },
    { id: 5, title: '국제운전면허증', completed: false, auto: false }
  ],
  beforeWork: [
    { id: 6, title: '세금 신고 번호(TFN) 발급', completed: false, auto: true },
    { id: 7, title: '은행 계좌 개설', completed: false, auto: true },
    { id: 8, title: '현지 유심 구매', completed: false, auto: false },
    { id: 9, title: '숙소 확정', completed: false, auto: false }
  ]
};

// ============ LocalStorage 관리 ============
function saveState() {
  localStorage.setItem('holijob_state', JSON.stringify(AppState));
}

function loadState() {
  const saved = localStorage.getItem('holijob_state');
  if (saved) {
    const parsed = JSON.parse(saved);
    Object.assign(AppState, parsed);
    return true;
  }
  return false;
}

function clearState() {
  localStorage.removeItem('holijob_state');
}

// ============ 유틸리티 함수 ============
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function getDaysUntil(dateStr) {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function isProfileComplete() {
  const { nameEn, nationality, passportNumber } = AppState.profile;
  return nameEn && nationality && passportNumber;
}

// ============ 화면 렌더링 함수들 ============

function renderSplash() {
  return `
    <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-6">
      <div class="text-center text-white">
        <div class="mb-8 animate-bounce">
          <div class="w-24 h-24 mx-auto bg-white rounded-3xl flex items-center justify-center shadow-2xl">
            <span class="text-5xl">✈️</span>
          </div>
        </div>
        <h1 class="text-5xl font-bold mb-4">HoliJob</h1>
        <p class="text-xl text-blue-100 mb-12 leading-relaxed">
          일자리부터<br/>골라드릴게요
        </p>
        <button onclick="startApp()" 
          class="bg-white text-blue-600 px-12 py-4 rounded-2xl font-bold text-xl hover:shadow-2xl transition transform hover:scale-105">
          시작하기
        </button>
      </div>
    </div>
  `;
}

function renderOnboarding() {
  return `
    <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-6">
      <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div class="text-center mb-8">
          <div class="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <span class="text-3xl">📋</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">기본 정보만 알려주세요</h2>
          <p class="text-gray-600">3가지만 입력하면 매칭을 시작해요</p>
        </div>
        
        <div class="space-y-5 mb-8">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="text-red-500">*</span> 어디로 가시나요?
            </label>
            <div class="grid grid-cols-2 gap-3 mb-2">
              <select id="country" class="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition">
                <option value="">국가 선택</option>
                <option value="Australia">호주</option>
                <option value="Canada">캐나다</option>
                <option value="New Zealand">뉴질랜드</option>
                <option value="UK">영국</option>
              </select>
              <input type="text" id="city" placeholder="도시명" 
                class="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="text-red-500">*</span> 출국일
            </label>
            <input type="date" id="departureDate" 
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition">
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="text-red-500">*</span> 일 시작 가능일
            </label>
            <input type="date" id="workStartDate" 
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition">
          </div>
        </div>
        
        <button onclick="submitBasicInfo()" 
          class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition transform hover:scale-105">
          매칭 시작
        </button>
        
        <p class="text-center text-sm text-gray-500 mt-4">
          입력한 정보는 자동으로 저장돼요
        </p>
      </div>
    </div>
  `;
}

function renderMatching() {
  return `
    <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-6">
      <div class="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
        <div class="mb-8">
          <div class="inline-block animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-blue-500"></div>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-3">당신에게 맞는 일자리를</h2>
        <p class="text-gray-600 mb-6">지금 찾고 있어요</p>
        
        <div class="bg-blue-50 rounded-xl p-4 text-left">
          <div class="flex items-center gap-2 text-sm text-gray-700 mb-2">
            <span class="text-green-500">✓</span>
            <span>${AppState.userInput.city} 지역 일자리 검색 중</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-700 mb-2">
            <span class="text-green-500">✓</span>
            <span>시작일 ${formatDate(AppState.userInput.workStartDate)} 매칭</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-blue-500">
            <span class="animate-pulse">⏳</span>
            <span>최적의 후보 선정 중...</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderHome() {
  const content = getHomeContent();
  
  return `
    <div class="pb-20">
      ${renderHeader()}
      ${content}
    </div>
  `;
}

function getHomeContent() {
  // match_status에 따른 조건 분기
  switch (AppState.match_status) {
    case 'MATCHING':
      return renderHomeMatching();
    case 'READY_TO_APPLY':
      return renderHomeReadyToApply();
    case 'APPLIED':
      return renderHomeApplied();
    case 'PRE_INTERVIEW':
      return renderHomePreInterview();
    default:
      return renderHomeDefault();
  }
}

function renderHeader() {
  return `
    <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-b-3xl shadow-lg">
      <h1 class="text-2xl font-bold mb-1">안녕하세요!</h1>
      <p class="text-blue-100 text-sm">${AppState.userInput.city}로 ${getDaysUntil(AppState.userInput.departureDate)}일 후 출국</p>
    </div>
  `;
}

function renderHomeMatching() {
  return `
    <div class="p-6">
      <div class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="mb-4">
          <div class="inline-block animate-pulse">
            <span class="text-6xl">🔍</span>
          </div>
        </div>
        <h2 class="text-xl font-bold text-gray-800 mb-2">당신 조건에 맞는 일자리</h2>
        <p class="text-gray-600">찾는 중...</p>
      </div>
    </div>
  `;
}

function renderHomeReadyToApply() {
  const job = AppState.topJob;
  if (!job) return renderHomeDefault();
  
  return `
    <div class="p-6">
      <!-- 매칭 스코어 -->
      <div class="bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-2xl p-4 mb-4 text-center">
        <p class="text-sm mb-1">당신에게 딱 맞는 일자리를 찾았어요!</p>
        <p class="text-3xl font-bold">${job.matchScore}% 매칭</p>
      </div>
      
      <!-- 메인 카드 -->
      <div class="bg-white rounded-2xl shadow-2xl p-6 mb-6 border-4 border-blue-500">
        <div class="flex items-center justify-between mb-4">
          <span class="bg-blue-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold">
            🎯 1순위 추천
          </span>
          <span class="text-2xl">${job.accommodation ? '🏠' : ''}</span>
        </div>
        
        <h2 class="text-3xl font-bold text-gray-800 mb-2">${job.title}</h2>
        <p class="text-gray-600 mb-4">${job.employer}</p>
        
        <div class="space-y-3 mb-6">
          <div class="flex items-center gap-3 text-gray-700">
            <span class="text-xl">📍</span>
            <span class="font-semibold">${job.city}, ${job.country}</span>
          </div>
          <div class="flex items-center gap-3 text-gray-700">
            <span class="text-xl">💰</span>
            <div>
              <span class="font-bold text-2xl text-blue-600">${job.wage}</span>
              <span class="text-gray-500 text-sm">/ 시간</span>
            </div>
          </div>
          <div class="flex items-center gap-3 text-gray-700">
            <span class="text-xl">📅</span>
            <span>${job.startDateDisplay} 시작 가능</span>
          </div>
        </div>
        
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl mb-6">
          <p class="text-sm font-semibold text-blue-600 mb-2">✨ 왜 이 일자리일까요?</p>
          <p class="text-gray-700">${job.reason}</p>
        </div>
        
        <div class="mb-6">
          <p class="text-sm font-semibold text-gray-700 mb-2">주요 혜택</p>
          <div class="flex flex-wrap gap-2">
            ${job.benefits.map(benefit => `
              <span class="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full">${benefit}</span>
            `).join('')}
          </div>
        </div>
        
        <button onclick="applyJob(${job.id})" 
          class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-5 rounded-xl font-bold text-xl hover:shadow-2xl transition transform hover:scale-105 flex items-center justify-center gap-2">
          <span>✨</span>
          <span>원터치 지원</span>
        </button>
        
        <p class="text-center text-xs text-gray-500 mt-3">
          지원에 필요한 정보가 부족하면 바로 입력할 수 있어요
        </p>
      </div>
      
      ${renderQuickStats()}
    </div>
  `;
}

function renderHomeApplied() {
  const job = AppState.topJob;
  
  return `
    <div class="p-6">
      <div class="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <div class="text-center mb-6">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-4xl">✓</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">지원 완료!</h2>
          <p class="text-gray-600">${job.employer}에 지원서가 전송되었어요</p>
        </div>
        
        <div class="bg-blue-50 rounded-xl p-4 mb-4">
          <p class="text-sm font-semibold text-blue-600 mb-2">📌 지원한 일자리</p>
          <p class="font-bold text-lg text-gray-800">${job.title}</p>
          <p class="text-sm text-gray-600">${job.city} · ${job.wage}/시간</p>
        </div>
        
        <div class="space-y-2 text-sm">
          <div class="flex items-center gap-2 text-gray-700">
            <span class="text-green-500">✓</span>
            <span>지원서 제출됨</span>
          </div>
          <div class="flex items-center gap-2 text-gray-500">
            <span>⏳</span>
            <span>고용주 확인 대기 중</span>
          </div>
        </div>
      </div>
      
      <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 mb-6">
        <h3 class="font-bold text-gray-800 mb-3">💡 다음 단계</h3>
        <ul class="space-y-2 text-sm text-gray-700">
          <li class="flex items-start gap-2">
            <span class="text-blue-500 mt-0.5">1.</span>
            <span>고용주가 24-48시간 내 검토해요</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-500 mt-0.5">2.</span>
            <span>추가 정보 요청이나 인터뷰 제안이 올 수 있어요</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-500 mt-0.5">3.</span>
            <span>알림으로 결과를 바로 알려드려요</span>
          </li>
        </ul>
      </div>
      
      ${renderQuickStats()}
    </div>
  `;
}

function renderHomePreInterview() {
  return `
    <div class="p-6">
      <div class="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <div class="text-center mb-6">
          <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-4xl">🎯</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">인터뷰 직전!</h2>
          <p class="text-gray-600">고용주가 당신에게 관심있어 해요</p>
        </div>
        
        <button onclick="viewInterviewGuide()" 
          class="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition">
          인터뷰 준비하기
        </button>
      </div>
    </div>
  `;
}

function renderHomeDefault() {
  return `
    <div class="p-6">
      <div class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <p class="text-gray-600">일자리 정보를 불러오는 중...</p>
      </div>
    </div>
  `;
}

function renderQuickStats() {
  const checklistCompletion = calculateChecklistCompletion();
  
  return `
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white rounded-xl shadow p-4">
        <p class="text-sm text-gray-500 mb-1">체크리스트</p>
        <p class="text-2xl font-bold text-blue-600">${checklistCompletion}%</p>
      </div>
      <div class="bg-white rounded-xl shadow p-4">
        <p class="text-sm text-gray-500 mb-1">출국까지</p>
        <p class="text-2xl font-bold text-purple-600">D-${getDaysUntil(AppState.userInput.departureDate)}</p>
      </div>
    </div>
  `;
}

function calculateChecklistCompletion() {
  const allItems = [...CHECKLIST_ITEMS.beforeDeparture, ...CHECKLIST_ITEMS.beforeWork];
  const completed = allItems.filter(item => item.completed).length;
  return Math.floor((completed / allItems.length) * 100);
}

// 정보 보완 모달
function renderInfoModal() {
  const missing = getMissingInfo();
  
  return `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50" onclick="closeModal(event)">
      <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full" onclick="event.stopPropagation()">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">📝</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">지원하려면 이것만 필요해요</h2>
          <p class="text-gray-600 text-sm">한 번만 입력하면 다음부턴 자동이에요</p>
        </div>
        
        <div class="space-y-4 mb-6">
          ${missing.includes('nameEn') ? `
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span class="text-red-500">*</span> 영문 이름 (여권과 동일)
              </label>
              <input type="text" id="modal_nameEn" placeholder="HONG GILDONG" 
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition uppercase">
            </div>
          ` : ''}
          
          ${missing.includes('nationality') ? `
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span class="text-red-500">*</span> 국적
              </label>
              <select id="modal_nationality" 
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition">
                <option value="">선택</option>
                <option value="KR">대한민국</option>
                <option value="US">미국</option>
                <option value="JP">일본</option>
                <option value="CN">중국</option>
              </select>
            </div>
          ` : ''}
          
          ${missing.includes('passportNumber') ? `
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span class="text-red-500">*</span> 여권 번호
              </label>
              <input type="text" id="modal_passportNumber" placeholder="M12345678" 
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition uppercase">
              <button onclick="scanPassport()" 
                class="mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1">
                <span>📷</span>
                <span>여권 사진으로 자동 입력</span>
              </button>
            </div>
          ` : ''}
        </div>
        
        <button onclick="submitProfileAndApply()" 
          class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition mb-3">
          저장하고 지원하기
        </button>
        
        <button onclick="closeModal()" 
          class="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">
          나중에
        </button>
      </div>
    </div>
  `;
}

function getMissingInfo() {
  const missing = [];
  const { nameEn, nationality, passportNumber } = AppState.profile;
  
  if (!nameEn) missing.push('nameEn');
  if (!nationality) missing.push('nationality');
  if (!passportNumber) missing.push('passportNumber');
  
  return missing;
}

// 일자리 탭
function renderJobs() {
  return `
    <div class="pb-20">
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-b-3xl shadow-lg mb-6">
        <h1 class="text-2xl font-bold mb-1">다른 후보들</h1>
        <p class="text-blue-100 text-sm">AI가 추천하는 다른 일자리들이에요</p>
      </div>
      
      <div class="px-6 space-y-4">
        ${AppState.candidateJobs.map((job, index) => `
          <div class="bg-white rounded-xl shadow-lg p-5">
            <div class="flex items-center justify-between mb-3">
              <span class="bg-purple-100 text-purple-600 text-xs px-3 py-1 rounded-full font-semibold">
                ${index + 2}순위 · ${job.matchScore}% 매칭
              </span>
              ${job.accommodation ? '<span class="text-xl">🏠</span>' : ''}
            </div>
            
            <h3 class="text-xl font-bold text-gray-800 mb-2">${job.title}</h3>
            <p class="text-sm text-gray-600 mb-3">${job.employer}</p>
            
            <div class="space-y-2 mb-4 text-sm">
              <div class="flex items-center gap-2 text-gray-600">
                <span>📍</span>
                <span>${job.city}</span>
              </div>
              <div class="flex items-center gap-2 text-gray-600">
                <span>💰</span>
                <span class="font-semibold text-blue-600">${job.wage}</span>
                <span class="text-gray-500">/ 시간</span>
              </div>
              <div class="flex items-center gap-2 text-gray-600">
                <span>📅</span>
                <span>${job.startDateDisplay}</span>
              </div>
            </div>
            
            <p class="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">${job.reason}</p>
            
            <button onclick="applyJob(${job.id})" 
              class="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition">
              원터치 지원
            </button>
          </div>
        `).join('')}
      </div>
      
      <div class="px-6 mt-6">
        <div class="bg-gray-50 rounded-xl p-6 text-center">
          <p class="text-gray-600 mb-3">더 많은 일자리를 찾고 싶으신가요?</p>
          <button class="text-blue-600 font-semibold hover:underline">
            직접 검색하기 →
          </button>
        </div>
      </div>
    </div>
  `;
}

// 체크리스트 탭
function renderChecklist() {
  const totalItems = CHECKLIST_ITEMS.beforeDeparture.length + CHECKLIST_ITEMS.beforeWork.length;
  const completedItems = [...CHECKLIST_ITEMS.beforeDeparture, ...CHECKLIST_ITEMS.beforeWork]
    .filter(item => item.completed).length;
  const completionRate = Math.floor((completedItems / totalItems) * 100);
  
  // 출국일에 따라 우선순위 결정
  const daysUntil = getDaysUntil(AppState.userInput.departureDate);
  const showDepartureFirst = daysUntil <= 30;
  
  return `
    <div class="pb-20">
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-b-3xl shadow-lg mb-6">
        <h1 class="text-2xl font-bold mb-2">체크리스트</h1>
        <div class="flex items-center gap-3">
          <div class="flex-1 bg-white/20 rounded-full h-2.5">
            <div class="bg-white h-2.5 rounded-full transition-all" style="width: ${completionRate}%"></div>
          </div>
          <span class="font-bold text-lg">${completionRate}%</span>
        </div>
        <p class="text-blue-100 text-sm mt-2">${completedItems}/${totalItems} 완료</p>
      </div>
      
      <div class="px-6 space-y-6">
        ${showDepartureFirst ? renderChecklistSection('beforeDeparture', '출국 전 (우선)') : ''}
        ${renderChecklistSection('beforeWork', '근무 전')}
        ${!showDepartureFirst ? renderChecklistSection('beforeDeparture', '출국 전') : ''}
      </div>
    </div>
  `;
}

function renderChecklistSection(section, title) {
  const items = CHECKLIST_ITEMS[section];
  
  return `
    <div>
      <h2 class="text-lg font-bold text-gray-800 mb-3">${title}</h2>
      <div class="space-y-2">
        ${items.map(item => `
          <div class="bg-white rounded-xl shadow p-4 flex items-center gap-3" onclick="toggleChecklistItem(${item.id})">
            <div class="w-7 h-7 rounded-full ${item.completed ? 'bg-green-500' : 'bg-gray-200'} flex items-center justify-center flex-shrink-0 transition-all cursor-pointer">
              ${item.completed ? '<span class="text-white text-sm font-bold">✓</span>' : ''}
            </div>
            <div class="flex-1">
              <span class="text-gray-700 ${item.completed ? 'line-through' : ''}">${item.title}</span>
              ${item.auto ? '<span class="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">자동화</span>' : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// 마이페이지 탭
function renderMyPage() {
  const profileCompletion = calculateProfileCompletion();
  
  return `
    <div class="pb-20">
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-b-3xl shadow-lg mb-6">
        <h1 class="text-2xl font-bold">마이페이지</h1>
      </div>
      
      <div class="px-6 space-y-4">
        <!-- 프로필 완성도 -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-800">프로필 완성도</h2>
            <span class="text-2xl font-bold ${profileCompletion === 100 ? 'text-green-600' : 'text-blue-600'}">${profileCompletion}%</span>
          </div>
          <div class="flex-1 bg-gray-200 rounded-full h-3 mb-4">
            <div class="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all" style="width: ${profileCompletion}%"></div>
          </div>
          ${profileCompletion < 100 ? `
            <button onclick="editProfile()" class="text-sm text-blue-600 hover:underline">
              프로필 완성하기 →
            </button>
          ` : `
            <div class="flex items-center gap-2 text-green-600 text-sm">
              <span>✓</span>
              <span>프로필이 완성되었어요!</span>
            </div>
          `}
        </div>
        
        <!-- 기본 정보 -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-lg font-bold text-gray-800 mb-4">기본 정보</h2>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">목적지</span>
              <span class="font-semibold text-gray-800">${AppState.userInput.city}, ${AppState.userInput.country}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">출국일</span>
              <span class="font-semibold text-gray-800">${formatDate(AppState.userInput.departureDate)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">근무 시작</span>
              <span class="font-semibold text-gray-800">${formatDate(AppState.userInput.workStartDate)}</span>
            </div>
          </div>
          <button onclick="editBasicInfo()" class="mt-4 text-sm text-blue-600 hover:underline">
            수정하기
          </button>
        </div>
        
        <!-- 프로필 정보 -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-lg font-bold text-gray-800 mb-4">프로필 정보</h2>
          ${AppState.profile.nameEn ? `
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">영문 이름</span>
                <span class="font-semibold text-gray-800">${AppState.profile.nameEn}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">국적</span>
                <span class="font-semibold text-gray-800">${AppState.profile.nationality}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">여권</span>
                <span class="font-semibold text-gray-800">${AppState.profile.passportNumber}</span>
              </div>
            </div>
          ` : `
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700">
              <p class="mb-2">원터치 지원을 위해 프로필을 완성하세요</p>
              <button onclick="editProfile()" class="text-blue-600 font-semibold hover:underline">
                지금 완성하기 →
              </button>
            </div>
          `}
        </div>
        
        <!-- Services Hub -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-lg font-bold text-gray-800 mb-4">전체 서비스</h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
              <div class="flex items-center gap-3">
                <span class="text-2xl">💼</span>
                <div>
                  <p class="font-semibold text-gray-700">일자리 매칭</p>
                  <p class="text-xs text-gray-500">활성화됨</p>
                </div>
              </div>
              <span class="text-green-600 font-semibold text-sm">사용중</span>
            </div>
            
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-3">
                <span class="text-2xl">✈️</span>
                <div>
                  <p class="font-semibold text-gray-700">항공권</p>
                  <p class="text-xs text-gray-500">출시 예정</p>
                </div>
              </div>
              <span class="text-gray-400 text-sm">준비중</span>
            </div>
            
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-3">
                <span class="text-2xl">🏠</span>
                <div>
                  <p class="font-semibold text-gray-700">숙박</p>
                  <p class="text-xs text-gray-500">출시 예정</p>
                </div>
              </div>
              <span class="text-gray-400 text-sm">준비중</span>
            </div>
            
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-3">
                <span class="text-2xl">📄</span>
                <div>
                  <p class="font-semibold text-gray-700">비자 지원</p>
                  <p class="text-xs text-gray-500">출시 예정</p>
                </div>
              </div>
              <span class="text-gray-400 text-sm">준비중</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function calculateProfileCompletion() {
  const fields = ['nameEn', 'nationality', 'passportNumber', 'email', 'phone'];
  const completed = fields.filter(field => AppState.profile[field]).length;
  return Math.floor((completed / fields.length) * 100);
}

// 지원 완료 화면
function renderComplete() {
  const appliedJob = AppState.topJob;
  
  return `
    <div class="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-6">
      <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div class="mb-6">
          <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <span class="text-5xl">✓</span>
          </div>
          <h1 class="text-3xl font-bold text-gray-800 mb-3">지원 완료!</h1>
          <p class="text-lg text-gray-600 leading-relaxed">
            도착 전에<br/>일자리가 정해질 수 있어요
          </p>
        </div>
        
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 text-left">
          <p class="text-sm text-gray-600 mb-3">방금 지원한 일자리</p>
          <p class="text-xl font-bold text-gray-800 mb-1">${appliedJob.title}</p>
          <p class="text-sm text-gray-600">${appliedJob.employer}</p>
          <div class="flex items-center gap-4 mt-3 text-sm text-gray-700">
            <span>📍 ${appliedJob.city}</span>
            <span>💰 ${appliedJob.wage}</span>
          </div>
        </div>
        
        <div class="space-y-3 mb-6 text-left">
          <div class="flex items-center gap-3 text-gray-700">
            <span class="text-green-500 text-xl flex-shrink-0">✓</span>
            <span>지원서가 고용주에게 전송됐어요</span>
          </div>
          <div class="flex items-center gap-3 text-gray-700">
            <span class="text-blue-500 text-xl flex-shrink-0">⏳</span>
            <span>24-48시간 내 검토 예정</span>
          </div>
          <div class="flex items-center gap-3 text-gray-700">
            <span class="text-purple-500 text-xl flex-shrink-0">🔔</span>
            <span>결과는 알림으로 바로 알려드려요</span>
          </div>
        </div>
        
        <button onclick="goToHome()" 
          class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition mb-3">
          홈으로 가기
        </button>
        
        <button onclick="viewOtherJobs()" 
          class="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">
          다른 일자리 보기
        </button>
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
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg safe-area-bottom">
      <div class="flex justify-around items-center py-2">
        ${tabs.map(tab => `
          <button onclick="switchTab('${tab.id}')" 
            class="flex flex-col items-center justify-center py-2 px-4 flex-1 transition-all ${AppState.currentScreen === tab.id ? 'text-blue-600' : 'text-gray-400'}">
            <span class="text-2xl mb-1 ${AppState.currentScreen === tab.id ? 'transform scale-110' : ''}">${tab.icon}</span>
            <span class="text-xs font-semibold">${tab.label}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

// ============ 액션 함수들 ============

function startApp() {
  // 이탈 복구 체크
  const hasState = loadState();
  
  if (hasState && AppState.user_status !== 'NEW') {
    // 이어하기 제안
    if (confirm('이전에 입력하신 정보가 있어요. 이어서 하시겠어요?')) {
      // 상태에 따라 적절한 화면으로
      if (AppState.match_status === 'READY_TO_APPLY' || AppState.match_status === 'APPLIED') {
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

function submitBasicInfo() {
  const country = document.getElementById('country').value;
  const city = document.getElementById('city').value;
  const departureDate = document.getElementById('departureDate').value;
  const workStartDate = document.getElementById('workStartDate').value;
  
  if (!country || !city || !departureDate || !workStartDate) {
    alert('모든 항목을 입력해주세요!');
    return;
  }
  
  // 날짜 검증
  const departure = new Date(departureDate);
  const workStart = new Date(workStartDate);
  const today = new Date();
  
  if (departure < today) {
    alert('출국일은 오늘 이후여야 해요');
    return;
  }
  
  if (workStart < departure) {
    alert('근무 시작일은 출국일 이후여야 해요');
    return;
  }
  
  // 저장
  AppState.userInput = { country, city, departureDate, workStartDate };
  AppState.user_status = 'BASIC_READY';
  AppState.match_status = 'MATCHING';
  AppState.currentScreen = 'matching';
  
  saveState();
  render();
  
  // 2초 후 매칭 완료
  setTimeout(() => {
    completeMatching();
  }, 2000);
}

function completeMatching() {
  // 더미 데이터로 매칭 결과 생성
  AppState.topJob = DUMMY_JOBS[0];
  AppState.candidateJobs = DUMMY_JOBS.slice(1);
  AppState.match_status = 'READY_TO_APPLY';
  AppState.currentScreen = 'home';
  AppState.currentTab = 'home';
  
  saveState();
  render();
}

function applyJob(jobId) {
  // 정보 체크
  if (!isProfileComplete()) {
    // 정보 보완 모달 표시
    AppState.currentScreen = 'infoModal';
    AppState.modalData = { jobId };
    render();
    return;
  }
  
  // 바로 지원
  submitApplication(jobId);
}

function submitApplication(jobId) {
  // 지원 처리
  if (AppState.topJob && AppState.topJob.id === jobId) {
    AppState.topJob.applied = true;
  }
  
  const job = AppState.candidateJobs.find(j => j.id === jobId);
  if (job) {
    job.applied = true;
  }
  
  AppState.match_status = 'APPLIED';
  AppState.application_status = 'SUBMITTED';
  AppState.currentScreen = 'complete';
  
  // 체크리스트 자동 활성화
  CHECKLIST_ITEMS.beforeWork[0].completed = true; // TFN 자동 활성화 시뮬레이션
  
  saveState();
  render();
}

function submitProfileAndApply() {
  const nameEn = document.getElementById('modal_nameEn')?.value;
  const nationality = document.getElementById('modal_nationality')?.value;
  const passportNumber = document.getElementById('modal_passportNumber')?.value;
  
  const missing = getMissingInfo();
  
  if (missing.includes('nameEn') && !nameEn) {
    alert('영문 이름을 입력해주세요');
    return;
  }
  if (missing.includes('nationality') && !nationality) {
    alert('국적을 선택해주세요');
    return;
  }
  if (missing.includes('passportNumber') && !passportNumber) {
    alert('여권 번호를 입력해주세요');
    return;
  }
  
  // 프로필 저장
  if (nameEn) AppState.profile.nameEn = nameEn;
  if (nationality) AppState.profile.nationality = nationality;
  if (passportNumber) AppState.profile.passportNumber = passportNumber;
  
  AppState.user_status = 'PROFILE_COMPLETE';
  
  // 지원 진행
  const jobId = AppState.modalData.jobId;
  AppState.currentScreen = 'home'; // 모달 닫기
  
  saveState();
  
  // 지연 후 지원 완료
  setTimeout(() => {
    submitApplication(jobId);
  }, 300);
}

function scanPassport() {
  alert('📷 여권 스캔 기능은 실제 앱에서 제공됩니다.\n\n데모에서는 수동으로 입력해주세요.');
}

function closeModal(event) {
  if (event && event.target !== event.currentTarget) return;
  AppState.currentScreen = 'home';
  render();
}

function goToHome() {
  AppState.currentScreen = 'home';
  AppState.currentTab = 'home';
  render();
}

function viewOtherJobs() {
  AppState.currentScreen = 'jobs';
  AppState.currentTab = 'jobs';
  render();
}

function switchTab(tabId) {
  AppState.currentScreen = tabId;
  AppState.currentTab = tabId;
  saveState();
  render();
}

function toggleChecklistItem(itemId) {
  const allItems = [...CHECKLIST_ITEMS.beforeDeparture, ...CHECKLIST_ITEMS.beforeWork];
  const item = allItems.find(i => i.id === itemId);
  
  if (item) {
    item.completed = !item.completed;
    saveState();
    render();
  }
}

function editProfile() {
  alert('프로필 수정 기능은 곧 추가될 예정이에요!');
}

function editBasicInfo() {
  if (confirm('기본 정보를 수정하면 매칭 결과가 다시 생성됩니다. 계속하시겠어요?')) {
    AppState.currentScreen = 'onboarding';
    render();
  }
}

function viewInterviewGuide() {
  alert('인터뷰 준비 가이드는 곧 추가될 예정이에요!');
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
    case 'infoModal':
      content = renderHome() + renderInfoModal();
      break;
    case 'complete':
      content = renderComplete();
      break;
    default:
      content = renderSplash();
  }
  
  app.innerHTML = content + renderBottomNav();
}

// ============ 초기화 ============
document.addEventListener('DOMContentLoaded', () => {
  // 초기 화면은 스플래시
  AppState.currentScreen = 'splash';
  render();
});
