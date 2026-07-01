import React from 'react'
import Image from 'next/image'

export default function Logo({logo}: {logo: string}) {
  const isUrl = logo && (logo.startsWith('/') || logo.startsWith('http://') || logo.startsWith('https://'));

  return (
    <div className='mb-5'>
      {isUrl ? (
        <Image src={logo} alt='logo' width={160} height={150} className="object-contain" />
      ) : (
        <span className="text-white text-3xl font-extrabold tracking-wider">{logo || 'ManBazar'}</span>
      )}
    </div>
  )
}
