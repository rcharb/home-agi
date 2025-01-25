import { config } from 'dotenv';
import { readFile } from 'node:fs/promises';
import path from 'path';

// Load .env.local in development
if (process.env.NODE_ENV !== 'production') {
  config({ path: path.resolve(process.cwd(), '.env.local') });
}

// Build information
process.env.NEXT_PUBLIC_BUILD_HASH = 'big-agi-2-dev';
process.env.NEXT_PUBLIC_BUILD_PKGVER = JSON.parse('' + await readFile(new URL('./package.json', import.meta.url))).version;
process.env.NEXT_PUBLIC_BUILD_TIMESTAMP = new Date().toISOString();
console.log(` 🧠 \x1b[1mbig-AGI\x1b[0m v${process.env.NEXT_PUBLIC_BUILD_PKGVER} (@${process.env.NEXT_PUBLIC_BUILD_HASH})`);

// Non-default build types
const buildType =
  process.env.BIG_AGI_BUILD === 'standalone' ? 'standalone'
    : process.env.BIG_AGI_BUILD === 'static' ? 'export'
      : undefined;

buildType && console.log(` 🧠 big-AGI: building for ${buildType}...\n`);

// Force persona selection for debugging
const personaSelection = 'home';  // Explicitly set to 'home'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    personaSelection: personaSelection
  },
  env: {
    NEXT_PUBLIC_PERSONA_SELECTION: process.env.NEXT_PUBLIC_PERSONA_SELECTION || 'default',
    NEXT_PUBLIC_DEBUG: 'true'
  },

  // [exports] https://nextjs.org/docs/advanced-features/static-html-export
  ...buildType && {
    output: buildType,
    distDir: 'dist',

    // disable image optimization for exports
    images: { unoptimized: true },

    // Optional: Change links `/me` -> `/me/` and emit `/me.html` -> `/me/index.html`
    // trailingSlash: true,
  },

  // [puppeteer] https://github.com/puppeteer/puppeteer/issues/11052
  // NOTE: we may not be needing this anymore, as we use '@cloudflare/puppeteer'
  serverExternalPackages: ['puppeteer-core'],

  webpack: (config, { isServer }) => {
    // @mui/joy: anything material gets redirected to Joy
    config.resolve.alias['@mui/material'] = '@mui/joy';

    // @dqbd/tiktoken: enable asynchronous WebAssembly
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    // fix warnings for async functions in the browser (https://github.com/vercel/next.js/issues/64792)
    if (!isServer) {
      config.output.environment = { ...config.output.environment, asyncFunction: true };
    }

    // prevent too many small chunks (40kb min) on 'client' packs (not 'server' or 'edge-server')
    // noinspection JSUnresolvedReference
    if (typeof config.optimization.splitChunks === 'object' && config.optimization.splitChunks.minSize) {
      // noinspection JSUnresolvedReference
      config.optimization.splitChunks.minSize = 40 * 1024;
    }

    config.plugins = config.plugins || [];
    
    // Add environment variables explicitly
    config.plugins.push(
      new config.webpack.DefinePlugin({
        'process.env.NEXT_PUBLIC_PERSONA_SELECTION': JSON.stringify(process.env.NEXT_PUBLIC_PERSONA_SELECTION || 'home')
      })
    );

    return config;
  },

  // Note: disabled to check whether the project becomes slower with this
  // modularizeImports: {
  //   '@mui/icons-material': {
  //     transform: '@mui/icons-material/{{member}}',
  //   },
  // },

  // Uncomment the following leave console messages in production
  // compiler: {
  //   removeConsole: false,
  // },

  // Add this for debugging environment variables during build
  onInit: (config) => {
    console.log('Next.js Config Environment:', {
      envValue: process.env.NEXT_PUBLIC_PERSONA_SELECTION,
      configValue: nextConfig.env.NEXT_PUBLIC_PERSONA_SELECTION,
    });
    return config;
  },
};

// Validate environment variables, if set at build time. Will be actually read and used at runtime.
// This is the reason both this file and the servr/env.mjs files have this extension.
await import('./src/server/env.mjs');

// conditionally enable the nextjs bundle analyzer
if (process.env.ANALYZE_BUNDLE) {
  const { default: withBundleAnalyzer } = await import('@next/bundle-analyzer');
  nextConfig = withBundleAnalyzer({ openAnalyzer: true })(nextConfig);
}

// Debug logging (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log('Next.js Build Config:', {
    nodeEnv: process.env.NODE_ENV,
    personaSelection: process.env.NEXT_PUBLIC_PERSONA_SELECTION,
    configValue: nextConfig.env.NEXT_PUBLIC_PERSONA_SELECTION
  });
}

export default nextConfig;