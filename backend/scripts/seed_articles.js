const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Article = require("../src/models/Article");

const initialArticles = [
  {
    slug: "iocl-engineer-officer-admit-card-2026",
    title:
      "IOCL Admit Card 2026 Out, Direct Download Link for Engineer & Officer Posts Active at iocl.com",
    shortTitle: "IOCL Engineer & Officer Admit Card 2026 Released",
    seoTitle:
      "IOCL Admit Card 2026 Out: Direct Download Link for Engineer & Officer Posts",
    metaDescription:
      "IOCL Admit Card 2026 has been released on 17th September 2026 for 470 Executive Engineer & Officer vacancies. Download IOCL hall ticket, check exam date (24 September 2026), shift timings, exam pattern, and guidelines.",
    category: "Admit Card",
    categorySlug: "admit-card",
    status: "Published",
    badge: "🔴 Out Now",
    author: {
      name: "Prayaas Portal Exam Desk",
      role: "Senior Exam Analyst",
      avatar: "/logo.png",
    },
    publishDate: new Date("2026-09-17T10:30:00+05:30"),
    lastUpdated: new Date("2026-09-18T11:00:00+05:30"),
    readingTime: "5 min read",
    advtNumber: "IOCL/CO-HR/RECTT/2026/01",
    organization: "Indian Oil Corporation Limited (IOCL)",
    postName: "Engineer, Officer & Executive Posts",
    totalVacancies: "470 Vacancies",
    examDate: "24th September 2026",
    admitCardReleaseDate: "17th September 2026",
    admitCardLastDate: "24th September 2026",
    officialWebsite: "https://iocl.com",
    directAdmitCardLink:
      "https://ibpsreg.ibps.in/iocljun26/oecla_sep26/login.php?appid=bb744299b15aea20f763a9455e9893b8",
    overview: [
      { label: "Conducting Body", value: "Indian Oil Corporation Limited (IOCL)" },
      { label: "Advt. No.", value: "IOCL/CO-HR/RECTT/2026/01" },
      { label: "Post Names", value: "Engineer, Officer, Law Officer, AQCO & Diploma Executives" },
      { label: "Total Vacancies", value: "470 Posts" },
      { label: "Admit Card Status", value: "Released (Live Now)" },
      { label: "Admit Card Release Date", value: "17 September 2026" },
      { label: "Exam Date", value: "24 September 2026 (Thursday)" },
      { label: "Exam Mode", value: "Computer Based Test (CBT - Online)" },
      { label: "Negative Marking", value: "0.25 Mark (1/4th mark deduction)" },
      {
        label: "Selection Process",
        value: "CBT Exam -> Group Discussion (GD) / Group Task (GT) -> Personal Interview (PI)",
      },
      { label: "Official Portal", value: "iocl.com" },
    ],
    loginCredentialsRequired: [
      "Registration Number / Roll Number (received during online application)",
      "Password / Date of Birth (DD-MM-YYYY)",
      "Security Captcha Verification Code",
    ],
    stepsToDownload: [
      "Visit the official website of Indian Oil Corporation Limited at iocl.com.",
      "Navigate to the 'Careers' or 'Latest Job Openings' section in the navigation menu.",
      "Click on the notification link that reads 'Admit Card for Recruitment of Engineers/Officers/Executives 2026 (Advt No. IOCL/CO-HR/RECTT/2026/01)'.",
      "You will be redirected to the secure IBPS candidate login portal.",
      "Enter your Registration Number/Roll Number and Password/Date of Birth in the designated fields.",
      "Solve the security captcha displayed on screen and click 'Login'.",
      "Your IOCL Hall Ticket 2026 will appear on the screen. Verify your name, roll number, shift timing, and exam centre.",
      "Click on 'Download' and print at least 2 color copies of the admit card for examination day.",
    ],
    detailsOnAdmitCard: [
      "Candidate's Full Name & Photograph",
      "Registration Number & Roll Number",
      "Father's / Guardian's Name",
      "Category & Sub-Category (GEN / OBC / SC / ST / EWS / PwD)",
      "Date of Birth & Gender",
      "Exam Date (24 September 2026)",
      "Reporting Time & Gate Closing Time",
      "Shift Timing & Total Exam Duration",
      "Examination Venue Name & Complete Center Address",
      "Candidate's Signature & Thumb Impression Box",
      "Invigilator's Signature Box",
      "Important Exam Day Instructions & COVID/Safety Protocols",
    ],
    documentsToCarry: [
      "Printed hard copy of IOCL Admit Card 2026 (preferably in color).",
      "One original valid Photo Identity Proof (Aadhaar Card, PAN Card, Voter ID, Passport, or Driving License). Photocopies or mobile screenshots are strictly NOT accepted.",
      "Two recent passport-size color photographs (identical to the one uploaded during online registration).",
      "Transparent ballpoint pen (Blue or Black).",
    ],
    prohibitedItems: [
      "Mobile phones, smartwatches, fitness bands, or pagers.",
      "Calculators, digital diaries, or electronic storage devices.",
      "Bluetooth headsets, earphones, or microphones.",
      "Books, notebooks, paper chits, or unauthorized stationery.",
      "Bags, wallets, purses, or valuable metallic accessories.",
    ],
    examPattern: {
      duration: "150 Minutes (2 Hours 30 Minutes)",
      totalQuestions: 100,
      totalMarks: 100,
      negativeMarking: "0.25 (1/4 mark) deducted for each incorrect answer",
      sections: [
        {
          sectionName: "Section A: General Aptitude",
          topics:
            "Quantitative Aptitude (20 Qs), Logical Reasoning (15 Qs), Verbal English (15 Qs)",
          questions: 50,
          marks: 50,
          duration: "60 Minutes",
        },
        {
          sectionName: "Section B: Domain Knowledge",
          topics: "Core Engineering Discipline / Specialized Subject Knowledge",
          questions: 50,
          marks: 50,
          duration: "90 Minutes",
        },
      ],
    },
    examCities: [
      "Agartala", "Agra", "Ahmedabad", "Amravati", "Amritsar", "Balasore", "Bareilly", "Bathinda",
      "Belagavi", "Bengaluru", "Bhagalpur", "Bhilai", "Bhopal", "Bhubaneswar", "Bikaner", "Bilaspur",
      "Bokaro", "Chennai", "Chhatrapati Sambhaji Nagar", "Coimbatore", "Cuttack", "Dehradun", "Delhi / NCR",
      "Dibrugarh", "Durgapur", "Ernakulam", "Faridabad", "Gaya", "Ghaziabad", "Gorakhpur", "Guntur",
      "Gurugram", "Guwahati", "Gwalior", "Hooghly", "Hyderabad", "Indore", "Jabalpur", "Jaipur",
      "Jammu", "Jamshedpur", "Jhansi", "Jodhpur", "Jorhat", "Kanpur", "Kolkata", "Kota", "Kozhikode",
      "Lucknow", "Madurai", "Mangalore", "Mumbai", "Muzaffarpur", "Nagpur", "Noida", "Patna",
      "Prayagraj", "Pune", "Raipur", "Ranchi", "Surat", "Thiruvananthapuram", "Varanasi", "Visakhapatnam",
    ],
    faqs: [
      {
        question: "Is the IOCL Admit Card 2026 released?",
        answer:
          "Yes, Indian Oil Corporation Limited released the IOCL Admit Card 2026 on 17th September 2026 for the Computer Based Test scheduled on 24th September 2026.",
      },
      {
        question: "Where can I download the IOCL Admit Card 2026?",
        answer:
          "Candidates can download their hall ticket directly from the official IOCL recruitment portal (iocl.com) or via the active IBPS hosting link provided on this page.",
      },
      {
        question: "What login credentials are needed to download the IOCL hall ticket?",
        answer:
          "You will need your Registration Number / Roll Number and your Password or Date of Birth (in DD-MM-YYYY format), along with the visual security captcha.",
      },
      {
        question: "What is the IOCL 2026 CBT Exam Date?",
        answer:
          "The IOCL Executive recruitment online exam is scheduled to be conducted on 24th September 2026 across various examination centers in India.",
      },
      {
        question: "Is there any negative marking in the IOCL CBT Examination?",
        answer:
          "Yes, there is a negative marking of 0.25 marks (1/4th mark) for every incorrect answer. No marks are deducted for unattempted questions.",
      },
      {
        question: "What is the selection process for IOCL Recruitment 2026?",
        answer:
          "The selection procedure comprises a Computer Based Test (CBT), followed by Group Discussion (GD) / Group Task (GT), and a final Personal Interview (PI).",
      },
      {
        question: "Can I enter the exam center if I show the admit card on my mobile phone?",
        answer:
          "No, digital copies or mobile screenshots are strictly forbidden. You must carry a printed physical hard copy of the admit card with an original government photo ID.",
      },
      {
        question: "What should I do if there is a mistake in my IOCL Admit Card?",
        answer:
          "In case of any discrepancy in your name, category, or photo, contact the IOCL Recruitment Helpdesk immediately through the official support email and helpline numbers mentioned on iocl.com before the exam date.",
      },
    ],
    tags: [
      "IOCL Admit Card 2026",
      "IOCL Engineer Hall Ticket",
      "IOCL Exam Date 2026",
      "IOCL Recruitment 2026",
      "iocl.com",
      "PSU Jobs 2026",
      "Govt Exam Updates",
    ],
  },
];

async function seedArticles() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/prayaas_portal";
    console.log("Connecting to MongoDB for seeding articles...");
    await mongoose.connect(mongoUri);

    for (const articleData of initialArticles) {
      const existing = await Article.findOne({ slug: articleData.slug });
      if (existing) {
        console.log(`Article already exists with slug: ${articleData.slug}. Updating...`);
        await Article.findOneAndUpdate({ slug: articleData.slug }, articleData, { new: true });
      } else {
        console.log(`Inserting article with slug: ${articleData.slug}...`);
        await Article.create(articleData);
      }
    }

    console.log("Articles seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding articles:", error);
    process.exit(1);
  }
}

seedArticles();
