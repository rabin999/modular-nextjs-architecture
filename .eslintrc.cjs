const fs = require('fs')
const path = require('path')

/**
 * Dynamically generate ESLint zones for feature isolation
 * This prevents cross-feature imports automatically based on folder structure
 */
function generateFeatureZones() {
  const featuresDir = path.join(__dirname, 'src', 'features')

  // Get all feature directories (excluding files like registry.ts)
  const features = fs.readdirSync(featuresDir)
    .filter(item => {
      const itemPath = path.join(featuresDir, item)
      return fs.statSync(itemPath).isDirectory()
    })

  // Generate a zone for each feature that blocks imports from other features
  return features.map(feature => ({
    target: `./src/features/${feature}`,
    from: './src/features',
    except: [`./${feature}`],
    message: `Feature '${feature}' cannot import from other features. Use registry or shared modules.`
  }))
}

// Generate zones dynamically
const featureZones = generateFeatureZones()

module.exports = {
  extends: 'next/core-web-vitals',
  plugins: ['import'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@/features/*/*'],
            message: 'Features should not import from other features directly. Use the registry or shared abstraction.'
          },
          {
            group: ['../../features/*'],
            message: 'Relative imports between features are forbidden.'
          }
        ]
      }
    ],
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          // Dynamically generated feature isolation zones
          ...featureZones,

          // Enforce unidirectional flow: shared → features → app
          {
            target: './src/features',
            from: './src/app',
            message: 'Features cannot import from app layer. Flow must be: core/shared → features → app'
          },
          {
            target: ['./src/core', './src/shared'],
            from: ['./src/features', './src/app'],
            message: 'Core and Shared cannot import from features or app. They must remain dependency-free.'
          }
        ]
      }
    ]
  },
  overrides: [
    {
      files: ['src/core/**', 'src/shared/**'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/features/**'],
                message: 'Core and Shared modules cannot import from Features.'
              },
              {
                group: ['@/app/**'],
                message: 'Core and Shared modules cannot import from App layer.'
              }
            ]
          }
        ]
      }
    }
  ]
}
