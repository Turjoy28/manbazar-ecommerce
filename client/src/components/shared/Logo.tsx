import React from 'react'

import Image from 'next/image'

export default function Logo({logo}: {logo: string}) {
  return (
      <div className='mb-5'><Image src={`${logo}`} alt='logo' width={160} height={150}/></div>
  )
}
