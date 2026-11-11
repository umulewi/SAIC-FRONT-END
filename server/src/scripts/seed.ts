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
      title: "Transaction Advisory",
      description:
        "Strategic support that connects agribusinesses to markets, finance, partnerships, and sustainable growth opportunities.",
      content:
        "Our transaction advisory team helps businesses prepare for growth, access the right opportunities, and build strong commercial relationships.",
      offerings: [
        { title: "B2B Facilitation", description: "Connect with buyers, suppliers, processors, and strategic business partners." },
        { title: "B2C Market Linkages", description: "Reach customers through focused market access and sales opportunities." },
        { title: "Grant Application Support", description: "Develop stronger grant applications, budgets, and supporting documents." },
        { title: "Loan Readiness", description: "Prepare business plans and financial information for lending opportunities." },
        { title: "Investment Readiness", description: "Position your business to communicate value clearly to investors and funders." },
        { title: "Partnership Development", description: "Build practical partnerships that unlock resources and sustainable growth." },
      ],
      image: "/images/service-advisory.jpg",
      href: "/services#transaction-advisory",
    },
    {
      title: "Farm Production Management & Carbon Credit Services",
      description:
        "Hands-on production systems and climate-smart support that improve farm performance, resilience, and environmental value.",
      content:
        "We help farms improve daily operations while identifying opportunities to reduce emissions, protect natural resources, and benefit from carbon markets.",
      offerings: [
        { title: "Farm Planning", description: "Plan crops, livestock, inputs, labour, and production targets for each season." },
        { title: "Production Management", description: "Improve farm processes, records, quality control, and operational efficiency." },
        { title: "Climate-Smart Agriculture", description: "Adopt practical methods that strengthen productivity and climate resilience." },
        { title: "Soil & Water Management", description: "Protect soil health and use water efficiently for long-term productivity." },
        { title: "Carbon Project Assessment", description: "Assess farm activities and opportunities for measurable carbon benefits." },
        { title: "Carbon Credit Advisory", description: "Support monitoring, documentation, and preparation for carbon credit programs." },
      ],
      image: "/images/service-incubation.jpg",
      href: "/services#farm-production",
    },
    {
      title: "Training and Incubation Services",
      description:
        "Practical learning, coaching, and incubation support that turns agricultural ideas into capable and sustainable enterprises.",
      content:
        "From early-stage ideation to business growth, we build the knowledge, confidence, and systems entrepreneurs need to succeed.",
      offerings: [
        { title: "Agribusiness Ideation", description: "Turn agricultural opportunities into clear and practical business concepts." },
        { title: "Business Planning", description: "Create realistic business models, plans, budgets, and growth strategies." },
        { title: "Entrepreneurship Training", description: "Build essential skills in leadership, management, marketing, and finance." },
        { title: "Technical Farm Training", description: "Develop practical knowledge for efficient and profitable farm operations." },
        { title: "Mentorship & Coaching", description: "Receive continued guidance from experienced business and agriculture professionals." },
        { title: "Enterprise Incubation", description: "Access structured support, tools, and networks as your enterprise grows." },
      ],
      image: "/images/service-training.jpg",
      href: "/services#training-incubation",
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

  // --- Stories ---
  await seedCollection("stories", [
    {
      title: "Farmer Field Day: Climate-Smart Irrigation",
      category: "Events",
      date: "March 2026",
      excerpt: "Farmers across Kayonza gathered to see drip irrigation and water-saving techniques in action.",
      content:
        "SAIC hosted a farmer field day focused on climate-smart irrigation, bringing together cooperative members to see drip irrigation and rainwater harvesting techniques firsthand.\nParticipants learned how small changes in water management can significantly boost yields while reducing costs, especially during dry seasons.\nThe event closed with a Q&A session led by our agribusiness advisors, and several cooperatives have since begun piloting the techniques on their own plots.",
      image: "/illustrations/impact-technology.svg",
    },
    {
      title: "Stewardship Academy Cohort 4 Graduation",
      category: "Training",
      date: "January 2026",
      excerpt: "Forty entrepreneurs completed our flagship agribusiness training program.",
      content:
        "The fourth cohort of the Stewardship Agribusiness Academy graduated this month, with forty entrepreneurs completing months of hands-on training in farm business management, financial planning, and market access.\nGraduates presented business plans to a panel of advisors and partner organizations, several of which are now moving forward with SAIC's transaction advisory support.\nWe're proud of this cohort's dedication and excited to see their businesses grow.",
      image: "/illustrations/service-training.svg",
    },
    {
      title: "New Partnership Signed with COLEAD",
      category: "Partnerships",
      date: "November 2025",
      excerpt: "A new agreement expands technical support for horticulture exporters.",
      content:
        "SAIC signed a new partnership agreement with COLEAD to expand technical support for horticulture producers working toward export markets.\nThe partnership will bring additional training on food safety standards, post-harvest handling, and certification support to cooperatives in our network.\nThis is part of our ongoing effort to connect Rwandan producers with larger, more resilient markets.",
      image: "/illustrations/service-branding.svg",
    },
  ]);

  // --- Job Openings ---
  await seedCollection("jobOpenings", [
    {
      title: "Field Agribusiness Advisor",
      location: "Kigali, Rwanda",
      type: "Full-time",
      description:
        "SAIC is looking for a Field Agribusiness Advisor to work directly with cooperatives and entrepreneurs across our program regions.\nYou'll conduct farm visits, deliver hands-on business advisory, and help clients access financing and markets.\nWe're looking for someone with a background in agribusiness or rural development, strong communication skills, and a genuine passion for community-driven growth.\nThis role involves regular travel to program sites outside Kigali.",
    },
    {
      title: "Training & Curriculum Officer",
      location: "Kigali, Rwanda",
      type: "Full-time",
      description:
        "We're hiring a Training & Curriculum Officer to help design and deliver courses for the Stewardship Agribusiness Academy.\nResponsibilities include developing training materials, facilitating workshops, and evaluating program outcomes.\nIdeal candidates have experience in adult education or agricultural extension, and are comfortable working with both English and Kinyarwanda speakers.",
    },
    {
      title: "Monitoring & Evaluation Associate",
      location: "Remote / Kigali",
      type: "Contract",
      description:
        "SAIC seeks a Monitoring & Evaluation Associate to help track program impact across our incubation, advisory, and training initiatives.\nYou'll design data collection tools, analyze outcomes, and prepare reports for partner organizations.\nStrong analytical skills and experience with M&E frameworks in development contexts are required. This is a contract position with flexible remote work options.",
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
      "https://maps.google.com/maps?q=SOLVIT+AFRICA+Training+Center,-1.9646179,30.1014274&z=17&output=embed",
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
