export const INDUSTRIES = [
  "SaaS", "AI", "Fintech", "Healthcare", "Manufacturing", "Agriculture",
  "Logistics", "Real Estate", "Construction", "Marketing", "HR",
  "Recruitment", "Legal", "Finance", "E-commerce", "D2C", "Retail",
  "Education", "Pharma", "Cybersecurity", "Consulting", "Cloud",
  "Automotive", "Food Processing", "Export/Import", "Supply Chain"
];

export const INDUSTRY_SUGGESTIONS: Record<string, { offerings: string[], needs: string[], goals: string[] }> = {
  "SaaS": {
    offerings: ["Subscription Billing", "Cloud Infrastructure", "API Integration", "User Analytics", "Enterprise Dashboard"],
    needs: ["Enterprise Clients", "Channel Partners", "Series A Investors", "Customer Success Experts"],
    goals: ["Seeking to onboard 10 enterprise clients this quarter.", "Looking for strategic channel partners in the EU market."]
  },
  "AI": {
    offerings: ["LLM Training", "Computer Vision", "Predictive Analytics", "NLP Solutions", "AI Strategy Consulting"],
    needs: ["Data Sets", "GPU Computing Power", "Beta Testers", "Industry Partners"],
    goals: ["Looking for healthcare companies to pilot our diagnostic AI.", "Seeking data partners for training our retail vision model."]
  },
  "Fintech": {
    offerings: ["Payment Gateway", "Neo-banking API", "Fraud Detection", "Lending Platforms", "Wealth Management"],
    needs: ["Banking Partners", "Compliance Experts", "Regulatory Approvals", "User Acquisition"],
    goals: ["Seeking a banking partner for our new credit card launch.", "Looking for legal advisors specialized in RBI/FCA compliance."]
  },
  "Healthcare": {
    offerings: ["EMR Software", "Telemedicine Platform", "Diagnostic Tools", "Hospital Management", "Medical Devices"],
    needs: ["Hospital Networks", "Doctors/Practitioners", "Clinical Trials", "Pharma Partners"],
    goals: ["Seeking hospital chains for our patient management system.", "Looking for medical equipment distributors in SE Asia."]
  },
  "Manufacturing": {
    offerings: ["Precision Engineering", "Bulk Components", "Assembly Services", "Raw Materials", "Quality Testing"],
    needs: ["Raw Material Suppliers", "Export Agents", "Factory Automation", "Industrial Real Estate"],
    goals: ["Looking for raw material suppliers for aluminum extrusion.", "Seeking export partners for the Middle East market."]
  },
  "Agriculture": {
    offerings: ["Smart Irrigation", "Organic Produce", "Farm Management", "Soil Testing", "Supply Chain Tech"],
    needs: ["Retail Chains", "FMCG Buyers", "Agri-Inputs", "Cold Storage Partners"],
    goals: ["Seeking direct-to-retail partnerships for organic fruits.", "Looking for cold chain logistics providers in North India."]
  },
  "Logistics": {
    offerings: ["Last Mile Delivery", "Warehousing", "Fleet Management", "Freight Forwarding", "Cross-border Shipping"],
    needs: ["Fleet Owners", "E-commerce Clients", "Technology Partners", "Warehouse Space"],
    goals: ["Seeking e-commerce brands for 3PL fulfillment.", "Looking for local delivery partners in Tier 2 cities."]
  },
  "Real Estate": {
    offerings: ["Commercial Leasing", "Property Management", "Virtual Tours", "Investment Advisory", "PropTech"],
    needs: ["Investors", "HNWIs", "Construction Partners", "Legal Experts"],
    goals: ["Looking for investors for a Grade-A commercial project.", "Seeking property management contracts for retail malls."]
  },
  "Construction": {
    offerings: ["Architecture", "Civil Engineering", "Project Management", "Raw Material Supply", "Interior Design"],
    needs: ["Sub-contractors", "Architects", "Equipment Rental", "Material Suppliers"],
    goals: ["Seeking reliable cement and steel suppliers for a new site.", "Looking for MEP consultants for a residential high-rise."]
  },
  "Marketing": {
    offerings: ["SEO Services", "Performance Ads", "Content Strategy", "Brand Identity", "Social Media"],
    needs: ["B2B Clients", "D2C Brands", "Agency Partners", "Creative Talent"],
    goals: ["Seeking 5 monthly retainer clients for SEO and PPC.", "Looking for white-label agency partners for content production."]
  },
  "HR": {
    offerings: ["Payroll Management", "Employee Onboarding", "Culture Consulting", "HRMS Software", "Policy Drafting"],
    needs: ["Mid-sized Firms", "Legal Consultants", "Benefits Providers", "Training Experts"],
    goals: ["Seeking companies with 100+ employees for our HRMS.", "Looking for corporate trainers specialized in DE&I."]
  },
  "Recruitment": {
    offerings: ["Executive Search", "Technical Hiring", "RPO Services", "Contract Staffing", "Talent Mapping"],
    needs: ["Hiring Managers", "SaaS Clients", "ATS Partners", "Training Institutes"],
    goals: ["Seeking companies looking to hire senior engineering talent.", "Looking for RPO contracts with growing tech startups."]
  },
  "Legal": {
    offerings: ["Contract Drafting", "IP Protection", "Compliance Audits", "Litigation Support", "M&A Advisory"],
    needs: ["Startup Founders", "Enterprise Clients", "International Partners", "Notary Services"],
    goals: ["Seeking startups needing trademark and patent filings.", "Looking for corporate legal retainers with manufacturing firms."]
  },
  "Finance": {
    offerings: ["Bookkeeping", "Tax Planning", "Investment Banking", "Audit Services", "Fractional CFO"],
    needs: ["SMEs", "Startup Founders", "Wealth Managers", "Software Partners"],
    goals: ["Seeking SMEs for full-stack accounting and GST compliance.", "Looking for startups needing Series B fundraising advisory."]
  },
  "E-commerce": {
    offerings: ["Online Storefront", "Payment Integration", "Inventory Management", "Direct Sales", "Marketplace Ads"],
    needs: ["Logistics Partners", "Packaging Suppliers", "Digital Marketers", "Inventory Finance"],
    goals: ["Looking for 3PL partners for national fulfillment.", "Seeking performance marketing agencies for scaling ROI."]
  },
  "D2C": {
    offerings: ["Consumer Products", "Brand Community", "Direct Subscription", "Unique Packaging", "Customer Feedback"],
    needs: ["Retail Distribution", "Influencer Partners", "E-commerce Tech", "Supply Chain"],
    goals: ["Seeking retail shelf space in modern trade outlets.", "Looking for influencer marketing agencies for Gen-Z reach."]
  },
  "Retail": {
    offerings: ["Physical Presence", "Customer Service", "In-store Branding", "Local Distribution", "Product Display"],
    needs: ["Inventory Management", "Digital Transformation", "Staff Training", "Supply Partners"],
    goals: ["Looking for inventory management software for 50 stores.", "Seeking supply chain partners for consistent stock delivery."]
  },
  "Education": {
    offerings: ["LMS Platform", "Skill Training", "Curriculum Design", "Certification", "Career Coaching"],
    needs: ["Institutional Clients", "Corporate Training", "Platform Partners", "Subject Experts"],
    goals: ["Seeking schools and colleges for our digital learning app.", "Looking for corporate partners for employee upskilling."]
  },
  "Pharma": {
    offerings: ["API Manufacturing", "Generic Drugs", "R&D Services", "Medical Supply", "Clinical Research"],
    needs: ["Distribution Network", "Raw Materials", "Compliance Experts", "Hospital Ties"],
    goals: ["Seeking distributors in Southeast Asia for generic drugs.", "Looking for R&D partners for new drug formulation."]
  },
  "Cybersecurity": {
    offerings: ["Penetration Testing", "Security Audit", "Threat Monitoring", "Firewall Solutions", "Incident Response"],
    needs: ["Fintech Clients", "Govt Agencies", "Tech Partners", "Certification Bodies"],
    goals: ["Seeking fintech startups for SOC2 compliance audits.", "Looking for enterprise clients for 24/7 security monitoring."]
  },
  "Consulting": {
    offerings: ["Business Strategy", "Operational Excellence", "Digital Transformation", "Market Research", "Sales Coaching"],
    needs: ["Client Leads", "Freelance Experts", "Networking Events", "Research Tools"],
    goals: ["Seeking manufacturing firms for lean operations consulting.", "Looking for strategic partners for market entry in India."]
  },
  "Cloud": {
    offerings: ["Cloud Migration", "Managed Services", "Serverless Architecture", "DevOps Automation", "Cloud Storage"],
    needs: ["Enterprise Clients", "Software Teams", "Vendor Credits", "Security Partners"],
    goals: ["Seeking companies moving from on-premise to cloud.", "Looking for software agencies needing managed DevOps."]
  },
  "Automotive": {
    offerings: ["EV Components", "Auto Parts", "Vehicle Leasing", "Repair Services", "Fleet Management"],
    needs: ["Dealerships", "Logistics Firms", "Battery Suppliers", "Charging Stations"],
    goals: ["Seeking dealerships for our new electric scooter line.", "Looking for battery manufacturers for long-term supply."]
  },
  "Food Processing": {
    offerings: ["Food Packaging", "Preservation Tech", "Bulk Ingredients", "Private Labeling", "Cold Chain Food"],
    needs: ["Packaging Supplies", "Quality Certs", "Distribution Chain", "Cold Storage"],
    goals: ["Seeking retail brands for private label food production.", "Looking for cold chain partners for frozen snacks."]
  },
  "Export/Import": {
    offerings: ["Custom Clearance", "Sourcing Agents", "Freight Booking", "Quality Control", "Trade Finance"],
    needs: ["Foreign Buyers", "Local Manufacturers", "Shipping Lines", "Insurance"],
    goals: ["Seeking European buyers for high-quality Indian textiles.", "Looking for reliable sourcing agents for electronics in China."]
  },
  "Supply Chain": {
    offerings: ["SCM Software", "Inventory Control", "Supplier Audit", "Demand Planning", "Warehouse Tech"],
    needs: ["Manufacturers", "Retailers", "Technology Partners", "Logistics Firms"],
    goals: ["Seeking retailers needing end-to-end SCM automation.", "Looking for factory partners for supply chain visibility pilot."]
  }
};

export const DEFAULT_SUGGESTIONS = {
  offerings: ["Business Consulting", "Strategic Planning", "Project Management", "Digital Solutions"],
  needs: ["New Clients", "Business Partners", "Industry Connections", "Funding"],
  goals: ["Looking for new business opportunities and networking.", "Seeking strategic partners for expansion."]
};

// Business Types keyed by Industry
export const BUSINESS_TYPES_BY_INDUSTRY: Record<string, string[]> = {
  "SaaS": ["Startup", "Scale-up", "Enterprise Software", "ISV", "Bootstrapped SaaS", "VC-backed"],
  "AI": ["Research Lab", "AI Startup", "Product Company", "Consulting Firm", "University Spinoff"],
  "Fintech": ["Neo-bank", "Payment Startup", "Lending Platform", "WealthTech", "InsurTech", "RegTech"],
  "Healthcare": ["Hospital Chain", "HealthTech Startup", "Clinic Network", "Pharma Company", "MedDevice Maker"],
  "Manufacturing": ["OEM", "Contract Manufacturer", "SME Factory", "Large Enterprise", "MSME", "Auto-Ancillary"],
  "Agriculture": ["FPO", "AgriTech Startup", "Farm Cooperative", "Export House", "Input Supplier"],
  "Logistics": ["3PL Provider", "Freight Forwarder", "Last Mile Company", "Fleet Owner", "Warehouse Operator"],
  "Real Estate": ["Developer", "PropTech Startup", "REIT", "Broker/Agent", "Investment Firm"],
  "Construction": ["EPC Contractor", "Sub-contractor", "Architecture Firm", "PMC", "Material Supplier"],
  "Marketing": ["Digital Agency", "PR Firm", "Media House", "Performance Agency", "Influencer Network"],
  "HR": ["HR Consultancy", "HRMS Company", "Payroll Provider", "Staffing Agency", "L&D Company"],
  "Recruitment": ["Executive Search", "RPO Firm", "IT Staffing", "Campus Recruitment", "Headhunter"],
  "Legal": ["Law Firm", "Solo Practitioner", "LegalTech Startup", "Compliance Firm", "IP Firm"],
  "Finance": ["CA Firm", "Boutique IB", "Fractional CFO Service", "Tax Consulting", "Audit Firm"],
  "E-commerce": ["D2C Brand", "Marketplace Seller", "B2B Platform", "Aggregator", "Niche Store"],
  "D2C": ["Personal Care Brand", "Food & Beverage", "Fashion Brand", "Home Goods", "Subscription Box"],
  "Retail": ["Chain Store", "Franchise", "Department Store", "Specialty Retailer", "Modern Trade"],
  "Education": ["EdTech Startup", "Coaching Institute", "K12 School", "University", "Corporate L&D"],
  "Pharma": ["Generic Manufacturer", "API Producer", "CRO", "Drug Distributor", "Biotech"],
  "Cybersecurity": ["MSSP", "Product Company", "Consulting Firm", "Govt Contractor", "SOC Provider"],
  "Consulting": ["Strategy Boutique", "Big4 Affiliate", "Independent Consultant", "Domain Expert Firm"],
  "Cloud": ["Cloud MSP", "Cloud Reseller", "ISV on Cloud", "DevOps Consultancy", "Multi-cloud Integrator"],
  "Automotive": ["EV Startup", "Auto-parts Maker", "Dealership Network", "Fleet Company", "Auto Finance"],
  "Food Processing": ["FMCG Brand", "Private Label Manufacturer", "Bulk Supplier", "Exporter", "Co-packer"],
  "Export/Import": ["Export House", "Trading Company", "Sourcing Agent", "Customs Broker", "Freight Forwarder"],
  "Supply Chain": ["SCM Software Company", "3PL", "Procurement Firm", "Supply Chain Consultant", "WMS Provider"],
};

export const DEFAULT_BUSINESS_TYPES = [
  "Startup", "SME", "Enterprise", "Freelancer/Solo", "Partnership Firm", "LLP", "Private Limited", "NGO/Trust"
];

