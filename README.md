# ELITE Fraud Detection - Next.js Application

A Next.js application for the ELITE Fraud Detection API that allows users to upload statement files and analyze them for fraud detection.

## Features

- **Health Check**: Verify API connectivity and status
- **File Upload**: Upload statement files (PDF, CSV, TXT, XLSX, XLS) for analysis
- **Analysis Results**: View detailed fraud detection analysis results
- **Modern UI**: Beautiful, responsive interface with gradient design

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your API configuration:
```
NEXT_PUBLIC_API_BASE_URL=https://fraud-detection-api-qqgl.onrender.com
NEXT_PUBLIC_API_KEY=test-123
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

The application uses the following API endpoints:

- `GET /health` - Health check endpoint
- `POST /analyze-statement` - Analyze a statement file (requires API key authentication)

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page component
│   ├── page.module.css     # Page styles
│   └── globals.css         # Global styles
├── lib/
│   └── api.ts              # API client utilities
├── openapi.json            # OpenAPI specification
└── package.json            # Dependencies
```

## Build for Production

```bash
npm run build
npm start
```

## License

MIT

