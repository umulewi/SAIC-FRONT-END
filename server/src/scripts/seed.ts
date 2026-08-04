import "dotenv/config";
import bcrypt from "bcryptjs";
import { pool, initDb } from "../db/index.js";

async function upsertSection(key: string, data: unknown) {
  await pool.query(
    "INSERT INTO sections (`key`, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)",
    [key, JSON.stringify(data)]
  );
}

async function seedCollection(name: string, items: unknown[]) {
  await pool.query("DELETE FROM items WHERE collection = ?", [name]);
  for (let index = 0; index < items.length; index++) {
    await pool.query("INSERT INTO items (collection, order_index, data) VALUES (?, ?, ?)", [
      name,
      index,
      JSON.stringify(items[index]),
    ]);
  }
}

async function main() {
  await initDb();

  // --- Admin user ---
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@stewardincubation.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "SaicAdmin2026!";
  const passwordHash = bcrypt.hashSync(adminPassword, 10);
  await pool.query(
    "INSERT INTO users (email, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)",
    [adminEmail, passwordHash]
  );

  // --- Site-wide settings ---
  await upsertSection("site", {
    name: "SAIC",
    fullName: "Stewardship Agribusiness Incubation Center",
    tagline: "Transforming Agriculture Through Innovation",
    logoText: "SAIC",
    nav: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Sites & Apps", href: "/sites-apps" },
      { label: "Team", href: "/team" },
      { label: "Gallery", href: "/gallery" },
      { label: "Career", href: "/career" },
      { label: "Contact", href: "/contact" },
    ],
    social: {
      facebook: "https://facebook.com/stewardincubation",
      twitter: "https://twitter.com/stewardincubation",
      instagram: "https://instagram.com/stewardincubation",
      youtube: "https://youtube.com/@stewardincubation",
    },
  });

  // --- Hero ---
  await upsertSection("hero", {
    eyebrow: "Stewardship Agribusiness Incubation Center",
    headline: "Transforming Agriculture Through Innovation",
    subheadline:
      "We empower entrepreneurs, cooperatives, and communities across Rwanda with the tools, training, and partnerships to build thriving, sustainable agribusinesses.",
    primaryCta: { label: "Explore Our Services", href: "/services" },
    secondaryCta: { label: "Get in Touch", href: "/contact" },
    image: "/images/hero-cornfield.jpg",
    video: "/video/hero.mp4",
  });

  // --- Stats ---
  await seedCollection("stats", [
    { label: "Service Areas", value: "10+" },
    { label: "Core Programs", value: "3" },
    { label: "Network Partners", value: "4" },
    { label: "Communities Empowered", value: "500+" },
  ]);

  // --- Core values ---
  await seedCollection("coreValues", [
    {
      title: "Timely Execution",
      description: "Delivering results on schedule with precision and reliability.",
      icon: "Clock",
    },
    {
      title: "Flexibility",
      description: "Adapting to client needs with innovative solutions.",
      icon: "Sparkles",
    },
    {
      title: "Effectiveness",
      description: "Achieving measurable impact that transforms communities.",
      icon: "Target",
    },
  ]);

  // --- Services ---
  await seedCollection("services", [
    {
      title: "Agribusiness Incubation",
      description:
        "Business ideation, mentorship, coaching, and comprehensive training to turn agricultural ideas into thriving enterprises.",
      image: "/images/service-incubation.jpg",
      href: "/services#incubation",
    },
    {
      title: "Content Creation & Branding",
      description:
        "Marketing, social media management, and website development that help agribusinesses build a compelling brand presence.",
      image: "/images/service-branding.jpg",
      href: "/services#branding",
    },
    {
      title: "Transaction Advisory",
      description:
        "B2B and B2C facilitation, plus grant and loan support to help agribusinesses access the capital they need to grow.",
      image: "/images/service-advisory.jpg",
      href: "/services#advisory",
    },
    {
      title: "Training & Education",
      description:
        "Certified programs in farm operations, disaster management, and SME management for professionals and entrepreneurs.",
      image: "/images/service-training.jpg",
      href: "/services#training",
    },
  ]);

  // --- About ---
  await upsertSection("about", {
    eyebrow: "About SAIC",
    headline: "Empowering Communities Since 2020",
    body:
      "SAIC builds holistic and circular agribusinesses across the entire value chain — from inputs and services to production (crops and livestock), marketing, and value addition. We work hand-in-hand with MSMEs, cooperatives, and entrepreneurs to create lasting, sustainable impact throughout Rwanda's agricultural sector.",
    image: "/images/about-organic-farm.jpg",
    stats: [
      { label: "Years of Impact", value: "5+" },
      { label: "Services Offered", value: "14" },
    ],
  });

  // --- Impact areas ---
  await seedCollection("impactAreas", [
    {
      title: "Modern Technology",
      description:
        "Climate-smart technology, greenhouse farming, and efficient irrigation systems that boost productivity and resilience.",
      image: "/illustrations/impact-technology.svg",
    },
    {
      title: "Expert Consultation",
      description:
        "Business development, financial management, and partnership-building support tailored to each agribusiness.",
      image: "/illustrations/impact-consultation.svg",
    },
    {
      title: "Community Development",
      description:
        "Dedicated support for MSMEs, cooperatives, women, youth, and marginalized groups across the agricultural value chain.",
      image: "/images/impact-community.jpg",
    },
  ]);

  // --- Programs ---
  await seedCollection("programs", [
    {
      name: "Stewardship Agribusiness Academy",
      acronym: "SAA",
      description:
        "Agricultural education programs for professionals and entrepreneurs, building practical skills for modern farm and agribusiness management.",
    },
    {
      name: "Transaction Advisory Services",
      acronym: "TAS",
      description:
        "Supporting business transactions, financing access, and strategic partnerships that help agribusinesses scale sustainably.",
    },
    {
      name: "Farm Business Center",
      acronym: "FBC",
      description:
        "Hands-on support for farm operations, technology implementation, and market access to strengthen on-the-ground productivity.",
    },
  ]);

  // --- Partners ---
  await seedCollection("partners", [
    { name: "RWCA", logo: "" },
    { name: "RYAF", logo: "" },
    { name: "COLEAD", logo: "" },
    { name: "COPORWA", logo: "" },
    { name: "FAO", logo: "" },
    { name: "Rwanda Agriculture Board", logo: "" },
    { name: "MINAGRI", logo: "" },
    { name: "USAID", logo: "" },
    { name: "GIZ", logo: "" },
    { name: "AGRA", logo: "" },
  ]);

  // --- Sites & Apps ---
  await seedCollection("sitesApps", [
    {
      title: "SAIC Website",
      description: "Our main website showcasing programs, services, and impact across Rwanda.",
      url: "https://stewardincubation.com",
      image: "/illustrations/service-branding.svg",
    },
    {
      title: "Farm Business Center Portal",
      description: "Digital portal for farm business clients to track advisory sessions and resources.",
      url: "https://example.com/fbc-portal",
      image: "/illustrations/impact-technology.svg",
    },
    {
      title: "Stewardship Academy E-Learning",
      description: "Online learning platform for the Stewardship Agribusiness Academy's certified courses.",
      url: "https://example.com/academy",
      image: "/illustrations/service-training.svg",
    },
  ]);

  // --- Team ---
  await seedCollection("team", [
    {
      name: "Jean Baptiste Nkurunziza",
      role: "Executive Director",
      photo: "",
      bio: "Leads SAIC's strategic vision with over 12 years of experience in agribusiness development across East Africa.",
    },
    {
      name: "Aline Uwase",
      role: "Head of Programs",
      photo: "",
      bio: "Oversees the Academy, Transaction Advisory, and Farm Business Center programs to ensure measurable community impact.",
    },
    {
      name: "Eric Mugisha",
      role: "Partnerships & Advisory Lead",
      photo: "",
      bio: "Builds strategic relationships with financial institutions, NGOs, and government agencies to expand SAIC's reach.",
    },
    {
      name: "Diane Ingabire",
      role: "Training & Education Manager",
      photo: "",
      bio: "Designs and delivers certified training programs in farm operations, SME management, and disaster preparedness.",
    },
  ]);

  // --- CTA ---
  await upsertSection("cta", {
    headline: "Ready to Transform Your Agribusiness?",
    body: "Join hundreds of entrepreneurs and cooperatives who have grown with SAIC's support, training, and partnerships.",
    primaryCta: { label: "Get in Touch", href: "/contact" },
    secondaryCta: { label: "Explore Our Services", href: "/services" },
  });

  // --- Contact ---
  await upsertSection("contact", {
    email: "info@stewardincubation.com",
    phone: "+250 798 598 710",
    address: "KN 3 Rd, ININD House, Kigali City, Rwanda",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15949.0!2d30.0605!3d-1.9441!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1",
  });

  // --- Footer ---
  await upsertSection("footer", {
    about:
      "SAIC empowers Rwanda's agribusiness ecosystem through incubation, advisory, and training programs that build sustainable, community-driven growth.",
    companyLinks: [
      { label: "About", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Team", href: "/team" },
      { label: "Career", href: "/career" },
    ],
    resourceLinks: [
      { label: "News & Blogs", href: "/gallery" },
      { label: "Sites & Apps", href: "/sites-apps" },
      { label: "Contact", href: "/contact" },
    ],
    copyright: `© ${new Date().getFullYear()} Stewardship Agribusiness Incubation Center. All rights reserved.`,
  });

  console.log(`Seed complete. Admin login: ${adminEmail} / ${adminPassword}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
