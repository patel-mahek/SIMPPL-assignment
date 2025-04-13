# Rediview
Rediview is a full-stack web application that analyzes, visualizes, and generates narratives from Reddit data. It combines real-time post fetching, data science techniques, and generative AI to deliver meaningful insights through dashboards, stories, and chat interfaces.


## Table of Contents
1. [ Project Overview](#project-overview)
2. [ Frontend Pages](#frontend-pages)
   - [Dashboard](#dashboard)
   - [Story](#story)
   - [Chat](#chat)
   - [Subreddits](#subreddits)
3. [ Backend API](#backend-api)
   - [API Endpoints](#api-endpoints)
   - [Functions in `code.py`](#functions-in-codepy)
   - [Functions in `new_reddit.py`](#functions-in-new_redditpy)
4. [Setup Instructions](#setup-instructions)


# Project Overview
Rediview is designed to help researchers, journalists, and curious minds understand what's happening on Reddit across communities and topics. The platform:

- Presents you with data visualisations of already collected posts from multiple subreddits
- Performs data cleaning and analysis (TF-IDF, sentiment, author stats, etc.)
- Detects trends, flashpoints, and controversies
- Visualizes subreddit activity and topic evolution
- Generates story-style narratives with real post examples using Gemini

It currently analyzes ~8,000 Reddit posts from 23rd July 2024 to 18th February 2025.

Frontend Pages
Dashboard
Path: /

Purpose: Overview of the dataset with visuals and metrics.

Features:

- Total posts, comments, upvotes, and subreddits
- Monthly keyword trends via line/bar charts
- Pie charts for subreddit distribution
- Misleading/highly controversial post highlights

Story
Path: /story

Purpose: Tells a structured, multi-paragraph narrative based on the dataset.

Features:

- Gemini-generated descriptive story
- Image visualizations (topic spread, flashpoints, top authors)
- Highlights key moments, sentiment trends, and dominant figures

Chat
Path: /chat

Purpose: Ask questions about the Reddit dataset.

Features:

- Real-time chat interface powered by the /ask endpoint
- Supports queries like: "What are the top trending topics?", "Show controversial posts" or "Summarize sentiment"


Subreddits
Path: /subreddits

Purpose: Explore Reddit posts from specific subreddits.

Features:

- Pulls new posts from selected subreddits
- Carousel-like scroll experience for posts


Backend API
API Endpoints
/posts  
Method: POST  

Input:  
json { "subreddits": ["subreddit1", "subreddit2"], "limit": 10 }
Output: JSON list of posts

Function: Uses PRAW to fetch the latest posts and saves them to new_reddit_posts.jsonl

 /ask  
Method: POST  

Input:  
json { "query": "What are the top trending topics?" }

Output: Generated response string

Function: Triggers different backend analysis functions based on the user’s query

Functions in code.py
- fetch_reddit_posts() → Fetches fresh posts from Reddit
- subreddit_activity() → Post volume by subreddit
- top_authors() → Most active users
- sentiment_overview() → Breakdown of post sentiments
- flashpoint_detection() → Detects high-activity spike days
- domain_trends() → Analyzes linked websites/domains
- controversial_posts() → Finds high-comment vs low-score posts
- generate_narrative() → Generates formal story with Gemini
- /ask → Interprets user queries to dynamically trigger the above functions

Functions in new_reddit.py
Core Data Functions
- load_reddit_data(path) → Loads .jsonl Reddit dump
- preprocess(df) → Cleans and enriches dataset
- sentiment_analysis(df) → Adds VADER sentiment scores

Analysis & Visualization
- detect_topics_tfidf() → Top keywords from TF-IDF
- plot_post_trends() / plot_top_subreddits() / plot_top_authors() → Generates visualizations
- rise_of_topic_across_communities() → Keyword mentions over time by subreddit
- sentiment_shift_around_keyword() → Sentiment changes for a topic
- compare_sentiment_by_link() → Sentiment based on domains
- build_author_copost_network() / plot_author_network() → Author network visualizations

Story Generation
- generate_narrative_story_with_examples() → Full descriptive narrative using Gemini
- summarize_insights() → Stats-based story summary
- get_example_posts_by_keyword() → Grabs high-score post samples

Helper Tools
- main() → Full pipeline runner (load, analyze, save outputs)


## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd nextjs-shadcn-fastapi

2. Install frontend dependencies:
    ```bash
   npm i
3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   
4. Start the server:
   ```bash
   npm run dev  
