# 🚀 Quick Start Guide — VolunteerAI

## What You Have Now

A **fully functional, modern, hackathon-ready** AI volunteer matching platform with:
- ✅ Clean, professional UI
- ✅ Working backend API with Gemini AI integration
- ✅ Responsive design (mobile + desktop)
- ✅ Real-time volunteer matching
- ✅ Assignment history tracking
- ✅ Zero build step needed

---

## Run It in 30 Seconds

### Step 1: Start Backend
```bash
cd backend
npm start
```

You should see:
```
🚀 Server running → http://localhost:5000
🤖 Gemini AI: disabled (rule-based fallback active)
```

### Step 2: Open Frontend
Simply open `frontend/index.html` in your browser.

**That's it!** The app is now running.

---

## Test the Features

### 1. View Volunteers
- Scroll to "Try Demo" section
- See the list of available volunteers on the right

### 2. Post a Task
- Fill in the form:
  - Task Title: "Medical Camp"
  - Required Skill: Medical
  - Location: "New York"
  - Urgency: High
- Click "Find Best Volunteer with AI"
- See the AI match result appear

### 3. Check History
- Scroll down to see assignment history
- All matches are logged with timestamps

---

## Enable Gemini AI (Optional)

### Get API Key
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### Add to Backend
1. Create `backend/.env` file:
```
PORT=5000
GEMINI_API_KEY=AIza...your_key_here...
```

2. Restart backend:
```bash
npm start
```

You'll now see:
```
🤖 Gemini AI: enabled
```

The AI will now provide intelligent reasoning for matches!

---

## What Was Fixed

### Before (Broken):
- ❌ CSS file path was wrong
- ❌ JavaScript functions were missing
- ❌ API calls didn't work
- ❌ Forms didn't submit
- ❌ No error handling
- ❌ Design looked basic

### After (Working):
- ✅ All file paths correct
- ✅ All functions implemented
- ✅ API integration working
- ✅ Forms submit properly
- ✅ Full error handling
- ✅ Modern, professional design

---

## File Structure

```
/
├── backend/
│   ├── server.js          ← Express API (in-memory data)
│   ├── gemini.js          ← AI matching logic
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── index.html         ← Main page (open this!)
│   ├── styles.css         ← Modern styling
│   ├── app.js             ← JavaScript logic
│   └── IMPROVEMENTS.md    ← Detailed changes
│
├── README.md              ← Full documentation
└── QUICKSTART.md          ← This file
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/volunteers` | List all volunteers |
| POST | `/task` | Assign best volunteer to task |
| GET | `/assignments` | View assignment history |

### POST /task Example
```json
{
  "title": "Medical Camp Setup",
  "skill": "medical",
  "location": "New York",
  "urgency": "high",
  "description": "Set up a camp in downtown"
}
```

### Response
```json
{
  "task": { "title": "Medical Camp Setup", "skill": "medical", ... },
  "ai_match": "Alice Johnson",
  "timestamp": "2026-04-27T10:00:00.000Z"
}
```

---

## Deploy to Production

### Backend → Render.com
1. Push `backend/` to GitHub
2. Go to render.com → New Web Service
3. Connect repo
4. Set:
   - Build: `npm install`
   - Start: `node server.js`
5. Add env var: `GEMINI_API_KEY` (optional)
6. Deploy → Get URL like `https://volunteerai.onrender.com`

### Frontend → Netlify
1. In `frontend/app.js` line 8, change:
   ```js
   const API = "https://volunteerai.onrender.com";
   ```
2. Go to netlify.com → New site → Deploy manually
3. Drag & drop `frontend/` folder
4. Done! Live in seconds

---

## Troubleshooting

### Backend won't start
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Frontend shows "Could not load volunteers"
- Check backend is running on port 5000
- Open browser console (F12) to see errors
- Verify `API` constant in `app.js` is correct

### CORS errors
- Backend already has `cors()` middleware
- If still issues, check browser console
- Ensure backend URL is correct

---

## Browser DevTools

Press `F12` to open developer tools:
- **Console**: See API calls and errors
- **Network**: Monitor requests to backend
- **Elements**: Inspect HTML/CSS

---

## Next Steps

1. ✅ Test all features locally
2. ✅ Add your Gemini API key
3. ✅ Customize colors/text if needed
4. ✅ Deploy to production
5. ✅ Present at hackathon!

---

## Support

If something doesn't work:
1. Check browser console for errors
2. Verify backend is running
3. Check `API` constant matches backend URL
4. Review `IMPROVEMENTS.md` for details

---

## Summary

You now have a **production-ready, visually impressive, fully functional** AI volunteer matching platform that:
- Looks professional
- Works flawlessly
- Is easy to understand
- Can be deployed immediately
- Is perfect for hackathons

**Everything is fixed and ready to go!** 🎉
