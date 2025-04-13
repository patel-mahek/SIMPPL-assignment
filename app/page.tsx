"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Button } from "@/components/ui/button"

// Define the types for your data
interface AccountData {
  name: string
  posts: number
  comments: number
  upvotes: number
}

interface MonthlyTrend {
  month: string
  keyword: string
  count: number
}

interface MisleadingPost {
  id: number
  title: string
  upvoteRatio: number
  comments: number
  selfText: string
  subreddit: string
  authorName: string
  url: string
}

const initialAccountsData: AccountData[] = [
  {
    name: "Anarchism",
    posts: 886,
    comments: 15117,
    upvotes: 121695,
  },
  {
    name: "Conservative",
    posts: 979,
    comments: 69231,
    upvotes: 333468,
  },
  {
    name: "Liberal",
    posts: 984,
    comments: 50039,
    upvotes: 151505,
  },
  {
    name: "Political Discussion",
    posts: 116,
    comments: 26850,
    upvotes: 19197,
  },
  {
    name: "Republican",
    posts: 853,
    comments: 25040,
    upvotes: 68947,
  },
  {
    name: "Democrats",
    posts: 931,
    comments: 81172,
    upvotes: 863439,
  },
  {
    name: "Neoliberal",
    posts: 991,
    comments: 190438,
    upvotes: 201210,
  },
  {
    name: "Politics",
    posts: 988,
    comments: 121003,
    upvotes: 1390458,
  },
  {
    name: "Socialism",
    posts: 960,
    comments: 13144,
    upvotes: 184622,
  },
  {
    name: "World Politics",
    posts: 989,
    comments: 8020,
    upvotes: 85837,
  },
]

const initialMonthlyTrends: MonthlyTrend[] = [
    // 2024-10
    { month: "2024-10", keyword: "Day", count: 3 },
    { month: "2024-10", keyword: "Trump", count: 17 },
    { month: "2024-10", keyword: "President", count: 1 },
  
    // 2024-11
    { month: "2024-11", keyword: "People", count: 10 },
    { month: "2024-11", keyword: "Day", count: 42 },
    { month: "2024-11", keyword: "Trump", count: 55 },
    { month: "2024-11", keyword: "Administration", count: 7 },
    { month: "2024-11", keyword: "Government", count: 3 },
    { month: "2024-11", keyword: "Democrats", count: 6 },
    { month: "2024-11", keyword: "Musk", count: 5 },
    { month: "2024-11", keyword: "Elon", count: 2 },
    { month: "2024-11", keyword: "President", count: 2 },
  
    // 2024-12
    { month: "2024-12", keyword: "Day", count: 63 },
    { month: "2024-12", keyword: "President", count: 4 },
    { month: "2024-12", keyword: "Trump", count: 35 },
    { month: "2024-12", keyword: "People", count: 14 },
    { month: "2024-12", keyword: "Democrats", count: 6 },
    { month: "2024-12", keyword: "Government", count: 5 },
    { month: "2024-12", keyword: "Musk", count: 7 },
    { month: "2024-12", keyword: "Elon", count: 6 },
    { month: "2024-12", keyword: "Administration", count: 2 },
  
    // 2025-01
    { month: "2025-01", keyword: "Trump", count: 330 },
    { month: "2025-01", keyword: "President", count: 55 },
    { month: "2025-01", keyword: "Day", count: 105 },
    { month: "2025-01", keyword: "Government", count: 33 },
    { month: "2025-01", keyword: "People", count: 68 },
    { month: "2025-01", keyword: "Musk", count: 26 },
    { month: "2025-01", keyword: "Elon", count: 26 },
    { month: "2025-01", keyword: "Democrats", count: 45 },
    { month: "2025-01", keyword: "Administration", count: 21 },
    { month: "2025-01", keyword: "Doge", count: 1 },
  
    // 2025-02
    { month: "2025-02", keyword: "Trump", count: 1400 },
    { month: "2025-02", keyword: "Musk", count: 326 },
    { month: "2025-02", keyword: "Day", count: 212 },
    { month: "2025-02", keyword: "President", count: 166 },
    { month: "2025-02", keyword: "Administration", count: 148 },
    { month: "2025-02", keyword: "People", count: 117 },
    { month: "2025-02", keyword: "Elon", count: 210 },
    { month: "2025-02", keyword: "Democrats", count: 161 },
    { month: "2025-02", keyword: "Government", count: 136 },
    { month: "2025-02", keyword: "Doge", count: 251 },
  ];

const initialMisleadingPosts: MisleadingPost[] = [
  {
    id: 1,
    title: "Discussion Thread",
    upvoteRatio: 0.49,
    comments: 13242,
    selfText:
      "The [discussion thread](https://neoliber.al/dt) is for casual and off-topic conversation that doesn't merit its own submission. If you've got a good meme, article, or question, please post it outside the DT. Meta discussion is allowed, but if you want to get the attention of the mods, make a post in /r/metaNL ^^^^^^^^^^^^^^^^[](https://i.imgur.com/cu8BHQU.png)\r\n\r\n## Announcements\r\n\r\n* The charity drive has concluded! [See our wrap-up thread here](https://www.reddit.com/r/neoliberal/comments/1i8zicf/subreddits_against_malaria_2024_wrapup/). If you're waiting on a donation incentive, please [send us a modmail](https://www.reddit.com/message/compose/?to=/r/neoliberal)\r\n\r\n## Links\r\n\r\n[Ping Groups](https://reddit.com/r/neoliberal/wiki/user_pinger_2) | [Ping History](https://neoliber.al/user_pinger_2/history.html) | [Mastodon](https://mastodo.neoliber.al/) | [CNL Chapters](https://cnliberalism.org/our-chapters) | [CNL Event Calendar](https://cnliberalism.org/events)\n\n## Upcoming Events\n\n* Feb 06: [Austin New Liberals February Social](https://cnliberalism.org/events/austin-new-liberals-february-social)",
    subreddit: "r/neoliberal",
    authorName: "jobautomator",
    url: "https://www.reddit.com/r/neoliberal/comments/1igjc8p/discussion_thread/",
  },
  {
    id: 2,
    title: "Why are so many Americans in favor of illegal immigration and opposed to deportation?",
    upvoteRatio: 0.00,
    comments: 269,
    selfText:
      "The rhetoric and ideologies around illegal immigration seem to have taken a major shift in recent years, especially among the left.Immigration was a bipartisan issue at one point in time, including under the Obama administration, with the common agreement being that those who enter the country illegally get deported. This is also the accepted norm and law of the land in many other countries around the world.This seems to be a relatively new perspective for America. What caused this dramatic shift? And why are so many Americans opposed to mass deportations an in favor of undocumented immigration or support open borders altogether?",
    subreddit: "r/PoliticalDiscussion",
    authorName: "hoochie69mama",
    url: "https://www.reddit.com/r/PoliticalDiscussion/comments/1igcohj/why_are_so_many_americans_in_favor_of_illegal/",
  },
  {
    id: 3,
    title: "Have Democrats Given Up On Men?",
    upvoteRatio: 0.00,
    comments: 155,
    selfText:
      "I was pondering over the results of this election and wondering why so many young men are voting for the conservative party these days.I came across this article from 2024 and it really made me think Have Democrats Given Up on Men? - The Survey Center on American Life https://www.americansurveycenter.org/newsletter/have-democrats-given-up-on-men/When you look at the Democratic Party home page for 'Who They Serve', they include Women specifically and exclude Men, outside of certain groupings that include them.democrats.org/who-we-are/who-we-serve/ I'm curious what people have to say on this topic and will save my personal opinions for the comment section. Is it a wise thing for Democrats to bank on the morality of a large portion of the population rather than showing direct support, to gain votes?",
    subreddit: "r/PoliticalDiscussion",
    authorName: "DramaticErraticism",
    url: "https://www.reddit.com/r/PoliticalDiscussion/comments/1ifhlj1/have_democrats_given_up_on_men/",
  },
  {
    id: 4,
    title: "More Democrats want to see party push to the political middle in wake of election looses",
    upvoteRatio: 0.00,
    comments: 140,
    selfText:
      "The announcement fails to mention that the test was conducted under very specific conditions with carefully selected questions, and independent experts have not verified the claims.",
    subreddit: "r/politics",
    authorName: "promocodebaby",
    url: "https://www.reddit.com/r/politics/comments/1ipl2nl/more_democrats_want_to_see_party_push_to_the/",
  },
  {
    id: 5,
    title: "How is Musk's DOGE team in 2025 different from Obama's young staffers in 2009?",
    upvoteRatio: 0.00,
    comments: 208,
    selfText:
      "In recent weeks since Trump came back into the presidency, much of the political commentary, especially angst on the part of the left, is directed toward Elon Musk's DOGE team of young engineers accessing various governmental agencies with the approval of Trump. The goal is supposedly to root out inefficiencies and eliminated programs and policies that are contrary to Trump's executive orders. A lot of the attention has been focused on how young and inexperienced these techies are and how they might not understand what they are doing to the inner workings of the departments they are reviewing.Back in 2009, after Barack Obama came into office, a much different media environment existed where the flock of young staffers, policy gurus and even techies from what was then a mostly Democratic Silicon Valley, were praised and given supportive backing by many of the same journalist outlets. The profiles were largely about how these eager college grads would transform government and bring it into the 21st century while also repudiating anything under the then despised outgoing president George W. Bush.Why do you think the attention on the young cohort of government whiz kids is so different from today under Trump than it was under Obama? Is it just partisan bias? What similarities and differences are there between the two? How have Republicans and Democrats reacted in both cases? Is the media treatment fair or just shaped by different environments (social media now v. traditional media with a hint of social then)?",
    subreddit: "r/PoliticalDiscussion",
    authorName: "TaylorSwiftian",
    url: "https://www.reddit.com/r/PoliticalDiscussion/comments/1ik59zs/how_is_musks_doge_team_in_2025_different_from/",
  },
]


const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"]

function MisleadingPostCard() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [misleadingPosts, setMisleadingPosts] = useState<MisleadingPost[]>(initialMisleadingPosts);

  const nextPost = () => {
    setCurrentIndex((prevIndex) => (prevIndex === misleadingPosts.length - 1 ? 0 : prevIndex + 1))
  }

  const prevPost = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? misleadingPosts.length - 1 : prevIndex - 1))
  }

  const post = misleadingPosts[currentIndex]

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="bg-muted/50 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Misleading Post Analysis</CardTitle>
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} of {misleadingPosts.length}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold line-clamp-2">{post.title}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="text-sm bg-secondary px-2 py-1 rounded-md">{post.subreddit}</div>
              <div className="text-sm bg-secondary px-2 py-1 rounded-md">by {post.authorName}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-2">
            <div className="text-center">
              <div className="text-2xl font-bold">{post.upvoteRatio * 100}%</div>
              <div className="text-xs text-muted-foreground">Upvote Ratio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{post.comments}</div>
              <div className="text-xs text-muted-foreground">Comments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {post.upvoteRatio > 0.8 ? "High" : post.upvoteRatio > 0.7 ? "Medium" : "Low"}
              </div>
              <div className="text-xs text-muted-foreground">Credibility</div>
            </div>
          </div>

          <div className="bg-muted/30 p-3 rounded-md">
            <p className="text-sm line-clamp-4">{post.selfText}</p>
          </div>

          <div className="text-sm truncate">
            <span className="text-muted-foreground">Source: </span>
            <a href={post.url} className="text-primary hover:underline truncate">
              {post.url}
            </a>
          </div>
        </div>
      </CardContent>
      <div className="flex border-t">
        <Button variant="ghost" className="flex-1 rounded-none h-12" onClick={prevPost}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-4 w-4"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Previous
        </Button>
        <div className="w-px bg-border h-12" />
        <Button variant="ghost" className="flex-1 rounded-none h-12" onClick={nextPost}>
          Next
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-2 h-4 w-4"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Button>
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const [metricType, setMetricType] = useState<"posts" | "comments" | "upvotes">("posts")
  const [chartType, setChartType] = useState<"bar" | "pie">("bar")
  const [accountsData, setAccountsData] = useState<AccountData[]>(initialAccountsData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>(initialMonthlyTrends)
  const [filteredKeywords, setFilteredKeywords] = useState<MonthlyTrend[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>("")

  // Prepare data for pie chart
  const pieData = accountsData.map((item) => ({
    name: item.name,
    value: item[metricType],
  }))

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const [engagementRes, trendsRes] = await Promise.all([
  //         fetch("http://127.0.0.1:8000/engagement-metrics"),
  //         fetch("http://127.0.0.1:8000/trending-keyword-counts")
  //       ])
  
  //       if (!engagementRes.ok || !trendsRes.ok) throw new Error("Failed to fetch data")
  
  //       const engagementData = await engagementRes.json()
  //       const trendsData = await trendsRes.json()
  
  //       // Convert engagement data to array format
  //       const formattedEngagement = Object.entries(engagementData).map(([name, values]) => ({
  //         name,
  //         ...values,
  //       }))
  //       setMonthlyTrends(trendsData)
  //         if (trendsData.length > 0) {
  //           setSelectedMonth(trendsData[0].month) // Default to first available month
  //         }
  //       setAccountsData(formattedEngagement)
  //     } catch (err) {
  //       setError(err.message)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }
  
  //   fetchData()
  // }, [])

  

  useEffect(() => {
    if (selectedMonth) {
      const filtered = monthlyTrends.filter((item) => item.month === selectedMonth)
      setFilteredKeywords(filtered)
    }
  }, [selectedMonth, monthlyTrends])
  

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>


  return (
    <div className="container mx-auto py-6 space-y-6">

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Posts</CardTitle>
            <CardDescription>Number of posts across all accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">8677</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Comments</CardTitle>
            <CardDescription>Number of comments across all accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">600054</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Upvotes</CardTitle>
            <CardDescription>Number of upvotes across all accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">3240378</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-right gap-2">
          <div className="w-40">
            <Select value={metricType} onValueChange={(value) => setMetricType(value as "posts" | "comments" | "upvotes")}>
              <SelectTrigger>
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="posts">Posts</SelectItem>
                <SelectItem value="comments">Comments</SelectItem>
                <SelectItem value="upvotes">Upvotes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <Select value={chartType} onValueChange={(value) => setChartType(value as "bar" | "pie")}>
              <SelectTrigger>
                <SelectValue placeholder="Chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Account {metricType.charAt(0).toUpperCase() + metricType.slice(1)} Comparison</CardTitle>
          <CardDescription>Compare {metricType} across different accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            {chartType === "bar" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={accountsData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={metricType} fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {chartType === "pie" && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} ${metricType}`, ""]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}

          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
      <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Keyword Trends</h1>
          <p className="text-muted-foreground">Analyze trending keywords over time</p>
        </div>
        <div className="w-40">
        <Select value={selectedMonth} onValueChange={(value) => setSelectedMonth(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {Array.from(new Set(monthlyTrends.map((item) => item.month))).map((month) => (
              <SelectItem key={month} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        </div>
      </div>

      <Card className="col-span-full">
        <CardContent>
          <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredKeywords}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="keyword" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>

          </div>
        </CardContent>
      </Card>
    </div>
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Accounts with highest posts</CardDescription>
          </CardHeader>
          <CardContent>
<CardContent>
  <div className="space-y-4">
    <div className="flex items-center">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground mr-3">
        1
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">M_i_c_K</div>
        <div className="h-2 bg-muted rounded-full mt-1">
          <div
            className="h-2 bg-primary rounded-full"
            style={{ width: `${(246 / 246) * 100}%` }}
          />
        </div>
      </div>
      <div className="ml-3 font-medium">246</div>
    </div>
    <div className="flex items-center">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground mr-3">
        2
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">John3262005</div>
        <div className="h-2 bg-muted rounded-full mt-1">
          <div
            className="h-2 bg-primary rounded-full"
            style={{ width: `${(194 / 246) * 100}%` }}
          />
        </div>
      </div>
      <div className="ml-3 font-medium">194</div>
    </div>
    <div className="flex items-center">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground mr-3">
        3
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">Walk1000Miles</div>
        <div className="h-2 bg-muted rounded-full mt-1">
          <div
            className="h-2 bg-primary rounded-full"
            style={{ width: `${(145 / 246) * 100}%` }}
          />
        </div>
      </div>
      <div className="ml-3 font-medium">145</div>
    </div>
    <div className="flex items-center">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground mr-3">
        4
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">Prudent_Bug_1350</div>
        <div className="h-2 bg-muted rounded-full mt-1">
          <div
            className="h-2 bg-primary rounded-full"
            style={{ width: `${(141 / 246) * 100}%` }}
          />
        </div>
      </div>
      <div className="ml-3 font-medium">141</div>
    </div>
    <div className="flex items-center">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground mr-3">
        5
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">Ask4MD</div>
        <div className="h-2 bg-muted rounded-full mt-1">
          <div
            className="h-2 bg-primary rounded-full"
            style={{ width: `${(137 / 246) * 100}%` }}
          />
        </div>
      </div>
      <div className="ml-3 font-medium">137</div>
    </div>
  </div>
</CardContent>
          </CardContent>
        </Card>
      </div>
      <MisleadingPostCard />
    </div>
  )
}