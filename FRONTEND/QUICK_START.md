# MediScan AI - Frontend Quick Start 🚀

This application has been converted to a **Frontend-Only** architecture. All data is managed locally within your browser using `localStorage`.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Application runs on: http://localhost:5173 (standard Vite port)

---

## Features

### 🏠 Home Page
The main entry point with quick access to scanning and the medicine catalog.

### 📸 AI Prescription Scanner
Upload images of prescriptions to see a simulated analysis. 
- **Note:** Analysis is simulated in the frontend. No actual AI API calls are made.
- You can review medicines and "Authorize Transfer" to the local Pharmacy Hub.

### 💊 Pharmacy Hub
Manage the prescriptions you've "sent" from the scanner.
- All data is saved in your browser's `localStorage`.
- You can **Accept** or **Reject** prescriptions here.

### 💊 Medicines Catalog
Browse and search the comprehensive medicine database.
- Search by name or category.
- Filter by category using the dropdown.
- Add items to your cart.

---

## Technical Details

- **Framework:** React 19 + Vite
- **Data Persistence:** `localStorage` (Prescriptions and Stats)
- **Mock Data:** Located in `src/lib/mockData.ts`
- **Mock API Layer:** Located in `src/lib/api.ts`

### Resetting Data
To clear all local data, you can clear your browser's local storage for this site.

---

**Enjoy the fast, serverless MediScan AI experience! 🎉**
