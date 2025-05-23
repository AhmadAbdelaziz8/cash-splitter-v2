# 🔒 Security Guide: API Key Protection

## ⚠️ Critical Security Issue

**Your Google API key is currently exposed in client-side code!**

This is a **major security vulnerability** that could lead to:

- Unauthorized usage of your API key
- Unexpected charges on your Google Cloud account
- API key revocation due to abuse
- Security breaches

## 🏗️ Production Solution: Backend Integration

### Option 1: Express.js Backend

Create a simple backend server to proxy API requests:

```javascript
// server.js
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();

app.use(express.json());

// Keep API key secure on server
const API_KEY = process.env.GOOGLE_API_KEY; // No EXPO_PUBLIC_ prefix!
const genAI = new GoogleGenerativeAI(API_KEY);

app.post("/api/parse-receipt", async (req, res) => {
  try {
    const { base64Image, mimeType } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    const result = await model.generateContent([
      "Analyze this receipt...", // Your prompt
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
    ]);

    const text = result.response.text();
    // ... your parsing logic

    res.json({ success: true, data: parsedData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000);
```

### Option 2: Serverless Functions

**Vercel:**

```javascript
// api/parse-receipt.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const API_KEY = process.env.GOOGLE_API_KEY;
  // ... your logic here
}
```

**Netlify:**

```javascript
// netlify/functions/parse-receipt.js
exports.handler = async (event, context) => {
  // ... your logic here
};
```

### Option 3: Expo Backend (EAS)

Use Expo's EAS Build with server-side functions.

## 📱 Update Client Code

Replace your current `geminiConfig.ts` with a client that calls your backend:

```typescript
// config/apiClient.ts
export async function parseReceiptImage(
  base64Image: string,
  mimeType: string = "image/jpeg"
): Promise<ParseResult> {
  try {
    const response = await fetch("https://your-backend.com/api/parse-receipt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add authentication headers if needed
      },
      body: JSON.stringify({
        base64Image,
        mimeType,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API request failed:", error);
    return {
      success: false,
      error: error.message,
      data: getMockData(),
    };
  }
}
```

## 🛡️ Additional Security Measures

### 1. Authentication

Add user authentication to prevent unauthorized API usage:

```javascript
// Add JWT or API key validation
app.use("/api/parse-receipt", authenticateUser);
```

### 2. Rate Limiting

Prevent abuse with rate limiting:

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
});

app.use("/api/parse-receipt", limiter);
```

### 3. Input Validation

Validate inputs to prevent attacks:

```javascript
const { body, validationResult } = require("express-validator");

app.post(
  "/api/parse-receipt",
  [
    body("base64Image").isBase64(),
    body("mimeType").isIn(["image/jpeg", "image/png", "image/webp"]),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // ... process request
  }
);
```

### 4. CORS Configuration

Restrict which domains can access your API:

```javascript
const cors = require("cors");

app.use(
  cors({
    origin: ["https://your-app-domain.com"],
    credentials: true,
  })
);
```

## 🚀 Quick Migration Steps

1. **Set up backend** (choose option above)
2. **Move API key** to backend environment variables
3. **Update client** to call your backend instead of Google directly
4. **Test thoroughly** in development
5. **Deploy** and update production environment variables
6. **Remove** `EXPO_PUBLIC_GOOGLE_API_KEY` from client

## 💡 Why This Matters

- **Client-side code is visible** to anyone who inspects your app
- **API keys should never** be bundled into mobile apps
- **Backend servers** can securely store secrets
- **You maintain control** over API usage and costs

## 🔧 Development vs Production

**Development (Current Setup):**

- ✅ Quick to implement
- ✅ Easy to test
- ❌ Major security risk
- ❌ Not suitable for production

**Production (Backend Setup):**

- ✅ Secure API key storage
- ✅ Rate limiting and authentication
- ✅ Full control over usage
- ✅ Scalable and maintainable

## 📞 Need Help?

If you need assistance implementing the backend solution:

1. Choose your preferred backend platform
2. Set up a simple Express.js server or serverless function
3. Move the Google API integration to the backend
4. Update your mobile app to call your secure backend

Remember: **Never expose API keys in client-side code!** 🔐
