import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isGitHubPages ? '/ruru-named-play' : '',
  assetPrefix: isGitHubPages ? '/ruru-named-play/' : undefined,
};

export default nextConfig;
