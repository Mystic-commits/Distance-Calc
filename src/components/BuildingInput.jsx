import React from 'react';

export function BuildingInput({ building, onUpdate, color }) {
  const updateCoordinate = (index, field, value) => {
    const newCoordinates = [...building.coordinates];
    newCoordinates[index] = { ...newCoordinates[index], [field]: value };
    onUpdate({ ...building, coordinates: newCoordinates });
  };

  const addCoordinate = () => {
    const lastPoint = building.coordinates[building.coordinates.length - 1];
    const newPoint = { x: lastPoint.x + 50, y: lastPoint.y + 50 };
    onUpdate({
      ...building,
      coordinates: [...building.coordinates, newPoint]
    });
  };

  const removeCoordinate = (index) => {
    if (building.coordinates.length > 3) {
      const newCoordinates = building.coordinates.filter((_, i) => i !== index);
      onUpdate({ ...building, coordinates: newCoordinates });
    }
  };

  const updateName = (name) => {
    onUpdate({ ...building, name });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${color}`}>
          {building.name}
        </span>
        <input
          type="text"
          value={building.name}
          onChange={(e) => updateName(e.target.value)}
          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          ✏️ Coordinates
        </div>
        
        {building.coordinates.map((coord, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-6">
              {index + 1}
            </span>
            <div className="flex items-center gap-1 flex-1">
              <label className="text-xs text-gray-600">X:</label>
              <input
                type="number"
                value={coord.x}
                onChange={(e) => updateCoordinate(index, 'x', parseFloat(e.target.value) || 0)}
                className="px-2 py-1 text-sm border border-gray-300 rounded w-20 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
              <label className="text-xs text-gray-600">Y:</label>
              <input
                type="number"
                value={coord.y}
                onChange={(e) => updateCoordinate(index, 'y', parseFloat(e.target.value) || 0)}
                className="px-2 py-1 text-sm border border-gray-300 rounded w-20 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {building.coordinates.length > 3 && (
              <button
                onClick={() => removeCoordinate(index)}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
              >
                ➖
              </button>
            )}
          </div>
        ))}
        
        <button
          onClick={addCoordinate}
          className="flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
        >
          ➕ Add Point
        </button>
      </div>
    </div>
  );
} 