import { ImageResponse } from 'next/og'

// Apple touch icon — shown when iOS users "Add to Home Screen".

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
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
          fontSize: 110,
          fontWeight: 900,
          fontFamily: 'sans-serif',
          letterSpacing: -4,
        }}
      >
        S
      </div>
    ),
    { ...size },
  )
}
