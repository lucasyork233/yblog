'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <Link href='/blog' className='block'>
        <div className='bg-white/80 backdrop-blur rounded-[40px] border p-8 text-center cursor-pointer hover:scale-105 transition-transform shadow-lg'>
          <h1 className='text-3xl font-bold'>
            yBlog
          </h1>
        </div>
      </Link>
    </div>
  )
}