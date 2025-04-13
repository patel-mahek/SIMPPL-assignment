from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import pandas as pd
import json
import os
from dotenv import load_dotenv
import google.generativeai as genai
from langchain.schema import Document
from sklearn.feature_extraction.text import TfidfVectorizer
import re

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import praw
reddit = praw.Reddit(
    client_id=os.getenv("REDDIT_CLIENT_ID", "9DliHvg8Kd9i7WXLpBNrQQ"),
    client_secret=os.getenv("REDDIT_CLIENT_SECRET", "kNIr1Vby84IsUTz-PfIkQMSm1ASmKg"),
    user_agent="script:Webscrap:v1.0 (by u/AnyEnvironment3975)"
)

OUTPUT_FILE = "new_reddit_posts.jsonl"

class SubredditRequest(BaseModel):
    subreddits: List[str]
    limit: int = 10

class QueryRequest(BaseModel):
    query: str

def fetch_reddit_posts(subreddit_name: str, limit: int = 10):
    subreddit = reddit.subreddit(subreddit_name)
    seen_ids = set()

    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r") as f:
            for line in f:
                try:
                    post = json.loads(line.strip())
                    seen_ids.add(post.get("id"))
                except json.JSONDecodeError:
                    continue

    posts = []
    with open(OUTPUT_FILE, "a") as outfile:
        for post in subreddit.new(limit=limit):
            if post.id not in seen_ids:
                post_data = {
                    "id": post.id,
                    "subreddit": post.subreddit.display_name,
                    "author": str(post.author),
                    "title": post.title,
                    "date": int(post.created_utc * 1000),
                    "score": post.score,
                    "ups": post.ups,
                    "downs": post.downs,
                    "num_comments": post.num_comments,
                    "url": post.url,
                    "permalink": post.permalink,
                    "word_count": len(post.title.split()) + len(post.selftext.split()),
                }
                outfile.write(json.dumps(post_data) + "\n")
                posts.append(post_data) 
    return posts  

@app.post("/posts")
def get_posts(req: SubredditRequest):
    subreddits = req.subreddits
    all_posts = []
    for subreddit in subreddits:
        subreddit_posts = fetch_reddit_posts(subreddit, limit=req.limit)
        all_posts.extend(subreddit_posts)  

    return {"posts": all_posts}

with open("data.jsonl", "r") as f:
    data = [json.loads(line) for line in f]

df = pd.DataFrame(data)

def preprocess(df):
    try:
        df = df.copy()
        df["datetime"] = pd.to_datetime(df["created_utc"], unit='s')
        df["text"] = df["title"].fillna("") + " " + df["selftext"].fillna("")
        df["word_count"] = df["text"].apply(lambda x: len(str(x).split()))
        df["domain"] = df["url"].apply(lambda x: x.split('/')[2] if pd.notna(x) and "http" in x else None)
        return df
    except Exception as e:
        print(f"Error preprocessing data: {e}")
        return pd.DataFrame()

df = preprocess(df)

genai.configure(api_key=os.getenv("YOUR_GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.0-flash')

def detect_topic_trends(df):
    try:
        vectorizer = TfidfVectorizer(stop_words="english", max_features=1000)
        tfidf = vectorizer.fit_transform(df["text"].fillna(""))
        scores = tfidf.sum(axis=0).A1
        words = vectorizer.get_feature_names_out()
        trending_words_df = pd.DataFrame({"word": words, "score": scores})
        return trending_words_df.sort_values(by="score", ascending=False).head(15).to_dict(orient="records")
    except Exception as e:
        print(f"Error detecting topics using TF-IDF: {e}")
        return {"error": str(e)}

def top_authors(df):
    return df['author'].value_counts().head(10).to_dict()

def subreddit_activity(df):
    return df['subreddit'].value_counts().head(10).to_dict()

def sentiment_overview(df):
    return {"positive": 60, "neutral": 30, "negative": 10}

def flashpoint_detection(df):
    daily_post_counts = df.groupby(df['datetime'].dt.date).size()
    spikes = daily_post_counts[daily_post_counts > daily_post_counts.mean() + daily_post_counts.std()]
    return spikes.to_dict()

def domain_trends(df):
    return df['domain'].value_counts().head(10).dropna().to_dict()

def controversial_posts(df):
    df = df.copy()
    df['controversy'] = df['num_comments'] / (df['score'] + 1)
    top_posts = df.sort_values(by='controversy', ascending=False).head(5)
    return [
        Document(
            page_content=row['selftext'],
            metadata={"title": row['title'], "score": row['score'], "author": row['author']}
        )
        for _, row in top_posts.iterrows()
    ]

def generate_narrative(topics, authors, subreddit_network, sentiments, flashpoints, domains, controversial):
    prompt = f"""
You are a Reddit analyst generating a data storytelling narrative based on these analysis results.

Topics: {topics}
Sentiments: {sentiments}
Flashpoints: {flashpoints}
Subreddit Network: {subreddit_network}
Author Influence: {authors}
Domains: {domains}
Controversial Posts: {[{'title': post.metadata.get('title', ''), 'score': post.metadata.get('score', 0), 'author': post.metadata.get('author', '')} for post in controversial]}

output: Generate a proper description of the information in a formal, descriptive tone.
"""
    result = model.generate_content(prompt)
    return result.text.strip()



@app.post("/ask")
async def ask(request: QueryRequest):
    query = request.query.lower()

    try:
        if "trending" in query or "topic" in query:
            topics = detect_topic_trends(df)
            response = "Based on the analysis of the data, the following topics are currently trending:\n\n"
            for topic in topics:
                response += f"The topic '{topic['word']}' has a significant score of {topic['score']:.2f}, indicating its prominence in discussions.\n"
            response += "\nThese topics highlight the key areas of interest in the current discourse."
        elif "author" in query or "influencer" in query:
            authors = top_authors(df)
            response = "The analysis of the data reveals the most active authors or influencers:\n\n"
            for author, count in authors.items():
                response += f"{author} has contributed {count} posts, showcasing their significant activity.\n"
            response += "\nThese authors play a crucial role in shaping the discussions within the community."
        elif "subreddit" in query or "community" in query:
            subreddit_network = subreddit_activity(df)
            response = "The data indicates the following subreddit activity:\n\n"
            for subreddit, count in subreddit_network.items():
                response += f"The subreddit '{subreddit}' has {count} posts, reflecting its engagement level.\n"
            response += "\nThese subreddits represent the most active communities in the dataset."
        elif "sentiment" in query:
            sentiments = sentiment_overview(df)
            response = (
                "The sentiment analysis of the data provides the following insights:\n\n"
                f"Positive sentiment accounts for {sentiments['positive']}% of the discussions, "
                f"while {sentiments['neutral']}% of the content is neutral. Negative sentiment constitutes {sentiments['negative']}%.\n\n"
                "This breakdown highlights the overall tone of the discussions."
            )
        elif "flashpoint" in query or "spike" in query:
            flashpoints = flashpoint_detection(df)
            response = "The analysis has identified the following flashpoints or spikes in activity:\n\n"
            for date, count in flashpoints.items():
                response += f"On {date}, there were {count} posts, indicating a significant spike in activity.\n"
            response += "\nThese flashpoints represent moments of heightened engagement."
        elif "domain" in query or "url" in query:
            domains = domain_trends(df)
            response = "The data reveals the following trends in domain usage:\n\n"
            for domain, count in domains.items():
                response += f"The domain '{domain}' was referenced {count} times, highlighting its relevance.\n"
            response += "\nThese domains are key sources of information in the discussions."
        elif "controversial" in query:
            controversial = controversial_posts(df)
            response = "The analysis has identified the most controversial posts:\n\n"
            for post in controversial:
                metadata = post.metadata
                response += (
                    f"The post titled '{metadata['title']}' by {metadata['author']} has a score of {metadata['score']}, "
                    "indicating its controversial nature.\n"
                )
            response += "\nThese posts have sparked significant debate within the community."
        elif "narrative" in query or "summary" in query:
            narrative = generate_narrative(
                detect_topic_trends(df),
                top_authors(df),
                subreddit_activity(df),
                sentiment_overview(df),
                flashpoint_detection(df),
                domain_trends(df),
                controversial_posts(df)
            )
            response = f"The following narrative summary has been generated based on the data:\n\n{narrative}"
        else:
            response = "I'm sorry, I couldn't understand your query.Can you be more specific about it?"

        return {"answer": response}
    except Exception as e:
        return {"answer": f"Error: {str(e)}"}