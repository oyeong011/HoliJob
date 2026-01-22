import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { cors } from 'hono/cors'
import { searchFlights } from './api/flights'
import { searchJobsAdzuna } from './api/jobs'
import { searchAccommodations } from './api/accommodations'

type Bindings = {
  AMADEUS_CLIENT_ID: string
  AMADEUS_CLIENT_SECRET: string
  ADZUNA_APP_ID: string
  ADZUNA_APP_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// ============ API Routes ============

// 항공권 검색 API
app.post('/api/flights/search', async (c) => {
  try {
    const body = await c.req.json()
    const { origin, destination, departureDate, adults } = body

    if (!origin || !destination || !departureDate) {
      return c.json({ error: 'Missing required parameters' }, 400)
    }

    const results = await searchFlights(
      {
        origin,
        destination,
        departureDate,
        adults: adults || 1,
        max: 10,
      },
      c.env
    )

    return c.json({ success: true, data: results })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// 일자리 검색 API
app.post('/api/jobs/search', async (c) => {
  try {
    const body = await c.req.json()
    const { query, location, country } = body

    if (!location) {
      return c.json({ error: 'Location is required' }, 400)
    }

    const results = await searchJobsAdzuna(
      {
        query: query || 'hospitality cafe kitchen',
        location,
        country: country || 'au',
        limit: 10,
      },
      c.env
    )

    return c.json({ success: true, data: results })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// 숙소 검색 API
app.post('/api/accommodations/search', async (c) => {
  try {
    const body = await c.req.json()
    const { city, checkin, checkout, guests } = body

    if (!city) {
      return c.json({ error: 'City is required' }, 400)
    }

    const results = await searchAccommodations(
      {
        city,
        checkin: checkin || new Date().toISOString().split('T')[0],
        checkout,
        guests: guests || 1,
      },
      c.env
    )

    return c.json({ success: true, data: results })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Serve static files from public directory
app.use('/static/*', serveStatic({ root: './public' }))
app.use('/holijob-logo.png', serveStatic({ path: './public/holijob-logo.png' }))

// Main route
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <title>HoliJob - 도착 전에 일부터 정해드립니다</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="/static/style.css">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          * {
            -webkit-tap-highlight-color: transparent;
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <div id="app"></div>
        
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
