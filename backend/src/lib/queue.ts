/**
 * Simple in-process async job queue.
 * Prevents thundering-herd on Gemini / Twilio / D-ID when hundreds of users
 * hit AI features simultaneously. Each API has its own queue with a concurrency cap.
 *
 * If you later add Redis, swap this for BullMQ — the interface is the same.
 */

class AsyncQueue {
  private concurrency: number
  private running   = 0
  private pending: Array<() => void> = []

  constructor(concurrency = 5) {
    this.concurrency = concurrency
  }

  run<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const execute = () => {
        this.running++
        fn()
          .then(resolve)
          .catch(reject)
          .finally(() => {
            this.running--
            if (this.pending.length) this.pending.shift()!()
          })
      }
      if (this.running < this.concurrency) {
        execute()
      } else {
        this.pending.push(execute)
      }
    })
  }

  get size() { return this.running + this.pending.length }
}

// Separate queues per external API — keep them from blocking each other
export const geminiQueue = new AsyncQueue(8)   // 8 concurrent Gemini calls
export const twilioQueue = new AsyncQueue(20)  // Twilio handles higher concurrency
export const didQueue    = new AsyncQueue(10)  // D-ID API concurrency
