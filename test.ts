type HomeGrid = {
  slug: string;
  items?: unknown[];
};

const ALWAYS_RENDER_SLUGS = new Set(['bonus-widget', 'home-races']);

/**
 * Splits heavy UI updates into small macrotasks.
 * The browser can paint/user-input between chunks, avoiding long tasks.
 */
export class GridRenderTaskQueue {
  private readonly pending: HomeGrid[] = [];
  private drainScheduled = false;
  private sourceCompleted = false;

  constructor(
    private readonly appendGrid: (grid: HomeGrid) => void,
    private readonly onFullyDrained: () => void,
    private readonly chunkTimeBudgetMs = 8,
  ) {}

  enqueue(grid: HomeGrid): void {
    if (!this.shouldRender(grid)) {
      return;
    }

    this.pending.push(grid);
    this.scheduleDrain();
  }

  markSourceAsCompleted(): void {
    this.sourceCompleted = true;
    this.scheduleDrain();
  }

  private shouldRender(grid: HomeGrid): boolean {
    return ALWAYS_RENDER_SLUGS.has(grid.slug) || Boolean(grid.items?.length);
  }

  private scheduleDrain(): void {
    if (this.drainScheduled) {
      return;
    }

    this.drainScheduled = true;
    setTimeout(() => this.drainChunk(), 0);
  }

  private drainChunk(): void {
    this.drainScheduled = false;
    const start = performance.now();

    while (this.pending.length > 0) {
      const nextGrid = this.pending.shift() as HomeGrid;
      this.appendGrid(nextGrid);

      // Yield once we spend our time slice.
      if (performance.now() - start >= this.chunkTimeBudgetMs) {
        this.scheduleDrain();
        return;
      }
    }

    if (this.sourceCompleted) {
      this.onFullyDrained();
    }
  }
}

/**
 * Drop-in shape for your Home component integration.
 * Replace your `next` + `complete` handlers with this queue.
 */
export class PageHomeLongTaskExample {
  public grids: HomeGrid[] = [];

  private readonly gridRenderQueue = new GridRenderTaskQueue(
    (grid) => {
      // push avoids expensive `this.grids = [...this.grids, grid]` copies.
      this.grids.push(grid);
    },
    () => this.pageRendered(),
  );

  /**
   * Use with Angular template:
   * *ngFor="let grid of grids; trackBy: trackGridBySlug"
   */
  trackGridBySlug(index: number, grid: HomeGrid): string {
    return `${index}-${grid.slug}`;
  }

  onGridLoaded(grid: HomeGrid): void {
    this.gridRenderQueue.enqueue(grid);
  }

  onAllGridRequestsCompleted(): void {
    this.gridRenderQueue.markSourceAsCompleted();
  }

  private pageRendered(): void {
    // existing pageRendered logic goes here
  }
}