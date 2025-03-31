import React, { useEffect, useRef, useState } from 'react';
import { Transaction } from '../types/types';

// This is a mock map component since actual mapping libraries are heavy
// In a production app, you'd use something like Leaflet, Mapbox, or Google Maps

interface TransactionMapProps {
  transactions: Transaction[];
}

interface Point {
  x: number;
  y: number;
  amount: number;
  is_fraud: number;
  transaction_id: string;
}

const TransactionMap: React.FC<TransactionMapProps> = ({ transactions }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const [points, setPoints] = useState<Point[]>([]);

  // Generate random points based on transaction data
  // In a real app, these would be mapped to actual coordinates
  useEffect(() => {
    if (!transactions || transactions.length === 0) return;
    
    const newPoints: Point[] = transactions.map(t => {
      // Generate a deterministic "random" position based on transaction_id
      // This ensures same transaction always appears in same place
      const idSum = t.transaction_id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const x = (idSum % 100) / 100; // Between 0-1
      const y = ((idSum * 31) % 100) / 100; // Between 0-1
      
      return {
        x,
        y,
        amount: t.amount,
        is_fraud: t.is_fraud,
        transaction_id: t.transaction_id
      };
    });
    
    setPoints(newPoints);
  }, [transactions]);

  // Draw the map
  useEffect(() => {
    if (!canvasRef.current || points.length === 0) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    context.clearRect(0, 0, width, height);
    
    // Draw map background
    context.fillStyle = '#eef7fe';
    context.fillRect(0, 0, width, height);
    
    // Draw fake map grid lines
    context.strokeStyle = '#cce3f5';
    context.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i < height; i += 30) {
      context.beginPath();
      context.moveTo(0, i);
      context.lineTo(width, i);
      context.stroke();
    }
    
    // Vertical grid lines
    for (let i = 0; i < width; i += 30) {
      context.beginPath();
      context.moveTo(i, 0);
      context.lineTo(i, height);
      context.stroke();
    }
    
    // Draw transactions
    points.forEach(point => {
      const x = point.x * width;
      const y = point.y * height;
      
      // Scale point size by transaction amount (between 4-12px)
      const minSize = 4;
      const maxSize = 12;
      const baseSize = minSize + (point.amount / 2000) * (maxSize - minSize);
      const size = Math.min(Math.max(baseSize, minSize), maxSize);
      
      // Choose color based on fraud status
      const color = point.is_fraud 
        ? 'rgba(239, 68, 68, 0.7)' // red for fraud
        : 'rgba(59, 130, 246, 0.7)'; // blue for normal
      
      // Draw circle
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fillStyle = color;
      context.fill();
      
      // Draw border
      context.strokeStyle = point.is_fraud 
        ? 'rgba(220, 38, 38, 1)' 
        : 'rgba(37, 99, 235, 1)';
      context.lineWidth = 1;
      context.stroke();
    });
    
    // If a point is hovered, draw tooltip
    if (hoveredPoint) {
      const x = hoveredPoint.x * width;
      const y = hoveredPoint.y * height;
      
      // Draw connecting line
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x, y - 30);
      context.strokeStyle = '#6b7280';
      context.lineWidth = 1;
      context.stroke();
      
      // Format amount
      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(hoveredPoint.amount);
      
      // Draw tooltip
      const tooltipWidth = 120;
      const tooltipHeight = 60;
      const tooltipX = Math.min(Math.max(x - tooltipWidth / 2, 10), width - tooltipWidth - 10);
      const tooltipY = Math.max(y - tooltipHeight - 35, 10);
      
      // Draw tooltip background
      context.fillStyle = 'white';
      context.strokeStyle = '#d1d5db';
      context.lineWidth = 1;
      context.beginPath();
      context.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4);
      context.fill();
      context.stroke();
      
      // Draw tooltip text
      context.fillStyle = '#111827';
      context.font = '11px sans-serif';
      context.textAlign = 'left';
      context.fillText('Amount: ' + formattedAmount, tooltipX + 8, tooltipY + 20);
      
      context.fillStyle = hoveredPoint.is_fraud ? '#ef4444' : '#3b82f6';
      context.fillText(
        'Status: ' + (hoveredPoint.is_fraud ? 'Fraudulent' : 'Normal'), 
        tooltipX + 8, 
        tooltipY + 40
      );
    }
  }, [points, hoveredPoint]);

  // Handle mouse movement to detect hover on points
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || points.length === 0) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate mouse position relative to canvas
    const mouseX = (e.clientX - rect.left) / canvas.width;
    const mouseY = (e.clientY - rect.top) / canvas.height;
    
    // Find if mouse is hovering a point
    const hoverThreshold = 0.03; // 3% of canvas size
    const hoveredPoint = points.find(point => {
      const dx = Math.abs(point.x - mouseX);
      const dy = Math.abs(point.y - mouseY);
      return dx < hoverThreshold && dy < hoverThreshold;
    }) || null;
    
    setHoveredPoint(hoveredPoint);
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">No transaction data available for map</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <canvas
        ref={canvasRef}
        width={600}
        height={300}
        className="w-full h-full rounded-lg"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredPoint(null)}
      />
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-80 p-2 rounded text-xs text-gray-600">
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 bg-blue-500 opacity-70 rounded-full mr-1"></div>
          <span>Normal Transaction</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 opacity-70 rounded-full mr-1"></div>
          <span>Fraudulent Transaction</span>
        </div>
      </div>
    </div>
  );
};

export default TransactionMap; 