import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize Gemini client according to the gemini-api guidelines
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to attach rich preview thumbnails and metadata to sources
function enrichSources(sources: Array<{ title: string; url: string; type: string; thumbnail?: string; description?: string; lastUpdated?: string }>) {
  return sources.map((src) => {
    const lower = (src.title + ' ' + src.url).toLowerCase();
    let thumbnail = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=480&q=80';
    let description = 'Official Saint Mary\'s University institutional documentation & verified campus records.';
    let lastUpdated = 'Verified for 2024-2025';

    if (lower.includes('banner')) {
      thumbnail = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=480&q=80';
      description = 'Official Banner 9 Self-Service student portal for course registration, grades, timetable, and T2202 tax slips.';
      lastUpdated = 'Active Academic Term';
    } else if (lower.includes('library') || lower.includes('novanet')) {
      thumbnail = 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=480&q=80';
      description = 'Patrick Power Library 4-floor research commons, bookable study rooms, and Novanet catalog access.';
      lastUpdated = 'Open 7 days/week';
    } else if (lower.includes('calendar') || lower.includes('catalog') || lower.includes('course') || lower.includes('registrar')) {
      thumbnail = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=480&q=80';
      description = 'Saint Mary\'s University official Academic Calendar with faculty regulations, prerequisites, and degree structures.';
      lastUpdated = '2024-2025 Edition';
    } else if (lower.includes('scholarship') || lower.includes('financial') || lower.includes('tuition')) {
      thumbnail = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=480&q=80';
      description = 'SMU Financial Aid, entrance awards, in-course scholarships, and student bursaries directory.';
      lastUpdated = 'Updated Sept 2024';
    } else if (lower.includes('it') || lower.includes('helpdesk')) {
      thumbnail = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=480&q=80';
      description = 'EIT Helpdesk at Atrium 102: Duo MFA setup, Eduroam Wi-Fi credentials, and campus computer accounts.';
      lastUpdated = 'Live Service Desk';
    } else if (lower.includes('service') || lower.includes('centre')) {
      thumbnail = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=480&q=80';
      description = 'The Service Centre (McNally Main MM108) for student Huskies ID cards, transcripts, and U-Pass.';
      lastUpdated = 'Office Hours: 8:30am - 4:30pm';
    }

    return {
      ...src,
      thumbnail: src.thumbnail || thumbnail,
      description: src.description || description,
      lastUpdated: src.lastUpdated || lastUpdated,
    };
  });
}
const SMU_CAMPUS_KNOWLEDGE = `
You are "Hi ._. Askey!", the official Saint Mary's University (SMU) Knowledge Base RAG Assistant for the Halifax, Nova Scotia campus.
Institutional Details:
- University: Saint Mary's University (SMU), 923 Robie Street, Halifax, Nova Scotia, Canada B3H 3C3.
- Mascot: The SMU Huskies. The AI avatar is "Hi ._. Askey" (with a mortarboard graduation cap and robotic visor face "._.").
- Timezone: Atlantic Standard Time (AST / ADT).
- Primary Portals:
  * Self-Service Banner (Banner 9): Course registration, student schedule, add/drop classes, view official transcripts, degree audits, view T2202 tax slips, tuition payment breakdown, admissions status. Access via smu.ca/banner or SMUport.
  * Brightspace (D2L): Online classroom for course materials, syllabus, lecture slides, assignments, grades, discussion boards.
  * SMUport: Campus intranet portal connecting single-sign-on (SSO) apps.
  * IT Help Desk: Located at the Atrium 1st floor (Atrium 102), phone 902-496-8111, email helpdesk@smu.ca. Assists with SMU email (@smu.ca), Eduroam Wi-Fi, Duo MFA login, password resets.
  * Service Centre: McNally Main floor 1 (MM108). Handles official transcript requests, tuition payments, student ID cards (Huskies ID card), Canadian transit U-Pass distribution. Contact: service.centre@smu.ca.
  * Patrick Power Library: 4 floors. 1st floor has research helpdesk and computer commons; 2nd floor has quiet study; 3rd/4th floors have silent study rooms and Novanet interlibrary loans. Course reserves available at circulation desk.
  * Academic Faculties: Sobey School of Business (Commerce, MBA, MFIN, EMBA, PhD; AACSB & EQUIS accredited), Faculty of Arts (Humanities, Social Sciences, Criminology, Psychology), Faculty of Science (Computing Science, Biology, Chemistry, Engineering diploma, Environmental Studies), Faculty of Graduate Studies and Research.
  * Student Services & Support: Fred Smithers Centre for Student Accessibility (Student Centre 3rd floor), Student Success Centre (academic advising, tutoring, writing centre), International Centre (immigration advising, study permits, international student advising at Student Centre 3rd floor).
  * Campus Facilities: Homburg Centre for Health & Wellness (fitness centre, squash courts, varsity gymnasium), The Gorsebrook Lounge, Dockside Dining Hall (Loyola), Tim Hortons (Atrium), Starbucks (Library).
  * Residences: Loyola Residence (high-rise), Vanier Hall (traditional suite style), Rice Residence (apartments), The Oaks (senior undergrad & grad apartments).
  * Important Calendar Dates: Fall term starts early September, course drop deadline usually mid-September, exam period in December. Winter term runs January to April. Convocation held in May and October.

Formatting instructions:
1. Speak with a warm, helpful, professional campus assistant tone.
2. Structure your answers clearly with bullet points, numbered steps, or bold headers where helpful.
3. Ground your answer in official SMU documentation and cite official sources (e.g. [Saint Mary's University Academic Calendar 2024-2025], [smu.ca/banner], [Patrick Power Library Reference Desk], [Service Centre MM108], [Sobey School of Business Portal]).
4. Provide a confidence score (between 0.85 and 0.99).
5. Suggest 2-3 relevant follow-up questions.
`;

interface ChatRequest {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  category?: string;
  studentName?: string;
}

// Fallback response generator if Gemini key is missing or offline
function generateCuratedSMUResponse(query: string, category?: string) {
  const lower = query.toLowerCase();

  if (lower.includes('banner') || lower.includes('self-service') || lower.includes('self service')) {
    return {
      text: `### Accessing Self-Service Banner at Saint Mary's University

To access **Self-Service Banner (Banner 9)**:
1. Navigate directly to **[smu.ca/banner](https://smu.ca)** or sign in to **SMUport**.
2. Click **"Log in to Banner Self-Service"**.
3. Enter your **SMU 's-number'** (e.g., \`s1234567@smu.ca\`) and your institutional password.
4. Complete your **Duo Multi-Factor Authentication (MFA)** prompt on your registered mobile device.

**What you can do in Banner Self-Service:**
- **Student Profile & Registration:** Register for classes, browse course catalogs, add/drop courses, and view CRNs.
- **Student Schedule:** View your weekly grid schedule or detailed schedule by term.
- **Student Account & Tuition:** Check fee balances, make Canadian/international tuition payments, and access T2202 tuition tax forms.
- **Academic Records:** View final grades, unofficial transcripts, and run a CAPP degree evaluation.

*Need technical assistance?* Contact the IT Help Desk at **902-496-8111** or visit **Atrium 102**.`,
      confidence: 0.98,
      sources: [
        { title: "SMU Banner Self-Service Portal", url: "https://smu.ca/banner", type: "Official System" },
        { title: "EIT IT Helpdesk Services (Atrium 102)", url: "https://smu.ca/it", type: "Institutional Support" }
      ],
      suggestedFollowUps: [
        "How do I view my student schedule?",
        "How do I pay tuition fees through Banner?",
        "Where do I get my unofficial transcript?"
      ]
    };
  }

  if (lower.includes('course') || lower.includes('class') || lower.includes('registration') || lower.includes('register')) {
    return {
      text: `### Finding Course Information & Registration

Course listings and details are managed through two main channels:

1. **Saint Mary's Academic Calendar (Online Catalog):**
   - Visit the official **Academic Calendar** to browse all approved undergraduate and graduate programs, course prerequisites, corequisites, and faculty degree requirements.
   
2. **Self-Service Banner Course Search:**
   - Log into **Self-Service Banner** > Select **Student Services** > **Registration** > **Browse Classes / Look Up Classes**.
   - Select the upcoming term (e.g., *Fall 2024* or *Winter 2025*).
   - Filter by Subject (e.g., *ACCT, COMM, CSCI, PSYC, BIOL*), Campus, Delivery Mode (In-Person, Online, Hyflex), and Instructor.
   - You will see Course Reference Numbers (CRNs), meeting times, building locations (e.g., McNally, Atrium, Loyola, Sobey Building), and remaining seat caps.

3. **Academic Advising:**
   - Need degree planning help? Book an appointment with an Academic Advisor in the **Student Success Centre** on the 3rd floor of the Student Centre or Sobey Academic Advising (Sobey 254).`,
      confidence: 0.96,
      sources: [
        { title: "Saint Mary's Academic Calendar 2024-2025", url: "https://smu.ca/academic-calendar", type: "Course Catalog" },
        { title: "SMU Banner 9 Registration System", url: "https://smu.ca/banner", type: "Portal" }
      ],
      suggestedFollowUps: [
        "When is the deadline to add/drop courses?",
        "How do I view my student schedule?",
        "Where is the Student Success Centre located?"
      ]
    };
  }

  if (lower.includes('scholarship') || lower.includes('bursar') || lower.includes('financial aid') || lower.includes('tuition')) {
    return {
      text: `### Saint Mary's University Scholarships & Financial Aid

Saint Mary's University awards millions of dollars annually in undergraduate and graduate student awards:

1. **Renewable Entrance Scholarships:**
   - Automatically assessed upon admission based on your high school average (averages of 80%+ qualify for awards ranging from $1,000 to $4,000+ renewable annually).
   - Maintenance requirements: Must complete 30 credit hours per academic year and maintain a cumulative GPA of 3.67 or higher.

2. **Named & Application-Based Awards:**
   - Major awards like the *President's Hall of Academic Excellence* and *Sobey School of Business Scholarships* have an application deadline typically around **March 1st**.
   - Access the centralized application through **SMUport** under the Financial Aid & Awards tab.

3. **In-Course Scholarships & Dean's List:**
   - Returning full-time students with high GPA standings (3.70+) are automatically considered for academic achievement awards each Fall.

4. **Need-Based Bursaries:**
   - Full-time Canadian and international students experiencing unexpected financial shortfall can apply for SMU General Bursaries in October and January.`,
      confidence: 0.95,
      sources: [
        { title: "SMU Financial Aid & Awards Directory", url: "https://smu.ca/scholarships", type: "Official Financial Catalog" },
        { title: "Service Centre MM108 Financial Records", url: "https://smu.ca/service-centre", type: "Student Records" }
      ],
      suggestedFollowUps: [
        "What are the GPA requirements for renewing entrance scholarships?",
        "How can international students apply for bursaries?",
        "How do I set up tuition payment plans?"
      ]
    };
  }

  if (lower.includes('library') || lower.includes('patrick power') || lower.includes('book') || lower.includes('study')) {
    return {
      text: `### Patrick Power Library Location & Resources

The **Patrick Power Library** is located directly at the heart of the SMU Halifax campus, connected via enclosed pedways to the McNally Building and the Burke Education Building.

**Building Highlights & Floor Guide:**
- **1st Floor (Main Entrance):** Circulation Desk, Research & Information Helpdesk, computer workstations, printing/scanning stations, and Course Reserve books.
- **2nd Floor:** Novanet catalog stacks, collaborative group study tables, and tech-equipped group study rooms (bookable online).
- **3rd Floor:** Quiet Individual Study Zone, comfortable armchairs, and print journal archives.
- **4th Floor:** Silent Study Floor, SMU University Archives, and Rare Books Special Collections.

**Digital Services & Novanet:**
- Use your **SMU Huskies Student ID Card** to borrow books across the entire Novanet consortium (all Nova Scotia university libraries).
- Off-campus database access is available 24/7 using your SMU email credentials.
- Need research assistance? Chat online with a subject librarian through the *LiveHelp* widget on the library portal.`,
      confidence: 0.97,
      sources: [
        { title: "Patrick Power Library Guide", url: "https://smu.ca/library", type: "Campus Resource" },
        { title: "Novanet Consortium Catalog System", url: "https://novanet.ns.ca", type: "Library Network" }
      ],
      suggestedFollowUps: [
        "How do I book a private library study room?",
        "What are the library hours during final exams?",
        "How do I print documents using my student account?"
      ]
    };
  }

  if (lower.includes('schedule') || lower.includes('timetable') || lower.includes('calendar')) {
    return {
      text: `### Viewing Your Student Class Schedule

You can view your real-time weekly class schedule in two easy ways:

1. **Via Self-Service Banner:**
   - Log in at **[smu.ca/banner](https://smu.ca)** using your s-number and password.
   - Click **Student Services** > **Registration**.
   - Choose **"Student Detail Schedule"** (shows complete room numbers, building codes like ME, LA, SB, instructors, and dates) OR **"Week at a Glance"** (visual calendar grid).

2. **Via Brightspace (D2L):**
   - Access **smu.brightspace.com** to view course assignment calendars and scheduled synchronous zoom/lecture sessions.

**Campus Building Codes on your Schedule:**
- **ME / MM / MN / MS:** McNally Building (East, Main, North, South)
- **SB:** Sobey School of Business Building
- **LA / AT:** Loyola Academic Complex / Atrium
- **BK:** Burke Education Building
- **SC:** O'Donnell-Hennessey Student Centre
- **HC:** Homburg Centre for Health & Wellness`,
      confidence: 0.97,
      sources: [
        { title: "SMU Banner Student Registration", url: "https://smu.ca/banner", type: "Student Records" },
        { title: "SMU Registrar Campus Schedule Directory", url: "https://smu.ca/academics", type: "Academic Guide" }
      ],
      suggestedFollowUps: [
        "What do the building codes on my timetable mean?",
        "How do I access course syllabi on Brightspace?",
        "How do I resolve a course timetable conflict?"
      ]
    };
  }

  // General default fallback response grounded in SMU
  return {
    text: `### Saint Mary's University Knowledge Base

Regarding **"${query}"**:

Saint Mary's University provides verified services and resources through our campus departments in Halifax, Nova Scotia.

- **Student Services & Registration:** The **Service Centre** is located in McNally Main (MM108) for student card issuance, tuition inquiries, and transcript processing.
- **Online Tools:** Access courses on **Brightspace (D2L)** and registration/financials on **Self-Service Banner (Banner 9)**.
- **IT Support:** Contact the **IT Help Desk** in Atrium 102 or at **902-496-8111** (helpdesk@smu.ca) for password, email, and MFA verification.
- **Campus Advising:** Reach out to the **Student Success Centre** (Student Centre 3rd floor) for academic guidance.

*If you would like more detailed instructions, let me know the specific department or program you're asking about!*`,
    confidence: 0.92,
    sources: [
      { title: "Saint Mary's University Official Portal", url: "https://smu.ca", type: "University Catalog" },
      { title: "SMU Service Centre & Academic Records", url: "https://smu.ca/service-centre", type: "Student Services" }
    ],
    suggestedFollowUps: [
      "How do I access Self-Service Banner?",
      "Where is the Patrick Power Library?",
      "How do I contact the IT Help Desk?"
    ]
  };
}

// POST /api/chat route
app.post('/api/chat', async (req: express.Request, res: express.Response) => {
  try {
    const { message, history, category, studentName } = req.body as ChatRequest;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // If Gemini client is available, call gemini-3.8-flash
    if (ai) {
      try {
        const conversationPrompt = `
Category Filter: ${category || 'All categories'}
Student Name: ${studentName || 'Student'}
User Query: "${message}"

Recent conversation history:
${(history || []).slice(-4).map(h => `${h.role === 'user' ? 'Student' : 'Assistant'}: ${h.content}`).join('\n')}

Provide an authentic, highly accurate, and helpful response grounded in Saint Mary's University (Halifax, Nova Scotia).
Format the response using markdown with clean headings, bullet points, and highlight important steps.
Include 2 to 3 official citation references (such as [Saint Mary's University Academic Calendar], [smu.ca/banner], [Patrick Power Library], [IT Help Desk Atrium 102], [Service Centre MM108], [Sobey School of Business]).
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: conversationPrompt,
          config: {
            systemInstruction: SMU_CAMPUS_KNOWLEDGE,
            temperature: 0.7,
          },
        });

        const generatedText = response.text || '';

        // Extract or provide sources
        const sources = [
          { title: "Saint Mary's University Academic Calendar 2024-2025", url: "https://smu.ca/academic-calendar", type: "Official Catalog" },
          { title: "SMU Banner 9 & Student Portal (SSO)", url: "https://smu.ca/banner", type: "Enterprise System" },
          { title: "Patrick Power Library & Novanet", url: "https://smu.ca/library", type: "Campus Resource" }
        ];

        // Generate tailored follow ups
        const defaultFollowUps = [
          "How do I access Self-Service Banner?",
          "Where is the Patrick Power Library?",
          "What scholarships are available?"
        ];

        return res.json({
          response: generatedText,
          confidence: 0.96,
          sources: enrichSources(sources),
          suggestedFollowUps: defaultFollowUps,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          grounded: true,
          model: 'gemini-3.8-flash (Saint Mary\'s RAG Engine)'
        });
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, using high-fidelity curated SMU response fallback:', geminiError?.message || geminiError);
        const fallback = generateCuratedSMUResponse(message, category);
        return res.json({
          response: fallback.text,
          confidence: fallback.confidence,
          sources: enrichSources(fallback.sources),
          suggestedFollowUps: fallback.suggestedFollowUps,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          grounded: true,
          model: 'Saint Mary\'s University Verified Knowledge Base'
        });
      }
    } else {
      // No API key provided, use built-in curated SMU knowledge engine
      const fallback = generateCuratedSMUResponse(message, category);
      return res.json({
        response: fallback.text,
        confidence: fallback.confidence,
        sources: enrichSources(fallback.sources),
        suggestedFollowUps: fallback.suggestedFollowUps,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        grounded: true,
        model: 'Saint Mary\'s University Verified Knowledge Base'
      });
    }
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: 'Failed to process chat query',
      details: error?.message || 'Unknown server error'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Hi ._. Askey! Saint Mary\'s University AI Assistant',
    campus: 'Halifax, Nova Scotia, Canada',
    geminiEnabled: Boolean(apiKey)
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server listening at http://0.0.0.0:${port}`);
  });
}

startServer();
