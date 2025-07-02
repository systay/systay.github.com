import Layout from '@/components/Layout'
import { getAllPostIds, getPostData, Post, formatDate } from '@/lib/posts'
import { GetStaticProps, GetStaticPaths } from 'next'
import Link from 'next/link'

interface PostProps {
  postData: Post
}

export default function BlogPost({ postData }: PostProps) {
  return (
    <Layout 
      title={`${postData.title} | Conscious Incompetence`}
      description={postData.summary || 'Technical writings about query optimizers and databases'}
    >
      <article>
        <Link href="/" className="back-link">
          ← Back to posts
        </Link>
        
        <header className="article-header">
          <h1 className="article-title">
            {postData.title}
          </h1>
          <div className="article-meta">
            {formatDate(postData.date)}
          </div>
          {postData.summary && (
            <div className="article-summary">
              {postData.summary}
            </div>
          )}
        </header>

        <div 
          className="content"
          dangerouslySetInnerHTML={{ __html: postData.content || '' }}
        />
      </article>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllPostIds()
  return {
    paths,
    fallback: false
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const postData = await getPostData(params?.id as string)
  return {
    props: {
      postData
    }
  }
}