import Layout from '@/components/Layout'
import Link from 'next/link'
import { GetStaticProps } from 'next'
import { getSortedPostsData, Post, formatDate } from '@/lib/posts'

interface HomeProps {
  allPostsData: Post[]
}

export default function Home({ allPostsData }: HomeProps) {
  return (
    <Layout>
      <div>
        <ul className="posts-list">
          {allPostsData.map(({ id, date, title, summary, external, url }) => (
            <li key={id} className="post-item">
              <div className="post-date">{formatDate(date)}</div>
              {external ? (
                <a 
                  href={url} 
                  className="post-title"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {title}
                  <span className="external-link">↗</span>
                </a>
              ) : (
                <Link href={`/posts/${id}`} className="post-title">
                  {title}
                </Link>
              )}
              {summary && (
                <div className="post-summary">{summary}</div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const allPostsData = getSortedPostsData()
  return {
    props: {
      allPostsData
    }
  }
}