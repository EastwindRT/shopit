import { ImageResponse } from 'next/og'

// Dynamic favicon — bold "S" wordmark on the Scoppa ink color.
// Generated at edge runtime, cached aggressively.

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090b',
          color: '#ffffff',
          fontSize: 24,
          fontWeight: 900,
          fontFamily: 'sans-serif',
          letterSpacing: -1,
        }}
      >
        S
      </div>
    ),
    { ...size },
  )
}
