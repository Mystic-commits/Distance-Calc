export class GeometryCalculator {
  constructor() {
    this.K = 4; // Safety distance constant
  }

  /**
   * Calculate the minimum distance between two polygons
   */
  polygonToPolygonDistance(polygon1, polygon2) {
    let minDistance = Infinity;

    // Check distance from each vertex of polygon1 to each edge of polygon2
    for (const vertex of polygon1) {
      for (let i = 0; i < polygon2.length; i++) {
        const edge1 = polygon2[i];
        const edge2 = polygon2[(i + 1) % polygon2.length];
        const distance = this.pointToLineSegmentDistance(vertex, edge1, edge2);
        minDistance = Math.min(minDistance, distance);
      }
    }

    // Check distance from each vertex of polygon2 to each edge of polygon1
    for (const vertex of polygon2) {
      for (let i = 0; i < polygon1.length; i++) {
        const edge1 = polygon1[i];
        const edge2 = polygon1[(i + 1) % polygon1.length];
        const distance = this.pointToLineSegmentDistance(vertex, edge1, edge2);
        minDistance = Math.min(minDistance, distance);
      }
    }

    // Check edge-to-edge distances for more accuracy
    for (let i = 0; i < polygon1.length; i++) {
      const edge1Start = polygon1[i];
      const edge1End = polygon1[(i + 1) % polygon1.length];
      
      for (let j = 0; j < polygon2.length; j++) {
        const edge2Start = polygon2[j];
        const edge2End = polygon2[(j + 1) % polygon2.length];
        
        const distance = this.lineSegmentToLineSegmentDistance(
          edge1Start, edge1End, edge2Start, edge2End
        );
        minDistance = Math.min(minDistance, distance);
      }
    }

    return minDistance;
  }

  /**
   * Calculate the minimum distance between two line segments
   */
  lineSegmentToLineSegmentDistance(p1, p2, p3, p4) {
    const distances = [
      this.pointToLineSegmentDistance(p1, p3, p4),
      this.pointToLineSegmentDistance(p2, p3, p4),
      this.pointToLineSegmentDistance(p3, p1, p2),
      this.pointToLineSegmentDistance(p4, p1, p2)
    ];

    return Math.min(...distances);
  }

  /**
   * Calculate the minimum distance from a point to a line segment
   */
  pointToLineSegmentDistance(point, lineStart, lineEnd) {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) {
      return Math.sqrt(A * A + B * B);
    }

    let param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Find the closest points between two polygons
   */
  findClosestPoints(polygon1, polygon2) {
    let minDistance = Infinity;
    let closestPoint1 = polygon1[0];
    let closestPoint2 = polygon2[0];

    // Check all vertex-to-edge combinations
    for (const vertex of polygon1) {
      for (let i = 0; i < polygon2.length; i++) {
        const edge1 = polygon2[i];
        const edge2 = polygon2[(i + 1) % polygon2.length];
        const closestPoint = this.closestPointOnLineSegment(vertex, edge1, edge2);
        const distance = this.pointDistance(vertex, closestPoint);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint1 = vertex;
          closestPoint2 = closestPoint;
        }
      }
    }

    for (const vertex of polygon2) {
      for (let i = 0; i < polygon1.length; i++) {
        const edge1 = polygon1[i];
        const edge2 = polygon1[(i + 1) % polygon1.length];
        const closestPoint = this.closestPointOnLineSegment(vertex, edge1, edge2);
        const distance = this.pointDistance(vertex, closestPoint);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint1 = closestPoint;
          closestPoint2 = vertex;
        }
      }
    }

    return { point1: closestPoint1, point2: closestPoint2 };
  }

  /**
   * Find the closest point on a line segment to a given point
   */
  closestPointOnLineSegment(point, lineStart, lineEnd) {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) {
      return lineStart;
    }

    let param = dot / lenSq;

    if (param < 0) {
      return lineStart;
    } else if (param > 1) {
      return lineEnd;
    } else {
      return {
        x: lineStart.x + param * C,
        y: lineStart.y + param * D
      };
    }
  }

  /**
   * Calculate required safety distance based on explosive weight
   */
  calculateSafetyDistance(weight) {
    return this.K * Math.pow(weight, 1/3);
  }

  /**
   * Calculate the centroid of a polygon
   */
  calculateCentroid(points) {
    const x = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const y = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    return { x, y };
  }

  /**
   * Calculate the distance between two points
   */
  pointDistance(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
} 