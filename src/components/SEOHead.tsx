import { Helmet } from "react-helmet-async";

import React, { Component } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  structuredData?: object;
  noindex?: boolean;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
  structuredData,
  noindex = false,
}) => {
  const siteTitle = "Into The Wild - Trekking Community";
  const siteDescription =
    "Join India's premier trekking community. Discover amazing treks, connect with fellow adventurers, and share your wilderness experiences.";
  const siteUrl = "https://into-the-wild.com"; // Update with actual domain
  const defaultImage = "/itw_logo.png"; // Update with actual logo

  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const metaDescription = description || siteDescription;
  const metaKeywords =
    keywords || "trekking, hiking, India, adventure, community, forum";
  const fullCanonicalUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="author" content="Into The Wild" />
      <meta
        name="robots"
        content={noindex ? "noindex,nofollow" : "index,follow"}
      />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta
        property="og:description"
        content={ogDescription || metaDescription}
      />
      <meta
        property="og:image"
        content={ogImage ? `${siteUrl}${ogImage}` : `${siteUrl}${defaultImage}`}
      />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullCanonicalUrl} />
      <meta property="twitter:title" content={ogTitle || fullTitle} />
      <meta
        property="twitter:description"
        content={ogDescription || metaDescription}
      />
      <meta
        property="twitter:image"
        content={ogImage ? `${siteUrl}${ogImage}` : `${siteUrl}${defaultImage}`}
      />

      {/* Structured Data / JSON-LD */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* Additional Meta Tags for India/SEO */}
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />
      <meta name="language" content="en-IN" />
      <meta httpEquiv="content-language" content="en-IN" />
    </Helmet>
  );
};
