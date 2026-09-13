export default function robots() {
  const baseUrl = "https://prayaas-portal.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/admin-secret-login/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
