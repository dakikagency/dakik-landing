flowchart TB

%% ─────────────────────────────────────────────────────────────────────────────
%% ENTRY
%% ─────────────────────────────────────────────────────────────────────────────
subgraph ENTRY["🚪 Entry Points"]
  Direct["Direct URL"]
  Search["Search/SEO"]
  Social["Social Links"]
  Referral["Referral"]
end

%% ─────────────────────────────────────────────────────────────────────────────
%% PUBLIC SITE (Marketing + Resources + Blog + Survey)
%% ─────────────────────────────────────────────────────────────────────────────
subgraph PUBLIC["🌐 Public Website"]
  direction TB

  subgraph LANDING["📄 Landing Page (/)"]
    direction TB

    NavbarPublic["🧭 Sticky Landing Navbar<br/>━━━━━━━━━━━━<br/>• Section-aware styling (light/dark sections)<br/>• Links: daIcons | daComps | Blog<br/>• CTA: Start a Project →<br/>• Customer Login"]
    Hero["Hero Section<br/>━━━━━━━━━━━━<br/>Headline + Proof<br/>• Rating badge<br/>• Clients count<br/>• Logo carousel<br/>Offerings:<br/>• AI Automations<br/>• Brand Identity<br/>• Custom Web/Mobile Dev"]
    Work["Work Section<br/>━━━━━━━━━━━━<br/>Portfolio Highlights"]
    Services["Services Section<br/>━━━━━━━━━━━━<br/>3 Core Offerings"]
    FAQ["FAQ Section<br/>━━━━━━━━━━━━<br/>Accordion items"]
    Footer["Footer<br/>━━━━━━━━━━━━<br/>CTA: LET'S TALK<br/>Links + Contact"]

    NavbarPublic --> Hero --> Work --> Services --> FAQ --> Footer
  end

  subgraph SERVICES_DETAIL["💼 Service Tiers (section or /services)"]
    direction TB
    Sprint["🚀 Sprint<br/>━━━━━━━━━━━━<br/>Idea → Product<br/>Timeline: 4–6 weeks"]
    Overhaul["🔧 Overhaul<br/>━━━━━━━━━━━━<br/>Legacy → Modern<br/>Timeline: Ongoing"]
    Growth["📈 Growth<br/>━━━━━━━━━━━━<br/>Traffic → Revenue<br/>Timeline: 2–4 weeks"]
  end

  subgraph RESOURCES["📚 Resource Pages"]
    direction TB
    daIcons["/daicons<br/>━━━━━━━━━━━━<br/>Phosphor-based Library<br/>• Search & Filter<br/>• Styles: Stroke/Filled/Duotone/Color (as supported)<br/>• Copy SVG / Download<br/>• Categories<br/>• Custom icons (admin-managed)"]
    daComps["/dacomps<br/>━━━━━━━━━━━━<br/>Component Library (DB-driven)<br/>• Live previews<br/>• Props docs<br/>• Import snippets<br/>Categories: Forms | Data Display | Disclosure"]
  end

  subgraph BLOG["📝 Blog (DB-backed)"]
    direction TB
    BlogList["/blog<br/>━━━━━━━━━━━━<br/>Post listing (from DB)<br/>Tags + search/filter (optional)"]
    BlogPost["/blog/[slug]<br/>━━━━━━━━━━━━<br/>Markdown-rendered post<br/>Cover image + inline images (Cloudinary)"]
  end

  subgraph FUNNEL["🎯 Survey + Booking Funnel (/survey)"]
    direction TB

    Step1["Step 1: Project Type<br/>━━━━━━━━━━━━<br/>• AI Automation<br/>• Brand Identity<br/>• Web/Mobile Development<br/>• Full Product Build"]
    Step2["Step 2: Budget<br/>━━━━━━━━━━━━<br/>Band selection"]
    Step3["Step 3: Contact<br/>━━━━━━━━━━━━<br/>• Name (required)<br/>• Email (required, unique)"]
    Step4["Step 4: Details<br/>━━━━━━━━━━━━<br/>Project description (optional)"]

    DupEmail["⚠️ Duplicate Email Screen<br/>━━━━━━━━━━━━<br/>“Looks like you’re already with us.<br/>Sign in maybe?”<br/>CTA: Customer Login"]
    Avail["🗓️ Pick a Meeting Time<br/>━━━━━━━━━━━━<br/>Calendly-like slot picker<br/>• 30-min survey meeting<br/>• Availability from single admin calendar<br/>• Working hours per weekday<br/>• Survey-based slot blocking"]
    Success["✅ Confirmation Screen<br/>━━━━━━━━━━━━<br/>Shows:<br/>• Scheduled date/time<br/>• Google Meet link<br/>CTA: Sign in / Next steps"]

    Step1 --> Step2 --> Step3 --> Step4
    Step4 -->|"Validate email"| EmailCheck{"Email already exists?"}
    EmailCheck -->|"Yes"| DupEmail
    EmailCheck -->|"No"| Avail
    DupEmail -->|"Login"| LoginRoute["/login (Google OAuth)"]
    Avail -->|"Book selected slot"| BookAPI["POST /api/meetings/book"]
    BookAPI --> Success
  end
end

%% ─────────────────────────────────────────────────────────────────────────────
%% AUTH (Google OAuth) + PORTAL + ADMIN (shadcn, sidebars)
%% ─────────────────────────────────────────────────────────────────────────────
subgraph AUTH["🔐 Authentication + App Shells"]
  direction TB

  LoginRoute2["/login<br/>━━━━━━━━━━━━<br/>Google OAuth sign-in"]
  RoleGate{"Role check"}
  Portal["👤 Customer Portal (/portal)<br/>━━━━━━━━━━━━<br/>shadcn layout + sidebar<br/>Shows:<br/>• Contracts<br/>• Projects + progress<br/>• Q&A captured during process<br/>• Meetings + links"]
  Admin["🛠️ Admin Panel (/admin)<br/>━━━━━━━━━━━━<br/>shadcn layout + sidebar<br/>Manage:<br/>• Customers + projects<br/>• Progress updates<br/>• Surveys/leads<br/>• Meetings (30/60 min)<br/>• Contracts + media<br/>• Send emails (Gmail API)<br/>• daComps entries<br/>• daIcons entries<br/>• Blog (markdown + image uploader)"]

  LoginRoute2 --> RoleGate
  RoleGate -->|"customer"| Portal
  RoleGate -->|"admin"| Admin
end

%% ─────────────────────────────────────────────────────────────────────────────
%% BACKEND + INTEGRATIONS
%% ─────────────────────────────────────────────────────────────────────────────
subgraph BACKEND["⚙️ Backend + Integrations"]
  direction TB

  subgraph API["🧩 API Surface"]
    direction TB
    LeadsAPI["POST /api/survey/submit<br/>━━━━━━━━━━━━<br/>Zod validation<br/>Reject duplicates (email unique)"]
    AvailAPI["GET /api/availability<br/>━━━━━━━━━━━━<br/>Compute available slots<br/>Working hours + Google busy + internal blocks"]
    BookMeetingAPI["POST /api/meetings/book<br/>━━━━━━━━━━━━<br/>Atomic booking + re-check availability<br/>Create Google Calendar event + Meet link<br/>Persist meeting record"]
    AdminMeetingsAPI["POST /api/admin/meetings<br/>━━━━━━━━━━━━<br/>Schedule 30/60 min meetings"]
    AdminEmailAPI["POST /api/admin/email<br/>━━━━━━━━━━━━<br/>Send via Gmail API + log"]
    UploadSignAPI["POST /api/uploads/sign<br/>━━━━━━━━━━━━<br/>Signed Cloudinary params (client uploads)"]
    BlogReadAPI["GET /api/blog + /api/blog/[slug]<br/>━━━━━━━━━━━━<br/>Public read endpoints"]
    BlogAdminAPI["/api/admin/blog (CRUD)<br/>━━━━━━━━━━━━<br/>Authenticated admin CRUD"]
    BlogIntegrationAPI["/api/integrations/blog (CRUD)<br/>━━━━━━━━━━━━<br/>Public endpoint<br/>API-key protected<br/>Full CRUD"]
  end

  subgraph DATA["🗄️ Data Stores"]
    direction TB
    DB[("PostgreSQL<br/>━━━━━━━━━━━━<br/>Core Models:<br/>• Lead (email unique)<br/>• Meeting (eventId, meetUrl)<br/>• WorkingHours (per weekday)<br/>• AvailabilityBlock / Rules<br/>• User (googleSub, role)<br/>• Customer, Project, Contract, Q&A<br/>• BlogPost (markdown), Tag<br/>• ComponentDoc, Icon (custom)<br/>• Asset (Cloudinary)<br/>• EmailLog")]
  end

  subgraph EXT["🔌 External Services"]
    direction TB
    GCal["Google Calendar (single admin calendar)<br/>━━━━━━━━━━━━<br/>FreeBusy + Create Event<br/>ConferenceData: Google Meet"]
    Gmail["Gmail API<br/>━━━━━━━━━━━━<br/>Transactional + project emails"]
    Cloudinary["Cloudinary<br/>━━━━━━━━━━━━<br/>All media hosting<br/>Client-side uploads (signed)"]
  end

  %% API ↔ DATA
  LeadsAPI --> DB
  AvailAPI --> DB
  BookMeetingAPI --> DB
  AdminMeetingsAPI --> DB
  AdminEmailAPI --> DB
  UploadSignAPI --> DB
  BlogReadAPI --> DB
  BlogAdminAPI --> DB
  BlogIntegrationAPI --> DB

  %% API ↔ EXTERNAL
  AvailAPI --> GCal
  BookMeetingAPI --> GCal
  AdminMeetingsAPI --> GCal
  AdminEmailAPI --> Gmail
  UploadSignAPI --> Cloudinary
  BlogAdminAPI --> Cloudinary
end

%% ─────────────────────────────────────────────────────────────────────────────
%% FLOW CONNECTIONS (PUBLIC NAV + CTAs)
%% ─────────────────────────────────────────────────────────────────────────────
ENTRY --> LANDING

Services --> SERVICES_DETAIL

NavbarPublic --> daIcons
NavbarPublic --> daComps
NavbarPublic --> BlogList
NavbarPublic -->|"Customer Login"| LoginRoute2

Hero -->|"Start a Project"| FUNNEL
Footer -->|"Let's Talk"| FUNNEL

BlogList --> BlogPost

BlogPost -->|"Work with us"| FUNNEL

%% Survey APIs
Step4 -->|"Submit survey"| LeadsAPI
LeadsAPI -->|"If unique"| AvailAPI
LeadsAPI -->|"If duplicate"| DupEmail
AvailAPI -->|"Return slots"| Avail
BookAPI --> BookMeetingAPI

%% Portal/Admin access from public pages
daIcons -->|"Login"| LoginRoute2
daComps -->|"Login"| LoginRoute2
BlogList -->|"Login"| LoginRoute2

%% ─────────────────────────────────────────────────────────────────────────────
%% STYLING
%% ─────────────────────────────────────────────────────────────────────────────
classDef entry fill:#084792,color:#fff,stroke:#000
classDef public fill:#000,color:#fff,stroke:#fff
classDef funnel fill:#d2141c,color:#fff,stroke:#000
classDef backend fill:#333,color:#fff,stroke:#fff
classDef resource fill:#fff,color:#000,stroke:#000
classDef blog fill:#084792,color:#fff,stroke:#000
classDef auth fill:#666,color:#fff,stroke:#000
classDef service fill:#000,color:#fff,stroke:#d2141c,stroke-width:2px
classDef external fill:#1f6f3b,color:#fff,stroke:#000

class Direct,Search,Social,Referral entry

class NavbarPublic,Hero,Work,Services,FAQ,Footer public
class Step1,Step2,Step3,Step4,Avail,Success,DupEmail funnel
class Sprint,Overhaul,Growth service
class daIcons,daComps resource
class BlogList,BlogPost blog
class LoginRoute,LoginRoute2,Portal,Admin,RoleGate auth

class LeadsAPI,AvailAPI,BookMeetingAPI,AdminMeetingsAPI,AdminEmailAPI,UploadSignAPI,BlogReadAPI,BlogAdminAPI,BlogIntegrationAPI,DB backend
class GCal,Gmail,Cloudinary external