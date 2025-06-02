# 🔑 API Setup Guide

## Google Gemini API Key

This app uses Google's Gemini AI to process receipt images. **Users provide their own API key directly in the app** - no environment variables needed.

## How Users Get Their API Key

1. **Visit Google AI Studio**: https://aistudio.google.com/app/apikey
2. **Sign in** with your Google account
3. **Create a new API key** (free)
4. **Copy the API key**
5. **Enter it in the app** when prompted

## For Developers

- **No .env file needed** - the app handles API key storage
- **User-provided keys** are stored securely on device using:
  - `expo-secure-store` on iOS/Android
  - `localStorage` on web
- **API key validation** happens at runtime
- **Fallback mock data** when no API key is provided

## Security Features

- API keys never leave the user's device
- Secure storage prevents key exposure
- Users control their own API usage and billing
- No centralized API key management needed

## Testing

The app provides mock data when no API key is configured, allowing development and testing without requiring an API key.
