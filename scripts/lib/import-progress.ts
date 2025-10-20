/**
 * Import Progress Tracker
 *
 * Tracks import progress for recipe sources with resume capability
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export type ImportSource = 'themealdb' | 'open-recipe-db' | 'usda' | 'tasty';

export interface ImportError {
  id: string;
  error: string;
  timestamp: string;
}

export interface ImportProgress {
  source: ImportSource;
  total: number;
  imported: number;
  failed: number;
  skipped: number;
  lastImportedId?: string;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  errors: ImportError[];
}

export class ImportProgressTracker {
  private progressFile: string;
  private progress: ImportProgress;
  private importedIds: Set<string>;
  private saveInterval: NodeJS.Timeout | null = null;
  private pendingSave = false;

  constructor(source: ImportSource) {
    this.progressFile = path.join(process.cwd(), 'tmp', `import-progress-${source}.json`);
    this.progress = {
      source,
      total: 0,
      imported: 0,
      failed: 0,
      skipped: 0,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      errors: [],
    };
    this.importedIds = new Set();

    // Auto-save every 5 seconds if there are pending changes
    this.saveInterval = setInterval(() => {
      if (this.pendingSave) {
        this.saveProgress().catch(console.error);
      }
    }, 5000);
  }

  /**
   * Load existing progress from file, or create new progress
   */
  async loadProgress(): Promise<void> {
    try {
      // Ensure tmp directory exists
      await fs.mkdir(path.dirname(this.progressFile), { recursive: true });

      // Try to read existing progress file
      const data = await fs.readFile(this.progressFile, 'utf-8');
      this.progress = JSON.parse(data);

      // Rebuild importedIds set for fast lookups
      this.importedIds = new Set();
      console.log(`📂 Loaded existing progress: ${this.progress.imported}/${this.progress.total} imported`);
    } catch (error) {
      // File doesn't exist or is invalid - start fresh
      console.log('📝 Starting new import session');
    }
  }

  /**
   * Save progress to file
   */
  async saveProgress(): Promise<void> {
    try {
      this.progress.updatedAt = new Date().toISOString();
      await fs.writeFile(
        this.progressFile,
        JSON.stringify(this.progress, null, 2),
        'utf-8'
      );
      this.pendingSave = false;
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  /**
   * Set total number of items to import
   */
  setTotal(total: number): void {
    this.progress.total = total;
    this.pendingSave = true;
  }

  /**
   * Mark item as successfully imported
   */
  markImported(id: string): void {
    this.progress.imported++;
    this.progress.lastImportedId = id;
    this.importedIds.add(id);
    this.pendingSave = true;
  }

  /**
   * Mark item as failed with error details
   */
  markFailed(id: string, error: string): void {
    this.progress.failed++;
    this.progress.errors.push({
      id,
      error: error.substring(0, 500), // Truncate long errors
      timestamp: new Date().toISOString(),
    });

    // Keep only last 100 errors to prevent file bloat
    if (this.progress.errors.length > 100) {
      this.progress.errors = this.progress.errors.slice(-100);
    }

    this.pendingSave = true;
  }

  /**
   * Mark item as skipped (already exists or filtered out)
   */
  markSkipped(id: string): void {
    this.progress.skipped++;
    this.importedIds.add(id);
    this.pendingSave = true;
  }

  /**
   * Check if item should be skipped (already imported)
   */
  shouldSkip(id: string): boolean {
    return this.importedIds.has(id);
  }

  /**
   * Mark import as completed
   */
  async markComplete(): Promise<void> {
    this.progress.completedAt = new Date().toISOString();
    await this.saveProgress();

    // Stop auto-save interval
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  }

  /**
   * Get current progress
   */
  getProgress(): ImportProgress {
    return { ...this.progress };
  }

  /**
   * Get progress percentage
   */
  getProgressPercentage(): number {
    if (this.progress.total === 0) return 0;
    return Math.round((this.progress.imported / this.progress.total) * 100);
  }

  /**
   * Get formatted status string
   */
  getStatusString(): string {
    const percentage = this.getProgressPercentage();
    const { imported, failed, skipped, total } = this.progress;
    return `${percentage}% (${imported} imported, ${failed} failed, ${skipped} skipped / ${total} total)`;
  }

  /**
   * Print summary
   */
  printSummary(): void {
    const elapsed = this.getElapsedTime();
    console.log('\n' + '='.repeat(60));
    console.log('📊 Import Summary');
    console.log('='.repeat(60));
    console.log(`Source: ${this.progress.source}`);
    console.log(`Total: ${this.progress.total}`);
    console.log(`✅ Imported: ${this.progress.imported}`);
    console.log(`⏭️  Skipped: ${this.progress.skipped}`);
    console.log(`❌ Failed: ${this.progress.failed}`);
    console.log(`Progress: ${this.getProgressPercentage()}%`);
    console.log(`Time: ${elapsed}`);

    if (this.progress.errors.length > 0) {
      console.log(`\n⚠️  Last ${Math.min(5, this.progress.errors.length)} errors:`);
      this.progress.errors.slice(-5).forEach(({ id, error }) => {
        console.log(`  - ${id}: ${error.substring(0, 80)}...`);
      });
    }

    console.log('='.repeat(60) + '\n');
  }

  /**
   * Get elapsed time since start
   */
  private getElapsedTime(): string {
    const start = new Date(this.progress.startedAt);
    const end = this.progress.completedAt
      ? new Date(this.progress.completedAt)
      : new Date();

    const seconds = Math.floor((end.getTime() - start.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Cleanup and close tracker
   */
  async cleanup(): Promise<void> {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
    await this.saveProgress();
  }
}
