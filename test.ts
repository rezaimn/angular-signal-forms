export type reza = 'test';

type GridItem = {
  slug: string;
  items?: unknown[];
};

/**
 * Minimal, drop-in fix for the hot `next` path:
 * - keeps your current filtering logic
 * - splits grid append work into small chunks
 * - avoids expensive `this.grids = [...this.grids, grid]` on each emission
 */
export class PageHomeComponent {
  public grids: GridItem[] = [];

  private readonly pendingGridUpdates: GridItem[] = [];
  private isFlushScheduled = false;
  private isSourceCompleted = false;
  private readonly gridsPerChunk = 3;

  handleGridStream(verticalObservables: Array<unknown>): void {
    // This mirrors your existing subscribe object with only the hot path changed.
    void verticalObservables;
  }

  onGridLoaded(grid: GridItem): void {
    if (grid.slug === 'bonus-widget' || grid.slug === 'home-races' || (grid.items && grid.items.length > 0)) {
      this.pendingGridUpdates.push(grid);
      this.scheduleGridFlush();
    }
  }

  onGridLoadingCompleted(): void {
    this.isSourceCompleted = true;
    this.scheduleGridFlush();
  }

  private scheduleGridFlush(): void {
    if (this.isFlushScheduled) {
      return;
    }

    this.isFlushScheduled = true;
    setTimeout(() => this.flushGridChunk(), 0);
  }

  private flushGridChunk(): void {
    this.isFlushScheduled = false;

    let processed = 0;
    while (this.pendingGridUpdates.length > 0 && processed < this.gridsPerChunk) {
      const nextGrid = this.pendingGridUpdates.shift() as GridItem;
      this.grids.push(nextGrid);
      processed++;
    }

    if (this.pendingGridUpdates.length > 0) {
      this.scheduleGridFlush();
      return;
    }

    if (this.isSourceCompleted) {
      this.pageRendered();
    }
  }

  private pageRendered(): void {
    // existing pageRendered logic goes here
  }
}