export default function robots() {
  const baseUrl = "https://prayaaskaro.in";

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
