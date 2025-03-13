# Integrating the Token Distribution Chart in Mintlify

Follow these steps to add the Amped Finance token distribution chart to your Mintlify documentation site.

## Step 1: Install Required Dependencies

First, make sure you have the necessary dependencies installed in your Mintlify project:

```bash
npm install recharts
```

## Step 2: Create the Component

1. Create a `components` directory in your Mintlify project if it doesn't already exist
2. Create a new file `components/TokenDistributionChart.jsx` and copy the code from the provided component file

## Step 3: Use the Component in Your Documentation

You can now use the component in any of your MDX files:

```mdx
---
title: Tokenomics
description: Amped Finance token distribution and allocation
---

import TokenDistributionChart from '../components/TokenDistributionChart';

# Token Distribution

Below is the complete token distribution schedule for Amped Finance, showing how all 100 million tokens are allocated over time:

<TokenDistributionChart />

## Distribution Categories

- **LightLink Foundation**: 10M tokens (10%)
- **Private Sale**: 7M tokens (7%)
- **KOL**: 5M tokens (5%)
- **Public Sale**: 8M tokens (8%)
- **Advisors**: 2M tokens (2%)
- **Team**: 9M tokens (9%)
- **Rewards**: 5M tokens (5%)
- **Liquidity**: 15M tokens (15%)
- **Reserve**: 11M tokens (11%)
- **Protocol Incentives**: 28M tokens (28%)
```

## Step 4: Configure Mintlify for React Components

Ensure your `mint.json` configuration file has the correct settings to support React components:

```json
{
  "reactStrictMode": true,
  "baseUrl": "your-base-url",
  "integrations": {
    "mdx": {
      "rehypePlugins": [
        ["rehype-external-links", { "target": "_blank", "rel": ["nofollow"] }]
      ]
    }
  }
}
```

## Customization Options

### Modifying Colors

If you want to change the color scheme, you can update the `categoryColors` object in the component:

```jsx
const categoryColors = {
  "LightLink Foundation": "#your-color-here",
  // other categories...
};
```

### Adjusting Chart Size

You can modify the chart's dimensions by changing the `height` property in:

```jsx
<div className="w-full h-96 mt-4">
  {/* ... */}
</div>
```

### Adding or Updating Data

If the token distribution changes, you can update the `DISTRIBUTION_DATA` array in the component file.

## Troubleshooting

### Chart Not Rendering

If the chart doesn't appear:

1. Ensure you've installed recharts (`npm install recharts`)
2. Check your browser console for errors
3. Verify the component is properly imported in your MDX file

### Styling Issues

If the chart styling looks different from what you expect:

1. Make sure Tailwind CSS is properly configured in your Mintlify project
2. You might need to add specific Tailwind classes to your `mint.json` configuration's `tailwindConfig` section

### Browser Compatibility

The chart uses modern web features that work in all recent browsers. If you need to support older browsers, consider adding appropriate polyfills.
