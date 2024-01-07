const { createRoutesFromFolders } = require("@remix-run/v1-route-convention");

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  // serverDependenciesToBundle: [/.*/],
  // match everything but rehype-pretty-code
  serverDependenciesToBundle: [/^(?!rehype-pretty-code$).*$/],
  serverModuleFormat: "cjs",
  tailwind: true,
  postcss: true,
  // routes(defineRoutes) {
  //   // uses the v1 convention, works in v1.15+ and v2
  //   return createRoutesFromFolders(defineRoutes);
  // },
};
