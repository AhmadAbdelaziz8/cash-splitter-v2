# 🔑 API Setup Guide

## Google Gemini AI Integration Setup

### Step 1: Get Your API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Set Up Environment Variable

Create a `.env` file in the `my-app` directory with the following content:

```env
EXPO_PUBLIC_GOOGLE_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with the API key you copied from Google AI Studio.

### Step 3: Verify Setup

1. Restart your development server
2. Take a photo with the app
3. Check the console logs - you should see:
   - ✅ API Key available: true
   - 🚀 Initializing Gemini AI...
   - 📤 Sending request to Gemini...

### Troubleshooting

**If you see "API Key available: false":**

- Make sure the `.env` file is in the correct location (`my-app/.env`)
- Make sure the variable is named exactly `EXPO_PUBLIC_GOOGLE_API_KEY`
- Restart your development server after creating the `.env` file

**If you see "API key not valid":**

- Double-check your API key is copied correctly
- Make sure there are no extra spaces or characters
- Try generating a new API key from Google AI Studio

### Security Note

- Keep your API key secure
- Don't commit the `.env` file to version control
- Add `.env` to your `.gitignore` file if it's not already there
