# Cash-Splitter V2

## Description

This project is the second version of Cash-Splitter. I am rebuilding the application to add new and improved ways to manage shared expenses. 
The main goals are to make splitting bills easier and faster.

This new version will include features like:

- Scanning receipts using LLM (gemini specifically) to automatically find items and prices.
- Sharing expense details easily with a simple link, instead of a complicated process.

## How It Works

Cash-Splitter V2 helps you and your friends or family share costs fairly.

1.  **Create an Event or Group:** You can start by creating a new event (like a dinner or a trip) or a group for ongoing shared expenses.
2.  **Add Expenses:**
    - scanning feature: take a picture of your receipt, and the app will try to read the items and amounts for you.
    - manually edit or delete any inaccurate items
4.  **generate a sharable link for your friends to calculate their expenses:**
    - a linke will open-up a static webpage that will show and calculate each person's share

The goal is to make splitting bills clear and simple for everyone involved.


## Tech Stack
- **Frontend (Mobile App):**
  - **React Native:** A framework for building native mobile apps using JavaScript and React.
  - **Expo:** A platform and set of tools built around React Native to simplify development, building, and deploying apps.
  - **TypeScript:** A superset of JavaScript that adds static typing for more robust code.
  - **NativeWind:** A utility-first styling solution for React Native, using Tailwind CSS principles.
  - **React Navigation:** For handling navigation between different screens in the app.
- **LLM for Receipt Scanning:**
    - GEMINI 2.0 flash

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

## Available Scripts

In the `my-app/` directory, you can run several scripts:

- `npm start` or `yarn start`: Starts the development server with Metro Bundler.
- `npm run android` or `yarn android`: Builds the app and runs it on an Android emulator or connected device.
- `npm run ios` or `yarn ios`: Builds the app and runs it on an iOS simulator or connected device (requires macOS).
- `npm run web` or `yarn web`: Runs the app in a web browser (if web support is configured).