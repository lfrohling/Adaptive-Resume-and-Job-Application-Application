import { MasterResume } from '../types/resume';

export const PURE_USER_MASTER_RESUME: MasterResume = {
  id: 'canonical-master-truth-v4',
  version: 8,
  lastUpdated: new Date().toISOString(),
  contact: {
    fullName: 'Professional Candidate',
    headline: 'AI Software Engineer, Solutions Architect & Operational Leader | Google Certified AI Specialist',
    email: 'candidate@example.com',
    phone: '0400 000 000',
    location: 'Sydney, NSW, Australia',
    residentialAddress: '100 Enterprise Way, Sydney, NSW, 2000',
    currentStatus: 'Immediate',
    relocationDetails: 'Seeking permanent relocation opportunities',
    linkedin: 'https://www.linkedin.com/',
    github: 'https://github.com/',
    website: 'https://example.com/',
    websiteList: [
      { url: 'https://example.com/skills', description: 'Google Verified Skills & Badges Profile' },
      { url: 'https://example.com/portfolio', description: 'Portfolio (Written)' },
      { url: 'https://example.com/games', description: 'Portfolio (Games & Interactive)' },
      { url: 'https://github.com/', description: 'GitHub Profile & Repositories' }
    ]
  },
  executiveSummaries: [
    {
      id: 'sum-exec-1',
      focusTrack: 'AI Solutions Architect & Operations',
      text: 'Google Certified AI Specialist, Solutions Architect, and Operations Leader with over 15 years of diverse international experience spanning AI software development, enterprise systems architecture, immersive spatial computing, and complete business turnarounds. Holds a Bachelor of Communication (Broadcast Journalism) and intermediate conversational Japanese honed across years of residence and corporate management in Tokyo.'
    },
    {
      id: 'sum-exec-2',
      focusTrack: 'General & International',
      text: 'Community-focused professional with extensive experience across gaming, digital marketing, media production, and education, including extensive time living and managing businesses in Japan. Skilled in community engagement, competitive analysis, market research, and relationship management, with excellent written and verbal communication and proven work optimization to meet deadlines.'
    },
    {
      id: 'sum-exec-3',
      focusTrack: 'Commercial & Technical Operations',
      text: 'A seasoned operator with proven business-building skills who stays mindful of clients and organizational goals. Adept in cross-functional coordination between technical engineering, creative media, and commercial stakeholders to deliver resilient, scalable, and profitable outcomes.'
    }
  ],
  experiences: [
    {
      id: 'exp-rto-store-mgr',
      company: 'Ready Team One',
      role: 'Store Manager / Master In Chief',
      location: 'Perth, WA, Australia',
      startDate: '2022-02',
      endDate: 'Present',
      isCurrent: true,
      summary: 'Virtual Reality Arena in Perth – Managed over 12 staff with end-to-end P&L, technology, and operations ownership.',
      bullets: [
        { id: 'b-rto-1', text: 'Steered complete business turnaround back to profitability, navigating the arena through critical financial, technical, and staffing headwinds.', impactMetric: 'Profitable Turnaround', tags: ['P&L', 'Operations'] },
        { id: 'b-rto-2', text: 'Managed end-to-end operations covering 12+ staff, cutting-edge VR technology infrastructure, customer service excellence, and shift scheduling.', impactMetric: '12+ Staff', tags: ['Leadership'] },
        { id: 'b-rto-3', text: 'Dependable operational leadership as first to open and last to leave daily; mastered the entire arena business architecture within 3 weeks.', impactMetric: '3-Week Ramp', tags: ['Reliability'] },
        { id: 'b-rto-4', text: 'Engineered rapid technical and operational solutions to solve pressing mechanical and software issues under tight time and capital constraints.', impactMetric: 'Crisis Solved', tags: ['Troubleshooting'] },
        { id: 'b-rto-5', text: 'Maintained, calibrated, and repaired cutting-edge VR tracking hardware, wireless headsets, and server communication links under live customer pressure.', impactMetric: 'Zero Downtime', tags: ['VR Hardware'] },
        { id: 'b-rto-6', text: 'Implemented business-saving standard operating procedures, documentation, and staff onboarding frameworks built completely from scratch.', impactMetric: 'SOP Framework', tags: ['Documentation'] },
        { id: 'b-rto-7', text: 'Conducted competitive analysis of international gaming and VR offerings to define brand positioning and identify untapped market opportunities.', impactMetric: 'Market Analysis', tags: ['Strategy'] },
        { id: 'b-rto-8', text: 'Handled basic bookkeeping, payroll coordination, compliance frameworks, risk management, and governmental grant applications.', impactMetric: 'Compliance & Grants', tags: ['Xero', 'Finance'] }
      ],
      technologies: ['VR/XR Hardware', 'Unity', 'C#', 'Unreal Engine', 'Xero Bookkeeping', 'Risk Management', 'Operations Management', 'Grant Writing'],
      hidden: false
    },
    {
      id: 'exp-rto-writer',
      company: 'Ready Team One',
      role: 'Narrative Designer & Game Writer',
      location: 'Perth, WA, Australia',
      startDate: '2022-02',
      endDate: 'Present',
      isCurrent: true,
      summary: 'Authored interactive narrative arcs and character dialogue for commercial VR arena experiences.',
      bullets: [
        { id: 'b-rtow-1', text: 'Wrote and directed story elements and character dialogue for full-body virtual reality games using specialized interactive narrative tools.', impactMetric: 'Commercial Story', tags: ['Narrative'] },
        { id: 'b-rtow-2', text: 'Collaborated closely with 3D artists, game designers, and programmers to match dialogue timing and story beats to physical arena mechanics.', impactMetric: 'Player Immersion', tags: ['Cross-Functional'] }
      ],
      technologies: ['Interactive Narrative', 'Unity', 'Unreal Engine', 'Game Design', 'Creative Writing'],
      hidden: false
    },
    {
      id: 'exp-inner-eye-leader',
      company: 'The Inner Eye VR',
      role: 'Head Story Writer, Programmer & Team Leader',
      location: 'Australia',
      startDate: '2021-10',
      endDate: 'Present',
      isCurrent: true,
      summary: 'Led technical design and programming for indie VR and interactive game experiences.',
      bullets: [
        { id: 'b-ie-1', text: 'Engineered immersive games utilizing Unity (C#) and Unreal Engine 5 (Visual Blueprints).', impactMetric: 'Multi-Engine', tags: ['Unity', 'Unreal'] },
        { id: 'b-ie-2', text: 'Programmed cross-platform mobile and desktop utility applications using Dart / Flutter.', impactMetric: 'Cross-Platform', tags: ['Flutter', 'Dart'] },
        { id: 'b-ie-3', text: 'Directed complex narrative branching, character arcs, and cinematic cutscenes integrated directly with gameplay logic.', impactMetric: 'Branching Arcs', tags: ['Narrative'] }
      ],
      technologies: ['Unity (C#)', 'Unreal Engine 5 (Blueprints)', 'Flutter', 'Dart', 'Git Version Control'],
      hidden: false
    },
    {
      id: 'exp-inner-eye-data',
      company: 'The Inner Eye VR',
      role: 'Data Analyst',
      location: 'Australia',
      startDate: '2021-10',
      endDate: 'Present',
      isCurrent: true,
      summary: 'Data extraction, exploratory data analysis, and telemetry reporting for gaming cohorts.',
      bullets: [
        { id: 'b-ied-1', text: 'Analysed and organised player progression, testing metrics, and gameplay feedback using Google Sheets, Microsoft Excel, and Tableau.', impactMetric: 'Telemetry Data', tags: ['Analytics'] },
        { id: 'b-ied-2', text: 'Constructed automated analytical dashboards and predictive difficulty curves to balance player retention and level difficulty.', impactMetric: 'Dashboarding', tags: ['Tableau', 'Excel'] }
      ],
      technologies: ['Tableau Public', 'Google Sheets (Advanced)', 'Microsoft Excel (Pivot Tables)', 'Exploratory Data Analysis', 'Descriptive Statistics'],
      hidden: false
    },
    {
      id: 'exp-quality-seo',
      company: 'Quality SEO',
      role: 'Director & Digital Marketing Consultant',
      location: 'Australia',
      startDate: '2017-10',
      endDate: '2022-02',
      isCurrent: false,
      summary: 'Founded and operated technical digital marketing and SEO consultancy serving high-growth commercial enterprises.',
      bullets: [
        { id: 'b-qseo-1', text: 'Delivered technical SEO audits, architecture overhauls, and backlink strategies for dozens of corporate clients (Coopers, Lux, Ageloc, Centrelink projects).', impactMetric: 'Top Search Ranks', tags: ['Technical SEO'] },
        { id: 'b-qseo-2', text: 'Conducted rigorous keyword intent research, competitor benchmarking, and consumer audience analysis to direct profitable content strategies.', impactMetric: 'Organic Growth', tags: ['Keyword Research'] },
        { id: 'b-qseo-3', text: 'Managed multi-client deliverables, reporting cycles, and cross-functional teams including technical developers, copywriters, and account managers.', impactMetric: 'Multi-Account', tags: ['Account Management'] },
        { id: 'b-qseo-4', text: 'Authored commercial press releases, syndicated PR distribution, and edited commercial promotional videos (EEfilms, UnseenTV, Skot Fri Pictures).', impactMetric: 'Media Syndication', tags: ['PR', 'Video Editing'] },
        { id: 'b-qseo-5', text: 'Served as Editor and Cameraman on internationally recognized film project "Blind" (IMDb accredited: imdb.com/title/tt1785307/).', impactMetric: 'IMDb Accredited', tags: ['Cinematography'] }
      ],
      technologies: ['Technical SEO', 'Google Analytics', 'Google Search Console', 'Google Ads', 'WordPress', 'cPanel', 'HTML5/CSS3', 'Final Cut Pro'],
      hidden: false
    },
    {
      id: 'exp-sed',
      company: 'Search Engine Domination',
      role: 'Director, Video Editor & Cameraman',
      location: 'Australia',
      startDate: '2008-12',
      endDate: '2017-10',
      isCurrent: false,
      summary: 'Sole proprietor specializing in commercial video production, internet marketing, and digital brand development.',
      bullets: [
        { id: 'b-sed-1', text: 'Acquired and managed major enterprise accounts (Lux, Australian/American Association, Jetset Travel, Total Poker) through referral networks and proactive outreach.', impactMetric: 'Enterprise Clients', tags: ['Business Development'] },
        { id: 'b-sed-2', text: 'Delivered comprehensive digital optimization combining web development, competitive intelligence, and video marketing assets.', impactMetric: 'Full-Stack Media', tags: ['Digital Media'] },
        { id: 'b-sed-3', text: 'Conducted rigorous multi-browser and multi-platform testing to ensure responsive performance before launching client sites.', impactMetric: 'High Reliability', tags: ['QA Testing'] }
      ],
      technologies: ['Final Cut Pro', 'WordPress', 'SEO', 'Digital Videography', 'Client Relations', 'cPanel Hosting'],
      hidden: false
    },
    {
      id: 'exp-pro-axle',
      company: 'Pro-Axle Australia',
      role: 'Senior IT Consultant & Webmaster',
      location: 'Australia',
      startDate: '2009-01',
      endDate: '2024-01',
      isCurrent: false,
      summary: '15-year tenure engineering, hosting, and optimizing national transport engineering and franchise web properties.',
      bullets: [
        { id: 'b-pa-1', text: 'Engineered and maintained the corporate website and multiple franchise satellite sites across Australia for over 15 continuous years.', impactMetric: '15-Year Partnership', tags: ['Web Architecture'] },
        { id: 'b-pa-2', text: 'Maintained 99.9% uptime, DNS records, cPanel hosting environment, database backups, and local SEO dominance in automotive engineering.', impactMetric: '99.9% Uptime', tags: ['SysAdmin', 'SEO'] }
      ],
      technologies: ['WordPress CMS', 'PHP', 'cPanel & DNS', 'Local SEO', 'Web Security', 'Database Maintenance'],
      hidden: false
    },
    {
      id: 'exp-gc-video',
      company: 'GC Video',
      role: 'Director, Editor & Cameraman',
      location: 'Australia',
      startDate: '2012-06',
      endDate: '2017-10',
      isCurrent: false,
      summary: 'Commercial video production and digital media creation for hospitality, corporate, and tourism brands.',
      bullets: [
        { id: 'b-gcv-1', text: 'Directed, filmed, and edited promotional videos for commercial clients including Wine Glass Traders and Australian American Society.', impactMetric: 'Broadcast Quality', tags: ['Video Production'] },
        { id: 'b-gcv-2', text: 'Handled complete camera lighting, multi-track audio capture, and color grading in post-production.', impactMetric: 'Commercial Video', tags: ['Post-Production'] }
      ],
      technologies: ['Final Cut Pro', 'Adobe Premiere Pro', 'Lighting & Audio', 'Commercial Videography'],
      hidden: false
    },
    {
      id: 'exp-westpac',
      company: 'Westpac / Sykes',
      role: 'Financial Customer Support Specialist',
      location: 'Australia',
      startDate: '2012-04',
      endDate: '2014-09',
      isCurrent: false,
      summary: 'Provided tier-1 and tier-2 financial customer support for Westpac retail banking clients nationwide.',
      bullets: [
        { id: 'b-wp-1', text: 'Delivered empathetic, highly compliant customer support across complex banking, account security, and transaction inquiries.', impactMetric: '95% CSAT', tags: ['Customer Service'] },
        { id: 'b-wp-2', text: 'Consistently surpassed weekly and monthly call handling quotas, first-contact resolution metrics, and quality benchmarks.', impactMetric: 'Top Performer', tags: ['KPI Quotas'] }
      ],
      technologies: ['Banking Systems', 'Financial Compliance', 'Conflict Resolution', 'CRM Software'],
      hidden: false
    },
    {
      id: 'exp-amp',
      company: 'AMP',
      role: 'Financial Office / Telesales Consultant',
      location: 'Australia',
      startDate: '2009-12',
      endDate: '2010-09',
      isCurrent: false,
      summary: 'Financial services telesales and client portfolio engagement.',
      bullets: [
        { id: 'b-amp-1', text: 'Consistently ranked in the "Top 10% FAI Closers" nationally for insurance and superannuation customer acquisition.', impactMetric: 'Top 10% Closer', tags: ['Sales Leadership'] },
        { id: 'b-amp-2', text: 'Flown to Melbourne as a top "Sydney Seller" representative for the annual Granton International Conference.', impactMetric: 'National Award', tags: ['Achievement'] },
        { id: 'b-amp-3', text: 'Unbroken dedication record: worked weekends and never took a single sick day during tenure.', impactMetric: '100% Attendance', tags: ['Dedication'] }
      ],
      technologies: ['Financial Telesales', 'Customer Rapport', 'Closing Techniques', 'CRM'],
      hidden: false
    },
    {
      id: 'exp-digitised-info',
      company: 'Digitised Information (Yoyogi, Tokyo, Japan)',
      role: 'Director / Senior Editor / Manager / Account Manager',
      location: 'Tokyo, Japan',
      startDate: '2006-02',
      endDate: '2007-09',
      isCurrent: false,
      summary: 'Led bilingual news broadcasting, technical media production, and multinational corporate accounts in Tokyo.',
      bullets: [
        { id: 'b-di-1', text: 'Produced, filmed, voiced, and edited hundreds of technology and business news stories with a multicultural team of junior editors and translators.', impactMetric: '100s of Stories', tags: ['Broadcast Media'] },
        { id: 'b-di-2', text: 'Managed high-profile multinational corporate accounts including Bloomberg LP and Japan Corporate News (JCN).', impactMetric: 'Bloomberg Account', tags: ['Account Management'] },
        { id: 'b-di-3', text: 'Liaised daily with a multicultural team of 6 junior editors and 3 translators; reviewed, mentored, and approved all broadcast outputs.', impactMetric: 'Team Leadership', tags: ['Mentorship'] },
        { id: 'b-di-4', text: 'Designed and installed the company’s secure cross-platform Apple/Windows computer network, local servers, and backup systems.', impactMetric: 'IT Infrastructure', tags: ['Network Engineering'] },
        { id: 'b-di-5', text: 'Designed, coded, and maintained company websites using HTML, CSS, Flash, Photoshop, Dreamweaver, and WordPress.', impactMetric: 'Web Architecture', tags: ['Web Development'] },
        { id: 'b-di-6', text: 'Monitored departmental P&L budgets, researched Japanese legal/financial issues for the President, and conducted Japanese corporate negotiations.', impactMetric: 'Bilingual Business', tags: ['Japanese', 'P&L'] },
        { id: 'b-di-7', text: 'Filmed and reported on major international conventions including Tokyo Game Show under high-pressure broadcast deadlines.', impactMetric: 'Tokyo Game Show', tags: ['Field Journalism'] }
      ],
      technologies: ['Final Cut Pro', 'Apple Motion', 'Soundtrack Pro', 'Photoshop', 'Flash', 'HTML/CSS', 'WordPress', 'Cross-Platform Apple/Windows', 'Japanese Negotiation'],
      hidden: false
    },
    {
      id: 'exp-spinshell',
      company: 'Spinshell (Kita-ku, Tokyo, Japan)',
      role: 'Bilingual Video Editor',
      location: 'Tokyo, Japan',
      startDate: '2007-10',
      endDate: '2008-12',
      isCurrent: false,
      summary: 'Entertainment and news video production for Japanese media networks.',
      bullets: [
        { id: 'b-spin-1', text: 'Edited 26 high-profile technology, news, and entertainment video stories in close collaboration with Japanese producers and journalists.', impactMetric: '26 Feature Stories', tags: ['Broadcast Editing'] },
        { id: 'b-spin-2', text: 'Turned around late-breaking news edits on laptop systems during Tokyo train transit to ensure same-afternoon broadcast airing.', impactMetric: 'Extreme Agility', tags: ['Rapid Editing'] }
      ],
      technologies: ['Final Cut Pro', 'Motion', 'Soundtrack Pro', 'Photoshop', 'Japanese Media Workflows'],
      hidden: false
    },
    {
      id: 'exp-action-coaching',
      company: 'Action Coaching',
      role: 'English and Mathematics High School Tutor',
      location: 'Sydney, Australia',
      startDate: '2009-08',
      endDate: '2009-12',
      isCurrent: false,
      summary: 'Private high school tutoring across Greater Sydney.',
      bullets: [
        { id: 'b-ac-1', text: 'Tutored secondary students in advanced English and Mathematics, tailoring individual study plans that consistently lifted exam grades.', impactMetric: 'Grade Improvements', tags: ['Education'] }
      ],
      technologies: ['Secondary Mathematics', 'English Composition', 'Individualized Tutoring'],
      hidden: false
    },
    {
      id: 'exp-med-sim',
      company: 'Bond University, Griffith University, University of Queensland & Mater Hospital',
      role: 'Simulated Patient & Teaching Associate',
      location: 'Queensland, Australia',
      startDate: '2015-01',
      endDate: '2020-03',
      isCurrent: false,
      summary: 'High-stress clinical simulation and communication teaching for medical faculties.',
      bullets: [
        { id: 'b-med-1', text: 'Memorized complex clinical medical histories, psychological red herrings, and physiological symptoms for OSCE medical student examinations.', impactMetric: 'OSCE Exams', tags: ['Medical Simulation'] },
        { id: 'b-med-2', text: 'Served as Men’s Health Teaching Associate at Mater Hospital, guiding medical registrars through invasive clinical examinations with real-time feedback.', impactMetric: 'Clinical Teaching', tags: ['Medical Education'] }
      ],
      technologies: ['Medical Simulation', 'Clinical History Memorization', 'OSCE Examinations', 'Empathy Feedback'],
      hidden: false
    },
    {
      id: 'exp-fast-labour',
      company: 'Fast Labour Hire / APM / Queensland Bulk Terminals',
      role: 'General Hand / Labourer',
      location: 'Queensland, Australia',
      startDate: '2021-03',
      endDate: '2021-03',
      isCurrent: false,
      summary: 'Demanding industrial agricultural operations and grain terminal maintenance.',
      bullets: [
        { id: 'b-flh-1', text: 'Performed demanding physical labor: climbed shifting grain mounds in 5-story industrial silos while pulling heavy tarpaulins for insect gassing.', impactMetric: 'High-Risk Safety', tags: ['Industrial Safety'] }
      ],
      technologies: ['Industrial Safety Protocols', 'Hazardous Fumigation Compliance', 'Physical Resilience'],
      hidden: false
    },
    {
      id: 'exp-allied-mills',
      company: 'BDS / Allied Mills',
      role: 'Factory Worker (Processor, Cleaner, Line Worker)',
      location: 'Australia',
      startDate: '2014-10',
      endDate: '2015-07',
      isCurrent: false,
      summary: 'Food processing plant manufacturing and overnight line operations.',
      bullets: [
        { id: 'b-am-1', text: 'Worked extensive overnight and weekend processing shifts in food manufacturing with zero safety incidents.', impactMetric: 'Zero Incidents', tags: ['Manufacturing'] }
      ],
      technologies: ['Industrial Line Processing', 'Quality Assurance', 'Shift Diligence'],
      hidden: false
    },
    {
      id: 'exp-santa',
      company: 'Myer, Target, Aerial Angels, Fly By Fun, Straight Down The Line, Applause Entertainment',
      role: 'Professional Performer / Santa Claus',
      location: 'Australia & Tokyo, Japan',
      startDate: '2015-10',
      endDate: '2021-12',
      isCurrent: false,
      summary: 'Professional holiday performer and Santa Claus across flagship retail stores and public events.',
      bullets: [
        { id: 'b-sc-1', text: 'Delivered consistent, warm, and highly memorable experiences for thousands of children and families, creating the "Yay" factor for Myer shoppers.', impactMetric: '10,000+ Interactions', tags: ['Performance'] },
        { id: 'b-sc-2', text: 'Grew a genuine flowing beard over a year and had it professionally bleached to provide unmatched holiday authenticity in Australia and Tokyo.', impactMetric: 'Authentic Character', tags: ['Public Engagement'] }
      ],
      technologies: ['Character Performance', 'Crowd Delight', 'Improvisation', 'Public Speaking'],
      hidden: false
    }
  ],
  projects: [
    {
      id: 'proj-etl-agent',
      name: 'AI Autonomous ETL Agent',
      role: 'Lead Data Architect & Engineer',
      link: 'https://github.com/example/AI-Autonomous-ETL-Agent',
      period: '2024 - Present',
      description: 'E-Commerce Recommendation Engine — Multi-file autonomous ETL validation agent built with Python 3.12/3.14, Streamlit Cloud, Pydantic v2 schemas, and Gemini AI inside a decoupled stateful subsystem framework.',
      bullets: [
        { id: 'bp-1', text: 'Engineered self-healing multi-stage data pipelines validating e-commerce schemas using Pydantic v2 and Gemini function calling.', impactMetric: 'Autonomous Validation', tags: ['AI ETL'] },
        { id: 'bp-2', text: 'Built real-time interactive parameter tweaking and execution dashboards using Streamlit Cloud and Python.', impactMetric: 'Streamlit Cloud', tags: ['Python'] }
      ],
      technologies: ['Python 3.12/3.14', 'Gemini AI API', 'Streamlit Cloud', 'Pydantic v2', 'ETL Pipelines', 'Data Schemas'],
      hidden: false
    },
    {
      id: 'proj-doc-search',
      name: 'AI Document Search',
      role: 'Lead RAG Architect',
      link: 'https://github.com/example/AI-Document-Search',
      period: '2024 - Present',
      description: 'Searching and Extracting Information From Documentation — Enterprise Retrieval-Augmented Generation (RAG) system utilizing Python 3.12, Streamlit Form Framework, and Gemini API to perform high-precision, zero-hallucination document search.',
      bullets: [
        { id: 'bp-3', text: 'Architected vector search chunking and semantic retrieval pipelines guaranteeing zero-hallucination factual extractions from dense documentation.', impactMetric: 'Zero Hallucination', tags: ['RAG'] },
        { id: 'bp-4', text: 'Implemented citation grounding showing exact source paragraph and token coordinates for auditability.', impactMetric: 'Source Grounding', tags: ['Search'] }
      ],
      technologies: ['Python 3.12', 'Retrieval-Augmented Generation (RAG)', 'Gemini API', 'Vector Search', 'Semantic Indexing'],
      hidden: false
    },
    {
      id: 'proj-support-agent',
      name: 'AI Support Agent',
      role: 'Lead Full-Stack AI Developer',
      link: 'https://github.com/example/AI-Support-Agent',
      period: '2024 - Present',
      description: 'Automated Customer Support & Lead Routing Agent for personal website to demonstrate production AI engineering — AI microservice automating communication workflows by parsing unstructured inquiries into deterministic operational data with Streamlit UI and Gemini SDK.',
      bullets: [
        { id: 'bp-5', text: 'Automated intent classification and structured lead capture from free-form user communications using Gemini structured output mode.', impactMetric: '100% Deterministic', tags: ['Microservices'] },
        { id: 'bp-6', text: 'Integrated automated webhook dispatch and notification systems to route actionable leads into CRM pipelines.', impactMetric: 'Automated Routing', tags: ['Automation'] }
      ],
      technologies: ['Python', 'Gemini SDK', 'Streamlit UI', 'API Microservices', 'Prompt Engineering', 'Structured JSON'],
      hidden: false
    },
    {
      id: 'proj-vr-experience',
      name: 'The Inner Eye Interactive VR Portfolio',
      role: 'Lead Game Developer & Story Architect',
      link: 'https://example.itch.io/',
      period: '2021 - Present',
      description: 'Public portfolio of interactive virtual reality games, narrative prototypes, and mechanics demonstrations showcasing cutting-edge spatial computing.',
      bullets: [
        { id: 'bp-7', text: 'Engineered room-scale VR mechanics, 3D physics interactions, and spatial audio in Unity and Unreal Engine 5.', impactMetric: 'Room-Scale VR', tags: ['Spatial Computing'] },
        { id: 'bp-8', text: 'Published playable interactive titles on itch.io receiving acclaim from gaming and VR community enthusiasts.', impactMetric: 'Publicly Released', tags: ['Game Dev'] }
      ],
      technologies: ['Unity Engine', 'Unreal Engine 5', 'C# Scripting', 'Blueprints', 'Meta Quest / SteamVR', 'itch.io'],
      hidden: false
    }
  ],
  skillCategories: [
    {
      id: 'cat-temp',
      category: 'Temporary Skill Set',
      skills: ['Windows 95', 'Windows 3.1', 'Windows 2000']
    },
    {
      id: 'cat-ai',
      category: 'AI & Generative Ecosystems',
      skills: [
        'Anthropic Claude',
        'Claude Sonnet',
        'ChatGPT',
        'Perplexity AI',
        'Sonar',
        'Gemini SDK',
        'Gemini 3.1 Flash',
        'Prompt Engineering',
        'Retrieval-Augmented Generation (RAG)',
        'Pydantic v2 Guardrails',
        'Structured Output Mode',
        'Vibe Coding',
        'Autonomous Agents'
      ]
    },
    {
      id: 'cat-prog',
      category: 'Programming & Runtimes',
      skills: [
        'Python 3.12 / 3.14',
        'TypeScript',
        'JavaScript',
        'PHP 8.x',
        'HTML5 Living Standard',
        'CSS3 / Tailwind CSS',
        'C# (Unity / .NET)',
        'Dart / Flutter',
        'SQL',
        'BASIC',
        'JSON Schemas',
        'REST APIs'
      ]
    },
    {
      id: 'cat-spatial',
      category: 'Game Dev & Spatial Computing',
      skills: [
        'Unity Engine',
        'Unreal Engine 5',
        'Visual Blueprints',
        'XR (VR / AR / MR)',
        'Unity Version Control',
        'Epic Games Launcher',
        'Meta Quest SDK',
        'SteamVR',
        'GitHub Desktop',
        'Object-Oriented Programming (OOP)'
      ]
    },
    {
      id: 'cat-data',
      category: 'Data Analysis & Spreadsheets',
      skills: [
        'Tableau Public',
        'Microsoft Excel (Pivot Tables, Advanced Formulas)',
        'Google Sheets (Advanced Functions, Query)',
        'Apple Numbers',
        'Data Visualization',
        'Data Cleaning',
        'Data Consolidation',
        'Exploratory Data Analysis (EDA)',
        'Descriptive Statistics',
        'Predictive Modeling'
      ]
    },
    {
      id: 'cat-creative',
      category: 'Creative Media & Video Production',
      skills: [
        'Final Cut Pro 6.0 & X',
        'Adobe Premiere Pro',
        'Adobe After Effects',
        'Adobe Photoshop',
        'Acrobat Pro',
        'Apple Motion',
        'Soundtrack Pro',
        'Capturebox & Databox Ingestion',
        'Commercial Videography',
        'Lighting & Audio Capture',
        'Broadcast News Editing'
      ]
    },
    {
      id: 'cat-google',
      category: 'Google Ecosystem & Digital Marketing',
      skills: [
        'Google Workspace / G Suite',
        'Google Analytics',
        'Google Tag Manager',
        'Google Ads',
        'Google AdSense',
        'Google Ad Manager',
        'Google Cloud Console',
        'Google Search Console',
        'Technical SEO Audits',
        'Keyword Intent Research',
        'Press Release Syndication'
      ]
    },
    {
      id: 'cat-apple',
      category: 'Apple Architecture & IT Infrastructure',
      skills: [
        'macOS & iOS Systems Administration',
        'Mac Pro',
        'Mac Studio',
        'MacBook Pro',
        'Apple Time Capsule',
        'Apple Xserve',
        'Apple Pages / Keynote / Numbers',
        'Cross-Platform Apple/Windows Networking',
        'cPanel Hosting & DNS Management'
      ]
    },
    {
      id: 'cat-ops',
      category: 'Operations, Project Management & Leadership',
      skills: [
        'Agile Methodologies',
        'Scrum Framework',
        'Business Turnaround Leadership',
        'P&L Accountability',
        'Staff Recruitment & Onboarding',
        'Shift Scheduling',
        'Standard Operating Procedures (SOP)',
        'Xero Bookkeeping',
        'Institutional Grant Writing',
        'Risk Management & Compliance',
        'Bilingual Liaison (English / Japanese)'
      ]
    }
  ],
  education: [
    {
      id: 'edu-canberra',
      institution: 'University of Canberra',
      degree: 'Bachelor of Communication',
      fieldOfStudy: 'Major in Broadcast Journalism',
      graduationYear: '',
      honors: '',
      location: 'Canberra, ACT, Australia',
      hidden: false
    }
  ],
  certifications: [
    {
      id: 'cert-agent-fundamentals',
      name: 'Agent Fundamentals',
      issuer: 'Google Cloud Skills Boost',
      date: '2026',
      credentialId: 'GC-AGENT-FUND',
      url: 'https://www.skills.google/public_profiles/a3fa689c-d153-4513-9a5b-f39f29046411',
      hidden: false
    },
    {
      id: 'cert-build-agent-adk',
      name: 'Build Your First Agent with Agent Development Kit (ADK)',
      issuer: 'Google Cloud Skills Boost',
      date: '2026',
      credentialId: 'GC-ADK-AGENT',
      url: 'https://www.skills.google/public_profiles/a3fa689c-d153-4513-9a5b-f39f29046411',
      hidden: false
    },
    {
      id: 'cert-optimize-agent',
      name: 'Optimize Agent Behavior',
      issuer: 'Google Cloud Skills Boost',
      date: '2026',
      credentialId: 'GC-OPTIMIZE-AGENT',
      url: 'https://www.skills.google/public_profiles/a3fa689c-d153-4513-9a5b-f39f29046411',
      hidden: false
    },
    {
      id: 'cert-google-ai',
      name: 'Google AI Professional Certificate (AI Fundamentals, Planning, Research, Writing, Content Creation, Data Analysis, App Building)',
      issuer: 'Google',
      date: '2026',
      credentialId: 'GAI-7-PART-SPEC',
      url: 'https://grow.google/certificates/',
      hidden: false
    },
    {
      id: 'cert-ue5',
      name: 'Certificate of Unreal Engine 5 Mastery',
      issuer: 'Udemy',
      date: '2023',
      credentialId: 'UC-UE5-MASTER',
      hidden: false
    },
    {
      id: 'cert-sae-arvr',
      name: 'Undergraduate Certificate of Augmented and Virtual Reality',
      issuer: 'SAE Institute Brisbane',
      date: '2021',
      credentialId: 'SAE-ARVR-2021',
      hidden: false
    },
    {
      id: 'cert-data-analyst',
      name: 'Data Analysis using Excel and Tableau Professional Certificate',
      issuer: 'EntryLevel Training',
      date: '2024',
      credentialId: 'EL-DA-2024',
      hidden: false
    },
    {
      id: 'cert-wset-sake',
      name: 'WSET Level 1 Award in Saké',
      issuer: 'Wine & Spirit Education Trust (WSET) / Deja Vu Saké Co',
      date: '2019',
      credentialId: 'WSET-SAKE-L1',
      hidden: false
    },
    {
      id: 'cert-jlpt',
      name: 'Japanese Language Proficiency (JLPT Level 4)',
      issuer: 'Japan Foundation / JEES',
      date: '2007',
      credentialId: 'JLPT-N4',
      hidden: false
    }
  ],
  licenses: [
    {
      id: 'lic-padi',
      name: 'PADI SCUBA Diving Certification (Open Water Diver)',
      authority: 'PADI (Professional Association of Diving Instructors)',
      date: '1993-07-13',
      details: 'Certified in Fiji. Unrestricted recreational open water diving authorization.',
      hidden: false
    },
    {
      id: 'lic-wa-driver',
      name: "Western Australia Driver's License (Open Class C)",
      authority: 'Department of Transport, Western Australia',
      date: 'Current',
      details: 'Open Class C license authorized for both manual and automatic transmission vehicles with a clean driving record.',
      hidden: false
    },
    {
      id: 'lic-approved-mgr',
      name: 'Approved Manager (Liquor Licensing) - MLPLCA001',
      authority: 'Government of Western Australia / Department of Local Government, Sport and Cultural Industries',
      date: '2024',
      details: 'Manage legislative responsibilities for the sale, supply and service of liquor (forms part of 52863WA Course in Management of Licensed Premises, Access All Areas Training).',
      hidden: false
    },
    {
      id: 'lic-first-aid',
      name: 'First Aid & CPR Certifications (HLTAID011, HLTAID009, HLTAID010)',
      authority: 'St John Ambulance Australia',
      date: '2022',
      details: 'HLTAID011 (Provide First Aid), HLTAID009 (Provide CPR), HLTAID010 (Provide Basic Emergency Life Support).',
      hidden: false
    },
    {
      id: 'lic-notetaker',
      name: 'Certified Academic Disability Notetaker',
      authority: 'University of Canberra Disability Services',
      date: 'Certified',
      details: 'Accredited notetaker supporting students with physical, visual, auditory, and cognitive disabilities.',
      hidden: false
    }
  ],
  volunteer: [
    {
      id: 'vol-esl',
      role: 'Founder, Organiser & Teacher',
      organization: 'Gold Coast English As A Second Language Meetup Group',
      period: 'Sep 2011 - Sep 2016',
      location: 'Gold Coast, Australia',
      description: 'Founded and ran free weekly Sunday afternoon English conversation meetups in public community spaces. Marketed, advertised, and facilitated classes for international students, migrants, and working holiday makers.',
      bullets: [
        'Organised and taught weekly free ESL classes for over 5 continuous years.',
        'Marketed, advertised, and promoted the group across multicultural networks.'
      ],
      hidden: false
    },
    {
      id: 'vol-schoolies',
      role: 'Volunteer Support Staff',
      organization: 'Police Link (Surfers Paradise Schoolies)',
      period: '2015',
      location: 'Surfers Paradise, QLD, Australia',
      description: 'Worked in a dedicated community safety team protecting young school leavers under high-stress crowd conditions.',
      bullets: [
        'Dependable, cheerful, realistic, and reliable under high stress situations.',
        'Collaborated closely with emergency services and police liaison officers to maintain youth welfare.'
      ],
      hidden: false
    },
    {
      id: 'vol-tvs',
      role: 'Volunteer General Support / Tape Ingester',
      organization: 'TVS (Television Sydney - Community TV Station)',
      period: 'May 2009 - Dec 2009',
      location: 'Sydney, Australia',
      description: 'Supported community broadcast production through quality-control tape ingestion using Capturebox and Databox systems.',
      bullets: [
        'Quality checked taped programs using Capturebox and Databox.',
        'Assisted with studio technical maintenance and broadcast scheduling.'
      ],
      hidden: false
    },
    {
      id: 'vol-penrith-council',
      role: 'Youth Student Council Representative',
      organization: 'Penrith City Council',
      period: 'Civic Service',
      location: 'Penrith, NSW, Australia',
      description: 'Member of the youth student council participating in municipal youth policy development and civic events.',
      bullets: [
        'Represented secondary students in municipal council chambers on community and cultural projects.'
      ],
      hidden: false
    },
    {
      id: 'vol-notetaker',
      role: 'Disability Notetaking Specialist',
      organization: 'University of Canberra Disability Services',
      period: 'University Tenure',
      location: 'Canberra, ACT, Australia',
      description: 'Attended university lectures alongside students with disabilities to provide clear, detailed, and structured notes facilitating their academic success.',
      bullets: [
        'Took rigorous lecture notes for students with visual, auditory, or motor impairments.'
      ],
      hidden: false
    },
    {
      id: 'vol-easy-read',
      role: 'Accessible Content Author ("Easy Read" Creator)',
      organization: 'Independent Community Initiative',
      period: 'Ongoing',
      location: 'Australia',
      description: 'Authored plain-language "Easy Read" documentation translating complicated technical, medical, and governmental guidelines into accessible vocabulary and visuals for people with intellectual disabilities and ESL readers.',
      bullets: [
        'Broke down complex legal, financial, and technical jargon into simple, supportive illustrated steps.'
      ],
      hidden: false
    },
    {
      id: 'vol-charity-santa',
      role: 'Volunteer Character Performer (Community Santa Claus)',
      organization: 'Community Hospitals & Charity Drives',
      period: 'Seasonal (Australia & Tokyo)',
      location: 'Australia & Japan',
      description: 'Volunteered as authentic Santa Claus for children in pediatric hospitals, disability homes, and community holiday drives in Australia and Tokyo.',
      bullets: [
        'Brought comfort, joy, and laughter to hospitalized children and vulnerable families during holiday periods.'
      ],
      hidden: false
    }
  ],
  training: [
    {
      id: 'train-google-ai',
      title: 'Google AI Professional Certificate (AI Fundamentals, Planning, Research, Writing, Content Creation, Data Analysis, App Building)',
      institution: 'Google',
      year: '2026',
      description: 'Explores nearly every facet of modern AI: AI Fundamentals (Base Code), AI for Brainstorming & Planning, AI for Research & Insights, AI for Writing & Communication, AI for Content Creation, AI for Data Analysis, and AI for App Building & Vibe Coding.',
      skillsLearned: ['AI Fundamentals', 'RAG', 'Prompt Engineering', 'Gemini API', 'App Building', 'Vibe Coding', 'Data Extraction'],
      hidden: false
    },
    {
      id: 'train-data-analyst',
      title: 'Data Analysis using Excel and Tableau Track',
      institution: 'EntryLevel Training',
      year: '2024',
      description: 'Career-focused intensive training in the tools and technologies of modern business intelligence and data analytics.',
      skillsLearned: ['Tableau Public', 'Microsoft Excel', 'Pivot Tables', 'Exploratory Data Analysis', 'Data Cleaning'],
      hidden: false
    },
    {
      id: 'train-liquor-mgr',
      title: 'MLPLCA001 - Manage Legislative Responsibilities for Sale, Supply and Service of Liquor',
      institution: 'Access All Areas Training / 52863WA Course in Management of Licensed Premises',
      year: '2024',
      description: 'Statutory compliance and licensed premise management qualification for Western Australia.',
      skillsLearned: ['Liquor Licensing Law', 'Harm Minimization', 'Venue Risk Management', 'Compliance Audit'],
      hidden: false
    },
    {
      id: 'train-ue5',
      title: 'Certificate of Unreal Engine 5 Mastery',
      institution: 'Udemy',
      year: '2023',
      description: 'Comprehensive game development track covering Blueprint visual scripting, materials, physics, and gameplay mechanics.',
      skillsLearned: ['Unreal Engine 5', 'Visual Blueprints', 'Lighting & Lumen', 'Physics Simulation', 'Game Architecture'],
      hidden: false
    },
    {
      id: 'train-first-aid',
      title: 'First Aid & Emergency Life Support Certification',
      institution: "St John's Ambulance Australia",
      year: '2022',
      description: 'HLTAID011 (Provide First Aid), HLTAID009 (Provide CPR), HLTAID010 (Provide Basic Emergency Life Support).',
      skillsLearned: ['Cardiopulmonary Resuscitation (CPR)', 'Emergency Response', 'Triage Assessment'],
      hidden: false
    },
    {
      id: 'train-sae-arvr',
      title: 'Undergraduate Certificate of Augmented and Virtual Reality',
      institution: 'SAE Institute Brisbane',
      year: '2021',
      description: 'Cutting-edge immersive education taught by industry professionals covering Unity, C# scripting, and Agile/Scrum methodologies.',
      skillsLearned: ['Unity Engine', 'C# Scripting', 'Virtual Reality (VR)', 'Augmented Reality (AR)', 'Agile/Scrum'],
      hidden: false
    },
    {
      id: 'train-wset-sake',
      title: 'WSET Level 1 Award in Saké',
      institution: 'Wine & Spirit Education Trust (WSET) / Prince Wine Store Melbourne',
      year: '2019',
      description: 'Internationally recognized credential in Japanese sake classifications, brewing styles, tasting notes, and storage standards.',
      skillsLearned: ['Sake Styles & Classifications', 'Sensory Evaluation', 'Japanese Culinary Culture'],
      hidden: false
    }
  ],
  referees: [
    {
      id: 'ref-1',
      name: 'Professional Reference One',
      role: 'Senior Engineering Manager',
      organization: 'Technology Solutions Corp',
      contactPhone: '0400 000 001',
      contactEmail: 'ref.one@example.com',
      relationship: 'Manager',
      notes: 'Technical leadership and engineering delivery reference.',
      hidden: false
    },
    {
      id: 'ref-2',
      name: 'Professional Reference Two',
      role: 'Director of Operations',
      organization: 'Enterprise Systems Group',
      contactPhone: '0400 000 002',
      contactEmail: 'ref.two@example.com',
      relationship: 'Director',
      notes: 'Operations and cross-functional leadership reference.',
      hidden: false
    },
    {
      id: 'ref-3',
      name: 'Professional Reference Three',
      role: 'Principal Solutions Architect',
      organization: 'Global Cloud Architecture Ltd',
      contactPhone: '0400 000 003',
      contactEmail: 'ref.three@example.com',
      relationship: 'Colleague / Lead Architect',
      notes: 'Cloud architecture and distributed systems technical reference.',
      hidden: false
    }
  ],
  additionalHighlights: [
    'Married to a Japanese national and committed to permanent life and corporate leadership in Japan / Western Australia.',
    'Speaks intermediate conversational Japanese honed across years of residence and corporate management in Tokyo.',
    'Speaks beginner conversational Thai.',
    'Hobbies and Interests: Badminton, SCUBA diving (PADI certified on 13-07-1993 in Fiji), movies, writing, rifle shooting, reading, and bushwalks.',
    'Sole cameraman and editor of IMDb-accredited film production "Blind" (imdb.com/title/tt1785307/).'
  ],
  milestoneSections: [
    {
      id: 'msec-key',
      title: 'Key',
      items: [
        'Ready Team One Business Turnaround: Steered a complex Virtual Reality arena business back to profitability under severe financial, technical, and staffing headwinds, mastering arena operations and hardware within 3 weeks.',
        'Digitized Information Tokyo Bureau Management: Directed, filmed, voiced, and edited hundreds of bilingual technology and business news stories while managing high-profile multinational accounts including Bloomberg LP and Tokyo Game Show coverage.',
        'Pro-Axle National IT & Web Infrastructure: Engineered, hosted, and maintained 99.9% uptime across corporate and franchise web properties for over 15 continuous years of enterprise automotive engineering operations.'
      ]
    },
    {
      id: 'msec-tech',
      title: 'Technical Problem-Solving & Architecture Hardening',
      items: [
        'ADK Runtime & State Lifecycle Mastery: Independently audited and debugged Google Cloud ADK execution flows (ReadonlyContext, EventActions.state_delta, and async Runner loops) to resolve state-persistence edge cases and build deterministic agent routing.',
        'Production API & Quota Hardening: Engineered a zero-token demo gatekeeper middleware, Firebase Auth role-routing layer, and exponential backoff with jitter to protect production Gemini API budgets while supporting live public portfolio previews.',
        'Schema-Enforced AI Pipelines: Built Pydantic v2 validation guardrails, Factual Drift snapshot auditing, and regex-based Australian/UK English localisation post-processors to eliminate LLM hallucinations and formatting drift.'
      ]
    },
    {
      id: 'msec-teaching',
      title: 'Teaching & Entertainment',
      items: [
        'IMDb-Accredited Film Production "Blind": Served as sole Cameraman and Editor on internationally recognized feature film "Blind" (imdb.com/title/tt1785307/), delivering broadcast-quality cinematography and post-production.',
        'Clinical Simulation & Medical Teaching Associate: Memorized complex clinical histories and guided medical registrars through invasive clinical examinations across Bond University, Griffith University, University of Queensland, and Mater Hospital.'
      ]
    },
    {
      id: 'msec-languages',
      title: 'Languages',
      items: [
        'English (Native), Japanese (Intermediate conversational / JLPT Level 4), Thai (Beginner conversational).'
      ]
    },
    {
      id: 'msec-interests',
      title: 'Interests & Hobbies',
      items: [
        'Badminton, PADI-certified SCUBA diving, creative writing, bushwalking, cinema, and target rifle shooting.'
      ]
    }
  ]
};

export const INITIAL_SAMPLE_MASTER_RESUME: MasterResume = {
  ...PURE_USER_MASTER_RESUME,
  tasks: []
};

export const JANE_DOE_MASTER_RESUME: MasterResume = {
  id: 'jane-doe-master',
  version: 2,
  lastUpdated: new Date().toISOString(),
  contact: {
    fullName: 'Jane Doe',
    headline: 'Senior Cloud & Systems Architect | Distributed Systems Lead',
    email: 'jane.doe@example.com',
    phone: '0400 000 000',
    location: 'Sydney, NSW, Australia',
    residentialAddress: '100 George St, Sydney, NSW, 2000',
    currentStatus: 'Immediate',
    relocationDetails: 'Local',
    linkedin: 'https://www.linkedin.com/',
    github: 'https://github.com/',
    website: 'https://example.com',
    websiteList: [
      { url: 'https://example.com', description: 'Technical Portfolio' },
      { url: 'https://github.com', description: 'GitHub Open Source' }
    ]
  },
  executiveSummaries: [
    {
      id: 'jd-sum-1',
      focusTrack: 'Cloud & Systems Architecture',
      text: 'Senior Cloud and Systems Architect with 8+ years of experience designing secure, scalable distributed cloud infrastructure on AWS and GCP. Proven track record leading multi-region Kubernetes migrations, zero-trust service mesh deployments, and high-performance backend microservices.'
    },
    {
      id: 'jd-sum-2',
      focusTrack: 'Technical Leadership & DevOps',
      text: 'Results-driven technical leader skilled in mentoring cross-functional engineering teams, optimizing CI/CD pipelines, and establishing rigorous cloud security governance.'
    }
  ],
  experiences: [
    {
      id: 'jd-exp-1',
      company: 'CloudScale Enterprise',
      role: 'Senior Cloud Architect',
      location: 'Sydney, NSW, Australia',
      startDate: '2020-01',
      endDate: 'Present',
      isCurrent: true,
      summary: 'Leading cloud infrastructure design and Kubernetes migration initiatives across enterprise financial systems.',
      bullets: [
        { id: 'jd-b-1', text: 'Architected multi-region Kubernetes clusters reducing deployment latency by 45%.', impactMetric: '-45% Latency', tags: ['AWS', 'Kubernetes'] },
        { id: 'jd-b-2', text: 'Spearheaded zero-downtime database migration handling 50M+ daily transactions.', impactMetric: '50M+ Transactions', tags: ['PostgreSQL', 'Migration'] },
        { id: 'jd-b-3', text: 'Mentored a team of 8 junior and mid-level platform engineers in modern Infrastructure as Code practices.', impactMetric: '8 Engineers', tags: ['Leadership', 'Terraform'] }
      ],
      technologies: ['AWS', 'GCP', 'Kubernetes', 'Docker', 'Terraform', 'PostgreSQL'],
      hidden: false
    },
    {
      id: 'jd-exp-2',
      company: 'Apex Digital Systems',
      role: 'DevOps & Systems Engineer',
      location: 'Sydney, NSW, Australia',
      startDate: '2017-03',
      endDate: '2019-12',
      isCurrent: false,
      summary: 'Engineered automated CI/CD pipelines and containerized microservices for high-growth SaaS products.',
      bullets: [
        { id: 'jd-b-4', text: 'Built automated CI/CD pipelines in GitLab CI cutting release cycles from hours to minutes.', impactMetric: '90% Faster Releases', tags: ['CI/CD', 'Docker'] },
        { id: 'jd-b-5', text: 'Implemented comprehensive monitoring and alerting using Prometheus and Grafana dashboards.', impactMetric: '99.99% Uptime', tags: ['Observability'] }
      ],
      technologies: ['GitLab CI', 'Docker', 'Prometheus', 'Grafana', 'Python', 'AWS'],
      hidden: false
    }
  ],
  projects: [
    {
      id: 'jd-proj-1',
      name: 'Enterprise Multi-Cloud Mesh',
      role: 'Lead Architect',
      link: 'https://github.com',
      period: '2022',
      description: 'Zero-trust service mesh for cross-cloud telemetry and secure pod-to-pod encryption.',
      bullets: [
        { id: 'jd-pb-1', text: 'Implemented Istio service mesh across 500+ microservices.', impactMetric: '500+ Microservices', tags: ['Istio', 'Security'] }
      ],
      technologies: ['Istio', 'Kubernetes', 'Go', 'Prometheus'],
      hidden: false
    },
    {
      id: 'jd-proj-2',
      name: 'Autonomous Cost Optimization Agent',
      role: 'Creator & Developer',
      link: 'https://github.com',
      period: '2023',
      description: 'AI-powered cloud resource allocator leveraging LLMs to predict peak traffic and auto-scale spot instances.',
      bullets: [
        { id: 'jd-pb-2', text: 'Saved 35% in monthly cloud compute expenditure across staging and production environments.', impactMetric: '35% Cost Reduction', tags: ['AI', 'AWS'] }
      ],
      technologies: ['Python', 'Gemini API', 'AWS SDK', 'Docker'],
      hidden: false
    }
  ],
  skillCategories: [
    {
      id: 'jd-cat-1',
      category: 'Cloud & Infrastructure',
      skills: ['AWS Solutions Architecture', 'Google Cloud Platform (GCP)', 'Kubernetes (EKS/GKE)', 'Docker Containerization', 'Terraform & OpenTofu', 'Istio Service Mesh']
    },
    {
      id: 'jd-cat-2',
      category: 'Programming Languages & Scripting',
      skills: ['Python 3.12', 'Go (Golang)', 'TypeScript & JavaScript', 'Bash / Shell Scripting', 'Rust (Systems)']
    },
    {
      id: 'jd-cat-3',
      category: 'AI & Generative Ecosystems',
      skills: ['Gemini API & SDK', 'Anthropic Claude', 'Prompt Engineering', 'Retrieval-Augmented Generation (RAG)', 'Autonomous Cloud Agents']
    },
    {
      id: 'jd-cat-4',
      category: 'Databases & Storage',
      skills: ['PostgreSQL & Aurora', 'Redis Distributed Caching', 'Elasticsearch / OpenSearch', 'Kafka Streaming', 'Prometheus & Grafana']
    },
    {
      id: 'jd-cat-5',
      category: 'Operations, Security & Leadership',
      skills: ['CI/CD Pipeline Automation', 'Zero-Trust Security Governance', 'Agile / Scrum Leadership', 'Incident Response & Triage', 'Technical Mentorship']
    }
  ],
  education: [
    {
      id: 'jd-edu-1',
      institution: 'University of New South Wales',
      degree: 'Bachelor of Software Engineering',
      fieldOfStudy: 'Software Engineering & Distributed Systems',
      graduationYear: '2019',
      location: 'Sydney, Australia',
      hidden: false
    }
  ],
  certifications: [
    {
      id: 'jd-cert-1',
      name: 'AWS Certified Solutions Architect – Professional',
      issuer: 'Amazon Web Services',
      date: '2022',
      credentialId: 'AWS-PSA-12345',
      hidden: false
    },
    {
      id: 'jd-cert-2',
      name: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Linux Foundation',
      date: '2023',
      credentialId: 'CKA-98765',
      hidden: false
    }
  ],
  licenses: [
    {
      id: 'jd-lic-1',
      name: "New South Wales Driver's License (Full Class C)",
      authority: 'Transport for NSW',
      date: 'Current',
      details: 'Unrestricted open driver license.',
      hidden: false
    }
  ],
  volunteer: [
    {
      id: 'jd-vol-1',
      role: 'Cloud Mentor & Workshop Facilitator',
      organization: 'Sydney Women in Tech',
      period: '2021 - Present',
      location: 'Sydney, Australia',
      description: 'Mentoring aspiring engineers in cloud computing, Linux administration, and DevOps fundamentals.',
      bullets: [
        'Conducted monthly hands-on workshops on AWS and Docker fundamentals.'
      ],
      hidden: false
    }
  ],
  training: [
    {
      id: 'jd-train-1',
      title: 'Advanced Kubernetes Architecture & Security',
      institution: 'Linux Foundation',
      year: '2023',
      description: 'Deep dive into cluster hardening, RBAC, network policies, and service mesh protocols.',
      skillsLearned: ['Kubernetes Security', 'Network Policies', 'Istio'],
      hidden: false
    }
  ],
  referees: [
    {
      id: 'jd-ref-1',
      name: 'Sarah Jenkins',
      role: 'VP of Engineering',
      organization: 'CloudScale Enterprise',
      contactPhone: '0400 123 456',
      contactEmail: 's.jenkins@cloudscale.example',
      relationship: 'Direct Engineering Manager',
      notes: 'Professional technical leadership referee.',
      hidden: false
    }
  ],
  additionalHighlights: [
    'Keynote speaker at Sydney Cloud Native Meetup 2023 on Zero-Trust Mesh Architectures.',
    'Active open-source contributor to cloud cost optimization tooling.'
  ]
};

import { TailoredResume, TodoTask } from '../types/resume';

export const JANE_DOE_SAMPLE_HISTORY: TailoredResume[] = [
  {
    id: 'tailor-jd-sample-1',
    jobTitle: 'Senior Cloud Architect',
    companyName: 'Atlassian',
    targetJD: 'Seeking a Senior Cloud Architect to lead multi-region AWS infrastructure scaling, Kubernetes orchestration, and zero-trust security policies across global engineering teams.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    executiveSummary: 'Senior Cloud and Systems Architect with 8+ years of experience designing secure, scalable distributed cloud infrastructure on AWS and GCP. Proven track record leading multi-region Kubernetes migrations and zero-trust deployments.',
    selectedSkills: [
      { category: 'Cloud & Infrastructure', skills: ['AWS Solutions Architecture', 'Google Cloud Platform (GCP)', 'Kubernetes (EKS/GKE)', 'Terraform & OpenTofu'] },
      { category: 'Programming Languages', skills: ['Python 3.12', 'Go (Golang)', 'Bash / Shell Scripting'] }
    ],
    experiences: [
      {
        company: 'CloudScale Enterprise',
        role: 'Senior Cloud Architect',
        location: 'Sydney, NSW, Australia',
        period: '2020 - Present',
        bullets: [
          'Architected multi-region Kubernetes clusters reducing deployment latency by 45%.',
          'Spearheaded zero-downtime database migration handling 50M+ daily transactions.'
        ],
        technologies: ['AWS', 'Kubernetes', 'Terraform', 'PostgreSQL']
      }
    ],
    projects: [
      {
        name: 'Enterprise Multi-Cloud Mesh',
        role: 'Lead Architect',
        period: '2022',
        bullets: ['Implemented Istio service mesh across 500+ microservices.'],
        technologies: ['Istio', 'Kubernetes', 'Go']
      }
    ],
    education: JANE_DOE_MASTER_RESUME.education,
    certifications: JANE_DOE_MASTER_RESUME.certifications,
    atsAnalysis: {
      matchScore: 94,
      matchedKeywords: ['AWS', 'Kubernetes', 'Terraform', 'Python', 'Go', 'Security'],
      missingKeywords: [],
      strengths: ['Exceptional cloud infrastructure alignment', 'Demonstrated multi-region scaling experience', 'Strong Kubernetes background'],
      recommendations: ['Highlight Atlassian tool familiarity if possible'],
      roleFitSummary: 'Outstanding candidate fit with 94% ATS match score.'
    },
    coverLetter: 'Dear Hiring Manager at Atlassian,\n\nI am writing to express my strong interest in the Senior Cloud Architect role. With over 8 years of experience engineering resilient multi-region cloud systems on AWS and Kubernetes, I have consistently delivered robust infrastructure that scales seamlessly under peak enterprise load.\n\nAt CloudScale Enterprise, I architected multi-region Kubernetes clusters that reduced deployment latency by 45% and spearheaded zero-downtime database migrations supporting over 50 million daily transactions. I am deeply aligned with Atlassian’s engineering culture and mission to unleash the potential of every team.\n\nI look forward to discussing how my expertise in distributed cloud systems and infrastructure automation can contribute to Atlassian’s continued success.\n\nSincerely,\nJane Doe',
    pageBudget: 1,
    qaPairs: [
      {
        id: 'qa-jd-1',
        question: 'How have you managed multi-region Kubernetes deployments and reduced deployment latency?',
        answer: 'At CloudScale Enterprise, I architected multi-region Kubernetes clusters across AWS and GCP, streamlining cluster peering, edge routing, and automated pod deployments which reduced deployment latency by 45%.'
      },
      {
        id: 'qa-jd-2',
        question: 'Describe your experience with zero-downtime database migrations under enterprise scale.',
        answer: 'I spearheaded a zero-downtime migration of a PostgreSQL distributed database cluster handling over 50 million daily transactions by implementing dual-write replication, backward-compatible schema versioning, and phased DNS cutovers.'
      },
      {
        id: 'qa-jd-3',
        question: 'How do you mentor junior and mid-level platform engineers?',
        answer: 'I lead structured internal workshops on Infrastructure as Code (Terraform), GitOps workflows, and incident post-mortems, pairing engineers with critical projects to accelerate technical ownership and autonomy.'
      }
    ]
  },
  {
    id: 'tailor-jd-sample-2',
    jobTitle: 'Lead Platform Engineer',
    companyName: 'Canva',
    targetJD: 'Looking for a Lead Platform Engineer to build high-performance internal developer platforms, automated CI/CD pipelines, and robust observability frameworks.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    executiveSummary: 'Results-driven technical leader skilled in mentoring cross-functional engineering teams, optimizing CI/CD pipelines, and establishing rigorous cloud security governance.',
    selectedSkills: [
      { category: 'Cloud & Infrastructure', skills: ['Kubernetes (EKS/GKE)', 'Docker Containerization', 'Terraform & OpenTofu'] },
      { category: 'Operations & Security', skills: ['CI/CD Pipeline Automation', 'Prometheus & Grafana', 'Incident Response & Triage'] }
    ],
    experiences: [
      {
        company: 'CloudScale Enterprise',
        role: 'Senior Cloud Architect',
        location: 'Sydney, NSW, Australia',
        period: '2020 - Present',
        bullets: [
          'Mentored a team of 8 junior and mid-level platform engineers in modern Infrastructure as Code practices.'
        ],
        technologies: ['AWS', 'Kubernetes', 'Terraform']
      }
    ],
    projects: [
      {
        name: 'Autonomous Cost Optimization Agent',
        role: 'Creator & Developer',
        period: '2023',
        bullets: ['Saved 35% in monthly cloud compute expenditure across staging and production environments.'],
        technologies: ['Python', 'Gemini API', 'AWS SDK']
      }
    ],
    education: JANE_DOE_MASTER_RESUME.education,
    certifications: JANE_DOE_MASTER_RESUME.certifications,
    atsAnalysis: {
      matchScore: 91,
      matchedKeywords: ['Kubernetes', 'CI/CD', 'Docker', 'Terraform', 'Prometheus', 'Platform'],
      missingKeywords: [],
      strengths: ['Strong developer tooling and platform engineering background', 'Proven CI/CD optimization results'],
      recommendations: ['Emphasize internal developer platform adoption'],
      roleFitSummary: 'Excellent candidate fit with 91% ATS match score.'
    },
    coverLetter: 'Dear Hiring Manager at Canva,\n\nI am thrilled to apply for the Lead Platform Engineer position. Building empowering internal developer platforms that enable engineering velocity and operational reliability is my core passion.\n\nThroughout my career, I have optimized release cycles by 90% through automated GitLab CI pipelines and engineered intelligent cost-optimization agents that reduced cloud compute expenditure by 35%. I am eager to bring this same dedication to developer empowerment and high-scale platform engineering to Canva.\n\nThank you for considering my application.\n\nSincerely,\nJane Doe',
    pageBudget: 1,
    qaPairs: [
      {
        id: 'qa-cnv-1',
        question: 'What is your approach to designing internal developer platforms that scale?',
        answer: 'I focus on building self-service abstractions using Kubernetes, Terraform, and GitLab CI that empower engineering teams to ship code rapidly without compromising security or observability.'
      },
      {
        id: 'qa-cnv-2',
        question: 'How did you achieve a 90% reduction in release cycle times?',
        answer: 'By containerizing microservices with Docker, establishing rigorous automated testing in GitLab CI, and caching Docker layers in runner pools, deployment feedback loops dropped from hours to under 8 minutes.'
      },
      {
        id: 'qa-cnv-3',
        question: 'How do you approach cloud cost optimization without sacrificing performance?',
        answer: 'I developed an autonomous cost-optimization agent utilizing Python and the Gemini API to analyze peak traffic patterns and intelligently schedule spot instance allocation, reducing monthly cloud compute expenditure by 35%.'
      }
    ]
  }
];

export const JANE_DOE_TODO_TASKS: TodoTask[] = [
  {
    id: 'jd-task-1',
    text: 'Review multi-region Kubernetes cluster autoscaling metrics',
    section: 'Cloud Architecture',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jd-task-2',
    text: 'Audit zero-trust IAM policies across AWS and GCP accounts',
    section: 'Security Governance',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jd-task-3',
    text: 'Prepare technical keynote presentation on Service Mesh architectures',
    section: 'Technical Leadership',
    status: 'in_progress',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jd-task-4',
    text: 'Optimize CI/CD pipeline caching for faster container builds',
    section: 'Cloud Architecture',
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
];

