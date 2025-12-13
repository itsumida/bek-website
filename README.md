# Minimalist Blog Website

A clean, minimalist blog website that displays posts scraped from a Telegram channel. Features a split-screen design with posts listed on the left and content displayed on the right.

## Features

- **Minimalist Design**: Black and white color scheme inspired by modern minimalist blogs
- **Split-Screen Layout**: Posts sidebar on the left, content area on the right
- **Year-Based Organization**: Posts automatically grouped and sorted by year
- **Search Functionality**: Real-time search through post titles and content
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Telegram Integration**: Automatically scrape posts from your Telegram blog channel

## Project Structure

```
bek-website/
├── index.html           # Main HTML file
├── styles.css           # All styles (minimalist black/white theme)
├── script.js           # Frontend JavaScript
├── posts.json          # Your blog posts data
├── telegram_scraper.py # Python script to scrape Telegram
├── requirements.txt    # Python dependencies
├── .env.example       # Example environment variables
└── README.md          # This file
```

## Setup

### 1. Convert Your Telegram Export

If you already have a Telegram export file (`result.json`):

```bash
python3 convert_telegram_export.py
```

This will convert your Telegram messages to the `posts.json` format.

### 2. View the Website

Start the local server:

```bash
python3 serve.py
```

This will automatically open your blog in the browser at `http://localhost:8000`

### 3. Alternative: Scrape Directly from Telegram (Optional)

#### Prerequisites

- Python 3.7 or higher
- A Telegram account
- Your Telegram channel username

#### Get Telegram API Credentials

1. Go to https://my.telegram.org
2. Log in with your phone number
3. Click on "API development tools"
4. Create a new application
5. Copy your `api_id` and `api_hash`

#### Configure the Scraper

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your credentials:
   ```
   TELEGRAM_API_ID=12345678
   TELEGRAM_API_HASH=your_api_hash_here
   TELEGRAM_PHONE=+1234567890
   CHANNEL_USERNAME=@your_channel_username
   ```

#### Run the Scraper

```bash
python telegram_scraper.py
```

The first time you run it, Telegram will send you a verification code. Enter it to authenticate.

The scraper will:
- Connect to your Telegram channel
- Extract all posts
- Format them for the website
- Save them to `posts.json`

### 4. Deploy

#### Option 1: GitHub Pages (Free)

1. Create a GitHub repository
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```
3. Go to Settings → Pages → Select "main" branch
4. Your site will be live at `https://yourusername.github.io/your-repo`

#### Option 2: Netlify (Free)

1. Drag and drop your folder to https://app.netlify.com/drop
2. Your site will be live instantly

#### Option 3: Vercel (Free)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Deploy:
   ```bash
   vercel
   ```

## Customization

### Change Title

Edit `index.html` line 6 and line 17:
```html
<title>Your Blog Name</title>
...
<h1>Your Blog Name</h1>
```

### Modify Colors

Edit `styles.css` root variables (lines 9-15):
```css
:root {
    --bg-primary: #ffffff;      /* Main background */
    --bg-secondary: #fafafa;    /* Sidebar background */
    --text-primary: #000000;    /* Main text color */
    --text-secondary: #666666;  /* Secondary text */
    --border-color: #e0e0e0;    /* Border color */
    --hover-bg: #f5f5f5;        /* Hover state */
    --accent: #000000;          /* Accent color */
}
```

### Adjust Layout Width

Edit `styles.css` line 37 to change sidebar width:
```css
.sidebar {
    width: 350px;  /* Change this value */
}
```

Edit line 87 to change content max width:
```css
.content {
    max-width: 800px;  /* Change this value */
}
```

## Data Format

The `posts.json` file follows this structure:

```json
[
    {
        "id": 1,
        "title": "Post Title",
        "date": "2024-01-15",
        "content": "<p>HTML formatted content...</p>"
    }
]
```

You can manually edit this file or use the Telegram scraper to generate it automatically.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

Free to use and modify for your personal blog.

## Troubleshooting

### Telegram Scraper Issues

**"Missing credentials in .env file"**
- Make sure your `.env` file exists and has all required fields

**"Could not find the input entity"**
- Double-check your channel username (should include @)
- Make sure you're a member of the channel

**"The phone number is already in use"**
- Delete the `session.session` file and try again

### Website Issues

**Posts not showing**
- Check that `posts.json` exists and has valid JSON
- Open browser console (F12) to see any errors

**Search not working**
- Make sure JavaScript is enabled in your browser

## Support

For issues or questions, please open an issue on GitHub.
