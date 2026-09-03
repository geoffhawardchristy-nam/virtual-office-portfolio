/* ==========================================================================
   VIRTUAL OFFICE PORTFOLIO
   ---------------------------------------------------------------------------
   Single-file build. Sections below mirror the requested architecture:

     data/      -> DATA           (edit this block only, to change content)
     scene/     -> Lighting, OfficeScene, CameraController
     components/-> makeDesk, makeChair, makeNPC, makeMeetingRoom, ...
     App        -> boot(), animate()
   ========================================================================== */

/* ==========================================================================
   1 · DATA  —  everything you'll ever want to edit lives here.
   Anything wrapped in {{ }} is a placeholder waiting for your real value.
   ========================================================================== */
const DATA = {

  owner: {
    name: "GeoffHaward Christy",
    role: "Frontend Developer",
    location: "Gandhinagar / Ahmedabad, Gujarat, India",
    years: "3 yrs 5 mos",
    summary:
      "I build the parts of enterprise software people actually touch all day — HR service portals, project management systems, dashboards and mobile apps. Mostly React and Angular on the front, Java Spring Boot REST APIs on the other side of the fence, which means I can debug a broken payload instead of just reporting it.",
    pitch: [
      "3 yrs 5 mos shipping production frontends across two product companies.",
      "Comfortable across React, Angular, React Native, Next.js and Shopify Liquid.",
      "Have built and consumed REST APIs in Java Spring Boot — not just integrated them.",
      "Role-based access control, dashboards and Chrome Extensions in live products."
    ],
    resumeUrl: "{{link-to-your-resume.pdf}}"
  },

  contact: {
    email: "{{your.email@example.com}}",
    phone: "{{+91 XXXXX XXXXX}}",
    linkedin: "{{linkedin.com/in/your-handle}}",
    github: "{{github.com/your-handle}}",
    note: "Open to frontend roles and freelance builds. Fastest reply is by email."
  },

  /* ---------- WORKSTATIONS -> projects. Order matches the desks on the floor. */
  projects: [
    {
      id: "ws01", station: "Workstation 01",
      name: "HR Service Center (HRSC)",
      company: "Logieagle Private Limited",
      role: "Frontend Developer",
      duration: "2024 – 2025",
      screen: "dashboard",
      tech: ["React", "Redux Toolkit", "REST APIs", "Java Spring Boot", "RBAC", "SCSS"],
      description:
        "An internal HR service platform where employees raise requests — leave, documents, payroll queries — and HR routes, approves and closes them. Hundreds of daily tickets moving through a workflow that different roles see very differently.",
      responsibilities: [
        "Built the request lifecycle UI end to end: create, assign, escalate, resolve",
        "Implemented role-based access control across routes, views and individual actions",
        "Normalised API responses into a predictable Redux store shape",
        "Handled loading, empty, error and permission-denied states as first-class screens",
        "Worked directly with the backend team on payload contracts"
      ],
      features: [
        "Multi-role dashboards (employee / HR / manager) off one codebase",
        "Approval chains with status history",
        "Document upload and preview",
        "Filterable, paginated ticket tables"
      ],
      apis: ["Spring Boot REST endpoints", "JWT auth + refresh", "File upload / download", "Role & permission APIs"],
      challenge:
        "Permissions were sprawling. Role checks were being repeated inside components, so a single rule change meant hunting through the whole app.",
      solution:
        "Moved to a single permission map plus a guard wrapper, so a component asks 'can this user do X?' in one line and routes, buttons and menu items all read from the same source of truth.",
      impact: "One rule change now touches one file instead of a dozen components, and permission bugs largely stopped reaching QA."
    },
    {
      id: "ws02", station: "Workstation 02",
      name: "Task Management Mobile App",
      company: "Logieagle Private Limited",
      role: "Mobile Developer (React Native)",
      duration: "2024 – 2025",
      screen: "mobile",
      tech: ["React Native", "Redux Toolkit", "Firebase", "Notifee", "REST APIs"],
      description:
        "A cross-platform task app for teams already living inside the web product — assign work, track progress, get nudged when something is due.",
      responsibilities: [
        "Developed the mobile UI across both platforms",
        "Integrated REST APIs and handled offline / retry behaviour",
        "Implemented state management with Redux Toolkit",
        "Added push notifications with Firebase and Notifee",
        "Profiled and fixed list performance issues",
        "Coordinated payload shape with backend developers"
      ],
      features: ["Task assignment and status flow", "Local + push reminders", "Deep links into a task", "Offline-tolerant list views"],
      apis: ["Firebase Cloud Messaging", "Notifee local notifications", "Task & user REST APIs"],
      challenge: "Long task lists stuttered on mid-range Android devices once a few hundred items loaded.",
      solution: "Switched to windowed lists with stable keys, memoised row components, and moved date formatting out of render into selectors.",
      impact: "Scrolling went from visibly janky to smooth on the cheap test devices, which is where most users actually were."
    },
    {
      id: "ws03", station: "Workstation 03",
      name: "Analytics Dashboard",
      company: "Logieagle Private Limited",
      role: "Frontend Developer",
      duration: "2024 – 2025",
      screen: "charts",
      tech: ["React", "Redux", "Chart libraries", "REST APIs", "CSS Grid"],
      description:
        "The reporting surface on top of the operational data — the screen management opens first thing in the morning to see whether yesterday went well.",
      responsibilities: [
        "Built reusable chart and KPI card components",
        "Implemented date-range, team and status filters that compose together",
        "Wired export-to-CSV for every table view",
        "Kept the layout readable from a 13\" laptop up to a wall-mounted display"
      ],
      features: ["Cross-filtering widgets", "Drill-down from summary into raw rows", "Saved filter presets", "Responsive grid layout"],
      apis: ["Aggregation endpoints", "Paginated detail endpoints", "Export service"],
      challenge: "Every filter change refetched every widget, so the dashboard flickered and hammered the API.",
      solution: "Batched filter state into one debounced request cycle and cached responses by filter signature, so untouched widgets stopped refetching.",
      impact: "Far fewer network calls per interaction and a dashboard that stopped flashing white between updates."
    },
    {
      id: "ws04", station: "Workstation 04",
      name: "Project Management System (PMS)",
      company: "Evision IT Solution Pvt. Ltd.",
      role: "Frontend Developer",
      duration: "2022 – 2024",
      screen: "kanban",
      tech: ["Angular", "TypeScript", "RxJS", "Reactive Forms", "Java Spring Boot", "RBAC"],
      description:
        "Projects, sprints, timesheets and approvals for delivery teams — the system the company ran its own work on.",
      responsibilities: [
        "Built lazy-loaded feature modules for projects, tasks and timesheets",
        "Wrote complex Reactive Forms with cross-field validation",
        "Centralised HTTP error handling in interceptors",
        "Implemented role-based menus and route guards",
        "Contributed to Spring Boot REST endpoints where the frontend needed a better-shaped response"
      ],
      features: ["Sprint board with drag-and-drop", "Timesheet entry with approval flow", "Project health summaries", "Audit history per record"],
      apis: ["Spring Boot REST", "Auth interceptor + guards", "Timesheet & approval services"],
      challenge: "The initial bundle carried the whole application, so first load was slow for users who only ever opened one module.",
      solution: "Split features into lazy-loaded routes and moved shared UI into a single shared module, so each area downloads only when it is opened.",
      impact: "Noticeably faster first paint, and adding a new module stopped making every other page slower."
    },
    {
      id: "ws05", station: "Workstation 05",
      name: "Shopify Storefront Build",
      company: "Evision IT Solution Pvt. Ltd.",
      role: "Frontend Developer",
      duration: "2022 – 2024",
      screen: "shop",
      tech: ["Shopify", "Liquid", "JavaScript", "HTML", "CSS"],
      description:
        "Custom Shopify theme work: sections merchants could rearrange themselves, without calling a developer for every banner change.",
      responsibilities: [
        "Built custom Liquid sections and schema-driven settings",
        "Implemented product, collection and cart page customisations",
        "Optimised images and above-the-fold loading",
        "Fixed cross-browser and mobile layout issues"
      ],
      features: ["Merchant-editable sections", "Custom cart drawer", "Collection filtering", "Mobile-first product pages"],
      apis: ["Shopify AJAX Cart API", "Storefront metafields"],
      challenge: "Content changes kept coming back as developer tickets.",
      solution: "Exposed the right settings through section schema so copy, ordering and imagery became merchant-editable in the theme editor.",
      impact: "The client stopped needing a developer for routine content updates."
    },
    {
      id: "ws06", station: "Workstation 06",
      name: "Chrome Extension Toolkit",
      company: "Logieagle Private Limited",
      role: "Frontend Developer",
      duration: "2024 – 2025",
      screen: "code",
      tech: ["JavaScript", "Chrome Extension APIs", "React", "Manifest V3"],
      description:
        "A browser extension that pulled the internal tooling into the tab the team was already working in, instead of another window to alt-tab to.",
      responsibilities: [
        "Built the popup and options UI in React",
        "Wrote the content script / background service worker messaging layer",
        "Handled auth token storage and expiry inside extension storage",
        "Shipped through the packaging and review process"
      ],
      features: ["One-click capture from the active tab", "Persistent session across browser restarts", "Keyboard shortcuts", "Sync via chrome.storage"],
      apis: ["chrome.storage", "chrome.tabs", "chrome.runtime messaging", "Internal REST APIs"],
      challenge: "Manifest V3 removed the persistent background page the first design depended on.",
      solution: "Re-architected around an event-driven service worker with state rehydrated from chrome.storage on every wake.",
      impact: "The extension survived the MV3 migration without users noticing a behaviour change."
    }
  ],

  /* ---------- SIDE PROJECT — the laptop in the lounge */
  sideProject: {
    id: "side",
    name: "India Vehicle Comparison Platform",
    company: "Personal project · in progress",
    role: "Solo — product, frontend, backend",
    duration: "2026 –",
    tech: ["Next.js 14", "Node.js + Express", "PostgreSQL", "Tailwind CSS"],
    description:
      "A car comparison site built around one honest question: what mileage does this car actually give, versus the ARAI figure on the brochure? India-first, starting with Maruti, Hyundai, Tata, Honda, Toyota and Mahindra.",
    features: [
      "ARAI claim vs real-world user-reported mileage, side by side",
      "Efficiency split by city, highway and speed band",
      "Engine specs written in plain language",
      "3-year total cost of ownership",
      "\"Looks vs reality\" score and a middle-class buyer verdict"
    ],
    responsibilities: [
      "Own PostgreSQL database for both spec data and user-submitted logs — no dependency on a third-party API staying alive",
      "Data sourced from FuelEconomy.gov, CarQuery, NHTSA, VAHAN and V3Cars",
      "Phase 1 deliberately scoped: cars only, no login, no payments, no app"
    ],
    impact: "Planned monetisation: dealership leads, featured listings and premium reports."
  },

  /* ---------- NPCs -> collaboration stories.
     These are stand-in colleagues, not real named individuals. */
  employees: [
    {
      id: "npc01", name: "Rohit Sharma", designation: "Senior Frontend Developer", department: "Engineering",
      shirt: 0x4A6FA5, seatKey: "ws02",
      projects: ["HR Service Center", "Analytics Dashboard", "Chrome Extension Toolkit"],
      duration: "About 18 months, same pod",
      mine: ["Feature ownership on HRSC modules", "Reusable component library work", "Code review on shared UI"],
      theirs: ["Architecture decisions", "Review standards", "Mentoring on state management patterns"],
      collab: "We split the frontend by feature area and met at the component library. Most of what I know about keeping a large React codebase from turning into spaghetti came out of his code reviews.",
      tech: ["React", "Redux Toolkit", "TypeScript", "SCSS"]
    },
    {
      id: "npc02", name: "Ankit Verma", designation: "Backend Developer", department: "Engineering",
      shirt: 0x3F7D6B, seatKey: "ws01",
      projects: ["HR Service Center", "Project Management System", "Analytics Dashboard"],
      duration: "Roughly 2 years across two products",
      mine: ["Frontend development", "API integration", "Defining the response shapes the UI actually needed"],
      theirs: ["Spring Boot services", "Database design", "Auth and role model"],
      collab: "The closest working relationship on this list. We agreed contracts before either side built anything, argued about pagination more than once, and I picked up enough Spring Boot to fix small endpoints myself instead of filing a ticket.",
      tech: ["Java Spring Boot", "REST", "JWT", "PostgreSQL"]
    },
    {
      id: "npc03", name: "Priya Nair", designation: "UI/UX Designer", department: "Design",
      shirt: 0x8A5CA8, seatKey: "ws03",
      projects: ["Analytics Dashboard", "Task Management Mobile App", "Shopify Storefront"],
      duration: "About 14 months",
      mine: ["Turning Figma into components", "Flagging states the design didn't cover", "Responsive behaviour"],
      theirs: ["Design system", "Interaction design", "Usability calls with clients"],
      collab: "I'd build the happy path, then come back with the list she hadn't seen yet — empty, loading, error, 400-characters-in-a-40-character-field. Those conversations improved both the design system and my eye for detail.",
      tech: ["Figma", "Design tokens", "Responsive layout"]
    },
    {
      id: "npc04", name: "Sneha Patel", designation: "QA Engineer", department: "Quality Assurance",
      shirt: 0xC2703C, seatKey: "board",
      projects: ["HR Service Center", "Project Management System", "Task Management Mobile App"],
      duration: "Across most of both roles",
      mine: ["Fixing what she found", "Reproducing on real devices", "Adding guard rails so a bug class stopped recurring"],
      theirs: ["Test plans", "Regression suites", "Release sign-off"],
      collab: "She tested the way real users behave — double-clicking submit, going back mid-flow, losing network halfway. A lot of my defensive UI habits are just her bug reports, internalised.",
      tech: ["Manual + regression testing", "Android device testing", "Bug tracking"]
    },
    {
      id: "npc05", name: "Manav Desai", designation: "Project Manager", department: "Delivery",
      shirt: 0x5A6270, seatKey: "meeting",
      projects: ["HR Service Center", "Project Management System", "Shopify Storefront"],
      duration: "Full delivery cycles on three products",
      mine: ["Estimates", "Sprint delivery", "Demoing frontend work to clients"],
      theirs: ["Scope and priority", "Client communication", "Release planning"],
      collab: "Daily standups, sprint planning, retros. He's the reason I learned to give an estimate with the risky part named out loud instead of a single optimistic number.",
      tech: ["Agile / Scrum", "Jira", "Sprint planning"]
    }
  ],

  /* ---------- WHITEBOARD -> skills */
  skills: {
    groups: [
      { label: "Core frontend",   hot: true,  years: "3 yrs 5 mos", items: ["React", "Angular", "Next.js", "React Native", "JavaScript (ES6+)", "TypeScript"] },
      { label: "State & data",    hot: false, years: "3 yrs", items: ["Redux", "Redux Toolkit", "RxJS", "REST API integration", "Reactive Forms"] },
      { label: "Styling",         hot: false, years: "3 yrs 5 mos", items: ["Tailwind CSS", "SCSS", "CSS Grid / Flexbox", "Responsive design"] },
      { label: "Backend I touch", hot: false, years: "2 yrs", items: ["Java Spring Boot", "Node.js + Express", "PostgreSQL", "REST design"] },
      { label: "Platform",        hot: false, years: "2 yrs", items: ["Shopify Liquid", "Chrome Extension APIs", "Firebase", "Git"] }
    ],
    workflow: [
      "Read the API contract before writing a component",
      "Build the state machine — loading, empty, error, denied — before the happy path looks pretty",
      "Keep permissions in one map, never scattered across components",
      "Reusable component first, one-off second",
      "Test on the cheapest device anyone will actually use"
    ],
    architecture:
      "The pattern I keep returning to: a thin API layer that normalises every response, a typed store shape that screens read from, and dumb presentational components that receive exactly what they render. It survives a redesign, and it survives a backend changing its mind."
  },

  /* ---------- MEETING ROOM -> experience & teamwork */
  experience: {
    roles: [
      { when: "Mar 2024 – Nov 2025", what: "Frontend Developer", who: "Logieagle Private Limited",
        points: ["HRSC and PMS enterprise modules", "React Native task app", "Analytics dashboard", "Chrome Extension", "RBAC across products"] },
      { when: "May 2022 – Mar 2024", what: "Frontend Developer", who: "Evision IT Solution Pvt. Ltd.",
        points: ["Angular project management system", "Shopify theme development", "Reactive Forms and RxJS-heavy modules", "First exposure to Spring Boot APIs"] }
    ],
    teamwork: [
      "Agile / Scrum: daily standups, sprint planning, retrospectives",
      "Estimation and sprint commitments with a PM",
      "Demoing frontend work directly to clients",
      "Cross-team API contract discussions before build starts",
      "Code review, both directions"
    ],
    clients: "Enterprise HR and delivery teams, plus e-commerce merchants on the Shopify side."
  },

  /* ---------- BOOKSHELF -> education */
  education: {
    degree: "B.E. Computer Engineering",
    school: "LDRP Institute of Technology and Research",
    year: "2022",
    score: "8.0 CGPA",
    extra: [
      "Graduated 2022, working full time from May of the same year",
      "Kept learning on the job: Angular first, React after, React Native and Next.js since",
      "Currently building a full-stack side project to keep the backend muscles honest"
    ]
  },

  /* ---------- COFFEE MACHINE -> easter egg */
  coffee: [
    "Cup 1. Standard operating fuel.",
    "Cup 2. The bug is reproducible now.",
    "Cup 3. You've started refactoring something that worked fine.",
    "Cup 4. Bold. Console.log-driven development begins.",
    "Cup 5. It works. Nobody knows why. Ship it.",
    "Cup 6. Please go home. The office is closing."
  ]
};

/* ==========================================================================
   1b · DOORS  —  one door per chapter of the career.
   Tier is earned by what's behind it, not decoration.
   ========================================================================== */
const DOORS = [
  {
    id: 'evision2', tier: 'silver', tierLabel: 'Silver',
    company: 'Evision IT Solution 207', marker: 'Evision 207',
    role: 'Frontend Developer',
    when: 'Set this in the editor', span: '',
    headline: 'The floor Evision moved into',
    blurb: 'Same team, same job — Evision took a new office and we moved in. Dates and the rest of this copy are still placeholders; open the content editor to set them.',
    stack: ['Angular', 'TypeScript', 'RxJS', 'Reactive Forms', 'Shopify Liquid', 'Java Spring Boot'],
    learned: [
      'Placeholder — replace in the content editor'
    ]
  },
  {
    id: 'evision', tier: 'silver', tierLabel: 'Silver',
    company: 'Evision IT Solution 203 & 204', marker: 'Evision 203 204',
    role: 'Frontend Developer',
    when: 'May 2022 – Mar 2024', span: '1 yr 11 mos',
    headline: 'Where I learned to ship',
    blurb: 'Straight out of LDRP into a delivery team. Angular, Reactive Forms, RxJS, and a Shopify theme practice on the side. This is the floor where I stopped writing code that only worked on my machine.',
    stack: ['Angular', 'TypeScript', 'RxJS', 'Reactive Forms', 'Shopify Liquid', 'Java Spring Boot'],
    learned: [
      'Lazy-loaded feature modules, and why the bundle size is somebody\'s first impression',
      'Centralised HTTP error handling instead of a try/catch in every component',
      'Reading a Spring Boot endpoint before complaining about its payload',
      'Talking to a client without a PM translating for me'
    ]
  },
  {
    id: 'logieagle', tier: 'gold', tierLabel: 'Gold',
    company: 'Logieagle Private Limited',
    role: 'Frontend Developer',
    when: 'Mar 2024 – Nov 2025', span: '1 yr 9 mos',
    headline: 'Where the work got serious',
    blurb: 'Enterprise HR and project systems with real permission models, a React Native app, an analytics dashboard and a Chrome Extension. Four products, one frontend, three teammates I still think about when I write code.',
    stack: ['React', 'Redux Toolkit', 'React Native', 'RBAC', 'Firebase', 'Chrome Extension APIs'],
    learned: [
      'Role-based access control belongs in one map, never scattered across components',
      'Performance work is measured on the cheapest device anyone actually owns',
      'A component library is a negotiation with a designer, not a folder',
      'Manifest V3 will delete your architecture and not apologise'
    ]
  }
/* ===== PLATINUM + DIAMOND — parked for now =================================
   Uncomment this block (and the matching LAYOUTS + nav buttons below) to bring
   both doors back. Door positions in the lobby recalculate automatically.
  {
    id: 'independent', tier: 'platinum', tierLabel: 'Platinum',
    company: 'Independent',
    role: 'Building my own things',
    when: 'Nov 2025 – present', span: 'ongoing',
    headline: 'Where nobody hands me the spec',
    blurb: 'A full-stack side project, freelance work, and the uncomfortable discovery that scoping your own product is harder than building it. Next.js, my own Postgres, my own bad decisions.',
    stack: ['Next.js 14', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS'],
    learned: [
      'Owning the database beats depending on somebody else\'s API staying alive',
      'Phase 1 means cutting the features you\'re most excited about',
      'A product needs a verdict, not just data',
      'Backend skills stop being theoretical the moment nobody else has them'
    ]
  },
  {
    id: 'vacant', tier: 'diamond', tierLabel: 'Diamond',
    company: 'Vacant',
    role: 'Reserved for the next team',
    when: 'Available now', span: 'open',
    headline: 'The one you can fill',
    blurb: 'Empty desk, working monitor, nothing on the walls yet. This is the room where whatever I build next goes — and it stays empty until somebody hires me to furnish it.',
    stack: ['React', 'Next.js', 'TypeScript', 'React Native', 'Node.js'],
    learned: [
      'Frontend roles where the UI is the product, not a wrapper',
      'Teams that write down API contracts before building either side',
      'Somewhere I can keep one foot in the backend',
      'Remote, hybrid or Ahmedabad / Gandhinagar'
    ]
  }
   ========================================================================= */
];

/* What I'm looking for — shown on the empty desk behind the Diamond door */
const VACANCY = {
  title: 'The empty desk',
  intro: 'This desk is set up and waiting. Here\'s what would fill it.',
  looking: [
    'Frontend Developer — React, Next.js or Angular, product-owned UI',
    'Teams that treat state, permissions and error handling as design work',
    'Room to touch the backend when the payload is the problem',
    'Ahmedabad / Gandhinagar, remote, or hybrid'
  ],
  bring: [
    '3 yrs 5 mos of production frontend across two product companies',
    'Enterprise RBAC, dashboards, mobile and Chrome Extension experience',
    'Java Spring Boot and Node.js — I can meet the API halfway',
    'A side project I run end to end, database included'
  ]
};
