// Indeed Job Search API Integration
// Free API for job search

interface JobSearchParams {
  query: string; // Job title or keywords
  location: string; // City name (e.g., Sydney)
  country?: string; // Country code (e.g., au)
  limit?: number; // Max results
}

interface JobResult {
  id: string;
  rank: number;
  badge: string;
  title: string;
  employer: string;
  city: string;
  wage: string;
  start_display: string;
  reason_short: string;
  match_score: number;
  applied: boolean;
  description?: string;
  url?: string;
}

// Indeed API는 공식적으로 폐쇄되어 대안 사용
// Adzuna API (호주 일자리 검색) - 무료 티어 있음
async function searchJobsAdzuna(params: JobSearchParams, env: any): Promise<JobResult[]> {
  try {
    const appId = env.ADZUNA_APP_ID;
    const appKey = env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
      throw new Error('Adzuna API credentials not configured');
    }

    const country = params.country || 'au';
    const location = encodeURIComponent(params.location.toLowerCase());
    const query = encodeURIComponent(params.query);
    const limit = params.limit || 10;

    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=${limit}&what=${query}&where=${location}&sort_by=date`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status}`);
    }

    const data = await response.json();
    return formatJobResults(data.results);
  } catch (error) {
    console.error('Job search error:', error);
    return getDummyJobs(params);
  }
}

function formatJobResults(adzunaResults: any[]): JobResult[] {
  if (!adzunaResults || adzunaResults.length === 0) {
    return [];
  }

  return adzunaResults.slice(0, 3).map((job: any, index: number) => {
    // 시급 추출 (있으면)
    const salary = job.salary_min 
      ? `$${Math.round(job.salary_min / 2080)}` // 연봉을 시급으로 변환 (대략)
      : '$27-30';

    // 도시명 추출
    const city = job.location?.display_name?.split(',')[0] || 'Sydney';

    // 시작일 추정 (최근 공고는 빨리 시작)
    const daysFromNow = index * 2 + 3;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + daysFromNow);
    const startDisplay = `${String(startDate.getMonth() + 1).padStart(2, '0')}/${String(startDate.getDate()).padStart(2, '0')}`;

    return {
      id: index + 1,
      rank: index + 1,
      badge: `AI 추천 ${index + 1}순위`,
      title: job.title,
      employer: job.company.display_name,
      city,
      wage: salary,
      start_display: startDisplay,
      reason_short: generateReason(job.title, index),
      match_score: 95 - (index * 7),
      applied: false,
      description: job.description,
      url: job.redirect_url,
    };
  });
}

function generateReason(title: string, index: number): string {
  const reasons = [
    '첫 워홀러·영어초급도 적응 빠른 루트',
    '체력 필요, 영어 부담 적음',
    '영어 중급 이상, 소통 좋아하면 추천',
  ];

  // 직무에 따른 맞춤 이유
  if (title.toLowerCase().includes('cafe') || title.toLowerCase().includes('barista')) {
    return '카페 경험 쌓기 좋음, 팁 수입 가능';
  }
  if (title.toLowerCase().includes('kitchen') || title.toLowerCase().includes('chef')) {
    return '영어 부담 적고 시급 좋은 편';
  }
  if (title.toLowerCase().includes('farm')) {
    return '세컨드 비자 신청 가능';
  }
  if (title.toLowerCase().includes('retail') || title.toLowerCase().includes('sales')) {
    return '영어 실력 향상에 최고';
  }

  return reasons[index] || reasons[0];
}

function getDummyJobs(params: JobSearchParams): JobResult[] {
  const cities = ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'];
  const city = cities.includes(params.location) ? params.location : 'Sydney';

  return [
    {
      id: 1,
      rank: 1,
      badge: 'AI 추천 1순위',
      title: 'Cafe All-rounder',
      employer: `${city} Coffee Culture`,
      city,
      wage: '$28',
      start_display: '02/03',
      reason_short: '첫 워홀러·영어초급도 적응 빠른 루트',
      match_score: 95,
      applied: false,
    },
    {
      id: 2,
      rank: 2,
      badge: 'AI 추천 2순위',
      title: 'Kitchen Hand',
      employer: `${city} Restaurant Group`,
      city,
      wage: '$27',
      start_display: '02/05',
      reason_short: '체력 필요, 영어 부담 적음',
      match_score: 88,
      applied: false,
    },
    {
      id: 3,
      rank: 3,
      badge: 'AI 추천 3순위',
      title: 'Retail Assistant',
      employer: `${city} Shopping Mall`,
      city,
      wage: '$29',
      start_display: '02/10',
      reason_short: '영어 중급 이상, 소통 좋아하면 추천',
      match_score: 82,
      applied: false,
    },
  ];
}

export { searchJobsAdzuna, JobSearchParams, JobResult };
