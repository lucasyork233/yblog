'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

interface BlogItem {
  slug: string
  title: string
  date: string
  summary: string
  tags?: string[]
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 加载真实博客数据
    async function loadBlogs() {
      try {
        const response = await fetch('/blogs/index.json')
        const data = await response.json()
        setBlogs(data)
      } catch (error) {
        console.error('加载博客失败:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadBlogs()
  }, [])

  if (loading) {
    return <div className='text-secondary flex h-full items-center justify-center text-sm'>加载中...</div>
  }

  return (
    <div className='flex flex-col items-center justify-center gap-6 px-6 pt-24'>
      {blogs.map((blog) => (
        <div key={blog.slug} className='card relative w-full max-w-[840px]'>
          <Link href={`/blog/${blog.slug}`} className='group flex min-h-10 items-center gap-3 py-3 cursor-pointer'>
            <span className='text-secondary w-[44px] shrink-0 text-sm font-medium'>
              {dayjs(blog.date).format('MM-DD')}
            </span>
            <div className='flex-1 truncate text-sm font-medium transition-all group-hover:translate-x-2'>
              {blog.title}
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              {(blog.tags || []).map(t => (
                <span key={t} className='text-secondary text-sm'>
                  #{t}
                </span>
              ))}
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
}