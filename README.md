# Bamsense Dev Slides

**Bamsense Dev Slides** is a privacy-first, client-side AI presentation generator. It empowers developers and creators to generate stunning, code-rich presentations instantly using Google Gemini AI, all while keeping your data 100% local.

![Bamsense Dev Slides Banner](public/vite.svg)

## 🚀 Features

-   **AI-Powered Generation:** Instantly generate comprehensive slide decks from a single topic using Google Gemini models.
-   **🔒 100% Private & Local:** No server-side data storage. Your API key connects directly to Google, and your presentations are saved locally on your device.
-   **Manual / "No API Key" Mode:** Generate prompts to use with ChatGPT/Claude/Gemini externally, then import the JSON response to render slides.
-   **Rich Editor:** Edit slides with a Notion-style WYSIWYG editor (TipTap) supporting rich text, images, and code blocks.
-   **Developer Friendly:** Edit the raw HTML/CSS of any slide for pixel-perfect control.
-   **Export Options:**
    -   🌐 **HTML:** Export as a standalone interactive web page.
    -   📄 **PDF:** Print-ready document format.
    -   📊 **PowerPoint (.pptx):** Editable slide deck.
-   **Responsive Design:** Optimized for desktop and mobile (with a dedicated drawer navigation).
-   **Presentation Mode:** Distraction-free full-screen player with keyboard navigation.

## 🛠️ Tech Stack

-   **Framework:** React 19 + Vite
-   **Styling:** Custom CSS Variables (Glassmorphism UI)
-   **AI Integration:** Google Generative AI SDK
-   **Rich Text:** TipTap Editor
-   **Animations:** Framer Motion
-   **Icons:** Lucide React
-   **PDF/PPTX Generation:** `jspdf`, `html2canvas`, `pptxgenjs`

## 🚦 Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/bamsense-works/slides.git
    cd slides
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser at `http://localhost:5173`

## 📖 Usage Guide

### Method 1: Automatic Generation (Recommended)
1.  Click **Settings** (⚙️) in the toolbar.
2.  Enter your [Google AI Studio API Key](https://aistudio.google.com/app/apikey).
3.  Click **Generate with AI**, enter a topic (e.g., "React Hooks"), and watch the magic happen.

### Method 2: Manual Mode (No API Key)
1.  Click **Generate with AI** -> **No API Key?**.
2.  Copy the optimized system prompt provided.
3.  Paste it into ChatGPT, Claude, or Gemini.
4.  Copy the JSON response and paste it back into the app to render your slides.

## 🛡️ Privacy Policy

**Your Data is Yours.**
-   **Zero Tracking:** We do not collect usage data, analytics, or personal information.
-   **Local Storage:** API keys and generated slides are stored in your browser's `localStorage`.
-   **Direct Connection:** AI requests are sent directly from your browser to Google's API servers. No middleman servers involved.

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ❤️ Maintained by

**Bamsense Works**

**Primary Maintainer:**  
[**Balagangadhar Reddy**](https://github.com/Balagangadhar-Dev/)  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat&logo=linkedin)](https://www.linkedin.com/in/balagangadhar-reddy/)

---
*Built with ❤️ for the Developer Community.*