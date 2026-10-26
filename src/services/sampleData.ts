import { MasterResume } from '../types/resume';

/**
 * PURE CANONICAL TRUTH DOCUMENT FOR LUKE FROHLING
 * Contains exclusively verified personal information, projects, skills, and certifications.
 * Zero demo/placeholder data (no fictional employers, degrees, or patents).
 */
export const PURE_USER_MASTER_RESUME: MasterResume = {
  id: 'canonical-master-truth-v2',
  version: 3,
  lastUpdated: new Date().toISOString(),
  contact: {
    fullName: 'Luke Frohling',
    headline: 'AI Software Engineer & Solutions Architect | Google Certified AI Specialist',
    email: 'Lfrohling01@yahoo.com.au',
    phone: '',
    location: 'Perth, WA, Australia (Currently in Japan; Available for Remote & Seeking Permanent Relocation)',
    residentialAddress: 'Unit 10, 187 Walcott St, Mount Lawley, WA, Australia, 6050',
    currentStatus: 'Currently in Japan (available immediately for in-person interviews / non-geo-locked work; scheduled return to AU in 3 weeks)',
    relocationDetails: 'Seeking permanent relocation to Japan; standard 1-month notice period to relocate; AWST/JST time-zone synchronised; JLPT Level 4 certified (actively studying intermediate)',
    linkedin: 'https://www.linkedin.com/in/lukefrohling/',
    github: '',
    website: 'https://lukefrohling.com',
    websiteList: [
      { url: 'https://lukefrohling.com', description: 'Personal Website' },
      { url: 'https://www.linkedin.com/in/lukefrohling/', description: 'LinkedIn' }
    ]
  },
  executiveSummaries: [
    {
      id: 'sum-ai-1',
      focusTrack: 'AI Engineering & Business Process Automation',
      text: 'Google Certified AI Specialist and Software Engineer specializing in deploying intelligent microservices, deterministic LLM structured extraction pipelines, and automated support triage architectures. Proficient in Python 3.12, Streamlit cloud architectures, Google Gemini API SDKs, prompt engineering, and zero-leak security models. Experienced in building resilient systems that handle platform rate constraints gracefully.'
    },
    {
      id: 'sum-ai-2',
      focusTrack: 'Full-Stack Solutions & Global Collaboration',
      text: 'Solutions Architect and technical engineer focused on automating enterprise workflows by converting unstructured communications into structured operational data. Based in Perth, WA with AWST/JST time-zone alignment for seamless collaboration with Japan and APAC teams. Actively studying intermediate Japanese (JLPT Level 4 certified) and seeking permanent relocation to Japan.'
    }
  ],
  experiences: [],
  projects: [
    {
      id: 'proj-triage-agent',
      name: 'AI-Powered Customer Support Triage & Lead Routing Agent',
      role: 'Lead AI Engineer & Solutions Architect',
      link: 'ai.studio/apps/7e99cee3-61a2-48dd-ae97-94392f5b6766',
      period: '2024 - Present',
      description: 'Enterprise AI microservice automating communication workflows by parsing unstructured user data (support tickets, sales leads, emails) into deterministic operational data. Built with Python 3.12, Streamlit UI, Google Gemini API (gemini-3.8-flash SDK), and Streamlit Community Cloud hosting.',
      technologies: [
        'Python 3.12',
        'Streamlit UI',
        'Google Gemini API (gemini-3.8-flash SDK)',
        'JSON Structured Outputs',
        'Git/GitHub',
        'Streamlit Community Cloud',
        'st.secrets Isolation',
        'Session State Caching',
        'Error Handling & Fallback Architectures'
      ],
      bullets: [
        {
          id: 'pb-triage-1',
          text: 'Developed an automated triage pipeline utilizing Python and the Google Gemini API to parse unformatted client text blocks into enterprise-ready structured JSON models, eliminating manual triage overhead.',
          impactMetric: 'Sub-second structured triage',
          tags: ['Python 3.12', 'Gemini API', 'JSON Outputs', 'Automation']
        },
        {
          id: 'pb-triage-2',
          text: 'Architected a user-facing analytics dashboard using Streamlit, featuring real-time metric categorization for incoming ticket urgency, classification tracking, and automated empathetic response drafts.',
          impactMetric: 'Real-time classification dashboard',
          tags: ['Streamlit', 'UI/UX', 'Analytics', 'State Management']
        },
        {
          id: 'pb-triage-3',
          text: 'Optimized application reliability against platform API tier constraints (e.g. 20 RPD limits) by implementing multi-layered error handling, structured input form validation controls, and a custom "Recruiter Simulator Mode" fallback switch.',
          impactMetric: '100% uptime fallback layer',
          tags: ['API Resilience', 'Quota Optimization', 'Architecture']
        },
        {
          id: 'pb-triage-4',
          text: 'Secured infrastructure deployment profiles by isolating live production credentials and server connection vectors natively inside managed cloud environment variables (st.secrets) with zero version control exposure.',
          impactMetric: 'Zero credential exposure',
          tags: ['Cloud Security', 'DevOps', 'st.secrets']
        }
      ]
    },
    {
      id: 'proj-document-search',
      name: 'Intelligent Document Search Engine (RAG System)',
      role: 'Lead AI Engineer & Solutions Architect',
      link: '[PASTE_YOUR_PROJECT_2_STREAMLIT_URL_HERE]',
      period: '2024 - Present',
      description: 'Enterprise Retrieval-Augmented Generation (RAG) system utilizing Python 3.12, Streamlit Form Framework, and Google Gemini API (gemini-3.5-flash) to perform high-precision, grounded document search with zero-hallucination guardrails.',
      technologies: [
        'Python 3.12',
        'Streamlit Form Framework',
        'Google Gemini API (gemini-3.5-flash SDK)',
        'In-Memory Cache & Grounding',
        'Mermaid.js Visual Layouts',
        'Git/GitHub',
        'Streamlit Cloud'
      ],
      bullets: [
        {
          id: 'pb-rag-1',
          text: 'Engineered a Retrieval-Augmented Generation (RAG) search application utilizing Python and Gemini 3.5 Flash to ground LLM context windows natively within unstructured corporate text documents.',
          impactMetric: 'Zero-hallucination doc search',
          tags: ['Python', 'Gemini API', 'RAG', 'Doc Search']
        },
        {
          id: 'pb-rag-2',
          text: 'Architected a modular frontend file-processing pipeline via Streamlit, allowing users to upload localized data assets into operational memory for instant semantic query responses.',
          impactMetric: 'Streamlit file processing pipeline',
          tags: ['Streamlit UI', 'In-Memory Cache', 'State Isolation']
        },
        {
          id: 'pb-rag-3',
          text: 'Formulated defensive system prompt constraint parameters, enforcing strict data lookup protocols that prevent the model from introducing information outside the provided text boundaries.',
          impactMetric: 'Grounded Answer Matrix',
          tags: ['Prompt Engineering', 'Constraints', 'Determinism']
        },
        {
          id: 'pb-rag-4',
          text: 'Maintained uninterrupted public application availability across strict platform infrastructure quotas by building an internal mock data runtime simulation layer for public testing.',
          impactMetric: 'Fault-tolerant recruiter rails',
          tags: ['Quota Optimisation', 'Recruiter Simulator', 'Resilience']
        }
      ]
    },
    {
      id: 'proj-etl-validation-agent',
      name: 'Multi-File AI Autonomous ETL Data Validation Agent',
      role: 'Lead Data Architect & Backend Engineer',
      link: '[PASTE_YOUR_PROJECT_3_STREAMLIT_URL_HERE]',
      period: '2024 - Present',
      description: 'Programmatically guarded ETL data validation agent using Python 3.12/3.14, Streamlit Cloud, Pydantic v2, and Gemini 3.5 Flash inside a decoupled stateful subsystem framework.',
      technologies: [
        'Python 3.12/3.14',
        'Streamlit v1.64.0',
        'Pydantic v2',
        'Google Gemini API (gemini-3.5-flash)',
        'Stateful Caching (@st.cache_data)',
        'Regex Formatting Validation',
        'Multi-File Structure (models.py, pipeline.py, app.py)'
      ],
      bullets: [
        {
          id: 'pb-etl-1',
          text: 'Designed and implemented a scalable, multi-file production design (models.py, pipeline.py, app.py) separating front-end user experience, core API pipelines, and strict data layer parsing structures to maximise codebase maintainability.',
          impactMetric: 'Decoupled subsystem design',
          tags: ['Multi-File Architecture', 'Software Engineering', 'Python']
        },
        {
          id: 'pb-etl-2',
          text: 'Integrated programmatic validation networks using Pydantic schemas to layer deterministic validation checks—such as custom alphanumeric regular expressions (Regex) and structural value boundary parameters—directly on top of volatile unstructured generative outputs.',
          impactMetric: 'Deterministic validation network',
          tags: ['Pydantic v2', 'Regex', 'Data Validation', 'Guaranteed Schemas']
        },
        {
          id: 'pb-etl-3',
          text: 'Engineered an independent transactional validation loop that catches individual cell format anomalies natively on a row-by-row level, safely isolating corrupted text records into diagnostic tracking ledgers while passing valid data to relational destinations without script crashes.',
          impactMetric: 'Granular row-level isolation',
          tags: ['Fault Isolation', 'Error Handling', 'Transaction Pipeline']
        },
        {
          id: 'pb-etl-4',
          text: 'Resolved production page-load framework collisions and memory mutation bugs inside a live Streamlit cloud environment by implementing rigid data caching configurations (@st.cache_data) and explicit unique key state markers to preserve user data-grid interactions during server re-run actions.',
          impactMetric: 'Stateful UI persistence',
          tags: ['Streamlit Caching', 'Session State', 'State Management']
        },
        {
          id: 'pb-etl-5',
          text: 'Formulated dual-path resource management guardrails, including an isolated offline simulation runtime toggle to prevent API quota depletion and a programmatic local memory cache caching layer to completely intercept duplicate processing loops and protect strict environment limits.',
          impactMetric: 'Cost & Quota optimisation',
          tags: ['Quota Optimisation', 'Local Caching', 'Sandbox Simulator']
        }
      ]
    },
    {
      id: 'proj-telemetry-security-suite',
      name: 'Pragmatic Full-Stack Web Security, Routing & User Telemetry Suite',
      role: 'Lead Full-Stack Developer & Security Engineer',
      link: '[PASTE_YOUR_PORTFOLIO_URL_HERE]',
      period: '2024 - Present',
      description: 'Robust, full-stack website security, single-page application router fallback, and rendering-safe user behavior sequential logging system built on React 19, TypeScript, cPanel Apache configurations, and high-performance PHP backend script integrations.',
      technologies: [
        'React 19',
        'TypeScript',
        'PHP 8.x Native Runtime',
        'Apache Web Server (.htaccess)',
        'Spam Trap Honeypots',
        'sessionStorage APIs',
        'RFC 5322 Email Standards',
        'IP-API Geolocation Engine',
        'Python Build Scripts'
      ],
      bullets: [
        {
          id: 'pb-sec-1',
          text: 'Developed an interactive, lazy-hydration email obfuscator storing decoupled contact elements in JS variables to construct dynamic mailto anchors on hover/interaction, successfully shielding static web files from automated regex-based scraping spam bots.',
          impactMetric: '100% human-friendly email shielding',
          tags: ['Lazy-Hydration Obfuscation', 'Bot Protection', 'Spam Defense']
        },
        {
          id: 'pb-sec-2',
          text: 'Engineered an invisible CSS spam trap honeypot programmatically injected into frontend forms, causing the PHP SMTP mailer to immediately and silently discard bot-completed payloads at the gateway without legitimate user disruption.',
          impactMetric: 'Zero spam bot form-fills',
          tags: ['Honeypots', 'Form Spam Prevention', 'PHP Sanitisation']
        },
        {
          id: 'pb-sec-3',
          text: 'Designed a zero-dependency sessionStorage sequential tracking logging system logging viewport exit timestamps, stay durations, and external click telemetry directly in browser memory, completely avoiding React re-renders and UI latency.',
          impactMetric: 'Zero render-latency user tracking',
          tags: ['User Telemetry', 'sessionStorage API', 'Performance Engineering']
        },
        {
          id: 'pb-sec-4',
          text: 'Programmed a custom 500-character line-length wrapper and formatter in PHP, aligning raw journey logs to strict RFC 5322 specifications to eliminate spam filter triggers and prevent email truncation on shared cPanel hosts.',
          impactMetric: '100% server-side mail deliverability',
          tags: ['PHP mail() SMTP', 'RFC 5322 Compliance', 'String Sanitisation']
        },
        {
          id: 'pb-sec-5',
          text: 'Architected custom Apache redirection rules inside standard .htaccess templates, routing non-physical SPA paths to fallback to index.html and completely resolving reload 404 errors on cPanel c-hosting platforms.',
          impactMetric: '100% reload routing durability',
          tags: ['Apache Redirection', '.htaccess fallbacks', 'SPA Deployments']
        }
      ]
    },
    {
      id: 'proj-ai-portfolio-deployment',
      name: 'AI-Powered Portfolio & Automated Deployment System',
      role: 'Lead Architect & Developer',
      link: '[PASTE_YOUR_PORTFOLIO_URL_HERE]',
      period: '2024 - Present',
      description: 'High-ROI automated deployment architecture featuring deterministic AI frameworks, secure full-stack proxy routing, and reliable ETL data pipelines.',
      technologies: [
        'React 19',
        'TypeScript',
        'Vite',
        'Tailwind CSS',
        'Express.js',
        'Node.js',
        'Google Gemini API & Interactions SDK',
        'Python 3.12 (Automation)'
      ],
      bullets: [
        {
          id: 'pb-ai-port-1',
          text: 'Implemented robust LLM interactions for intelligent content extraction and structured generation using the Gemini API and Interactions SDK.',
          impactMetric: 'High-ROI content automation',
          tags: ['Gemini API', 'LLM Integration', 'Automation']
        },
        {
          id: 'pb-ai-port-2',
          text: 'Engineered deterministic JSON output schemas to enforce strict data structures, effectively eliminating AI hallucinations during automated metadata parsing and triage.',
          impactMetric: '100% factual accuracy in parsing',
          tags: ['JSON Schema', 'Deterministic AI', 'Reliability']
        },
        {
          id: 'pb-ai-port-3',
          text: 'Architected Retrieval-Augmented Generation (RAG) grounding layers that restrict LLM responses strictly to verified business documentation.',
          impactMetric: 'Critical reliability',
          tags: ['RAG', 'AI Grounding', 'Data Accuracy']
        },
        {
          id: 'pb-ai-port-4',
          text: 'Designed a custom Node.js deployment framework automating secure builds, environment variable synchronisation, and direct production FTP/FTPS deployment cycles.',
          impactMetric: 'Critical deployment automation',
          tags: ['DevOps', 'CI/CD', 'Node.js']
        },
        {
          id: 'pb-ai-port-5',
          text: 'Implemented multi-layered security protocols including AES-256 encryption, server-side proxy routes, and credential obfuscation to shield frontend assets from exposure.',
          impactMetric: 'Critical infrastructure security',
          tags: ['Security', 'Backend Engineering', 'Proxy Routing']
        }
      ]
    }
  ],
  skillCategories: [
    {
      id: 'cat-languages',
      category: 'Programming Languages & Core Runtimes',
      skills: [
        'Python 3.12 / 3.14 (Advanced script automation, structured logic, API orchestration, error handling)',
        'JavaScript / TypeScript (Strict typing, ES6+ logic flows)',
        'PHP 8.x (Native custom systems, CURL extensions, php mail SMTP clients)',
        'HTML5 / Tailwind CSS Frameworks (UI layouts, responsive presenting principles, viewport hydration)',
        'Mermaid.js Markdown Notation (Programmatic systems architecture mapping)',
        'JSON Data Schemas (Serialization & payload parsing)',
        'TOML Syntax (Configuration management for isolated backend storage)'
      ]
    },
    {
      id: 'cat-ai-ml',
      category: 'AI Engineering & Google AI Systems',
      skills: [
        'Google Gemini API (gemini-3.8-flash, gemini-3.5-flash SDK connections)',
        'Gemini API & Interactions SDK',
        'Retrieval-Augmented Generation (RAG) (In-memory context grounding networks)',
        'Retrieval-Augmented Generation (RAG) Concepts',
        'Prompt Engineering & Defensive System Prompts (Strict data lookup protocols)',
        'Structured JSON Schema Framing',
        'Deterministic Workflow Design',
        'Pydantic v2 Operational Runtime Guardrail Models (Deterministic validation, alphanumeric regex parameters)',
        'JSON Structured Outputs & Decoupled Data Layer Parsing Structures',
        'Row Fault Isolation & Corruption Diagnosis (Independent cell validation loops)',
        'AI Ethics & Responsible AI Practices',
        'Rate-Limit Fallback Design & Sandbox Simulator Toggle (Offline simulation)'
      ]
    },
    {
      id: 'cat-web-frameworks',
      category: 'Modern Web & Application Frameworks',
      skills: [
        'React 19 & TypeScript',
        'React 19 Single-Page Application (SPA) Architecture (Conversational UX/UI, responsive grid layouts)',
        'Vite & Tailwind CSS',
        'Express.js Backend',
        'Streamlit v1.64.0 (State-preserving web interfaces, dynamic decoupled execution rendering pipelines)',
        'Multi-File Application Structuring (models.py, pipeline.py, app.py decoupled framework)',
        'React Component State Management',
        'Form Container Workflows (Atomic st.form container isolation to prevent page-re-renders)',
        'Session State Caching (@st.cache_data configuration & caching controllers)'
      ]
    },
    {
      id: 'cat-security-shielding',
      category: 'Security & Shielding Engineering',
      skills: [
        'Secure Credentials Management',
        'Client-Side Email Obfuscation (Lazy-hydration anti-bot scraping)',
        'Invisible Spam Honeypot Traps',
        'Server-Side Input Sanitisation & SMTP Validation',
        'Email Line-Length Compliance (RFC 5322 specification compliance)'
      ]
    },
    {
      id: 'cat-analytics-monitoring',
      category: 'Analytics & Client Monitoring',
      skills: [
        'Browser API Integration & sessionState Serialisation',
        'Client-Side Dwell-Time Calculation (Scroll tracking, entry/exit logging)',
        'Zero render-latency storage caching (sessionStorage data-telemetry)',
        'Sequential Outbound Click Interception & Target Logging'
      ]
    },
    {
      id: 'cat-tools-devops',
      category: 'Tools, Version Control & Cloud Deployment',
      skills: [
        'Automated Deployment Pipelines',
        'System Reliability & Error Handling',
        'Production Debugging & Log Analysis',
        'Apache Web Server Administration (Rewrite engine config, htaccess redirection rules)',
        'Git & GitHub Version Control (Branching, repository infrastructure, recruiter documentation)',
        'Streamlit Community Cloud',
        'cPanel Hosting and Shared Server Deployments',
        'st.secrets Management',
        'Cloud Environment Variables',
        'CI/CD Basics'
      ]
    },
    {
      id: 'cat-languages-cultural',
      category: 'Languages & Cultural Competency',
      skills: [
        'English (Native)',
        'Japanese (JLPT Level 4 certified, active intermediate community study)',
        'Cross-Cultural Communications',
        'AWST/JST Synchronised Collaboration'
      ]
    }
  ],
  education: [],
  certifications: [
    {
      id: 'cert-google-ai-spec',
      name: 'Google AI Professional Certificate (Full 8-Course Specialization)',
      issuer: 'Google (via Coursera)',
      date: 'Completed 2024',
      url: 'https://www.coursera.org/professional-certificates/google-ai'
    },
    {
      id: 'cert-google-ai-1',
      name: 'Google AI: AI Fundamentals',
      issuer: 'Google',
      date: 'Completed 2024',
      url: 'https://www.coursera.org/professional-certificates/google-ai'
    },
    {
      id: 'cert-google-ai-2',
      name: 'Google AI: AI for Brainstorming and Planning',
      issuer: 'Google',
      date: 'Completed 2024',
      url: 'https://www.coursera.org/professional-certificates/google-ai'
    },
    {
      id: 'cert-google-ai-3',
      name: 'Google AI: AI for Research and Insights',
      issuer: 'Google',
      date: 'Completed 2024',
      url: 'https://www.coursera.org/professional-certificates/google-ai'
    },
    {
      id: 'cert-google-ai-4',
      name: 'Google AI: AI for Writing and Communicating',
      issuer: 'Google',
      date: 'Completed 2024',
      url: 'https://www.coursera.org/professional-certificates/google-ai'
    },
    {
      id: 'cert-google-ai-5',
      name: 'Google AI: AI for Content Creation',
      issuer: 'Google',
      date: 'Completed 2024',
      url: 'https://www.coursera.org/professional-certificates/google-ai'
    },
    {
      id: 'cert-google-ai-6',
      name: 'Google AI: AI for Data Analysis',
      issuer: 'Google',
      date: 'Completed 2024',
      url: 'https://www.coursera.org/professional-certificates/google-ai'
    },
    {
      id: 'cert-google-ai-7',
      name: 'Google AI: AI for App Building',
      issuer: 'Google',
      date: 'Completed 2024',
      url: 'https://www.coursera.org/professional-certificates/google-ai'
    },
    {
      id: 'cert-google-ai-8',
      name: 'Google AI: AI for App Deployment',
      issuer: 'Google',
      date: 'Completed 2024',
      url: 'https://www.coursera.org/professional-certificates/google-ai'
    },
    {
      id: 'cert-jlpt-4',
      name: 'JLPT Level 4 (Japanese Language Proficiency Test)',
      issuer: 'Japan Educational Exchanges and Services (JEES) / The Japan Foundation',
      date: 'Certified (Actively pursuing Intermediate level with community study)'
    }
  ],
  additionalHighlights: [
    'Completed the comprehensive 8-course Google AI Professional Certificate specialization from Google with verified credentials integrated on LinkedIn',
    'JLPT Level 4 certified; actively studying intermediate Japanese with regular conversational community immersion',
    'Open to immediate non-geo-locked remote roles and seeking permanent relocation to Japan (1 month standard transition notice)',
    'Western Australia (AWST) based, operating within 1 hour of Japan Standard Time (JST) for real-time collaboration'
  ],
  debuggingMilestones: [
    'Legacy SDK Version Migration: Diagnosed a 404 service degradation error from deprecated gemini-2.5-flash model; refactored codebase to utilize gemini-3.8-flash and gemini-3.5-flash via modern @google/genai Interactions API.',
    'State Isolation Control: Eliminated recursive Streamlit re-render glitches and IndentationErrors by wrapping execution pipelines in atomic st.form triggers.',
    'Defensive Rate-Limit Throttling: Engineered a frontend Recruiter Simulator Mode toggle, shielding active apps from free-tier 429 quota ceilings (5 RPM / 20 RPD) by falling back gracefully to cached baseline snapshots.',
    'Secure Infrastructure Hardening: Natively isolated sensitive third-party tokens and API keys via st.secrets, eliminating high-severity repository leaks.',
    'Stateful Serialization & Caching Controls: Eliminated framework re-render state collisions and memory mutation bugs inside a live Streamlit cloud environment by configuring rigid @st.cache_data decorators and explicit unique state keys.',
    'Defensive API Architecture (503 Overloads): Created a resilient input framework utilizing a localized data staging tier and try-except pipelines to capture capacity spikes gracefully and route them to user-facing alerts instead of script crashes.',
    'Modular Processing Scalability: Mitigated high-latency loop bugs and Streamlit memory depletion by designing a decoupled 3-file structure (models.py, pipeline.py, app.py) to separate schema definitions and completion pipelines from visual drawing elements.',
    'Lazy-Hydration Email Obfuscation: Shielded contact anchors from regex-based spam bots and automated scrapers by storing email sub-components decoupled in client-side JS variables and hydrating them dynamically on viewport hover/interaction.',
    'Invisible Spam Trap Honeypots: Intercepted automated form-fill bots at the gate by deploying CSS-hidden input honeypot fields, programmatically discarding spam payloads silently at the PHP SMTP mailer level without legitimate user friction.',
    'Render-Safe User Telemetry: Integrated a zero-dependency sessionStorage user journey sequential logger that tracks dwell-times and link clicks directly to browser storage, bypassing React render cycles to maintain 60FPS UI execution.',
    'RFC 5322 PHP Line-Length Compliance: Resolved shared hosting email truncation and spam filter trip flags by engineering a custom PHP line-wrapper sanitiser wrapping raw journey logs tightly at 500 characters.',
    'Apache Routing Fallbacks (.htaccess): Eradicated single-page application reload 404 routing failures on cPanel hosts by writing htaccess rewrite rules that transparently fall back non-physical path requests through the react index.html entry-point.'
  ],
  tasks: []
};

export const JANE_DOE_MASTER_RESUME: MasterResume = {
  id: 'canonical-jane-doe',
  version: 1,
  lastUpdated: new Date().toISOString(),
  contact: {
    fullName: 'Jane Doe',
    headline: 'Senior Product Management Leader | Strategic Growth & AI Transformation',
    email: 'jane.doe.pro@example.com.au',
    phone: '+61 412 345 678',
    location: 'Sydney, NSW, Australia',
    residentialAddress: 'Unit 5, 22 Harbour St, Sydney, NSW, Australia, 2000',
    currentStatus: 'Considering new executive challenges',
    relocationDetails: 'Flexible, open to APAC travel',
    linkedin: 'linkedin.com/in/jane-doe-demo-au',
    github: 'github.com/janedoe-demo-au',
    website: 'janedoe.demo.au',
    websiteList: [
      { url: 'https://janedoe.demo.au', description: 'Personal Website' },
      { url: 'https://linkedin.com/in/jane-doe-demo-au', description: 'LinkedIn' }
    ]
  },
  executiveSummaries: [
    {
      id: 'sum-dummy-1',
      focusTrack: 'Product Leadership',
      text: 'Highly accomplished Product Management Leader based in Sydney, with over 10 years of experience driving global digital transformation initiatives. Proven track record in scaling B2B SaaS platforms from Series B to IPO, with deep expertise in AI-driven product roadmapping, cross-functional team leadership, and P&L accountability. Adept at bridging the gap between sophisticated technical infrastructure and complex business objectives to maximize ROI and market share within APAC and international markets.'
    }
  ],
  experiences: [
    {
      id: 'exp-dummy-1',
      company: 'InnovateX Global',
      role: 'Head of Product',
      location: 'Sydney, Australia',
      startDate: '2021-03',
      endDate: 'Present',
      isCurrent: true,
      bullets: [
        { id: 'b-1', text: 'Lead the engineering and product teams for high-growth SaaS platforms, defining product vision and executing roadmaps for enterprise B2B clients.' },
        { id: 'b-2', text: 'Managed a cross-functional team of 20+ engineers and designers, improving feature delivery speed by 30% through Agile process optimization.' },
        { id: 'b-3', text: 'Drove market strategy for a new B2B product suite, contributing to a 50% year-over-year revenue increase.' }
      ],
      technologies: ['Product Strategy', 'B2B SaaS', 'Team Leadership', 'Market Analysis']
    },
    {
      id: 'exp-dummy-2',
      company: 'Sydney Journalism Co.',
      role: 'Senior Journalist / Communications Manager',
      location: 'Sydney, Australia',
      startDate: '2015-01',
      endDate: '2021-02',
      isCurrent: false,
      bullets: [
        { id: 'b-4', text: 'Researched and authored high-impact investigative reports on technology trends, maintaining a consistent readership of 100k+ monthly.' },
        { id: 'b-5', text: 'Managed stakeholder communications and media relations, securing placements in major national publications.' }
      ],
      technologies: ['Investigative Research', 'Copywriting', 'Media Relations', 'Strategic Communication']
    }
  ],
  projects: [
    {
      id: 'proj-dummy-1',
      name: 'OmniAI Platform Migration',
      role: 'Product Lead',
      period: '2022-01 - 2022-12',
      description: 'Distributed cloud-native data architecture and platform migration.',
      bullets: [
        { id: 'pb-1', text: 'Led the complex migration of 500TB of client data from legacy monolith systems to a distributed, cloud-native architecture.' },
        { id: 'pb-2', text: 'Standardized API documentation and RFC processes across all engineering teams, improving developer velocity by 25%.' }
      ],
      technologies: ['AWS', 'Terraform', 'Kubernetes', 'CI/CD']
    }
  ],
  skillCategories: [
    {
      id: 'cat-dummy-skills',
      category: 'Executive Strategy',
      skills: ['Product Roadmap Development', 'P&L Ownership', 'Corporate Strategy', 'Cross-Functional Team Building']
    },
    {
      id: 'cat-dummy-tech',
      category: 'Technical Proficiency',
      skills: ['Generative AI Application', 'SaaS/B2B Platform Architecture', 'Data Modeling (SQL/NoSQL)', 'Cloud Infrastructure (AWS/GCP)']
    }
  ],
  education: [
    {
      id: 'edu-dummy-1',
      institution: 'University of Sydney',
      degree: 'Master of Business Administration (MBA)',
      fieldOfStudy: 'Strategy & Innovation',
      graduationYear: '2016'
    },
    {
      id: 'edu-dummy-2',
      institution: 'University of New South Wales (UNSW)',
      degree: 'Bachelor of Engineering',
      fieldOfStudy: 'Computer Science',
      graduationYear: '2012'
    }
  ],
  certifications: [
    {
      id: 'cert-dummy-1',
      name: 'JLPT N2 (Japanese Language Proficiency Test)',
      issuer: 'Japan Foundation',
      date: '2023'
    },
    {
      id: 'cert-dummy-2',
      name: 'Certified Product Manager (CPM)',
      issuer: 'AIPMM',
      date: '2020'
    },
    {
      id: 'cert-dummy-3',
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2022'
    }
  ],
  additionalHighlights: ['Keynote Speaker at SaaS Leaders Summit 2024', 'Advisory Board Member for FemTech Founders'],
  debuggingMilestones: [],
  tasks: []
};

// Default export is purely Luke Frohling's genuine truth document
export const INITIAL_SAMPLE_MASTER_RESUME: MasterResume = { ...PURE_USER_MASTER_RESUME, tasks: [] };

