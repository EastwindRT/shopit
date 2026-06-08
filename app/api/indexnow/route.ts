import { NextRequest, NextResponse } from 'next/server'
import { TOPICS } from '@/lib/topics'
import { ARTICLES } from '@/lib/articles'

// IndexNow: ping Bing/Yandex/Seznam etc. when content changes. Free, instant
// indexing on participating engines (Google does not participate).
//
// Endpoint:
//   GET /api/indexnow            → submits every Scoppa URL
//   GET /api/indexnow?url=…      → submits a single URL
//
// Verification file at /23a8f4c1b7e64d2890a1c9f7b3e4d6f8.txt — IndexNow
// engines fetch it to confirm we control the domain.

export const runtime = 'edge'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://scoppa.shop'
const HOST = SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '')
const KEY = '23a8f4c1b7e64d2890a1c9f7b3e4d6f8'
const KEY_LOCATION = `${SITE_URL}/${KEY}.txt`

function allUrls(): string[] {
  return [
    `${SITE_URL}/`,
    `${SITE_URL}/about`,
    `${SITE_URL}/topics`,
    `${SITE_URL}/articles`,
    ...TOPICS.map((t) => `${SITE_URL}/topics/${t.slug}`),
    ...ARTICLES.map((a) => `${SITE_URL}/articles/${a.slug}`),
  ]
}

export async function GET(req: NextRequest) {
  const single = req.nextUrl.searchParams.get('url')
  const urlList = single ? [single] : allUrls()

  const body = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  }

  const res = await fetch('https://api.indexnow.org/IndexNow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  })

  return NextResponse.json(
    {
      submitted: urlList.length,
      indexnow_status: res.status,
      indexnow_ok: res.ok,
    },
    { status: res.ok ? 200 : 502 },
  )
}
