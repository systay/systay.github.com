import Head from 'next/head'
import Link from 'next/link'
import { ReactNode, useState, useEffect } from 'react'

interface LayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export default function Layout({ 
  children, 
  title = 'Conscious Incompetence', 
  description = 'Technical writings about query optimizers, databases, and SQL processing' 
}: LayoutProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Check for saved theme preference or default to 'light'
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') as 'light' | 'dark' | null : null
    const prefersDark = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
    
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
    setTheme(initialTheme)
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', initialTheme)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
    }
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme)
    }
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="Andres Taylor" />
        <meta name="keywords" content="SQL, database, query optimizer, Vitess, query planner" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:creator" content="@andres_taylor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container">
        <header className="header">
          <Link href="/" className="site-title">
            Conscious Incompetence
          </Link>
          <p className="site-description">
            Technical writings about query optimizers, databases, and SQL processing
          </p>
          <nav className="nav">
            <Link href="/">Posts</Link>
            <Link href="/about">About</Link>
            <a href="https://github.com/systay" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="https://twitter.com/andres_taylor" target="_blank" rel="noopener noreferrer">
              Twitter
            </a>
            <a href="https://fosstodon.org/@systay" target="_blank" rel="noopener noreferrer">
              Mastodon
            </a>
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </nav>
        </header>

        <main>
          {children}
        </main>

        <footer className="footer">
          <p>
            © {new Date().getFullYear()} Andres Taylor
          </p>
        </footer>
      </div>
    </>
  )
}