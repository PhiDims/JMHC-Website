// Eleventy configuration for josmhconference.com
export default function (eleventyConfig) {
  // Files copied to the site as they are
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/_headers": "_headers" });
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/assets/img/favicon.svg": "favicon.svg" });

  eleventyConfig.ignores.add("src/admin/**");

  const byOrder = (a, b) => (a.data.order || 99) - (b.data.order || 99);

  // Collections (each folder is editable at /admin)
  eleventyConfig.addCollection("news", (api) =>
    api.getFilteredByGlob("src/news/*.md").filter((p) => !p.data.draft).sort((a, b) => b.date - a.date)
  );
  eleventyConfig.addCollection("committee", (api) => api.getFilteredByGlob("src/committee/*.md").sort(byOrder));
  eleventyConfig.addCollection("speakers", (api) =>
    api.getFilteredByGlob("src/speakers/*.md").filter((s) => s.data.approved).sort(byOrder)
  );
  // Partners appear only when marked approved by the Central Working Committee
  eleventyConfig.addCollection("partners", (api) =>
    api.getFilteredByGlob("src/partners/*.md").filter((p) => p.data.approved).sort(byOrder)
  );
  eleventyConfig.addCollection("editions", (api) =>
    api.getFilteredByGlob("src/editions/*.md").sort((a, b) => b.data.year - a.data.year)
  );

  // Dates, formatted for Nigeria
  const fmt = (d, opts) => new Date(d).toLocaleDateString("en-GB", { timeZone: "Africa/Lagos", ...opts });
  eleventyConfig.addFilter("longDate", (d) => fmt(d, { day: "numeric", month: "long", year: "numeric" }));
  eleventyConfig.addFilter("monthYear", (d) => fmt(d, { month: "short", year: "numeric" }));
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("year", () => new Date().getFullYear());

  // Small helpers
  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("forEdition", (items, year) => (items || []).filter((i) => String(i.data.edition) === String(year)));
  eleventyConfig.addFilter("byTier", (items, tier) => (items || []).filter((i) => i.data.tier === tier));
  eleventyConfig.addFilter("wa", (text, number) => "https://wa.me/" + number + "?text=" + encodeURIComponent(text));

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
