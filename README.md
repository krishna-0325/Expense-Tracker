# 💸 ExpenseOS — Expense Tracker Dashboard

> **Intern ID:** CITS2697

---

## 📌 Project Overview

**ExpenseOS** is a personal finance dashboard built with React that helps users track daily expenses, monitor monthly budgets, and analyze spending habits by category. It features a clean dark-themed UI with real-time budget tracking, interactive charts, and a smooth add-expense flow.

---

## 🚀 Features

- 📊 **Dashboard Overview** — Monthly budget card with live progress bar, daily average, and transaction count
- 📈 **7-Day Activity Chart** — Visual bar chart of spending over the past week
- 🍩 **Category Donut Chart** — Breakdown of spending by category with percentage labels
- 📋 **Transactions Tab** — Searchable, filterable list of all expenses with delete support
- 🔍 **Analytics Tab** — Deep category breakdown, highest spend, and most frequent category
- ➕ **Add Expense Modal** — Title, amount, 8 category options, date picker, and optional note
- 🎨 **Dark Terminal UI** — Acid green accents, DM Mono font, smooth animations

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| CSS-in-JS (inline styles) | Styling |
| JavaScript (ES6+) | Logic & state management |

---

## 📁 Project Structure

```
expense-tracker/
├── src/
│   ├── App.jsx         # Main dashboard component
│   └── index.css       # Global reset styles
├── index.html
├── package.json
└── vite.config.js
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v16+ → [nodejs.org](https://nodejs.org)
- VS Code → [code.visualstudio.com](https://code.visualstudio.com)

### Installation

```bash
# 1. Create Vite React project
npm create vite@latest expense-tracker -- --template react

# 2. Navigate into folder
cd expense-tracker

# 3. Install dependencies
npm install

# 4. Replace src/App.jsx with the project code
# 5. Clear src/index.css

# 6. Start development server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📷 Screens

| Tab | Description |
|-----|-------------|
| Overview | Budget hero card, weekly chart, category breakdown |
| Expenses | Search & filter all transactions |
| Analytics | Detailed category stats and insights |

---

## 🗂️ Categories Supported

🍜 Food & Dining · 🚇 Transport · 🛍️ Shopping · 💊 Health · 🎬 Entertainment · ⚡ Utilities · 🏠 Housing · 📦 Other

---

## 👨‍💻 Author

**Intern ID:** CITS2697
**Project:** Expense Tracker Dashboard
**Built with:** React + Vite

---

## 📄 License

This project was built as part of an internship program. All rights reserved.
