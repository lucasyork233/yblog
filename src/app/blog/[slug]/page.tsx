'use client'

export const runtime = 'edge'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { marked } from 'marked'

interface BlogData {
  title: string
  content: string
  date: string
}

export default function BlogPost() {
  const params = useParams()
  const slug = params.slug as string
  const [blog, setBlog] = useState<BlogData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBlog() {
      try {
        const indexRes = await fetch('/blogs/index.json')
        const blogs = await indexRes.json()
        const blogInfo = blogs.find((b: any) => b.slug === slug)
        
        if (!blogInfo) {
          setBlog(null)
          setLoading(false)
          return
        }
        
        const contentRes = await fetch(`/blogs/${slug}/index.md`)
        const markdown = await contentRes.text()
        const html = await marked(markdown)
        
        setBlog({
          title: blogInfo.title,
          content: html,
          date: blogInfo.date
        })
      } catch (error) {
        console.error('加载博客失败:', error)
        setBlog(null)
      } finally {
        setLoading(false)
      }
    }
    
    loadBlog()
  }, [slug])

  if (loading) {
    return <div className='text-secondary flex h-full items-center justify-center text-sm'>加载中...</div>
  }

  if (!blog) {
    return <div className='text-secondary flex h-full items-center justify-center text-sm'>文章不存在</div>
  }

  return (
    <div className='max-w-4xl mx-auto px-6 py-12'>
      <div className='bg-white/80 backdrop-blur rounded-[40px] border p-8 shadow-lg'>
        <h1 className='text-3xl font-bold mb-4'>{blog.title}</h1>
        <p className='text-gray-600 mb-6'>{dayjs(blog.date).format('YYYY年 M月 D日')}</p>
        <div 
          className='prose prose-gray max-w-none'
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>
    </div>
  )
}