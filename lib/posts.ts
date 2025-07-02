import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import { format } from 'date-fns'

const postsDirectory = path.join(process.cwd(), 'posts')

export interface Post {
  id: string
  title: string
  date: string
  summary?: string | null
  content?: string
  external?: boolean
  url?: string
}

export interface ExternalPost {
  title: string
  date: string
  url: string
  summary?: string
}

// External posts from Medium, Vitess, and PlanetScale
const externalPosts: ExternalPost[] = [
  {
    title: "What is a query planner?",
    date: "2022-12-15",
    url: "https://planetscale.com/blog/what-is-a-query-planner",
    summary: "An introduction to query planners and how they work"
  },
  {
    title: "Grouping and aggregations on Vitess",
    date: "2022-06-06", 
    url: "https://planetscale.com/blog/grouping-and-aggregations-on-vitess",
    summary: "How Vitess handles complex grouping and aggregation operations"
  },
  {
    title: "Why write a new planner",
    date: "2021-11-02",
    url: "https://vitess.io/blog/2021-11-02-why-write-new-planner/",
    summary: "The reasoning behind creating a new query planner for Vitess"
  },
  {
    title: "Examining query plans in MySQL and Vitess", 
    date: "2021-09-07",
    url: "https://vitess.io/blog/2021-09-07-examine-query-plan/",
    summary: "How to analyze and understand query execution plans"
  },
  {
    title: "Code generation in Vitess",
    date: "2021-03-24", 
    url: "https://vitess.io/blog/2021-03-24-code-generation-vitess/",
    summary: "Using code generation to improve performance and maintainability"
  },
  {
    title: "Shard Splits with Consistent Snapshots",
    date: "2018-12-05",
    url: "https://medium.com/square-corner-blog/shard-splits-with-consistent-snapshots-adcf622842dd",
    summary: "How to split database shards while maintaining consistency"
  }
]

export function getSortedPostsData(): Post[] {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory)
  const localPosts: Post[] = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '')

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    // Extract date from filename
    const dateMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})/)
    const date = dateMatch ? dateMatch[1] : '2021-01-01'

    return {
      id,
      title: matterResult.data.title || id,
      date,
      summary: matterResult.data.summary || null,
      external: false
    }
  })

  // Convert external posts to Post format
  const convertedExternalPosts: Post[] = externalPosts.map((post, index) => ({
    id: `external-${index}`,
    title: post.title,
    date: post.date,
    summary: post.summary,
    external: true,
    url: post.url
  }))

  // Combine and sort posts by date
  const allPosts = [...localPosts, ...convertedExternalPosts]
  return allPosts.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, '')
      }
    }
  })
}

export async function getPostData(id: string): Promise<Post> {
  const fullPath = path.join(postsDirectory, `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  // Extract date from filename
  const dateMatch = id.match(/^(\d{4}-\d{2}-\d{2})/)
  const date = dateMatch ? dateMatch[1] : '2021-01-01'

  return {
    id,
    title: matterResult.data.title || id,
    date,
    summary: matterResult.data.summary || null,
    content: contentHtml,
    external: false
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return format(date, 'dd MMM yyyy')
}