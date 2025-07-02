import Layout from '@/components/Layout'
import Link from 'next/link'

export default function About() {
  return (
    <Layout 
      title="About | Conscious Incompetence"
      description="About Andres Taylor and this blog"
    >
      <article>
        <Link href="/" className="back-link">
          ← Back to posts
        </Link>
        
        <header className="article-header">
          <h1 className="article-title">About</h1>
        </header>

        <div className="content">
          <p>
            Hi! I'm Andres Taylor, and this is my collection of writings about 
            database internals, query optimization, and distributed systems.
          </p>

          <h2>What I Write About</h2>
          <ul>
            <li>Query optimizers and planners</li>
            <li>Database architecture and performance</li>
            <li>Distributed systems (especially Vitess)</li>
            <li>SQL processing and execution</li>
            <li>Code generation and AST manipulation</li>
          </ul>

          <h2>Background</h2>
          <p>
            I work on database systems, with a particular focus on Vitess - 
            a database clustering system for horizontal scaling of MySQL. 
            Much of my time is spent thinking about how to make SQL queries 
            run faster and more efficiently in distributed environments.
          </p>

          <p>
            The name "Conscious Incompetence" reflects my belief that acknowledging 
            what we don't know is the first step to learning. In the world of 
            databases, there's always more to discover.
          </p>

          <h2>Get in Touch</h2>
          <p>
            You can find me on{' '}
            <a href="https://github.com/systay" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>,{' '}
            <a href="https://twitter.com/andres_taylor" target="_blank" rel="noopener noreferrer">
              Twitter
            </a>, or{' '}
            <a href="https://fosstodon.org/@systay" target="_blank" rel="noopener noreferrer">
              Mastodon
            </a>. You can also email me at andres@taylor.se.
          </p>

          <p>
            If you enjoy deep dives into database internals or have questions 
            about query optimization, feel free to reach out. I love discussing 
            these topics with fellow database enthusiasts.
          </p>
        </div>
      </article>
    </Layout>
  )
}