import { ImageResponse } from 'next/og'

// Dynamic OpenGraph + Twitter card image. Used by every social share
// (Twitter, LinkedIn, iMessage, Slack, Discord, etc.) when a page from this
// site is linked. Edge-rendered, cached by Next + Render.
//
// Size is the recommended 1200×630 — the size all major platforms expect.

export const runtime = 'edge'
export const alt = 'Scoppa — The front page of Shopify'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f4 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 80,
            fontSize: 22,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: '#a1a1aa',
          }}
        >
          The front page of Shopify
        </div>
        <div
          style={{
            fontSize: 220,
            fontWeight: 900,
            letterSpacing: -8,
            color: '#09090b',
            lineHeight: 1,
          }}
        >
          Scoppa
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 30,
            color: '#52525b',
            maxWidth: 800,
            textAlign: 'center',
            lineHeight: 1.3,
          }}
        >
          Search every Shopify store. One query. Thousands of merchants.
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            right: 80,
            fontSize: 22,
            color: '#a1a1aa',
            fontWeight: 600,
          }}
        >
          scoppa.shop
        </div>
      </div>
    ),
    { ...size },
  )
}
