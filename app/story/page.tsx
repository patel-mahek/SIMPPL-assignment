import type { Metadata } from "next"
export const metadata: Metadata = {
  title: "Story | My Website",
  description: "Read my story",
}

export default function StoryPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div
        className="h-[50vh] bg-cover bg-center bg-fixed flex items-center justify-center"
        style={{
          backgroundImage: "url('/bg.jpeg?height=1080&width=1920')",
          backgroundSize: "cover",
        }}
      >
        <div className="bg-black/30 p-8 md:p-12 rounded-lg max-w-5xl text-center">
          <h1 className="text-2xl md:text-5xl font-bold text-white mb-4">The Shifting Sands of Reddit: Politics, Personalities, and the Pursuit of Truth</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <article className="prose prose-lg dark:prose-invert mx-auto">
          <p className="text-xl font-medium">
          The Reddit landscape from late July 2024 through mid-February 2025 reveals a digital battleground dominated by political discourse and polarized communities. With Donald Trump and Elon Musk serving as lightning rods for debate, discussions flowed through ideologically diverse subreddits including "neoliberal," "worldpolitics," "politics," "Liberal," and "socialism." This analysis examines the interplay of news sources, user behavior, and sentiment during this politically charged period.
          </p>


          <h2>Key Figures and Themes</h2>
          <p>
          Trump and Musk emerged as the dominant personalities driving conversations across Reddit's political spectrum. The prevalence of "people" as a top keyword suggests users were particularly concerned with how policies and personalities impact everyday lives. Discussions frequently centered on societal equity, government accountability, and the future of work.
          </p>
          <p>
          These conversations weren't limited to purely political subreddits. For example, Musk's actions with Tesla sparked significant discussion in r/Anarchism, demonstrating how business, politics, and personal influence have become increasingly intertwined in online discourse.
          </p>
{/* 
          <blockquote>"The journey of a thousand miles begins with a single step." - Lao Tzu</blockquote> */}
            <img 
              src="topic_spread_musk.png" 
              alt="musk" 
              className="my-6 mx-auto rounded-lg shadow-lg"
            />

            <img 
              src="topic_spread_people.png" 
              alt="musk" 
              className="my-6 mx-auto rounded-lg shadow-lg"
            />

            <img 
              src="topic_spread_trump.png" 
              alt="musk" 
              className="my-6 mx-auto rounded-lg shadow-lg"
            />

          <h2>Information Sources and Trust</h2>
          <h3> Users relied on a mix of traditional and user-generated content:</h3>
          <p>
Established news outlets (New York Times, The Guardian, Reuters, AP) maintained significant influence, particularly in "neoliberal" and "Liberal" communities
Centrist sources like "thehill.com" suggested some appetite for diverse perspectives
Reddit's own platforms ("reddit.com" and "i.redd.it") and video content ("youtube.com," "youtu.be," "v.redd.it") highlighted the critical role of user-created content, memes, and video clips
          </p>

          <p>            
          This hybrid information ecosystem reflects the complex nature of modern political discourse, where verified reporting mingles with opinion pieces and visual rhetoric. Interestingly, a sentiment analysis of posts linking back to Reddit itself revealed negative sentiment, suggesting users maintain a healthy skepticism about "in-house" opinions.
          </p>

          <h2>Community Dynamics</h2>
          <p>
          The data reveals a Reddit ecosystem functioning less as a forum for open dialogue and more as a collection of ideological echo chambers. The generally neutral-to-negative sentiment score (0.01) across the dataset suggests a baseline cynicism permeating political discussions.
            ligula.
          </p>
          <h3>Power users played crucial roles in shaping community narratives:</h3>
          <img 
              src="top_authors.png" 
              alt="musk" 
              className="my-6 mx-auto rounded-lg shadow-lg"
            />
          <p>
          u/tzaeru, u/campbellscrambles, u/NoBackground7266, u/CrimethInc-Ex-Worker, and u/Salt_Helicopter1982 dominated fringe subreddits
          M_i_c_K, John3262005, Walk1000Miles, Prudent_Bug_1350, and Ask4MD represented opposing sides in more mainstream political forums
          </p>
          <p>Engagement patterns revealed interesting dynamics. For instance, in r/Anarchism, straightforward anti-Trump content received stronger engagement than nuanced posts about nationalism, demonstrating a preference for emotional content over complex analysis.</p>

          <h2>Flashpoint Events</h2>
          <p>
          February 14, 2025 (Valentine's Day) emerged as a significant "flashpoint day" marked by unusually high posting activity. This surge suggests a major event triggered intense debate, though the specific catalyst would require deeper content analysis. The timing—occurring on a traditionally unifying holiday—underscores how political divisions increasingly overshadow shared cultural moments.
          </p>

          <h2>Linguistic Patterns</h2>
          <p>
          Not all political keywords drove equal engagement. While "Trump" and "Musk" reliably sparked discourse, terms like "nationalism" and "anarchism" generated high sentiment but lower discussion rates. This suggests certain ideological concepts, while emotionally charged, don't necessarily serve as conversation starters in the way that polarizing personalities do.
          </p>

          <h2>Conclusion</h2>
          <p>
          This snapshot of Reddit from July 2024 to February 2025 reveals a digital landscape defined by political anxiety, personality cults, and deep ideological divisions. Platform algorithms and community structures appear to reward engagement over nuance, amplifying existing biases rather than challenging them.
          </p>
          <p>
          While Reddit continues to function as a valuable information-sharing platform, this analysis raises important questions about how social media shapes political discourse in an increasingly polarized society. The constant tug-of-war between ideological perspectives creates an environment where emotionally charged content thrives, potentially at the expense of deeper understanding.
          </p>

  
        </article>
      </div>
    </div>
  )
}

