# 🔒 Security Guide for Cash Splitter

## Overview

This guide outlines the security measures implemented in the Cash Splitter app and best practices for maintaining security.

## API Key Security

### User-Controlled API Keys

- **No centralized API keys** - each user provides their own Google Gemini API key
- **Device-local storage** - API keys never leave the user's device
- **Secure storage implementation**:
  - iOS/Android: `expo-secure-store` (encrypted storage)
  - Web: `localStorage` (browser-based storage)

### API Key Best Practices

- Users get their own free API key from Google AI Studio
- Keys are entered once and stored securely
- Users can update or delete their key at any time
- No shared or centralized API key management

## Data Privacy

### Image Processing

- Receipt images are processed temporarily
- Images are sent to Google's Gemini AI for text extraction
- No images are stored permanently on external servers
- Local temporary storage is cleaned up after processing

### User Data

- **No user accounts** - app works completely offline for data storage
- **No data collection** - we don't collect any personal information
- **Local processing** - all bill splitting happens on device

## Network Security

### HTTPS Communication

- All API calls to Google services use HTTPS
- Certificate pinning for secure connections
- Request timeouts to prevent hanging connections

### API Rate Limiting

- Users are responsible for their own API usage
- Google's standard rate limits apply
- No centralized rate limiting needed

## Mobile App Security

### Platform-Specific Security

#### iOS

- Uses iOS Keychain via `expo-secure-store`
- App Transport Security (ATS) enabled
- Secure enclave storage when available

#### Android

- Uses Android Keystore via `expo-secure-store`
- Certificate transparency monitoring
- Hardware security module when available

#### Web

- Uses browser's localStorage (limited to HTTPS in production)
- Content Security Policy (CSP) headers
- Same-origin policy enforcement

## Development Security

### Code Security

- No hardcoded secrets or API keys
- TypeScript for type safety
- Regular dependency updates
- ESLint security rules enabled

### Build Security

- EAS Build for secure app compilation
- Code signing for app integrity
- Secure build environment

## Incident Response

### If API Key is Compromised

1. User can delete their API key in app settings
2. User generates new API key from Google AI Studio
3. User enters new key in the app
4. Old key becomes invalid

### Reporting Security Issues

- Contact the development team immediately
- Provide detailed description of the issue
- Do not publicly disclose until resolved

## Compliance

### Data Protection

- GDPR compliant (no data collection)
- CCPA compliant (no data selling)
- SOC 2 considerations (secure development)

### Regular Security Reviews

- Monthly dependency audits
- Quarterly security assessments
- Annual penetration testing

## Best Practices for Users

### API Key Management

- Keep your API key private
- Don't share your API key with others
- Monitor your Google Cloud usage
- Delete and regenerate if suspected compromise

### App Usage

- Only install from official app stores
- Keep the app updated
- Use secure networks when possible
- Report any suspicious behavior

---

**Last Updated:** [Current Date]
**Security Contact:** [Your Contact Information]
