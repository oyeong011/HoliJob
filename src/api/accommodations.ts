// Accommodation Search
// Using Hostelworld API or dummy data

interface AccommodationSearchParams {
  city: string;
  checkin: string; // YYYY-MM-DD
  checkout?: string; // YYYY-MM-DD
  guests?: number;
}

interface AccommodationResult {
  id: string;
  type: string; // 가성비, 가심비, 최고
  name: string;
  price: string;
  location: string;
  rooms: string;
  highlight: string;
  rating?: number;
  imageUrl?: string;
  bookingUrl?: string;
}

// 현재는 더미 데이터 사용 (추후 실제 API 연동 가능)
export async function searchAccommodations(
  params: AccommodationSearchParams,
  env: any
): Promise<AccommodationResult[]> {
  try {
    // TODO: 실제 Hostelworld API 또는 Booking.com API 연동
    // 현재는 도시별 더미 데이터 반환
    return getDummyAccommodations(params.city);
  } catch (error) {
    console.error('Accommodation search error:', error);
    return getDummyAccommodations(params.city);
  }
}

function getDummyAccommodations(city: string): AccommodationResult[] {
  const cityData: { [key: string]: any } = {
    Sydney: {
      backpacker: 'Sydney Backpackers CBD',
      shareHouse: 'City Share House',
      studio: 'Premium Studio Apartment',
      location: 'CBD',
    },
    Melbourne: {
      backpacker: 'Melbourne Metro YHA',
      shareHouse: 'St Kilda Share House',
      studio: 'Southbank Studio',
      location: 'City Centre',
    },
    Brisbane: {
      backpacker: 'Brisbane City YHA',
      shareHouse: 'Fortitude Valley Share',
      studio: 'South Bank Studio',
      location: 'CBD',
    },
    Perth: {
      backpacker: 'Perth City YHA',
      shareHouse: 'Northbridge Share',
      studio: 'Perth Central Studio',
      location: 'City Centre',
    },
    Adelaide: {
      backpacker: 'Adelaide Central YHA',
      shareHouse: 'North Adelaide Share',
      studio: 'Adelaide Studio',
      location: 'CBD',
    },
  };

  const data = cityData[city] || cityData.Sydney;

  return [
    {
      id: 's1',
      type: '가성비',
      name: data.backpacker,
      price: '₩180,000/주',
      location: `${data.location} 도보 15분`,
      rooms: '8인실 도미토리',
      highlight: '저렴하게 시작',
      rating: 4.2,
    },
    {
      id: 's2',
      type: '가심비',
      name: data.shareHouse,
      price: '₩450,000/주',
      location: `${data.location} 도보 5분`,
      rooms: '2인실 셰어하우스',
      highlight: '편리한 위치 + 프라이버시',
      rating: 4.5,
    },
    {
      id: 's3',
      type: '최고',
      name: data.studio,
      price: '₩850,000/주',
      location: `${data.location} 중심가`,
      rooms: '1인실 스튜디오',
      highlight: '완벽한 독립 생활',
      rating: 4.8,
    },
  ];
}

// Hostelworld API 연동 함수 (추후 구현)
async function searchHostelworld(
  params: AccommodationSearchParams,
  env: any
): Promise<AccommodationResult[]> {
  // Hostelworld API는 공식적으로 제한적
  // 대안: RapidAPI의 Booking.com API 사용 가능
  
  // const apiKey = env.RAPIDAPI_KEY;
  // if (!apiKey) {
  //   throw new Error('RapidAPI key not configured');
  // }

  // const url = `https://booking-com.p.rapidapi.com/v1/hotels/search`;
  // ... API 호출 구현

  return getDummyAccommodations(params.city);
}

export { AccommodationSearchParams, AccommodationResult };
