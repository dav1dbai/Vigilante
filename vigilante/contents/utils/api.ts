export function simulateAPICall(): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Randomly return true or false.
      const result = Math.random() < 0.5;
      resolve(result);
    }, 1000);
  });
} 