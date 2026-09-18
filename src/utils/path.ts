export const getAssetPath = (path: string) => {
  const basePath = process.env.NODE_ENV === "production" ? "/wedding-invite-app" : "";
  return `${basePath}${path}`;
};