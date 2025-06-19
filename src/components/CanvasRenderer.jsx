import React, { useRef, useEffect } from 'react';
import { GeometryCalculator } from '../utils/geometry.js';

export function CanvasRenderer({ building1, building2, results }) {
  const canvasRef = useRef(null);
  const geometryCalculator = new GeometryCalculator();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate bounds for auto-scaling
    const allPoints = [...building1.coordinates, ...building2.coordinates];
    const bounds = {
      minX: Math.min(...allPoints.map(p => p.x)) - 50,
      maxX: Math.max(...allPoints.map(p => p.x)) + 50,
      minY: Math.min(...allPoints.map(p => p.y)) - 50,
      maxY: Math.max(...allPoints.map(p => p.y)) + 50
    };

    const scale = Math.min(
      (canvas.width - 40) / (bounds.maxX - bounds.minX),
      (canvas.height - 40) / (bounds.maxY - bounds.minY)
    );

    const offsetX = 20 - bounds.minX * scale;
    const offsetY = 20 - bounds.minY * scale;

    // Transform coordinates to canvas space
    const transform = (point) => ({
      x: point.x * scale + offsetX,
      y: point.y * scale + offsetY
    });

    // Draw grid
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (canvas.width / 10) * i;
      const y = (canvas.height / 10) * i;
      
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw safety zone if results available
    if (results && results.requiredDistance > 0) {
      const centroid1 = geometryCalculator.calculateCentroid(building1.coordinates);
      const transformedCentroid1 = transform(centroid1);
      
      ctx.fillStyle = results.isSafe ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.15)';
      ctx.strokeStyle = results.isSafe ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      ctx.beginPath();
      ctx.arc(
        transformedCentroid1.x,
        transformedCentroid1.y,
        results.requiredDistance * scale,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Building 1
    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    const transformedCoords1 = building1.coordinates.map(transform);
    ctx.moveTo(transformedCoords1[0].x, transformedCoords1[0].y);
    for (let i = 1; i < transformedCoords1.length; i++) {
      ctx.lineTo(transformedCoords1[i].x, transformedCoords1[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Label Building 1
    const centroid1 = geometryCalculator.calculateCentroid(building1.coordinates);
    const transformedCentroid1 = transform(centroid1);
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(building1.name, transformedCentroid1.x, transformedCentroid1.y + 5);

    // Draw Building 2
    ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    const transformedCoords2 = building2.coordinates.map(transform);
    ctx.moveTo(transformedCoords2[0].x, transformedCoords2[0].y);
    for (let i = 1; i < transformedCoords2.length; i++) {
      ctx.lineTo(transformedCoords2[i].x, transformedCoords2[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Label Building 2
    const centroid2 = geometryCalculator.calculateCentroid(building2.coordinates);
    const transformedCentroid2 = transform(centroid2);
    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(building2.name, transformedCentroid2.x, transformedCentroid2.y + 5);

    // Draw distance line between closest points if results available
    if (results) {
      const closestPoints = geometryCalculator.findClosestPoints(
        building1.coordinates,
        building2.coordinates
      );
      
      const transformedPoint1 = transform(closestPoints.point1);
      const transformedPoint2 = transform(closestPoints.point2);
      
      // Draw closest points
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(transformedPoint1.x, transformedPoint1.y, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(transformedPoint2.x, transformedPoint2.y, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw distance line
      ctx.strokeStyle = results.isSafe ? '#16a34a' : '#dc2626';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      
      ctx.beginPath();
      ctx.moveTo(transformedPoint1.x, transformedPoint1.y);
      ctx.lineTo(transformedPoint2.x, transformedPoint2.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw distance label
      const midX = (transformedPoint1.x + transformedPoint2.x) / 2;
      const midY = (transformedPoint1.y + transformedPoint2.y) / 2;
      
      ctx.fillStyle = 'white';
      ctx.fillRect(midX - 40, midY - 15, 80, 20);
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      ctx.strokeRect(midX - 40, midY - 15, 80, 20);
      
      ctx.fillStyle = results.isSafe ? '#16a34a' : '#dc2626';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${results.actualDistance.toFixed(1)}`, midX, midY + 3);
    }

    // Draw coordinate points for reference
    [...building1.coordinates, ...building2.coordinates].forEach((point, index) => {
      const transformed = transform(point);
      ctx.fillStyle = index < building1.coordinates.length ? '#2563eb' : '#16a34a';
      ctx.beginPath();
      ctx.arc(transformed.x, transformed.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

  }, [building1, building2, results]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-200 rounded-lg bg-white shadow-inner"
      />
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 text-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 bg-opacity-30 border-2 border-blue-500"></div>
            <span>{building1.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 bg-opacity-30 border-2 border-red-500"></div>
            <span>{building2.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded-full"></div>
            <span>Closest Points</span>
          </div>
          {results && (
            <div className="flex items-center gap-2">
              <div className={`w-4 h-1 ${results.isSafe ? 'bg-red-500' : 'bg-red-500'}`}></div>
              <span>Distance</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 