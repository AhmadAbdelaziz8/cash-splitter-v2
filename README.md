# Cash Splitter V2

A mobile application designed to make splitting bills easier and faster by scanning receipts and generating shareable expense links.

## Live Demo

Check out the live landing page for the project:

**[https://cash-splitter-v22.netlify.app/](https://cash-splitter-v22.netlify.app/)**

## Architecture

The project is built with a modern, decoupled architecture:

- **Mobile Application (`/my-app`):** A cross-platform mobile app built with React Native and Expo. It handles all the core functionality, including receipt scanning, item management, and expense calculation.
- **Landing Page (`/landing-page`):** A static marketing and download page built with vanilla HTML, CSS, and JavaScript. It is deployed separately on Netlify and provides project information and a link to download the APK.

## How It Works

Cash-Splitter V2 helps you and your friends or family share costs fairly.

1.  **Scan Receipt:** Take a picture of your receipt, and the app will use an LLM to read the items and amounts for you.
2.  **Review Items:** Manually edit or delete any inaccurate items to ensure the bill is correct.
3.  **Generate Link:** Get a shareable link that opens a static webpage, allowing friends to see and calculate their individual shares.

The goal is to make splitting bills clear and simple for everyone involved.

## Tech Stack

- **Frontend (Mobile App):**
  - **React Native:** A framework for building native mobile apps using JavaScript and React.
  - **Expo:** A platform and set of tools built around React Native to simplify development, building, and deploying apps.
  - **TypeScript:** A superset of JavaScript that adds static typing for more robust code.
  - **NativeWind:** A utility-first styling solution for React Native, using Tailwind CSS principles.
  - **React Navigation:** For handling navigation between different screens in the app.
- **LLM for Receipt Scanning:**
  - The application uses Google's Gemini Pro model to parse receipt images.

## Project Structure (Inside `my-app/`)

The `my-app/` directory contains the main source code for the application:

- `app/`: Contains the screen layouts and navigation, powered by Expo Router.
- `assets/`: Stores static files like images and fonts.
- `components/`: Holds reusable UI components (buttons, cards, etc.).
  - `components/ui/`: Basic, generic UI building blocks.
- `constants/`: For fixed values used throughout the app (e.g., color codes, API keys if not in .env).
- `contexts/`: Manages global state using React Context API.
- `hooks/`: Contains custom React Hooks for reusable logic.
- `services/`: For modules that handle API calls or other external services.
- `types/`: TypeScript type definitions and interfaces.
- `utils/`: Utility functions used in various parts of the application.
- `config/`: Configuration files for different parts of the application.
- `scripts/`: Utility scripts for development or build processes.

## Getting Started
1.  **Prerequisites:**
    - Node.js (LTS version recommended)
    - npm or Yarn (package managers for JavaScript)
    - Expo Go app on your iOS or Android device (for testing) or an Android Emulator/iOS Simulator.
    - Git (for version control)

2.  **Clone the Repository:**

    ```bash
    git clone <repository-url>
    cd cash-splitter-v2/my-app
    ```

3.  **Install Dependencies:**

    ```bash
    npm install
    # OR
    yarn install
    ```

4.  **Run the Application:**
    ```bash
    npm start
    # OR
    yarn start
    ```
    This will start the Metro Bundler. You can then scan the QR code with the Expo Go app on your phone or run it on an emulator/simulator.

## How to Contribute

We welcome contributions from the developer community! Here are a few ways you can help improve Cash Splitter V2:

- **iOS Deployment:** The application is currently built for Android. A major contribution would be to set up the build and deployment process for iOS, making the app available on the Apple App Store.
- **Multi-Image Capture:** Enhance the receipt scanning feature to allow users to capture and process multiple images for long receipts. This would involve updating the camera interface and the logic for sending images to the LLM.

If you are interested in contributing, please fork the repository and submit a pull request with your changes.

## Available Scripts

In the `my-app/` directory, you can run several scripts:

- `npm start` or `yarn start`: Starts the development server with Metro Bundler.
- `npm run android` or `yarn android`: Builds the app and runs it on an Android emulator or connected device.
- `npm run ios` or `yarn ios`: Builds the app and runs it on an iOS simulator or connected device (requires macOS).
- `npm run web` or `yarn web`: Runs the app in a web browser (if web support is configured).