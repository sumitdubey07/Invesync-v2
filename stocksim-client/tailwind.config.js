export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0a0a0f',
          surface: '#12121a',
          card: '#1a1a2e',
          border: '#2a2a3d',
          purple: '#7c3aed',
          purpleLight: '#8b5cf6',
          blue: '#3b82f6',
          blueLight: '#60a5fa',
          green: '#22c55e',
          red: '#ef4444',
          text: '#e2e8f0',
          muted: '#94a3b8',
          faint: '#475569',
        }
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
      }
    }
  },
  plugins: [],
}