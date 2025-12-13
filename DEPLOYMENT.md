# Deployment Guide for bekolimjon.com

## What's Been Added

### URL Routing
Your blog now supports shareable URLs for individual posts:
- Home: `bekolimjon.com/`
- Individual posts: `bekolimjon.com/?post=ajoyib-voqea`

When someone clicks a post, the URL updates automatically and can be copied and shared.

## Deployment Options

### Option 1: Netlify (Recommended - Easiest)

1. **Create Netlify Account**
   - Go to https://netlify.com
   - Sign up with GitHub, GitLab, or email

2. **Deploy Your Site**
   - Drag and drop your entire `bek-website` folder into Netlify
   - OR connect your GitHub repository if you have one

3. **Configure Custom Domain**
   - Go to Site settings → Domain management
   - Click "Add custom domain"
   - Enter `bekolimjon.com`
   - Follow DNS configuration instructions:
     - Add A record: `75.2.60.5`
     - Add CNAME record: `www` → `your-site-name.netlify.app`

4. **Enable HTTPS**
   - Netlify automatically provides free SSL certificate
   - Enable "Force HTTPS" in domain settings

**Cost:** FREE

---

### Option 2: Vercel

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub, GitLab, or email

2. **Deploy**
   - Click "Add New Project"
   - Import your repository OR upload files
   - Deploy with default settings

3. **Configure Domain**
   - Go to Project Settings → Domains
   - Add `bekolimjon.com`
   - Configure DNS:
     - Add A record: `76.76.19.19`
     - Add CNAME: `www` → `cname.vercel-dns.com`

**Cost:** FREE

---

### Option 3: GitHub Pages

1. **Create GitHub Repository**
   - Create a new repository named `bekolimjon-blog`
   - Upload all your files

2. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Source: Deploy from main branch
   - Save

3. **Configure Custom Domain**
   - In Settings → Pages, add `bekolimjon.com`
   - Create file `CNAME` in your repository with content: `bekolimjon.com`
   - Configure DNS:
     - Add A records:
       - `185.199.108.153`
       - `185.199.109.153`
       - `185.199.110.153`
       - `185.199.111.153`
     - Add CNAME: `www` → `yourusername.github.io`

**Cost:** FREE

---

## DNS Configuration (General)

You need to configure your domain at your registrar (where you bought `bekolimjon.com`):

### For Netlify:
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-site-name.netlify.app
```

### For Vercel:
```
Type: A
Name: @
Value: 76.76.19.19

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### For GitHub Pages:
```
Type: A (add all 4)
Name: @
Values:
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153

Type: CNAME
Name: www
Value: yourusername.github.io
```

---

## After Deployment

### Test Your URLs
1. Visit `bekolimjon.com` - should show home page
2. Click any post - URL should change to `bekolimjon.com/?post=post-title`
3. Copy URL and open in new tab - should show the same post
4. Share URL with someone - they should see the same post

### Adding New Posts
1. Run `python3 add_post.py` to add new posts
2. Upload/commit updated `posts.json` to your hosting
3. Changes appear automatically

### Updating Existing Posts
1. Use `admin.html` to review/edit posts
2. Export changes
3. Run `python3 apply_review.py your-export.json -y`
4. Upload/commit updated `posts.json`

---

## Recommended: Netlify

Why Netlify is best for you:
- ✅ Easiest deployment (drag & drop)
- ✅ Automatic HTTPS
- ✅ Automatic builds when you update
- ✅ Great performance
- ✅ Free forever for static sites
- ✅ Simple domain configuration

---

## Need Help?

Common issues:
- **DNS not working:** DNS changes take 24-48 hours to propagate
- **Posts not loading:** Make sure `posts.json` is uploaded
- **URL routing not working:** Hosting platform must support client-side routing (all mentioned options do)

For questions, check the hosting platform's documentation or let me know!