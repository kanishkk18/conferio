import http from 'k6/http'
import { sleep, check, group } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '1m',  target: 500 },
    { duration: '2m',  target: 1000 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
    http_req_failed:   ['rate<0.01'],  // less than 1% failure rate
  }
}

const BASE = 'http://localhost:4002' // swap to prod URL for real test

export default function () {
  group('Team APIs', () => {
    const r1 = http.get(`${BASE}/api/team/members`)
    check(r1, { 'members 200': (r) => r.status === 200 })
  })

  group('Meeting APIs', () => {
    const r2 = http.get(`${BASE}/api/meetings`)
    check(r2, { 'meetings 200': (r) => r.status === 200 })

    const r3 = http.get(`${BASE}/api/event/all`)
    check(r3, { 'events 200': (r) => r.status === 200 })
  })

  group('Auth APIs', () => {
    const r4 = http.get(`${BASE}/api/auth/session`)
    check(r4, { 'session 200': (r) => r.status === 200 })
  })

  sleep(1)
}