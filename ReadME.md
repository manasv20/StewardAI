# Steward AI 🤖💼

**Steward AI** is a sophisticated, AI-powered financial co-pilot designed to function like a personal wealth advisor from a multi-generational family office. It moves beyond simple charts and data feeds to provide a comprehensive, actionable "Legacy Wealth Plan" tailored to your entire financial life, emphasizing long-term, principled investing.

Powered by Google's Gemini, this application synthesizes fundamental analysis, market sentiment, and macroeconomic data into a clear, actionable strategy.

## ✨ Key Features

- **Holistic Financial Diagnosis:** Analyzes your complete capital profile across cash, brokerage, and retirement accounts.
- **AI-Powered Due Diligence:** The engine performs a multi-factor analysis, considering macro trends, market sentiment, and even SEC filing insights.
- **Actionable Blueprint:** Delivers a clear SWOT analysis, a prioritized list of next steps, and precise rebalancing orders for your current portfolio.
- **"The Steward" Co-Pilot:** An integrated AI chat agent with full context of your generated plan, ready to provide clarity and answer deep-dive questions.
- **100% Private & Secure:** All financial data and the API key are stored exclusively in your browser's local storage and are never sent to a server.

## 🚀 How to Run

This project is a client-side application with no build step required.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/steward-ai.git
    ```
2.  **Navigate to the directory:**
    ```bash
    cd steward-ai
    ```
3.  **Open `index.html`:**
    Simply open the `index.html` file in your web browser of choice (like Chrome, Firefox, or Safari).

4.  **Enter Your API Key:**
    On first launch, the application will prompt you for your Google AI API key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey). The key will be stored securely in your browser's local storage for future sessions.

## 🔒 Security & Privacy Notice

This application has been designed with privacy as a top priority.

-   **No Data Storage:** The application is 100% client-side. We do not have a backend server, and we do not store your financial data, portfolio, or personal information in any database.
-   **Local API Key:** Your Google AI API key is stored **only** in your browser's `localStorage`. It is never transmitted to any server other than Google's own API endpoints for authentication.
-   **Safe to Share:** Because of this architecture, the codebase can be safely hosted and shared publicly on platforms like GitHub without any risk of exposing user credentials. Every user is required to provide their own key.
