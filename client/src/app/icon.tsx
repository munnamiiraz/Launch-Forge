import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '20%',
          fontWeight: '900',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1.5px solid rgba(255,255,255,0.2)',
        }}
      >
        L
      </div>
    ),
    {
      ...size,
    }
  )
}
