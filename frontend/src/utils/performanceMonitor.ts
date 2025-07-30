/**
 * Performance monitoring utility for filter operations
 * Tracks timing and memory usage for optimization purposes
 */

interface PerformanceMetrics {
  operation: string;
  duration: number;
  itemCount: number;
  timestamp: number;
  memoryUsage?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 100; // Keep only last 100 metrics

  /**
   * Start timing an operation
   */
  startTiming(operation: string): () => void {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    return (itemCount: number = 0) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      const endMemory = this.getMemoryUsage();

      const metric: PerformanceMetrics = {
        operation,
        duration,
        itemCount,
        timestamp: Date.now(),
        memoryUsage: endMemory - startMemory,
      };

      this.addMetric(metric);

      // Log performance warnings for slow operations
      if (duration > 200) {
        console.warn(
          `Slow filter operation detected: ${operation} took ${duration.toFixed(
            2
          )}ms for ${itemCount} items`
        );
      }

      // Log memory usage warnings
      if (metric.memoryUsage && metric.memoryUsage > 10) {
        console.warn(
          `High memory usage detected: ${operation} used ${metric.memoryUsage.toFixed(
            2
          )}MB`
        );
      }
    };
  }

  /**
   * Add a metric to the collection
   */
  private addMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Get memory usage in MB (if available)
   */
  private getMemoryUsage(): number {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }
    return 0;
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    averageDuration: number;
    slowestOperation: PerformanceMetrics | null;
    totalOperations: number;
    operationBreakdown: Record<string, { count: number; avgDuration: number }>;
  } {
    if (this.metrics.length === 0) {
      return {
        averageDuration: 0,
        slowestOperation: null,
        totalOperations: 0,
        operationBreakdown: {},
      };
    }

    const totalDuration = this.metrics.reduce(
      (sum, metric) => sum + metric.duration,
      0
    );
    const averageDuration = totalDuration / this.metrics.length;

    const slowestOperation = this.metrics.reduce((slowest, current) =>
      current.duration > slowest.duration ? current : slowest
    );

    const operationBreakdown: Record<
      string,
      { count: number; avgDuration: number }
    > = {};

    this.metrics.forEach((metric) => {
      if (!operationBreakdown[metric.operation]) {
        operationBreakdown[metric.operation] = { count: 0, avgDuration: 0 };
      }

      const breakdown = operationBreakdown[metric.operation];
      breakdown.count++;
      breakdown.avgDuration =
        (breakdown.avgDuration * (breakdown.count - 1) + metric.duration) /
        breakdown.count;
    });

    return {
      averageDuration,
      slowestOperation,
      totalOperations: this.metrics.length,
      operationBreakdown,
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Log current performance statistics to console
   */
  logStats(): void {
    const stats = this.getStats();

    if (stats.totalOperations === 0) {
      console.log("No performance metrics available");
      return;
    }

    console.group("🚀 Filter Performance Statistics");
    console.log(`Total operations: ${stats.totalOperations}`);
    console.log(`Average duration: ${stats.averageDuration.toFixed(2)}ms`);

    if (stats.slowestOperation) {
      console.log(
        `Slowest operation: ${
          stats.slowestOperation.operation
        } (${stats.slowestOperation.duration.toFixed(2)}ms)`
      );
    }

    console.log("Operation breakdown:");
    Object.entries(stats.operationBreakdown).forEach(([operation, data]) => {
      console.log(
        `  ${operation}: ${data.count} ops, avg ${data.avgDuration.toFixed(
          2
        )}ms`
      );
    });

    console.groupEnd();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Decorator function for timing operations
 */
export function withPerformanceTracking<T extends (...args: any[]) => any>(
  operation: string,
  fn: T
): T {
  return ((...args: any[]) => {
    const endTiming = performanceMonitor.startTiming(operation);
    const result = fn(...args);

    // Handle both sync and async functions
    if (result instanceof Promise) {
      return result.finally(() => {
        endTiming(Array.isArray(args[0]) ? args[0].length : 0);
      });
    } else {
      endTiming(Array.isArray(result) ? result.length : 0);
      return result;
    }
  }) as T;
}

/**
 * Hook for accessing performance monitor in React components
 */
export function usePerformanceMonitor() {
  return {
    startTiming: performanceMonitor.startTiming.bind(performanceMonitor),
    getStats: performanceMonitor.getStats.bind(performanceMonitor),
    logStats: performanceMonitor.logStats.bind(performanceMonitor),
    clearMetrics: performanceMonitor.clearMetrics.bind(performanceMonitor),
  };
}
