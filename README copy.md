# Financial Fraud Detection Web Application

This is a modern web application built with Next.js that uses an AI agent to detect fraudulent financial transactions and alert users.

## Features

- **Machine Learning Fraud Detection**: Real-time analysis of transactions using a Random Forest model
- **User Dashboard**: Personal dashboard for users to view their transaction history and fraud alerts
- **Admin Dashboard**: Advanced overview of all transactions with filtering, searching, and user tracking
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Interactive Charts**: Visualize transaction patterns and fraud distribution
- **Transaction Cards**: Detailed transaction cards with fraud risk indicators

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/fraud-detect-web.git
cd fraud-detect-web
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Credentials

For demonstration purposes, you can log in using:

- **Admin User**: 
  - Email: admin@frauddetect.com
  - Password: admin123

- **Regular User**: 
  - Email: user1@example.com
  - Password: password1

## Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS, DaisyUI
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Heroicons
- **Machine Learning**: ml-random-forest, ml-matrix
- **Data Processing**: csv-parser

## Project Structure

- `/components` - Reusable UI components
- `/lib` - Core functionality (ML model, data loading, authentication)
- `/pages` - Application pages/routes
- `/public` - Static assets
- `/styles` - Global CSS and Tailwind configuration
- `/data` - Sample transaction and user data

## How It Works

1. The application loads transaction data from the CSV file
2. The Random Forest model is trained on the dataset
3. Each transaction is analyzed for fraud signals
4. Users can view personalized fraud warnings and statistics
5. Admins can monitor all transactions and see system-wide patterns

## License

This project is licensed under the MIT License - see the LICENSE file for details 