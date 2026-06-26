const buildInfo = {
  buildId: process.env.NEXT_PUBLIC_VERCEL_GIT_PULL_REQUEST_ID!,
  target: process.env.NEXT_PUBLIC_VERCEL_TARGET_ENV!,
  commitHash: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA!,
  buildTime: process.env.NEXT_PUBLIC_BUILD_TIME!,
};
export const buildInfoString = `T:${buildInfo.target},B:${buildInfo.buildId},H:${buildInfo.commitHash},T:${buildInfo.buildTime}`;
