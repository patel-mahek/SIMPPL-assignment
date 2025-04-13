"use client"

import { useState,useEffect  } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpIcon, MessageSquare, Calendar, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

// Types
interface RedditPost {
  id: string
  subreddit: string
  author: string
  title: string
  date: number
  score: number
  ups: number
  downs: number
  num_comments: number
  url: string
  permalink: string
  word_count: number
  isNew?: boolean
}

// Mock data for available subreddits
const availableSubreddits = [
  "Anarchism",
  "Conservative",
  "Liberal",
  "PoliticalDiscussion",
  "Republican",
  "Democrats",
  "Neoliberal",
  "Politics",
  "Socialism",
  "WorldPolitics"
]

function PostCard({ post }: { post: RedditPost }) {
  const isImage = post.url.match(/\.(jpeg|jpg|gif|png)$/) !== null
  const timeAgo = formatDistanceToNow(new Date(post.date), { addSuffix: true })

  return (
    <Card className={`w-full h-full flex flex-col ${post.isNew ? "ring-2 ring-primary ring-offset-2" : ""}`}>
      <div className="relative">
        {post.isNew && <Badge className="absolute top-2 right-2 z-10">New</Badge>}
        <div className="h-48 bg-muted overflow-hidden">
          {isImage ? (
            <img
              src={post.url || "/placeholder.svg"}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=200&width=400"
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <ExternalLink className="h-12 w-12 text-primary/40" />
            </div>
          )}
        </div>
      </div>
      <CardContent className="flex-grow p-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">{post.subreddit}</Badge>
          <span>•</span>
          <span>by {post.author}</span>
        </div>
        <h3 className="font-bold line-clamp-2 mb-2">{post.title}</h3>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{timeAgo}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 border-t mt-auto">
        <div className="flex justify-between w-full text-sm">
          <div className="flex items-center">
            <ArrowUpIcon className="h-4 w-4 mr-1 text-primary" />
            <span>{post.score}</span>
          </div>
          <div className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>{post.num_comments}</span>
          </div>
          <a
            href={`https://reddit.com${post.permalink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center"
          >
            View <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
      </CardFooter>
    </Card>
  )
}

function PostCarousel({ posts }: { posts: RedditPost[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const postsPerPage = 3;
    const totalPages = Math.ceil(posts.length / postsPerPage);
  
    const nextPage = () => {
      if (currentIndex < totalPages - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    };
  
    const prevPage = () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    };
  
    const currentPosts = posts.slice(currentIndex * postsPerPage, (currentIndex + 1) * postsPerPage);
  
    if (posts.length === 0) {
      return <p className="text-center text-muted-foreground">No posts available.</p>;
    }
  
    return (
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
  
        {posts.length > postsPerPage && (
          <div className="flex justify-center mt-6 space-x-2">
            <Button variant="outline" size="icon" onClick={prevPage} disabled={currentIndex === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center px-4 text-sm text-muted-foreground">
              Page {currentIndex + 1} of {totalPages}
            </div>
            <Button variant="outline" size="icon" onClick={nextPage} disabled={currentIndex === totalPages - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }


  export default function SubredditsPage() {
    const [selectedSubreddit, setSelectedSubreddit] = useState<string>("");
    const [allPosts, setAllPosts] = useState<RedditPost[]>([]);
    const [activeTab, setActiveTab] = useState<string>("all");
    let base_url = "https://simppl-assignment.vercel.app"
    if (process.env.NODE_ENV === "development") {
      base_url = "http://localhost:3000"
    }
  
    const fetchSubredditPosts = async () => {
      if (!selectedSubreddit) {
        console.error("No subreddit selected");
        return;
      }
  
      try {
        const res = await fetch(`${base_url}/api/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subreddits: [selectedSubreddit], limit: 10 }),
        });
  
        if (!res.ok) {
          throw new Error(`Failed to fetch posts: ${res.statusText}`);
        }
  
        const data = await res.json();
        if (data.posts) {
          setAllPosts(data.posts); // Assuming the API returns posts in a `posts` field
        } else {
          console.error("Invalid API response: Missing 'posts' field");
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    };
  
    // Filter posts based on active tab
    const filteredPosts = activeTab === "new"
      ? allPosts.filter((post) => post.isNew) // Show only new posts
      : allPosts; // Show all posts for the "All Posts" tab
  
    // Group posts by subreddit
    const postsBySubreddit = filteredPosts.reduce(
      (acc, post) => {
        if (!acc[post.subreddit]) {
          acc[post.subreddit] = [];
        }
        acc[post.subreddit].push(post);
        return acc;
      },
      {} as Record<string, RedditPost[]>
    );
  
    // Get unique subreddits from posts
    const subredditsInPosts = Object.keys(postsBySubreddit);
  
    return (
      <div className="container mx-auto py-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Subreddit Posts</h1>
          <p className="text-muted-foreground">Browse and explore the latest posts from your favorite subreddits</p>
        </div>
  
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="w-full md:w-64">
            <Select value={selectedSubreddit} onValueChange={(value) => setSelectedSubreddit(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subreddit" />
              </SelectTrigger>
              <SelectContent>
                {availableSubreddits.map((subreddit) => (
                  <SelectItem key={subreddit} value={subreddit}>
                    r/{subreddit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
  
          <Button onClick={fetchSubredditPosts} disabled={!selectedSubreddit}>
            Fetch Latest Posts
          </Button>
  
          <div className="ml-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Posts</TabsTrigger>
                <TabsTrigger value="new">New Posts</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
  
        {allPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet. Select a subreddit and fetch posts to get started.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {subredditsInPosts.map((subreddit) => (
              <div key={subreddit} className="space-y-4">
                <h2 className="text-2xl font-bold">r/{subreddit}</h2>
                <PostCarousel posts={postsBySubreddit[subreddit]} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }