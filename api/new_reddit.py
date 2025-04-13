import os
import json
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.feature_extraction.text import TfidfVectorizer
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk import download
from datetime import datetime
from dotenv import load_dotenv
import networkx as nx
import google.generativeai as genai
from io import BytesIO
import base64

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.0-flash')

def load_reddit_data(path):
    try:
        if path.endswith(".jsonl"):
            records = []
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    try:
                        data = json.loads(line)
                        if "data" in data:
                            records.append(data["data"])
                        else:
                            records.append(data)
                    except json.JSONDecodeError:
                        continue
            return pd.DataFrame(records)
        elif path.endswith(".json"):
            return pd.read_json(path)
        else:
            raise ValueError("Unsupported file format. Use .jsonl or .json")
    except Exception as e:
        print(f"Error loading data from {path}: {e}")
        return pd.DataFrame() 

def preprocess(df):
    try:
        df = df.copy() 
        df["datetime"] = pd.to_datetime(df["created_utc"], unit='s')
        df["text"] = df["title"].fillna("") + " " + df["selftext"].fillna("")
        df["word_count"] = df["text"].apply(lambda x: len(str(x).split()))
        df["domain"] = df["url"].apply(lambda x: x.split('/')[2] if pd.notna(x) and "http" in x else None)
        least_datetime = df["datetime"].min()
        highest_datetime = df["datetime"].max()
        
        print(f"Least Datetime: {least_datetime}")
        print(f"Highest Datetime: {highest_datetime}")
        return df
    except Exception as e:
        print(f"Error preprocessing data: {e}")
        return pd.DataFrame() 

def get_example_posts_by_keyword(df, keyword, max_posts=5):
    try:
        keyword_df = df[df["text"].str.contains(keyword, case=False, na=False)].copy()
        keyword_df = keyword_df.sort_values(by="score", ascending=False).head(max_posts)
        examples = []
        for _, row in keyword_df.iterrows():
            examples.append({
                "author": row["author"],
                "subreddit": row["subreddit"],
                "score": row["score"],
                "title": row["title"],
                "selftext": row["selftext"][:200] + "..." if row["selftext"] else ""
            })
        return examples
        
    except Exception as e:
        print(f"Error getting example posts for keyword '{keyword}': {e}")
        return []

def plot_post_trends(df):
    try:
        posts_per_day = df.groupby(df["datetime"].dt.date).size()
        plt.figure(figsize=(10, 4))
        posts_per_day.plot(kind="line", title="Posts Over Time")
        plt.ylabel("Number of Posts")
        plt.tight_layout()

        buf = BytesIO()
        plt.savefig(buf, format="png")
        plt.close()
        data = base64.b64encode(buf.getbuffer()).decode("ascii")
        with open("post_trends.html", "w", encoding="utf-8") as f:
            f.write(f'<img src="data:image/png;base64,{data}" alt="Post Trends">')
        return plt
    except Exception as e:
        print(f"Error plotting post trends: {e}")
        return None

def plot_top_subreddits(df):
    try:
        top = df["subreddit"].value_counts().head(10)
        plt.figure(figsize=(10, 4))
        sns.barplot(x=top.values, y=top.index)
        plt.title("Top 10 Subreddits by Post Count")
        plt.xlabel("Post Count")
        plt.tight_layout()
        buf = BytesIO()
        plt.savefig(buf, format="png")
        plt.close()
        data = base64.b64encode(buf.getbuffer()).decode("ascii")
        with open("top_subreddits.html", "w", encoding="utf-8") as f:
            f.write(f'<img src="data:image/png;base64,{data}" alt="Top Subreddits">')
        return plt
    except Exception as e:
        print(f"Error plotting top subreddits: {e}")
        return None

def extract_top_links(df, top_n=10):
    try:
        link_df = df[df["url"].notna() & df["url"].str.startswith("http")].copy()
        link_df.loc[:, "domain"] = link_df["url"].apply(lambda x: x.split('/')[2]) 
        return link_df["domain"].value_counts().head(top_n)
    except Exception as e:
        print(f"Error extracting top links: {e}")
        return pd.Series() 

def detect_topics_tfidf(df, top_n=10):
    try:
        vectorizer = TfidfVectorizer(stop_words="english", max_features=1000)
        tfidf = vectorizer.fit_transform(df["text"].fillna(""))
        scores = tfidf.sum(axis=0).A1
        words = vectorizer.get_feature_names_out()
        return pd.DataFrame({"word": words, "score": scores}).sort_values(by="score", ascending=False).head(top_n)
    except Exception as e:
        print(f"Error detecting topics using TF-IDF: {e}")
        return pd.DataFrame()

def time_series_of_topics(df, keyword):
    try:
        df["contains_keyword"] = df["text"].str.contains(keyword, case=False, na=False)
        df["date"] = df["datetime"].dt.date
        return df[df["contains_keyword"]].groupby("date").size()
    except Exception as e:
        print(f"Error generating time series for topic '{keyword}': {e}")
        return pd.Series() 

def summarize_posts_by_keyword(df, keyword, max_posts=10):
    try:
        related_posts = df[df["text"].str.contains(keyword, case=False, na=False)].head(max_posts)
        sample_texts = "\n".join(related_posts["text"].tolist())
        prompt = f"""Perform sentiment analysis of th epost that will be given to you and explain the posts, while 
summarizing the main ideas and tone from these Reddit posts about '{keyword}':{sample_texts}
        """
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error summarizing posts for keyword '{keyword}': {e}")
        return ""

def sentiment_analysis(df):
    try:
        download("vader_lexicon", quiet=True)  # Download only if not already present
        sia = SentimentIntensityAnalyzer()
        df["sentiment"] = df["text"].apply(lambda x: sia.polarity_scores(str(x))["compound"])
        return df
    except Exception as e:
        print(f"Error performing sentiment analysis: {e}")
        return df # Return the original DataFrame in case of an error

def summarize_insights(df, keywords_df, top_domains, top_subreddits, prominent_link, spike_day):
    try:
        num_posts = len(df)
        avg_sentiment = df["sentiment"].mean()
        keyword_list = keywords_df["word"].tolist()[:3] if 'word' in keywords_df.columns else []

        crossposting_matrix = subreddit_crossposting_network(df)
        crossposting_summary = (
            f"Subreddit cross-posting network generated with {crossposting_matrix.shape[0]} users and "
            f"{crossposting_matrix.shape[1]} subreddits."
            if not crossposting_matrix.empty else "No significant cross-posting activity detected."
        )

        domain_counts = top_domains_by_subreddit(df)
        domain_summary = (
            f"Top domains by subreddit calculated for {domain_counts.shape[0]} subreddits."
            if not domain_counts.empty else "No significant domain sharing detected."
        )

        # Flashpoint summary
        flashpoint_summary = (
            f"A flashpoint day with unusually high posting activity was detected on {spike_day}."
            if spike_day else "No flashpoint day detected."
        )

        return f"""
        The dataset contains {num_posts} posts with an average sentiment of {avg_sentiment:.2f}.
        Key topics include {', '.join(keyword_list)}.
        Top subreddits are {', '.join(top_subreddits)} and top domains include {', '.join(top_domains)}.
        {crossposting_summary}
        {domain_summary}
        {flashpoint_summary}
        """
    except Exception as e:
        print(f"Error in summarize_insights: {e}")
        return "Error generating summary."


def get_top_authors(df, top_n=20):
    try:
        return df['author'].value_counts().head(top_n)
    except Exception as e:
        print(f"Error getting top authors: {e}")
        return pd.Series() 

def author_stats(df):
    try:
        return (
            df.groupby('author')
            .agg(post_count=('author', 'count'),
                 avg_score=('score', 'mean'),
                 avg_comments=('num_comments', 'mean'),
                 subreddits=('subreddit', pd.Series.nunique))
            .sort_values('post_count', ascending=False)
        )
    except Exception as e:
        print(f"Error calculating author stats: {e}")
        return pd.DataFrame() 

def build_author_copost_network(df, min_shared_urls=2):
    try:
        from collections import Counter
        url_authors = df.groupby('url')['author'].unique()
        edge_counter = Counter()
        for authors in url_authors:
            for i in range(len(authors)):
                for j in range(i+1, len(authors)):
                    pair = tuple(sorted((authors[i], authors[j])))
                    edge_counter[pair] += 1

        G = nx.Graph()
        for (a1, a2), weight in edge_counter.items():
            if weight >= min_shared_urls:
                G.add_edge(a1, a2, weight=weight)
        return G
    except Exception as e:
        print(f"Error building author co-post network: {e}")
        return nx.Graph()  

def plot_top_authors(df, top_n=20):
    try:
        top = get_top_authors(df, top_n)
        plt.figure(figsize=(8,6))
        top.plot(kind='barh', title=f'Top {top_n} Authors by Post Count')
        plt.gca().invert_yaxis()
        plt.tight_layout()
        buf = BytesIO()
        plt.savefig(buf, format="png")
        plt.close()
        data = base64.b64encode(buf.getbuffer()).decode("ascii")
        with open("top_authors.html", "w", encoding="utf-8") as f:
            f.write(f'<img src="data:image/png;base64,{data}" alt="Top Authors">')
        return plt
    except Exception as e:
        print(f"Error plotting top authors: {e}")
        return None

def plot_author_network(G, num_nodes=50):
    try:
        degrees = dict(G.degree())
        top_nodes = sorted(degrees, key=degrees.get, reverse=True)[:num_nodes]
        H = G.subgraph(top_nodes)
        plt.figure(figsize=(10, 10))
        pos = nx.spring_layout(H, k=0.5)
        nx.draw_networkx_nodes(H, pos, node_size=[degrees[n]*50 for n in H.nodes()])
        nx.draw_networkx_edges(H, pos, alpha=0.3)
        nx.draw_networkx_labels(H, pos, font_size=8)
        plt.axis('off')
        plt.tight_layout()
        buf = BytesIO()
        plt.savefig(buf, format="png")
        plt.close()
        data = base64.b64encode(buf.getbuffer()).decode("ascii")
        with open("author_network.html", "w", encoding="utf-8") as f:
            f.write(f'<img src="data:image/png;base64,{data}" alt="Author Network">')
        return plt
    except Exception as e:
        print(f"Error plotting author network: {e}")
        return None

def rise_of_topic_across_communities(df, keyword):
    try:
        df = df.copy() # Avoid modifying the original DataFrame
        df["date"] = df["datetime"].dt.date
        df["contains_keyword"] = df["text"].str.contains(keyword, case=False, na=False)
        grouped = df[df["contains_keyword"]].groupby(["date", "subreddit"]).size().unstack(fill_value=0)

        plt.figure(figsize=(12, 5))
        grouped.plot(figsize=(12, 5), title=f"Mentions of '{keyword}' Across Subreddits Over Time")
        plt.ylabel("Mentions")
        plt.tight_layout()

        buf = BytesIO()
        plt.savefig(buf, format='png')
        plt.close()
        data = base64.b64encode(buf.getbuffer()).decode('ascii')
        return f'<img src="data:image/png;base64,{data}" alt="Topic rise across communities">'
    except Exception as e:
        print(f"Error in rise_of_topic_across_communities for '{keyword}': {e}")
        return "Error generating plot."

def sentiment_shift_around_keyword(df, keyword):
    try:
        df = df.copy() 
        df["contains_keyword"] = df["text"].str.contains(keyword, case=False, na=False)
        keyword_df = df[df["contains_keyword"]].copy()  
        keyword_df.loc[:, "week"] = keyword_df["datetime"].dt.to_period("W").apply(lambda r: r.start_time)  # Use .loc
        sentiment_by_week = keyword_df.groupby("week")["sentiment"].mean()
        plt.figure(figsize=(10, 4))
        sentiment_by_week.plot(kind='line', title=f"Sentiment Over Time for '{keyword}'")
        plt.ylabel("Average Sentiment")
        plt.tight_layout()

        buf = BytesIO()
        plt.savefig(buf, format='png')
        plt.close()
        data = base64.b64encode(buf.getbuffer()).decode('ascii')
        return f'<img src="data:image/png;base64,{data}" alt="Sentiment shift around keyword">'
    except Exception as e:
        print(f"Error in sentiment_shift_around_keyword for '{keyword}': {e}")
        return "Error generating plot."

def compare_sentiment_by_link(df, link_keyword):
    try:
        link_df = df[df["url"].str.contains(link_keyword, na=False, case=False)].copy()
        grouped = link_df.groupby("subreddit")["sentiment"].mean().sort_values(ascending=False)
        plt.figure(figsize=(10, 4))
        grouped.plot(kind='bar', title=f"Sentiment by Subreddit for link: '{link_keyword}'")
        plt.ylabel("Average Sentiment")
        plt.tight_layout()

        buf = BytesIO()
        plt.savefig(buf, format='png')
        plt.close()
        data = base64.b64encode(buf.getbuffer()).decode('ascii')
        return link_df, f'<img src="data:image/png;base64,{data}" alt="Sentiment by subreddit for link">'
    except Exception as e:
        print(f"Error in compare_sentiment_by_link for '{link_keyword}': {e}")
        return pd.DataFrame(), "Error generating plot."

def power_users_narrative(df, top_n=5):
    try:
        top_authors = df["author"].value_counts().head(top_n).index.tolist()
        author_topics = {}
        for author in top_authors:
            posts = df[df["author"] == author].sort_values(by="score", ascending=False).head(3)
            examples = "\n".join([f"- *{p['title']}* in r/{p['subreddit']} (↑ {p['score']})" for _, p in posts.iterrows()])
            author_topics[author] = examples
        return author_topics
    except Exception as e:
        print(f"Error in power_users_narrative: {e}")
        return {}

def subreddit_crossposting_network(df, min_subs=2):
    try:
        user_subs = df.groupby("author")["subreddit"].nunique()
        crossover_users = user_subs[user_subs >= min_subs].index.tolist()
        cross_df = df[df["author"].isin(crossover_users)]
        matrix = pd.crosstab(cross_df["author"], cross_df["subreddit"])
        return matrix
    except Exception as e:
        print(f"Error in subreddit_crossposting_network: {e}")
        return pd.DataFrame()

def detect_flashpoints(df):
    try:
        df = df.copy()
        df["date"] = df["datetime"].dt.date
        post_counts = df.groupby("date").size()
        if post_counts.empty:
            return None, pd.DataFrame()
        spike_day = post_counts.idxmax()
        spike_df = df[df["date"] == spike_day].sort_values(by="score", ascending=False).head(5)
        return spike_day, spike_df
    except Exception as e:
        print(f"Error in detect_flashpoints: {e}")
        return None, pd.DataFrame()

def top_domains_by_subreddit(df):
    try:
        df = df[df["domain"].notna()]
        domain_counts = df.groupby("subreddit")["domain"].value_counts().unstack(fill_value=0)
        return domain_counts
    except Exception as e:
        print(f"Error in top_domains_by_subreddit: {e}")
        return pd.DataFrame()



# def controversial_posts(df, top_n=5):
#     try:
#         df = df.copy()  # Avoid modifying the original DataFrame

#         # Ensure necessary columns exist, providing default values if missing
#         required_columns = ["num_comments", "score", "author", "subreddit", "title", "selftext", "url"]
#         for col in required_columns:
#             if col not in df.columns:
#                 print(f"Warning: Column '{col}' missing in DataFrame. Providing default value.")
#                 if col in ["score", "num_comments"]:
#                     df[col] = 0  # Default numeric value
#                 else:
#                     df[col] = ""  # Default string value


#         # Calculate controversy
#         df["controversy"] = df["num_comments"] / (df["score"] + 1)


#         # Sort by controversy and get top N
#         controversial = df.sort_values(by="controversy", ascending=False)

#         #Remove duplicate posts by title
#         controversial = controversial.drop_duplicates(subset=["title"], keep="first")


#         controversial = controversial.head(top_n)

#         results = [] #create results
#         # Iterate through the top posts and print information
#         for index, post in controversial.iterrows():
#             result = {
#             "id": index,
#             "title": post["title"],
#             "upvoteRatio": post["score"] / (post["score"] + post["num_comments"]) if (post["score"] + post["num_comments"]) > 0 else 0, # Calculate upvote ratio
#             "comments": post["num_comments"],
#             "selfText": post["selftext"],
#             "subreddit": post["subreddit"],
#             "authorName": post["author"],
#             "url": post.get("url", "URL not available") # Handles cases where url column is missing.
#               }
#             print("-------------------- Controversial Post --------------------")
#             print(f"ID: {result['id']}") #show id
#             print(f"Title: {result['title']}") #show title
#             print(f"Author: {result['authorName']}") #show Author
#             print(f"Subreddit: {result['subreddit']}") #show subreddit
#             print(f"Upvote Ratio: {result['upvoteRatio']:.2f}") #show UpvoteRatio
#             print(f"Comments: {result['comments']}") #show Comments
#             print(f"Selftext: {result['selfText']}")  #show Selftext
#             print(f"URL: {result['url']}") # show url
#             results.append(result)

#         return results

#     except Exception as e:
#         print(f"Error in controversial_posts: {e}")
#         return [] #ensure returns proper type upon error

# def controversial_posts(df, top_n=5):
#     try:
#         df = df.copy()
#         df["controversy"] = df["num_comments"] / (df["score"] + 1)
#         controversial = df.sort_values(by="controversy", ascending=False).head(top_n)
#         return controversial[["author", "subreddit", "score", "num_comments", "title", "selftext"]]
#     except Exception as e:
#         print(f"Error in controversial_posts: {e}")
#         return pd.DataFrame()


def controversial_posts(df, top_n=5):


    try:
        df = df.copy() 

        required_columns = ["num_comments", "score", "author", "subreddit", "title", "selftext", "url"]
        for col in required_columns:
            if col not in df.columns:
                print(f"Warning: Column '{col}' missing in DataFrame. Providing default value.")
                if col in ["score", "num_comments"]:
                    df[col] = 0  
                else:
                    df[col] = ""  


        # Calculate controversy
        df["controversy"] = df["num_comments"] / (df["score"] + 1)


        controversial = df.sort_values(by="controversy", ascending=False)

        controversial = controversial.drop_duplicates(subset=["title"], keep="first")


        controversial = controversial.head(top_n)

        results = [] 
        for index, post in controversial.iterrows():
            result = {
            "id": index,
            "title": post["title"],
            "upvoteRatio": post["score"] / (post["score"] + post["num_comments"]) if (post["score"] + post["num_comments"]) > 0 else 0, # Calculate upvote ratio
            "comments": post["num_comments"],
            "selfText": post["selftext"],
            "subreddit": post["subreddit"],
            "authorName": post["author"],
            "url": post.get("url", "URL not available") # Handles cases where url column is missing.
              }
            print("-------------------- Controversial Post --------------------")
            print(f"ID: {result['id']}") 
            print(f"Title: {result['title']}") 
            print(f"Author: {result['authorName']}")
            print(f"Subreddit: {result['subreddit']}") 
            print(f"Upvote Ratio: {result['upvoteRatio']:.2f}") 
            print(f"Comments: {result['comments']}") 
            print(f"Selftext: {result['selfText']}")
            print(f"URL: {result['url']}") 
            results.append(result)

        return results

    except Exception as e:
        print(f"Error in controversial_posts: {e}")
        return [] 

def generate_narrative_story_with_examples(df, keywords_df, top_domains, top_subreddits, model):
    try:
        keyword_list = keywords_df["word"].tolist()[:3]  

        crossposting_matrix = subreddit_crossposting_network(df)
        crossposting_summary = (
            f"Subreddit cross-posting network generated with {crossposting_matrix.shape[0]} users and "
            f"{crossposting_matrix.shape[1]} subreddits."
            if not crossposting_matrix.empty else "No significant cross-posting activity detected."
        )

        domain_counts = top_domains_by_subreddit(df)
        domain_summary = (
            f"Top domains by subreddit calculated for {domain_counts.shape[0]} subreddits."
            if not domain_counts.empty else "No significant domain sharing detected."
        )

        spike_day, spike_posts = detect_flashpoints(df)
        if spike_day:
            print(f"Flashpoint detected on {spike_day}.")
        flashpoint_summary = (
            f"A flashpoint day with unusually high posting activity was detected on {spike_day}."
            if spike_day else "No flashpoint day detected."
        )

        prompt = f"""
        You are a digital culture analyst. Analyze the following Reddit data and produce a compelling narrative.

        **Timeframe:** {df['datetime'].min().date()} – {df['datetime'].max().date()}
        **Top Subreddits:** {', '.join(top_subreddits)}
        **Top Keywords:** {', '.join(keyword_list)}
        **Top Domains:** {', '.join(top_domains)}

        **Dataset Insight Summary:**
        {crossposting_summary}
        {domain_summary}
        {flashpoint_summary}

        **Instructions:**
        Write a story in 4-5 paragraphs:
        - Explain the themes driving the discourse
        - Identify patterns of trust/distrust in external sources
        - Mention subreddit influence if relevant
        - Highlight tone shifts or controversy
        - End with a reflective insight on what this tells us about Reddit culture
        """

        response = model.generate_content(prompt)
        return response.text if hasattr(response, 'text') else str(response)

    except Exception as e:
        print(f"An error occurred in generate_narrative_story_with_examples: {e}")
        return "Error generating narrative."


def test_unused_functions(df):
    try:
        # Test time_series_of_topics
        print("\nTesting time_series_of_topics...")
        keyword = "example_keyword"
        time_series = time_series_of_topics(df, keyword)
        print(time_series)

        print("\nTesting summarize_posts_by_keyword...")
        summary = summarize_posts_by_keyword(df, keyword, max_posts=5)
        print(summary)

        print("\nTesting sentiment_shift_around_keyword...")
        sentiment_shift_plot = sentiment_shift_around_keyword(df, keyword)
        print(sentiment_shift_plot)

        print("\nTesting compare_sentiment_by_link...")
        link_keyword = "example.com"
        sentiment_by_link, sentiment_plot = compare_sentiment_by_link(df, link_keyword)
        print(sentiment_by_link)
        print(sentiment_plot)

        print("\nTesting power_users_narrative...")
        power_users = power_users_narrative(df, top_n=3)
        print(power_users)

        print("\nTesting rise_of_topic_across_communities...")
        topic_rise_plot = rise_of_topic_across_communities(df, keyword)
        print(topic_rise_plot)

    except Exception as e:
        print(f"Error testing unused functions: {e}")

def main():
    try:
        df = load_reddit_data("reddit_data.jsonl")
        if df.empty:
            print("Aborting due to empty DataFrame after loading.")
            return

        df = preprocess(df)
        if df.empty:
            print("Aborting due to empty DataFrame after preprocessing.")
            return

        plot_post_trends(df)
        plot_top_subreddits(df)

        test_unused_functions(df)
        top_links = extract_top_links(df)
        keywords_df = detect_topics_tfidf(df)
        df = sentiment_analysis(df)

        plot_top_authors(df)
        G = build_author_copost_network(df)
        plot_author_network(G)
        for kw in keywords_df["word"].head(3):
            get_example_posts_by_keyword(df, kw)

        try:
            top_links_list = top_links.index.tolist() if not top_links.empty else []
            top_subreddits_list = df["subreddit"].value_counts().head(5).index.tolist()

            spike_day ="2024-01-01"
            if not top_links_list:
                prominent_link = "example.com"
            else:
                prominent_link = top_links_list[0]

            spike_day_safe = "2024-01-01"
            spike_day, spike_posts = detect_flashpoints(df)
            if spike_day is None:
                spike_day = spike_day_safe
            summary = summarize_insights(df, keywords_df, top_links_list, top_subreddits_list, prominent_link, spike_day) #needs to be defined
            narrative = generate_narrative_story_with_examples(df, keywords_df, top_links_list, top_subreddits_list, model) #needs to be defined
        except Exception as e:
            print(f"Gemini integration error: {e}")
            summary = "Gemini summary failed."
            narrative = "Gemini narrative generation failed."

        try:
            with open("gemini_summary.txt", "w", encoding="utf-8") as f:
                f.write(str(summary)) 
        except Exception as e:
            print(f"Error saving Gemini summary: {e}")

        try:
            with open("narrative_story_with_examples.txt", "w", encoding="utf-8") as f:
                f.write(str(narrative)) 
        except Exception as e:
            print(f"Error saving narrative story: {e}")

        results = controversial_posts(df, top_n=5)
        
        if results:
            print("Successfully processed controversial posts.")
        else:
            print("No controversial posts found or error occurred.")


        # print("\nAnalysis complete. Results saved:\n- post_trends.html\n- top_subreddits.html\n- top_authors.html\n- author_network.html\n- gemini_summary.txt\n- narrative_story_with_examples.txt")

    except Exception as e:
        print(f"A critical error occurred: {e}")

if __name__ == "__main__":
    main()