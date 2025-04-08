import Image from 'next/image'
import React from 'react'

const Loader = () => {
  return (
    <div className='loader'>
      <Image
        src="/assets/icons/loader.svg"
        className='animate-spin'
        alt='Loading...'
        width={32}
        height={32}
      />
      Loading...
    </div>
  )
}

export default Loader
