// HoliJob Demo - State Management
const AppState = {
  currentScreen: 'onboarding', // onboarding, matching, home, jobs, checklist, mypage, complete
  currentTab: 'home',
  userInput: {
    destination: '',
    departureDate: '',
    workStartDate: ''
  },
  profile: {
    hasPassport: true, // 데모용 기본값
    completionRate: 60
  },
  topJob: null,
  candidateJobs: []
};

// 더미 데이터
const DUMMY_JOBS = [
  {
    id: 1,
    title: 'Barista',
    city: 'Sydney',
    wage: '$29.5',
    startDate: '5월 15일',
    reason: '숙소 지원 + 즉시 시작 가능',
    workType: '카페',
    accommodation: true,
    applied: false
  },
  {
    id: 2,
    title: 'Kitchen Hand',
    city: 'Melbourne',
    wage: '$28.0',
    startDate: '5월 20일',
    reason: '경력 무관 + 주 5일 보장',
    workType: '레스토랑',
    accommodation: false,
    applied: false
  },
  {
    id: 3,
    title: 'Farm Worker',
    city: 'Brisbane',
    wage: '$27.5',
    startDate: '5월 18일',
    reason: '2차 비자 가능 + 보너스',
    workType: '농장',
    accommodation: true,
    applied: false
  }
];

const CHECKLIST_ITEMS = {
  beforeDeparture: [
    { id: 1, title: '여권 준비', completed: true },
    { id: 2, title: '비자 신청', completed: true },
    { id: 3, title: '항공권 예약', completed: false },
    { id: 4, title: '여행자 보험', completed: false }
  ],
  beforeWork: [
    { id: 5, title: '세금 신고 번호(TFN) 발급', completed: false },
    { id: 6, title: '은행 계좌 개설', completed: false },
    { id: 7, title: '숙소 확정', completed: false }
  ]
};

// 화면 렌더링 함수들
function renderOnboarding() {
  return `
    <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-6">
      <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-800 mb-3">HoliJob</h1>
          <p class="text-xl text-gray-600 leading-relaxed">도착 전에<br/>일부터 정해드립니다</p>
        </div>
        
        <div class="space-y-6 mb-8">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">어디로 가나요?</label>
            <input type="text" id="destination" placeholder="예: 시드니" 
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition">
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">언제 출국하나요?</label>
            <input type="text" id="departureDate" placeholder="예: 5/10" 
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition">
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">언제부터 일 가능한가요?</label>
            <input type="text" id="workStartDate" placeholder="예: 5/15" 
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition">
          </div>
        </div>
        
        <button onclick="startMatching()" 
          class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition transform hover:scale-105">
          시작하기
        </button>
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
        <h2 class="text-2xl font-bold text-gray-800 mb-3">AI가 매칭 중...</h2>
        <p class="text-gray-600">당신 조건에 맞는<br/>일자리를 고르는 중입니다</p>
      </div>
    </div>
  `;
}

function renderHome() {
  const job = AppState.topJob;
  const completionRate = Math.floor((CHECKLIST_ITEMS.beforeDeparture.filter(i => i.completed).length / 
    (CHECKLIST_ITEMS.beforeDeparture.length + CHECKLIST_ITEMS.beforeWork.length)) * 100);
  
  return `
    <div class="pb-20">
      <!-- 헤더 -->
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-b-3xl shadow-lg">
        <h1 class="text-2xl font-bold mb-2">안녕하세요!</h1>
        <p class="text-blue-100">AI가 대신 골라드렸어요</p>
      </div>
      
      <!-- 메인 카드 -->
      <div class="p-6">
        <div class="bg-white rounded-2xl shadow-xl p-6 mb-6 border-2 border-blue-500">
          <div class="flex items-center gap-2 mb-4">
            <span class="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
              🎯 AI가 대신 고른 1순위
            </span>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-800 mb-4">${job.title}</h2>
          
          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-2 text-gray-700">
              <span>📍</span>
              <span>${job.city}</span>
            </div>
            <div class="flex items-center gap-2 text-gray-700">
              <span>💰</span>
              <span class="font-semibold text-lg">${job.wage}</span>
              <span class="text-gray-500 text-sm">/ 시간</span>
            </div>
            <div class="flex items-center gap-2 text-gray-700">
              <span>📅</span>
              <span>${job.startDate} 시작</span>
            </div>
          </div>
          
          <div class="bg-blue-50 p-4 rounded-xl mb-6">
            <p class="text-sm text-gray-700">
              <span class="font-semibold text-blue-600">선정 이유:</span> ${job.reason}
            </p>
          </div>
          
          <button onclick="applyJob(${job.id})" 
            class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition transform hover:scale-105">
            ✨ 원터치 지원
          </button>
        </div>
        
        <!-- 보조 정보 -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-white rounded-xl shadow p-4">
            <p class="text-sm text-gray-500 mb-1">체크리스트</p>
            <p class="text-2xl font-bold text-blue-600">${completionRate}%</p>
          </div>
          <div class="bg-white rounded-xl shadow p-4">
            <p class="text-sm text-gray-500 mb-1">비자 상태</p>
            <p class="text-sm font-semibold text-green-600">✓ 준비됨</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderJobs() {
  return `
    <div class="pb-20">
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-b-3xl shadow-lg mb-6">
        <h1 class="text-2xl font-bold">일자리</h1>
      </div>
      
      <!-- 탭 -->
      <div class="px-6 mb-6">
        <div class="bg-gray-100 rounded-xl p-1 flex">
          <button class="flex-1 py-2 bg-white rounded-lg shadow font-semibold text-blue-600">
            자동매칭
          </button>
          <button class="flex-1 py-2 text-gray-500">
            직접찾기
          </button>
        </div>
      </div>
      
      <!-- 후보 카드들 -->
      <div class="px-6 space-y-4">
        ${AppState.candidateJobs.map(job => `
          <div class="bg-white rounded-xl shadow-lg p-5 ${job.applied ? 'opacity-50' : ''}">
            <div class="flex items-center gap-2 mb-3">
              <span class="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full font-semibold">
                AI 추천
              </span>
              ${job.applied ? '<span class="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-semibold">지원완료</span>' : ''}
            </div>
            
            <h3 class="text-xl font-bold text-gray-800 mb-3">${job.title}</h3>
            
            <div class="space-y-1 mb-4 text-sm">
              <div class="flex items-center gap-2 text-gray-600">
                <span>📍</span>
                <span>${job.city}</span>
              </div>
              <div class="flex items-center gap-2 text-gray-600">
                <span>💰</span>
                <span class="font-semibold">${job.wage}</span>
              </div>
              <div class="flex items-center gap-2 text-gray-600">
                <span>📅</span>
                <span>${job.startDate}</span>
              </div>
            </div>
            
            <p class="text-sm text-gray-600 mb-4">${job.reason}</p>
            
            ${!job.applied ? `
              <button onclick="applyJob(${job.id})" 
                class="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition">
                원터치 지원
              </button>
            ` : `
              <div class="w-full bg-gray-100 text-gray-500 py-3 rounded-lg font-semibold text-center">
                지원 완료
              </div>
            `}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderChecklist() {
  const totalItems = CHECKLIST_ITEMS.beforeDeparture.length + CHECKLIST_ITEMS.beforeWork.length;
  const completedItems = [...CHECKLIST_ITEMS.beforeDeparture, ...CHECKLIST_ITEMS.beforeWork]
    .filter(item => item.completed).length;
  const completionRate = Math.floor((completedItems / totalItems) * 100);
  
  return `
    <div class="pb-20">
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-b-3xl shadow-lg mb-6">
        <h1 class="text-2xl font-bold mb-2">체크리스트</h1>
        <div class="flex items-center gap-3">
          <div class="flex-1 bg-white/20 rounded-full h-2">
            <div class="bg-white h-2 rounded-full transition-all" style="width: ${completionRate}%"></div>
          </div>
          <span class="font-bold">${completionRate}%</span>
        </div>
      </div>
      
      <div class="px-6 space-y-6">
        <!-- 출국 전 -->
        <div>
          <h2 class="text-lg font-bold text-gray-800 mb-3">출국 전</h2>
          <div class="space-y-2">
            ${CHECKLIST_ITEMS.beforeDeparture.map(item => `
              <div class="bg-white rounded-lg shadow p-4 flex items-center gap-3">
                <div class="w-6 h-6 rounded-full ${item.completed ? 'bg-green-500' : 'bg-gray-200'} flex items-center justify-center flex-shrink-0">
                  ${item.completed ? '<span class="text-white text-sm">✓</span>' : ''}
                </div>
                <span class="text-gray-700 ${item.completed ? 'line-through' : ''}">${item.title}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- 근무 전 -->
        <div>
          <h2 class="text-lg font-bold text-gray-800 mb-3">근무 전</h2>
          <div class="space-y-2">
            ${CHECKLIST_ITEMS.beforeWork.map(item => `
              <div class="bg-white rounded-lg shadow p-4 flex items-center gap-3">
                <div class="w-6 h-6 rounded-full ${item.completed ? 'bg-green-500' : 'bg-gray-200'} flex items-center justify-center flex-shrink-0">
                  ${item.completed ? '<span class="text-white text-sm">✓</span>' : ''}
                </div>
                <span class="text-gray-700 ${item.completed ? 'line-through' : ''}">${item.title}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderMyPage() {
  return `
    <div class="pb-20">
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-b-3xl shadow-lg mb-6">
        <h1 class="text-2xl font-bold">마이페이지</h1>
      </div>
      
      <div class="px-6 space-y-4">
        <!-- 프로필 완성도 -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-lg font-bold text-gray-800 mb-4">프로필 완성도</h2>
          <div class="flex items-center gap-4">
            <div class="flex-1 bg-gray-200 rounded-full h-3">
              <div class="bg-blue-500 h-3 rounded-full" style="width: ${AppState.profile.completionRate}%"></div>
            </div>
            <span class="font-bold text-blue-600">${AppState.profile.completionRate}%</span>
          </div>
        </div>
        
        <!-- 여권 정보 -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-lg font-bold text-gray-800 mb-4">여권 정보</h2>
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <span class="text-2xl">✓</span>
            </div>
            <div>
              <p class="font-semibold text-gray-800">등록 완료</p>
              <p class="text-sm text-gray-500">여권 정보가 저장되었습니다</p>
            </div>
          </div>
        </div>
        
        <!-- Services Hub -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-lg font-bold text-gray-800 mb-4">Services Hub</h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-3">
                <span class="text-2xl">✈️</span>
                <span class="font-semibold text-gray-700">항공권</span>
              </div>
              <span class="text-sm text-gray-400">연결 예정</span>
            </div>
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-3">
                <span class="text-2xl">🏠</span>
                <span class="font-semibold text-gray-700">숙박</span>
              </div>
              <span class="text-sm text-gray-400">연결 예정</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderComplete() {
  const appliedJobs = [...[AppState.topJob], ...AppState.candidateJobs].filter(j => j && j.applied);
  
  return `
    <div class="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-6">
      <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div class="mb-6">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-4xl">✓</span>
          </div>
          <h1 class="text-3xl font-bold text-gray-800 mb-3">지원 완료!</h1>
          <p class="text-lg text-gray-600 leading-relaxed">
            도착 전에<br/>일자리가 정해질 수 있습니다
          </p>
        </div>
        
        <div class="bg-blue-50 rounded-xl p-6 mb-6">
          <p class="text-sm text-gray-600 mb-2">지원한 일자리</p>
          <p class="text-xl font-bold text-gray-800">${appliedJobs.length}개</p>
        </div>
        
        <div class="space-y-3 mb-6 text-left">
          <div class="flex items-center gap-3 text-gray-700">
            <span class="text-green-500 text-xl">✓</span>
            <span>체크리스트 일부 완료</span>
          </div>
          <div class="flex items-center gap-3 text-gray-700">
            <span class="text-blue-500 text-xl">•</span>
            <span>비자 신청 확인됨</span>
          </div>
          <div class="flex items-center gap-3 text-gray-500">
            <span class="text-gray-300 text-xl">•</span>
            <span>항공권 연결 예정</span>
          </div>
        </div>
        
        <button onclick="goToHome()" 
          class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition">
          홈으로 가기
        </button>
      </div>
    </div>
  `;
}

function renderBottomNav() {
  if (AppState.currentScreen !== 'home' && 
      AppState.currentScreen !== 'jobs' && 
      AppState.currentScreen !== 'checklist' && 
      AppState.currentScreen !== 'mypage') {
    return '';
  }
  
  const tabs = [
    { id: 'home', label: '홈', icon: '🏠' },
    { id: 'jobs', label: '일자리', icon: '💼' },
    { id: 'checklist', label: '체크리스트', icon: '✓' },
    { id: 'mypage', label: '마이', icon: '👤' }
  ];
  
  return `
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div class="flex justify-around items-center py-2">
        ${tabs.map(tab => `
          <button onclick="switchTab('${tab.id}')" 
            class="flex flex-col items-center justify-center py-2 px-4 flex-1 ${AppState.currentScreen === tab.id ? 'text-blue-600' : 'text-gray-400'}">
            <span class="text-2xl mb-1">${tab.icon}</span>
            <span class="text-xs font-semibold">${tab.label}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

// 액션 함수들
function startMatching() {
  const destination = document.getElementById('destination').value;
  const departureDate = document.getElementById('departureDate').value;
  const workStartDate = document.getElementById('workStartDate').value;
  
  if (!destination || !departureDate || !workStartDate) {
    alert('모든 항목을 입력해주세요!');
    return;
  }
  
  AppState.userInput = { destination, departureDate, workStartDate };
  AppState.currentScreen = 'matching';
  render();
  
  // 2초 후 홈으로 이동
  setTimeout(() => {
    AppState.topJob = DUMMY_JOBS[0];
    AppState.candidateJobs = DUMMY_JOBS.slice(1);
    AppState.currentScreen = 'home';
    AppState.currentTab = 'home';
    render();
  }, 2000);
}

function applyJob(jobId) {
  // 원터치 지원
  if (AppState.topJob && AppState.topJob.id === jobId) {
    AppState.topJob.applied = true;
  }
  
  const job = AppState.candidateJobs.find(j => j.id === jobId);
  if (job) {
    job.applied = true;
  }
  
  AppState.currentScreen = 'complete';
  render();
}

function goToHome() {
  AppState.currentScreen = 'home';
  AppState.currentTab = 'home';
  render();
}

function switchTab(tabId) {
  AppState.currentScreen = tabId;
  AppState.currentTab = tabId;
  render();
}

function render() {
  const app = document.getElementById('app');
  
  let content = '';
  switch (AppState.currentScreen) {
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
    case 'complete':
      content = renderComplete();
      break;
  }
  
  app.innerHTML = content + renderBottomNav();
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  render();
});
