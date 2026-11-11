export interface SubService {
  slug: string;
  image: string;
  title: string;
  summary: string;
  intro: string;
  includes: string[];
  benefits: string[];
}

export interface MainService {
  id: number;
  order: number;
  slug: string;
  title: string;
  description: string;
  content?: string;
  image: string;
  href: string;
  subServices: SubService[];
}

export const publicServices: MainService[] = [
  {
    id: 1,
    order: 0,
    slug: "transaction-advisory",
    title: "Transaction Advisory (Brokerage)",
    description:
      "Deal-making and financial facilitation that connects agribusinesses to funding, partners, land, and markets.",
    content:
      "Our transaction advisory and brokerage team sits between entrepreneurs and the opportunities they need to grow — lenders, investors, buyers, partners, and land — structuring every deal so it holds up under scrutiny.",
    image: "/images/service-branding.jpg",
    href: "/services/transaction-advisory",
    subServices: [
      {
        slug: "feasibility-studies-business-plan-development",
        image: "/images/services/feasibility-studies-business-plan-development.jpg",
        title: "Feasibility Studies & Business Plan Development",
        summary:
          "Rigorous feasibility analysis and bankable business plans that turn an idea into a fundable venture.",
        intro:
          "Before any capital moves, investors and lenders need proof that a venture works on paper and on the ground. We conduct market, technical, and financial feasibility studies and translate them into clear, bankable business plans that stand up to scrutiny.",
        includes: [
          "Market and demand analysis for the proposed product or service",
          "Technical and operational feasibility assessment",
          "Financial projections, break-even analysis, and sensitivity modelling",
          "A complete, investor-ready business plan document",
        ],
        benefits: [
          "Reduces the risk of investing in untested ideas",
          "Gives lenders and investors the confidence to engage",
          "Provides a clear operational roadmap for the business",
        ],
      },
      {
        slug: "loan-application-financial-documentation-support",
        image: "/images/services/loan-application-financial-documentation-support.jpg",
        title: "Loan Application & Financial Documentation Support",
        summary:
          "End-to-end support preparing loan applications and the financial documentation lenders require.",
        intro:
          "Many strong businesses are turned away from financing simply because their paperwork doesn't meet lender standards. We prepare and package the financial documentation, statements, and loan applications needed to present your business professionally to banks and financial institutions.",
        includes: [
          "Preparation of financial statements and cash flow records",
          "Loan application packaging and lender-specific documentation",
          "Collateral and security documentation support",
          "Liaison and follow-up with financial institutions",
        ],
        benefits: [
          "Higher approval rates through complete, accurate submissions",
          "Faster turnaround on loan processing",
          "Reduced back-and-forth with lenders",
        ],
      },
      {
        slug: "grant-writing-application",
        image: "/images/services/grant-writing-application.jpg",
        title: "Grant Writing & Application",
        summary: "Professionally written grant proposals and applications aligned to funder priorities.",
        intro:
          "Grant funding is competitive, and proposals are won or lost on clarity, alignment, and evidence. We research suitable grant opportunities and write compelling applications that speak directly to what funders are looking for.",
        includes: [
          "Identification of relevant grant and donor opportunities",
          "Full proposal writing, budgeting, and logical framework development",
          "Compliance review against funder guidelines",
          "Support through clarification and award negotiation stages",
        ],
        benefits: [
          "Stronger, funder-aligned proposals",
          "Access to non-dilutive funding for growth",
          "Saved time for founders who can focus on running the business",
        ],
      },
      {
        slug: "investment-facilitation-pitch-preparation",
        image: "/images/services/investment-facilitation-pitch-preparation.jpg",
        title: "Investment Facilitation & Pitch Preparation",
        summary: "Pitch decks, investor materials, and warm introductions that connect businesses to the right capital.",
        intro:
          "Raising investment takes more than a good business — it takes a compelling story told to the right people. We prepare pitch decks and investment materials, refine the narrative, and facilitate introductions to investors active in agribusiness.",
        includes: [
          "Investor-ready pitch deck and executive summary development",
          "Valuation guidance and deal structuring support",
          "Pitch rehearsal and investor Q&A preparation",
          "Facilitated introductions to relevant investors and funds",
        ],
        benefits: [
          "A clear, confident investment narrative",
          "Access to SAIC's network of investors and financiers",
          "Higher likelihood of closing a funding round",
        ],
      },
      {
        slug: "b2b-b2c-market-linkage",
        image: "/images/services/b2b-b2c-market-linkage.jpg",
        title: "B2B & B2C Market Linkage",
        summary: "Direct connections to buyers, processors, distributors, and end consumers.",
        intro:
          "Production means little without a reliable market. We broker relationships between producers and the buyers, processors, retailers, and consumers who need their output, opening both business-to-business and business-to-consumer channels.",
        includes: [
          "Buyer and off-taker identification and matchmaking",
          "Supplier and distributor network connections",
          "Support negotiating supply agreements and contracts",
          "Consumer market access through retail and direct-to-market channels",
        ],
        benefits: [
          "Reliable, recurring sales channels",
          "Reduced post-harvest losses from unsold produce",
          "Stronger bargaining position through broker-negotiated terms",
        ],
      },
      {
        slug: "mergers-acquisitions-business-sales",
        image: "/images/services/mergers-acquisitions-business-sales.jpg",
        title: "Mergers, Acquisitions & Business Sales",
        summary: "Brokerage and advisory support for buying, selling, or merging agribusiness enterprises.",
        intro:
          "Whether consolidating operations, exiting a business, or acquiring a new venture, these transactions require careful valuation, negotiation, and structuring. We advise and broker both sides of mergers, acquisitions, and business sales.",
        includes: [
          "Business valuation and deal structuring",
          "Buyer or seller sourcing and matchmaking",
          "Negotiation support and transaction advisory",
          "Coordination of legal and regulatory transaction requirements",
        ],
        benefits: [
          "Fair, well-structured transaction terms",
          "Reduced risk of undervaluing or overpaying in a deal",
          "A smoother path to consolidation, growth, or exit",
        ],
      },
      {
        slug: "agricultural-land-transactions-lease-facilitation",
        image: "/images/services/agricultural-land-transactions-lease-facilitation.jpg",
        title: "Agricultural Land Transactions & Lease Facilitation",
        summary: "Facilitation of land purchase, sale, and lease arrangements for agricultural use.",
        intro:
          "Access to suitable land is often the first barrier to scaling an agribusiness. We facilitate land transactions and lease agreements, connecting landholders with producers and investors while ensuring terms are fair and properly documented.",
        includes: [
          "Identification of available agricultural land for purchase or lease",
          "Lease and sale agreement negotiation",
          "Due diligence on land titles and usage rights",
          "Coordination with local authorities and landholders",
        ],
        benefits: [
          "Secure, well-documented land access",
          "Reduced risk of land disputes",
          "Faster access to productive land for expansion",
        ],
      },
      {
        slug: "financial-advisory-budgeting-cash-flow",
        image: "/images/services/financial-advisory-budgeting-cash-flow.jpg",
        title: "Financial Advisory (Budgeting & Cash Flow)",
        summary: "Practical budgeting, cash flow planning, and financial management advisory.",
        intro:
          "Many agribusinesses fail not from lack of demand but from poor cash flow management. We provide hands-on financial advisory that helps businesses budget realistically, manage working capital, and plan for seasonal cash flow swings.",
        includes: [
          "Operating budget development and monitoring",
          "Cash flow forecasting and seasonal planning",
          "Cost control and margin improvement guidance",
          "Basic financial management systems and reporting templates",
        ],
        benefits: [
          "Improved liquidity and reduced cash shortfalls",
          "Clearer visibility into business performance",
          "Better-informed spending and investment decisions",
        ],
      },
      {
        slug: "strategic-partnership-mou-development",
        image: "/images/services/strategic-partnership-mou-development.jpg",
        title: "Strategic Partnership & MoU Development",
        summary: "Brokering and formalizing strategic partnerships through well-structured MoUs and agreements.",
        intro:
          "Strategic partnerships can unlock markets, technology, and resources — but only when the terms are clear and mutually beneficial. We help identify suitable partners and draft Memoranda of Understanding and partnership agreements that protect all parties.",
        includes: [
          "Partner identification aligned to strategic goals",
          "Negotiation facilitation between parties",
          "Drafting of MoUs, partnership, and collaboration agreements",
          "Ongoing support monitoring partnership commitments",
        ],
        benefits: [
          "Clearly defined roles, expectations, and benefits",
          "Reduced risk of partnership disputes",
          "Stronger, longer-lasting collaborations",
        ],
      },
      {
        slug: "due-diligence-coordination",
        image: "/images/services/due-diligence-coordination.jpg",
        title: "Due Diligence Coordination",
        summary: "Coordinated due diligence for investments, acquisitions, partnerships, and land transactions.",
        intro:
          "Every transaction carries risk if the facts aren't verified. We coordinate due diligence processes — financial, legal, operational, and land-related — so that investors, buyers, and partners can move forward with confidence.",
        includes: [
          "Financial and operational records verification",
          "Legal and regulatory compliance checks",
          "Land title and ownership verification",
          "Consolidated due diligence reporting for decision-makers",
        ],
        benefits: [
          "Reduced transaction risk",
          "Faster, better-informed decision-making",
          "Increased trust between transacting parties",
        ],
      },
      {
        slug: "funds-grant-management",
        image: "/images/services/funds-grant-management.jpg",
        title: "Funds & Grant Management",
        summary: "Post-award management of grants and funds to ensure compliant, effective use.",
        intro:
          "Winning a grant or fund is only the beginning — proper management determines whether it delivers results and protects future funding eligibility. We support the administration, reporting, and compliance management of awarded funds.",
        includes: [
          "Fund disbursement planning and tracking",
          "Donor and funder compliance reporting",
          "Budget variance monitoring and reallocation support",
          "Audit preparation and financial accountability systems",
        ],
        benefits: [
          "Full compliance with funder requirements",
          "Reduced risk of fund misuse or audit findings",
          "Stronger track record for future funding applications",
        ],
      },
      {
        slug: "internal-organizational-assessment-sops-development",
        image: "/images/services/internal-organizational-assessment-sops-development.jpg",
        title: "Internal Organizational Assessment & SOPs Development",
        summary: "Organizational diagnostics and Standard Operating Procedures that professionalize business operations.",
        intro:
          "Growth exposes gaps in structure and process. We assess internal organizational capacity — governance, roles, and systems — and develop Standard Operating Procedures that bring consistency and accountability to daily operations.",
        includes: [
          "Organizational capacity and governance assessment",
          "Role clarification and organizational structuring",
          "Development of SOPs for core business functions",
          "Staff orientation on new systems and procedures",
        ],
        benefits: [
          "More consistent, professional operations",
          "Reduced dependency on any single individual",
          "A stronger foundation for scaling and investment readiness",
        ],
      },
    ],
  },
  {
    id: 2,
    order: 1,
    slug: "farm-production-carbon-credits",
    title: "Farm Production Management & Carbon Credits Services",
    description:
      "Hands-on production systems and climate-smart support that improve farm performance, resilience, and environmental value.",
    content:
      "We deliver integrated climate-smart agricultural solutions through expert advisory, project implementation, technical support, monitoring, sustainable resource management, and climate finance facilitation.",
    image: "/images/service-incubation.jpg",
    href: "/services/farm-production-carbon-credits",
    subServices: [
      {
        slug: "farm-operations-management",
        image: "/images/services/farm-operations-management.jpg",
        title: "Farm Operations Management",
        summary: "Day-to-day operational management support that improves efficiency across farm activities.",
        intro:
          "Well-run farms don't happen by accident — they depend on disciplined planning, scheduling, and record-keeping. We provide hands-on operations management support that organizes labour, inputs, and production cycles for better output and lower waste.",
        includes: [
          "Production planning and seasonal scheduling",
          "Labour organization and task management systems",
          "Input and inventory tracking",
          "Operational record-keeping and performance review",
        ],
        benefits: [
          "Improved yields through better-organized operations",
          "Reduced input waste and operational losses",
          "Clear records that support financing and planning decisions",
        ],
      },
      {
        slug: "climate-smart-agriculture-advisory",
        image: "/images/services/climate-smart-agriculture-advisory.jpg",
        title: "Climate-Smart Agriculture Advisory",
        summary: "Technical advisory on climate-smart practices tailored to specific farms and crops.",
        intro:
          "Beyond general training, some farms need direct advisory tailored to their specific crops, soils, and climate exposure. We assess farm conditions and recommend specific climate-smart interventions that strengthen resilience and productivity.",
        includes: [
          "Farm-specific climate risk and vulnerability assessment",
          "Tailored recommendations on crop choice and practices",
          "Guidance on climate-resilient inputs and technologies",
          "Ongoing advisory as conditions and seasons change",
        ],
        benefits: [
          "Interventions matched to actual farm conditions",
          "Reduced vulnerability to climate shocks",
          "Sustained productivity under shifting weather patterns",
        ],
      },
      {
        slug: "carbon-footprint-assessment-auditing",
        image: "/images/services/carbon-footprint-assessment-auditing.jpg",
        title: "Carbon Footprint Assessment & Auditing",
        summary: "Independent assessment and auditing of a farm or enterprise's carbon footprint.",
        intro:
          "Understanding your carbon footprint is the first step toward both environmental responsibility and carbon market participation. We assess and audit emissions across farm operations, establishing a clear, credible baseline.",
        includes: [
          "Emissions source mapping across farm activities",
          "Baseline carbon footprint calculation",
          "Identification of key emission reduction opportunities",
          "Audit-ready documentation and reporting",
        ],
        benefits: [
          "A credible emissions baseline for decision-making",
          "A clear view of where reductions are most achievable",
          "Documentation needed for carbon project development",
        ],
      },
      {
        slug: "carbon-credit-project-development",
        image: "/images/services/carbon-credit-project-development.jpg",
        title: "Carbon Credit Project Development (VCS/Gold Standard)",
        summary: "End-to-end development of carbon credit projects under recognized standards like VCS and Gold Standard.",
        intro:
          "Turning farm and land-use practices into tradeable carbon credits requires rigorous project design against internationally recognized standards. We develop carbon credit projects from concept through registration under frameworks such as Verra's VCS and the Gold Standard.",
        includes: [
          "Project eligibility assessment against VCS/Gold Standard criteria",
          "Project Design Document (PDD) development",
          "Methodology selection and additionality demonstration",
          "Coordination through validation and registration processes",
        ],
        benefits: [
          "A credible pathway into regulated carbon markets",
          "New revenue streams from verified emission reductions",
          "Projects structured to withstand independent verification",
        ],
      },
      {
        slug: "mrv-measurement-reporting-verification",
        image: "/images/services/mrv-measurement-reporting-verification.jpg",
        title: "MRV (Measurement, Reporting & Verification) Services",
        summary: "Ongoing measurement, reporting, and verification support that keeps carbon projects compliant.",
        intro:
          "Carbon credits depend entirely on trustworthy data. We provide the Measurement, Reporting, and Verification systems that track project performance over time and keep it aligned with standard requirements for issuance.",
        includes: [
          "Monitoring plan design and data collection systems",
          "Periodic measurement of emission reductions or removals",
          "Preparation of monitoring reports for verification bodies",
          "Support through third-party verification audits",
        ],
        benefits: [
          "Reliable data that supports continued credit issuance",
          "Reduced risk of non-compliance or verification failure",
          "Transparent reporting that builds buyer confidence",
        ],
      },
      {
        slug: "agroforestry-reforestation-programmes",
        image: "/images/services/agroforestry-reforestation-programmes.jpg",
        title: "Agroforestry & Reforestation Programmes",
        summary: "Design and implementation of agroforestry and reforestation initiatives.",
        intro:
          "Trees on farms and degraded land deliver both environmental and economic value. We design and implement agroforestry and reforestation programmes suited to local ecosystems and farmer livelihoods.",
        includes: [
          "Site assessment and species selection",
          "Agroforestry system design integrated with existing crops",
          "Reforestation and land restoration planning",
          "Planting, maintenance, and survival monitoring",
        ],
        benefits: [
          "Additional income streams from tree products",
          "Improved soil health and microclimate on farms",
          "Contribution to carbon sequestration and land restoration goals",
        ],
      },
      {
        slug: "soil-carbon-sequestration-advisory",
        image: "/images/services/soil-carbon-sequestration-advisory.jpg",
        title: "Soil Carbon Sequestration Advisory",
        summary: "Advisory on practices that build soil organic carbon and long-term soil health.",
        intro:
          "Healthy soils store carbon and produce better yields. We advise on practices that increase soil organic carbon — supporting both productivity and potential participation in soil carbon credit mechanisms.",
        includes: [
          "Soil health and carbon stock assessment",
          "Recommendations on cover cropping, composting, and reduced tillage",
          "Integration of organic inputs and residue management",
          "Monitoring of soil carbon changes over time",
        ],
        benefits: [
          "Improved soil fertility and water retention",
          "Long-term yield stability",
          "Potential eligibility for soil carbon credit programmes",
        ],
      },
      {
        slug: "irrigation-water-management-design",
        image: "/images/services/irrigation-water-management-design.jpg",
        title: "Irrigation & Water Management Design",
        summary: "Design of efficient irrigation and water management systems suited to farm conditions.",
        intro:
          "Water is often the limiting factor in agricultural productivity. We design irrigation and water management systems matched to a farm's water sources, soil type, and crop requirements, prioritizing efficiency and sustainability.",
        includes: [
          "Water source and demand assessment",
          "Irrigation system design and technology selection",
          "Water-use efficiency and scheduling planning",
          "Installation oversight and farmer training on system use",
        ],
        benefits: [
          "More reliable water access through dry periods",
          "Reduced water waste and operating costs",
          "Higher, more consistent yields",
        ],
      },
      {
        slug: "crop-livestock-technical-support",
        image: "/images/services/crop-livestock-technical-support.jpg",
        title: "Crop & Livestock Technical Support",
        summary: "Direct technical support addressing crop and livestock production challenges.",
        intro:
          "When production issues arise — disease, poor yields, declining herd health — farms need responsive technical support. We provide direct, practical crop and livestock technical assistance to diagnose problems and implement solutions.",
        includes: [
          "On-site diagnosis of crop and livestock production issues",
          "Recommendations on inputs, breeds, and management practices",
          "Disease and pest management guidance",
          "Follow-up support to track improvement",
        ],
        benefits: [
          "Faster resolution of production problems",
          "Reduced losses from disease, pests, or poor practices",
          "Stronger technical knowledge retained on the farm",
        ],
      },
      {
        slug: "greenhouse-construction",
        image: "/images/services/greenhouse-construction.jpg",
        title: "Greenhouse Construction",
        summary: "Design and construction of greenhouses for controlled, higher-yield production.",
        intro:
          "Greenhouses extend growing seasons and protect crops from pests, disease, and unpredictable weather. We design and construct greenhouses suited to budget, crop choice, and site conditions, from simple structures to more advanced systems.",
        includes: [
          "Site assessment and greenhouse design",
          "Material selection suited to budget and climate",
          "Construction management and quality oversight",
          "Training on greenhouse operation and crop management",
        ],
        benefits: [
          "Higher, more consistent yields through controlled conditions",
          "Extended growing seasons and reduced weather risk",
          "Protection against common pests and diseases",
        ],
      },
      {
        slug: "climate-finance-green-fund-advisory",
        image: "/images/services/climate-finance-green-fund-advisory.jpg",
        title: "Climate Finance & Green Fund Advisory",
        summary: "Advisory that connects climate-smart agribusinesses to climate finance and green funding instruments.",
        intro:
          "Climate finance and green funds offer significant capital for agribusinesses with genuine environmental impact, but accessing them requires navigating specific requirements. We advise on eligibility and support applications to climate finance and green fund instruments.",
        includes: [
          "Identification of suitable climate finance and green fund opportunities",
          "Eligibility assessment against fund-specific criteria",
          "Application and proposal development support",
          "Guidance on environmental and social safeguard requirements",
        ],
        benefits: [
          "Access to capital earmarked for climate impact",
          "Stronger applications aligned to funder expectations",
          "A credible environmental track record for future funding",
        ],
      },
    ],
  },
  {
    id: 3,
    order: 2,
    slug: "training-incubation",
    title: "Training and Incubation Services",
    description:
      "Practical learning, coaching, and incubation support that turns agricultural ideas into capable and sustainable enterprises.",
    content:
      "From early-stage ideation to business growth, we build the knowledge, confidence, and systems entrepreneurs, cooperatives, and partner organizations need to succeed.",
    image: "/images/service-advisory.jpg",
    href: "/services/training-incubation",
    subServices: [
      {
        slug: "certified-agribusiness-incubation",
        image: "/images/services/certified-agribusiness-incubation.jpg",
        title: "Certified Agribusiness Incubation (3-6 Months)",
        summary: "A structured, certified incubation programme that takes agribusiness ideas from concept to launch.",
        intro:
          "Our flagship incubation programme runs over three to six months, combining training, mentorship, and hands-on support to help entrepreneurs validate, structure, and launch viable agribusiness enterprises.",
        includes: [
          "Structured curriculum covering business model development, operations, and finance",
          "One-on-one mentorship from agribusiness and enterprise experts",
          "Milestone-based progress tracking and evaluation",
          "A recognized certificate of completion",
        ],
        benefits: [
          "A validated, ready-to-launch business model",
          "Practical skills gained through real application, not just theory",
          "Access to SAIC's network of mentors, partners, and financiers",
        ],
      },
      {
        slug: "cooperative-enterprise-capacity-building",
        image: "/images/services/cooperative-enterprise-capacity-building.jpg",
        title: "Cooperative & Enterprise Capacity Building",
        summary: "Capacity building that strengthens governance, operations, and performance of cooperatives and enterprises.",
        intro:
          "Cooperatives and growing enterprises often need stronger internal systems to match their ambitions. We deliver targeted capacity building that improves governance, operational management, and the collective capability of staff and members.",
        includes: [
          "Governance and leadership training for boards and committees",
          "Operational systems and record-keeping strengthening",
          "Member engagement and participation improvement",
          "Performance monitoring frameworks",
        ],
        benefits: [
          "Stronger, more accountable governance",
          "Improved day-to-day operational efficiency",
          "Greater member trust and participation",
        ],
      },
      {
        slug: "entrepreneurship-business-plan-training",
        image: "/images/services/entrepreneurship-business-plan-training.jpg",
        title: "Entrepreneurship & Business Plan Training",
        summary: "Practical training in entrepreneurship fundamentals and business plan development.",
        intro:
          "Good ideas need structured plans to become real businesses. This training equips participants with entrepreneurship fundamentals and guides them step-by-step through building a complete, practical business plan.",
        includes: [
          "Core entrepreneurship and business mindset training",
          "Market research and opportunity identification exercises",
          "Guided business plan drafting, section by section",
          "Peer review and facilitator feedback sessions",
        ],
        benefits: [
          "A completed, usable business plan",
          "Stronger entrepreneurial decision-making skills",
          "Increased confidence to pursue funding and launch",
        ],
      },
      {
        slug: "climate-smart-agriculture-training",
        image: "/images/services/climate-smart-agriculture-training.jpg",
        title: "Climate-Smart Agriculture Training",
        summary: "Training in climate-resilient farming practices that protect yields under changing conditions.",
        intro:
          "Changing weather patterns are already affecting yields across Rwanda. This training introduces farmers and enterprises to climate-smart practices that build resilience while maintaining or improving productivity.",
        includes: [
          "Climate-resilient crop and livestock practice training",
          "Water-efficient and soil-conserving technique instruction",
          "Climate risk awareness and adaptation planning",
          "Practical, farm-based demonstration sessions",
        ],
        benefits: [
          "More resilient yields under variable climate conditions",
          "Reduced input waste through efficient resource use",
          "Practical skills that pay off immediately on the farm",
        ],
      },
      {
        slug: "extension-on-farm-demonstrations",
        image: "/images/services/extension-on-farm-demonstrations.jpg",
        title: "Extension & On-Farm Demonstrations",
        summary: "Hands-on, on-farm demonstration of improved agricultural techniques and technologies.",
        intro:
          "Some lessons are best learned in the field. Our extension officers run on-farm demonstrations that show improved techniques, inputs, and technologies in action, so farmers can see results before adopting new practices.",
        includes: [
          "On-site demonstration plots and farmer field days",
          "Hands-on coaching in improved agronomic practices",
          "Introduction to new tools, inputs, and technologies",
          "Follow-up visits to track adoption and results",
        ],
        benefits: [
          "Practices seen and trusted before adoption",
          "Faster uptake of improved techniques",
          "Direct, ongoing access to extension expertise",
        ],
      },
      {
        slug: "online-hybrid-learning-programmes",
        image: "/images/services/online-hybrid-learning-programmes.jpg",
        title: "Online & Hybrid Learning Programmes",
        summary: "Flexible online and blended learning programmes that extend training beyond the classroom.",
        intro:
          "Not every entrepreneur can attend full-time, in-person training. We offer online and hybrid learning programmes that combine digital coursework with in-person sessions, making capacity building accessible regardless of schedule or location.",
        includes: [
          "Self-paced online course modules",
          "Scheduled live virtual sessions and Q&A",
          "Blended in-person workshops for practical components",
          "Digital certificates and progress tracking",
        ],
        benefits: [
          "Learning that fits around work and farm schedules",
          "Wider access for entrepreneurs outside Kigali",
          "Consistent quality content delivered at scale",
        ],
      },
      {
        slug: "access-to-finance-investment-readiness-training",
        image: "/images/services/access-to-finance-investment-readiness-training.jpg",
        title: "Access to Finance & Investment Readiness Training",
        summary: "Training that prepares entrepreneurs to confidently approach lenders and investors.",
        intro:
          "Being investment-ready is a skill, not an accident. This training walks entrepreneurs through what lenders and investors look for, and how to present their business, financials, and plans accordingly.",
        includes: [
          "Overview of financing options: loans, grants, equity, and blended finance",
          "Financial literacy and statement preparation training",
          "Pitch and presentation skills development",
          "Mock investor and lender review sessions",
        ],
        benefits: [
          "Clearer understanding of financing options available",
          "Stronger, more confident presentations to funders",
          "Higher readiness to secure external financing",
        ],
      },
      {
        slug: "curriculum-development-consultancy",
        image: "/images/services/curriculum-development-consultancy.jpg",
        title: "Curriculum Development Consultancy",
        summary: "Consultancy support designing training curricula for partner organizations and institutions.",
        intro:
          "Organizations running their own training programmes don't always have agribusiness-specific curriculum expertise in-house. We design and structure training curricula tailored to an organization's audience, goals, and delivery format.",
        includes: [
          "Training needs assessment and audience analysis",
          "Curriculum structuring, content development, and sequencing",
          "Facilitator guides and participant materials",
          "Review and quality assurance of existing curricula",
        ],
        benefits: [
          "Professionally structured, outcome-focused training content",
          "Reduced time and effort developing content in-house",
          "Curricula grounded in practical agribusiness experience",
        ],
      },
      {
        slug: "sub-contracting-training-capacity-building",
        image: "/images/services/sub-contracting-training-capacity-building.jpg",
        title: "Sub-Contracting in Training & Capacity Building Project Implementation",
        summary: "Delivery partnership for organizations and projects that need training implemented on the ground.",
        intro:
          "Development projects and partner organizations often need a capable, on-the-ground implementer for training and capacity-building components. We take on sub-contracted delivery, bringing our facilitators, networks, and field experience to execute programmes reliably.",
        includes: [
          "Project-aligned training design and delivery planning",
          "Facilitator deployment and field coordination",
          "Participant recruitment and logistics management",
          "Reporting and M&E support aligned to project requirements",
        ],
        benefits: [
          "Reliable, experienced implementation capacity",
          "Reduced burden on the contracting organization's internal team",
          "Training delivered with established community trust and reach",
        ],
      },
    ],
  },
];

export function findService(slug?: string): MainService | undefined {
  return publicServices.find((s) => s.slug === slug);
}

export function findSubService(
  serviceSlug?: string,
  subSlug?: string
): { service: MainService | undefined; subService: SubService | undefined } {
  const service = findService(serviceSlug);
  const subService = service?.subServices.find((s) => s.slug === subSlug);
  return { service, subService };
}
