import Layout from '@/components/Layout'
import Link from 'next/link'

export default function Custom404() {
  return (
    <Layout 
      title="404 - Page Not Found | Conscious Incompetence"
      description="Page not found"
    >
      <div className="error-page">
        <h1 className="error-title">404</h1>
        <p className="error-description">
          The page you're looking for doesn't exist.
        </p>
        <Link href="/">
          ← Back to posts
        </Link>
      </div>
    </Layout>
  )
}