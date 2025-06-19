import React, { useState, useEffect, useRef } from 'react';
import { GeometryCalculator } from './utils/geometry.js';
import { BuildingInput } from './components/BuildingInput.jsx';

function App() {
  const [building1, setBuilding1] = useState({
    name: 'Building A',
    coordinates: [
      { x: 50, y: 50 },
      { x: 150, y: 50 },
      { x: 150, y: 150 },
      { x: 50, y: 150 }
    ]
  });

  const [building2, setBuilding2] = useState({
    name: 'Building B',
    coordinates: [
      { x: 300, y: 100 },
      { x: 400, y: 100 },
      { x: 400, y: 200 },
      { x: 300, y: 200 }
    ]
  });

  const [explosiveWeight, setExplosiveWeight] = useState(100);
  const [results, setResults] = useState(null);
  const canvasRef = useRef(null);

  const geometryCalculator = new GeometryCalculator();

  useEffect(() => {
    if (building1.coordinates.length >= 3 && building2.coordinates.length >= 3 && explosiveWeight > 0) {
      const actualDistance = geometryCalculator.polygonToPolygonDistance(
        building1.coordinates,
        building2.coordinates
      );
      
      const requiredDistance = geometryCalculator.calculateSafetyDistance(explosiveWeight);
      const safetyFactor = actualDistance / requiredDistance;
      const isSafe = actualDistance >= requiredDistance;

      setResults({
        actualDistance,
        requiredDistance,
        safetyFactor,
        isSafe
      });
    }
  }, [building1.coordinates, building2.coordinates, explosiveWeight]);

  // Canvas drawing effect
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

    // Draw distance line if results available
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

  }, [building1, building2, results]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Distance Calculator
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Calculate minimum safety distances between buildings based on explosive quantities.
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                📍 Building Configuration
              </h2>
              
              <BuildingInput
                building={building1}
                onUpdate={setBuilding1}
                color="bg-blue-100 text-blue-800"
              />
              
              <div className="my-6 border-t border-gray-200"></div>
              
              <BuildingInput
                building={building2}
                onUpdate={setBuilding2}
                color="bg-red-100 text-red-800"
              />

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explosive Weight (kg)
                </label>
                <input
                  type="number"
                  value={explosiveWeight}
                  onChange={(e) => setExplosiveWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            {results && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  🛡️ Safety Analysis
                </h2>
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border-2 ${
                    results.isSafe 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`font-semibold ${
                        results.isSafe ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {results.isSafe ? 'SAFE' : 'UNSAFE'}
                      </span>
                    </div>
                    <p className={`text-sm ${
                      results.isSafe ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {results.isSafe 
                        ? 'Buildings meet minimum safety distance requirements'
                        : 'Buildings are too close for the given explosive quantity'
                      }
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Actual Distance</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {results.actualDistance.toFixed(2)} units
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Required Distance</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {results.requiredDistance.toFixed(2)} units
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg ${
                      results.safetyFactor >= 1 ? 'bg-green-50' : 'bg-orange-50'
                    }`}>
                      <div className="text-sm text-gray-600 mb-1">Safety Factor</div>
                      <div className={`text-lg font-semibold ${
                        results.safetyFactor >= 1 ? 'text-green-700' : 'text-orange-700'
                      }`}>
                        {results.safetyFactor.toFixed(2)}x
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Visualization Panel */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Building Layout & Safety Zones
              </h2>
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
                      <div className="w-4 h-4 bg-green-500 bg-opacity-30 border-2 border-green-500"></div>
                      <span>{building2.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                      <span>Closest Points</span>
                    </div>
                    {results && (
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-1 ${results.isSafe ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span>Distance</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 