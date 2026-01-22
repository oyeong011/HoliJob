// Amadeus Flight Search API Integration
// Free Tier: 2,000 calls/month

interface FlightSearchParams {
  origin: string; // IATA code (e.g., ICN for Incheon)
  destination: string; // IATA code (e.g., SYD for Sydney)
  departureDate: string; // YYYY-MM-DD
  adults: number;
  max?: number; // Maximum results
}

interface AmadeusToken {
  access_token: string;
  expires_in: number;
  timestamp: number;
}

// Amadeus API 토큰 캐싱 (Cloudflare Workers 환경)
let cachedToken: AmadeusToken | null = null;

async function getAmadeusToken(env: any): Promise<string> {
  // 캐시된 토큰이 있고 만료되지 않았으면 재사용
  if (cachedToken && Date.now() < cachedToken.timestamp + (cachedToken.expires_in * 1000) - 60000) {
    return cachedToken.access_token;
  }

  // API 키 환경변수에서 가져오기
  const clientId = env.AMADEUS_CLIENT_ID;
  const clientSecret = env.AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Amadeus API credentials not configured');
  }

  // 새 토큰 요청
  const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
  });

  if (!response.ok) {
    throw new Error('Failed to get Amadeus token');
  }

  const data = await response.json();
  
  cachedToken = {
    access_token: data.access_token,
    expires_in: data.expires_in,
    timestamp: Date.now(),
  };

  return cachedToken.access_token;
}

export async function searchFlights(params: FlightSearchParams, env: any) {
  try {
    const token = await getAmadeusToken(env);

    const url = new URL('https://test.api.amadeus.com/v2/shopping/flight-offers');
    url.searchParams.append('originLocationCode', params.origin);
    url.searchParams.append('destinationLocationCode', params.destination);
    url.searchParams.append('departureDate', params.departureDate);
    url.searchParams.append('adults', params.adults.toString());
    url.searchParams.append('max', (params.max || 10).toString());
    url.searchParams.append('currencyCode', 'AUD');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Amadeus API error: ${response.status}`);
    }

    const data = await response.json();
    
    // 응답 데이터를 우리 형식으로 변환
    return formatFlightResults(data);
  } catch (error) {
    console.error('Flight search error:', error);
    // 에러 시 더미 데이터 반환
    return getDummyFlights(params);
  }
}

function formatFlightResults(amadeusData: any) {
  if (!amadeusData.data || amadeusData.data.length === 0) {
    return [];
  }

  return amadeusData.data.slice(0, 3).map((offer: any, index: number) => {
    const itinerary = offer.itineraries[0];
    const firstSegment = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];
    
    const price = parseFloat(offer.price.total);
    const stops = itinerary.segments.length - 1;

    // 가격대별 분류
    let type = '가성비';
    if (index === 1) type = '가심비';
    if (index === 2) type = '최고';

    return {
      id: `f${index + 1}`,
      type,
      airline: getAirlineName(firstSegment.carrierCode),
      price: `₩${Math.round(price * 1300).toLocaleString()}`, // AUD to KRW 환율 적용
      route: `${firstSegment.departure.iataCode} → ${lastSegment.arrival.iataCode}${stops > 0 ? ` (경유 ${stops}회)` : ' (직항)'}`,
      duration: formatDuration(itinerary.duration),
      highlight: stops === 0 ? '직항 편리함' : '경제적인 선택',
      departureTime: firstSegment.departure.at,
      arrivalTime: lastSegment.arrival.at,
      stops,
    };
  });
}

function getAirlineName(code: string): string {
  const airlines: { [key: string]: string } = {
    'KE': '대한항공',
    'OZ': '아시아나',
    'LJ': '진에어',
    'TW': '티웨이항공',
    'QF': 'Qantas',
    'VA': 'Virgin Australia',
    'JQ': 'Jetstar',
    'SQ': 'Singapore Airlines',
  };
  return airlines[code] || code;
}

function formatDuration(duration: string): string {
  // PT16H30M 형식을 "16시간 30분"으로 변환
  const match = duration.match(/PT(\d+)H(\d+)M/);
  if (match) {
    return `${match[1]}시간 ${match[2]}분`;
  }
  return duration;
}

function getDummyFlights(params: FlightSearchParams) {
  return [
    {
      id: 'f1',
      type: '가성비',
      airline: '진에어',
      price: '₩980,000',
      route: `${params.origin} → ${params.destination} (경유 1회)`,
      duration: '18시간',
      highlight: '가장 저렴한 옵션',
      departureTime: `${params.departureDate}T10:00:00`,
      arrivalTime: `${params.departureDate}T04:00:00`,
      stops: 1,
    },
    {
      id: 'f2',
      type: '가심비',
      airline: '대한항공',
      price: '₩1,280,000',
      route: `${params.origin} → ${params.destination} (직항)`,
      duration: '10시간',
      highlight: '편안한 여행 + 합리적 가격',
      departureTime: `${params.departureDate}T19:00:00`,
      arrivalTime: `${params.departureDate}T05:00:00`,
      stops: 0,
    },
    {
      id: 'f3',
      type: '최고',
      airline: 'Qantas',
      price: '₩1,850,000',
      route: `${params.origin} → ${params.destination} (직항 비즈니스)`,
      duration: '10시간',
      highlight: '프리미엄 비즈니스 클래스',
      departureTime: `${params.departureDate}T20:00:00`,
      arrivalTime: `${params.departureDate}T06:00:00`,
      stops: 0,
    },
  ];
}
