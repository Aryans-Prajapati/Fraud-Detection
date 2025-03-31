import React, { useEffect, useState, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Transaction } from '../types/types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FraudRiskChartProps {
  transactions: Transaction[];
}

const FraudRiskChart: React.FC<FraudRiskChartProps> = ({ transactions }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    if (!transactions || transactions.length === 0) return;

    // Calculate overall statistics
    const totalCount = transactions.length;
    const fraudCount = transactions.filter(t => t.is_fraud === 1).length;
    
    // Calculate fraud by category
    const categoriesSet = new Set(transactions.map(t => t.category));
    const categories = Array.from(categoriesSet);
    
    const categoryTotals: Record<string, number> = {};
    const categoryFrauds: Record<string, number> = {};
    
    // Initialize
    categories.forEach(cat => {
      categoryTotals[cat] = 0;
      categoryFrauds[cat] = 0;
    });
    
    // Count total transactions and frauds per category
    categories.forEach(category => {
      const categoryTransactions = transactions.filter(t => t.category === category);
      categoryTotals[category] = categoryTransactions.length;
      categoryFrauds[category] = categoryTransactions.filter(t => t.is_fraud === 1).length;
    });
    
    // Calculate fraud percentages
    const fraudPercentages = categories.map(category => {
      const total = categoryTotals[category];
      const frauds = categoryFrauds[category];
      return total > 0 ? (frauds / total) * 100 : 0;
    });
    
    // Calculate totals per category
    const totals = categories.map(category => categoryTotals[category]);
    
    // Prepare chart data
    setChartData({
      labels: categories,
      datasets: [
        {
          label: 'Fraud Risk (%)',
          data: fraudPercentages,
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: 'Transaction Count',
          data: totals,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          yAxisID: 'y1'
        }
      ]
    });
  }, [transactions]);

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Fraud Risk (%)',
          color: 'rgba(255, 99, 132, 1)'
        },
        min: 0,
        max: 100,
        ticks: {
          color: 'rgba(255, 99, 132, 1)',
          callback: function(value) {
            return value + '%';
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Transaction Count',
          color: 'rgba(54, 162, 235, 1)'
        },
        min: 0,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'rgba(54, 162, 235, 1)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Category'
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.datasetIndex === 0) {
                label += context.parsed.y.toFixed(1) + '%';
              } else {
                label += context.parsed.y;
              }
            }
            return label;
          }
        }
      }
    }
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">No transaction data available</p>
      </div>
    );
  }

  return <Bar data={chartData} options={options} />;
};

export default FraudRiskChart; 