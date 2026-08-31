/**
 * Simulates an async API call against in-memory mock data.
 * Used by the domain modules while the Django backend is not connected.
 */
export function mockRequest(resolver, { latency = 350, failRate = 0 } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (Math.random() < failRate) {
          reject(new Error("Simulated network failure"));
          return;
        }
        resolve(resolver());
      } catch (err) {
        reject(err);
      }
    }, latency);
  });
}
