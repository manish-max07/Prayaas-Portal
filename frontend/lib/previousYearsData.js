// lib/previousYearsData.js
// Comprehensive Directory of Popular Exams, Categories, Exam Years, and Shift-wise Previous Year Papers

export const EXAM_CATEGORIES = [
  { id: "all", label: "All Exams" },
  { id: "ssc", label: "SSC Exams" },
  { id: "banking", label: "Banking Exams" },
  { id: "teaching", label: "Teaching Exams" },
  { id: "civil-services", label: "Civil Services Exam" },
  { id: "railways", label: "Railways Exams" },
  { id: "engineering", label: "Engineering Recruitment Exams" },
  { id: "defence", label: "Defence & Police Exams" },
];

export const POPULAR_EXAMS = [
  {
    slug: "ssc-cgl",
    name: "SSC CGL",
    fullName: "SSC Combined Graduate Level Examination",
    category: "ssc",
    categoryLabel: "SSC Exams",
    organization: "Staff Selection Commission",
    logoType: "ssc",
    badgeColor: "from-blue-600 to-indigo-700",
    description: "Official shift-wise CBT question papers for SSC CGL Tier 1 and Tier 2 examinations with TCS iON simulation.",
    totalShiftsCount: 78,
    years: ["2024", "2023", "2022", "2021", "2020"],
    conductingBody: "SSC (Govt of India)",
    shiftsByYear: {
      "2024": [
        {
          id: "ssc-cgl-2024-sep09-s1",
          title: "SSC CGL 2024 Tier-1 (09 Sep 2024 Shift-1)",
          tier: "Tier-1",
          date: "09 Sep 2024",
          shift: "Shift 1 (09:00 AM - 10:00 AM)",
          totalQuestions: 100,
          totalDurationMinutes: 60,
          totalMarks: 200,
          negativeMarking: 0.50,
          language: "English / Hindi",
          status: "Available",
          liveExamId: "6aa5798a6d95008aa13f4884"
        },
        {
          id: "ssc-cgl-2024-sep09-s2",
          title: "SSC CGL 2024 Tier-1 (09 Sep 2024 Shift-2)",
          tier: "Tier-1",
          date: "09 Sep 2024",
          shift: "Shift 2 (12:30 PM - 01:30 PM)",
          totalQuestions: 100,
          totalDurationMinutes: 60,
          totalMarks: 200,
          negativeMarking: 0.50,
          language: "English / Hindi",
          status: "Available",
          liveExamId: "6aa8f204f5b4b3603df83380"
        },
        {
          id: "ssc-cgl-2024-sep09-s3",
          title: "SSC CGL 2024 Tier-1 (09 Sep 2024 Shift-3)",
          tier: "Tier-1",
          date: "09 Sep 2024",
          shift: "Shift 3 (04:00 PM - 05:00 PM)",
          totalQuestions: 100,
          totalDurationMinutes: 60,
          totalMarks: 200,
          negativeMarking: 0.50,
          language: "English / Hindi",
          status: "Available",
          liveExamId: "6aa5798a6d95008aa13f4884"
        },
        {
          id: "ssc-cgl-2024-sep10-s1",
          title: "SSC CGL 2024 Tier-1 (10 Sep 2024 Shift-1)",
          tier: "Tier-1",
          date: "10 Sep 2024",
          shift: "Shift 1 (09:00 AM - 10:00 AM)",
          totalQuestions: 100,
          totalDurationMinutes: 60,
          totalMarks: 200,
          negativeMarking: 0.50,
          language: "English / Hindi",
          status: "Available",
          liveExamId: "6aa8f204f5b4b3603df83380"
        },
        {
          id: "ssc-cgl-2024-sep10-s2",
          title: "SSC CGL 2024 Tier-1 (10 Sep 2024 Shift-2)",
          tier: "Tier-1",
          date: "10 Sep 2024",
          shift: "Shift 2 (12:30 PM - 01:30 PM)",
          totalQuestions: 100,
          totalDurationMinutes: 60,
          totalMarks: 200,
          negativeMarking: 0.50,
          language: "English / Hindi",
          status: "Available",
          liveExamId: "6aa5798a6d95008aa13f4884"
        }
      ],
      "2023": [
        {
          id: "ssc-cgl-2023-jul14-s1",
          title: "SSC CGL 2023 Tier-1 (14 Jul 2023 Shift-1)",
          tier: "Tier-1",
          date: "14 Jul 2023",
          shift: "Shift 1",
          totalQuestions: 100,
          totalDurationMinutes: 60,
          totalMarks: 200,
          negativeMarking: 0.50,
          language: "English / Hindi",
          status: "Available",
          liveExamId: "6aa5798a6d95008aa13f4884"
        },
        {
          id: "ssc-cgl-2023-jul14-s2",
          title: "SSC CGL 2023 Tier-1 (14 Jul 2023 Shift-2)",
          tier: "Tier-1",
          date: "14 Jul 2023",
          shift: "Shift 2",
          totalQuestions: 100,
          totalDurationMinutes: 60,
          totalMarks: 200,
          negativeMarking: 0.50,
          language: "English / Hindi",
          status: "Available",
          liveExamId: "6aa8f204f5b4b3603df83380"
        }
      ],
      "2022": [
        {
          id: "ssc-cgl-2022-dec01-s1",
          title: "SSC CGL 2022 Tier-1 (01 Dec 2022 Shift-1)",
          tier: "Tier-1",
          date: "01 Dec 2022",
          shift: "Shift 1",
          totalQuestions: 100,
          totalDurationMinutes: 60,
          totalMarks: 200,
          negativeMarking: 0.50,
          language: "English / Hindi",
          status: "Available",
          liveExamId: "6aa5798a6d95008aa13f4884"
        }
      ]
    }
  },
  {
    slug: "ssc-chsl",
    name: "SSC CHSL",
    fullName: "SSC Combined Higher Secondary Level (10+2) Examination",
    category: "ssc",
    categoryLabel: "SSC Exams",
    organization: "Staff Selection Commission",
    logoType: "ssc",
    badgeColor: "from-blue-600 to-indigo-700",
    description: "Shift-wise real question papers for Lower Division Clerk (LDC), Junior Secretariat Assistant (JSA), and Data Entry Operator (DEO).",
    totalShiftsCount: 64,
    years: ["2024", "2023", "2022", "2021"],
    conductingBody: "SSC (Govt of India)",
    shiftsByYear: {
      "2024": [
        {
          id: "ssc-chsl-2024-jul01-s1",
          title: "SSC CHSL 2024 Tier-1 (01 Jul 2024 Shift-1)",
          tier: "Tier-1",
          date: "01 Jul 2024",
          shift: "Shift 1 (09:00 AM - 10:00 AM)",
          totalQuestions: 100,
          totalDurationMinutes: 60,
          totalMarks: 200,
          negativeMarking: 0.50,
          language: "English / Hindi",
          status: "Available",
          liveExamId: "6aa5798a6d95008aa13f4884"
        },
        {
          id: "ssc-chsl-2024-jul01-s2",
          title: "SSC CHSL 2024 Tier-1 (01 Jul 2024 Shift-2)",
          tier: "Tier-1",
          date: "01 Jul 2024",
          shift: "Shift 2 (12:30 PM - 01:30 PM)",
          totalQuestions: 100,
          totalDurationMinutes: 60,
          totalMarks: 200,
          negativeMarking: 0.50,
          language: "English / Hindi",
          status: "Available",
          liveExamId: "6aa8f204f5b4b3603df83380"
        }
      ],
      "2023": [
        {
          id: "ssc-chsl-2023-aug02-s1",
          title: "SSC CHSL 2023 Tier-1 (02 Aug 2023 Shift-1)",
          tier: "Tier-1",
          date: "02 Aug 2023",
          shift: "Shift 1",
          totalQuestions: 100,
          totalDurationMinutes: 60,
          totalMarks: 200,
          negativeMarking: 0.50,
          language: "English / Hindi",
          status: "Available",
          liveExamId: "6aa5798a6d95008aa13f4884"
        }
      ]
    }
  },
  {
    slug: "ssc-selection-post",
    name: "SSC Selection Post",
    fullName: "SSC Selection Post Phase Examination (Matric, Inter & Grad)",
    category: "ssc",
    categoryLabel: "SSC Exams",
    organization: "Staff Selection Commission",
    logoType: "ssc",
    badgeColor: "from-blue-600 to-indigo-700",
    description: "Previous year question papers for Phase XII, Phase XI, and Phase X across all 3 academic eligibility levels.",
    totalShiftsCount: 42,
    years: ["2024", "2023", "2022"],
    conductingBody: "SSC (Govt of India)",
    shiftsByYear: {
      "2024": [
        {
          id: "ssc-sp-2024-phase12-s1",
          title: "SSC Selection Post Phase XII (20 Jun 2024 Shift-1 Graduate Level)",
          tier: "CBT",
          date: "20 Jun 2024",
          shift: "Shift 1",
          totalQuestions: 100,
          totalDurationMinutes: 60,
          totalMarks: 200,
          negativeMarking: 0.50,
          language: "English / Hindi",
          status: "Available",
          liveExamId: "6aa5798a6d95008aa13f4884"
        }
      ]
    }
  },
  {
    slug: "ssc-gd-constable",
    name: "SSC GD Constable",
    fullName: "SSC Constable (GD) in Central Armed Police Forces (CAPFs), SSF and Rifleman",
    category: "ssc",
    categoryLabel: "SSC Exams",
    organization: "Staff Selection Commission",
    logoType: "ssc",
    badgeColor: "from-blue-600 to-indigo-700",
    description: "Official shift-wise CBT papers for BSF, CISF, CRPF, SSB, ITBP, AR, and SSF constable recruitments.",
    totalShiftsCount: 54,
    years: ["2024", "2023", "2022"],
    conductingBody: "SSC (Govt of India)",
    shiftsByYear: {
      "2024": [
        {
          id: "ssc-gd-2024-feb20-s1",
          title: "SSC GD Constable 2024 (20 Feb 2024 Shift-1)",
          tier: "CBT",
          date: "20 Feb 2024",
          shift: "Shift 1 (09:00 AM - 10:00 AM)",
          totalQuestions: 80,
          totalDurationMinutes: 60,
          totalMarks: 160,
          negativeMarking: 0.25,
          language: "Hindi / English / Regional",
          status: "Available",
          liveExamId: "6aa5798a6d95008aa13f4884"
        }
      ]
    }
  },
  {
    slug: "ssc-mts",
    name: "SSC MTS",
    fullName: "SSC Multi-Tasking (Non-Technical) Staff & Havaldar Examination",
    category: "ssc",
    categoryLabel: "SSC Exams",
    organization: "Staff Selection Commission",
    logoType: "ssc",
    badgeColor: "from-blue-600 to-indigo-700",
    description: "Complete shift-wise papers for Session 1 & Session 2 following the revised examination pattern.",
    totalShiftsCount: 48,
    years: ["2024", "2023", "2022"],
    conductingBody: "SSC (Govt of India)",
    shiftsByYear: {
      "2024": [
        {
          id: "ssc-mts-2024-oct01-s1",
          title: "SSC MTS & Havaldar 2024 (01 Oct 2024 Shift-1)",
          tier: "CBT",
          date: "01 Oct 2024",
          shift: "Shift 1",
          totalQuestions: 90,
          totalDurationMinutes: 90,
          totalMarks: 270,
          negativeMarking: 1.0,
          language: "English / Hindi / Regional",
          status: "Available",
          liveExamId: "6aa5798a6d95008aa13f4884"
        }
      ]
    }
  },
  {
    slug: "ssc-cpo",
    name: "SSC CPO",
    fullName: "Sub-Inspector in Delhi Police and Central Armed Police Forces Examination",
    category: "ssc",
    categoryLabel: "SSC Exams",
    organization: "Staff Selection Commission",
    logoType: "ssc",
    badgeColor: "from-blue-600 to-indigo-700",
    description: "Official shift papers for Delhi Police Sub Inspector, CISF, BSF, and CRPF SI Paper-1 and Paper-2.",
    totalShiftsCount: 36,
    years: ["2024", "2023", "2022"],
    conductingBody: "SSC (Govt of India)",
    shiftsByYear: {
      "2024": [
        {
          id: "ssc-cpo-2024-jun27-s1",
          title: "SSC CPO 2024 Paper-1 (27 Jun 2024 Shift-1)",
          tier: "Paper-1",
          date: "27 Jun 2024",
          shift: "Shift 1 (09:00 AM - 11:00 AM)",
          totalQuestions: 200,
          totalDurationMinutes: 120,
          totalMarks: 200,
          negativeMarking: 0.25,
          language: "English / Hindi",
          status: "Available",
          liveExamId: "6aa5798a6d95008aa13f4884"
        }
      ]
    }
  },
  {
    slug: "ssc-stenographer",
    name: "SSC Stenographer",
    fullName: "SSC Stenographer Grade 'C' & 'D' Examination",
    category: "ssc",
    categoryLabel: "SSC Exams",
    organization: "Staff Selection Commission",
    logoType: "ssc",
    badgeColor: "from-blue-600 to-indigo-700",
    description: "Authentic CBT question papers for General Intelligence, Reasoning, General Awareness, and English Language.",
    totalShiftsCount: 28,
    years: ["2023", "2022", "2021"],
    conductingBody: "SSC (Govt of India)",
    shiftsByYear: {
      "2023": [
        {
          id: "ssc-steno-2023-oct12-s1",
          title: "SSC Stenographer 2023 (12 Oct 2023 Shift-1)",
          tier: "CBT",
          date: "12 Oct 2023",
          shift: "Shift 1",
          totalQuestions: 200,
          totalDurationMinutes: 120,
          totalMarks: 200,
          negativeMarking: 0.33,
          language: "English / Hindi",
          status: "Available",
          liveExamId: "6aa5798a6d95008aa13f4884"
        }
      ]
    }
  },
  {
    slug: "ssc-je",
    name: "SSC JE",
    fullName: "Staff Selection Commission Junior Engineer Examination",
    category: "engineering",
    categoryLabel: "Engineering Recruitment Exams",
    organization: "Staff Selection Commission",
    logoType: "ssc",
    badgeColor: "from-blue-600 to-indigo-700",
    description: "Paper-1 and Paper-2 CBT question papers for Civil, Electrical, and Mechanical engineering streams.",
    totalShiftsCount: 32,
    years: ["2024", "2023", "2022"],
    conductingBody: "SSC (Govt of India)",
    shiftsByYear: {
      "2024": [
        {
          id: "ssc-je-2024-jun05-s1",
          title: "SSC JE 2024 Paper-1 (05 Jun 2024 Shift-1 General Engineering)",
          tier: "Paper-1",
          date: "05 Jun 2024",
          shift: "Shift 1 (09:00 AM - 11:00 AM)",
          totalQuestions: 200,
          totalDurationMinutes: 120,
          totalMarks: 200,
          negativeMarking: 0.25,
          language: "English / Hindi",
          status: "Available",
          liveExamId: "6aa8f204f5b4b3603df83380"
        }
      ]
    }
  },
  {
    slug: "ssc-je-ce",
    name: "SSC JE CE",
    fullName: "SSC Junior Engineer (Civil Engineering Specialist)",
    category: "engineering",
    categoryLabel: "Engineering Recruitment Exams",
    organization: "Staff Selection Commission",
    logoType: "ssc",
    badgeColor: "from-blue-600 to-indigo-700",
    description: "Subject-specific Civil Engineering previous papers covering Building Materials, Estimating, Surveying, and Hydraulics.",
    totalShiftsCount: 24,
    years: ["2024", "2023", "2022"],
    conductingBody: "SSC (Govt of India)",
    shiftsByYear: {
      "2024": [
        {
          id: "ssc-je-ce-2024-s1",
          title: "SSC JE Civil 2024 (05 Jun 2024 Shift-1 Civil)",
          tier: "Paper-1",
          date: "05 Jun 2024",
          shift: "Shift 1",
          totalQuestions: 200,
          totalDurationMinutes: 120,
          totalMarks: 200,
          negativeMarking: 0.25,
          language: "English / Hindi",
          status: "Available",
          liveExamId: "6aa8f204f5b4b3603df83380"
        }
      ]
    }
  },
  {
    slug: "delhi-police-constable",
    name: "Delhi Police Constable",
    fullName: "Constable (Executive) Male and Female in Delhi Police Examination",
    category: "defence",
    categoryLabel: "Defence & Police Exams",
    organization: "Delhi Police / SSC",
    logoType: "police",
    badgeColor: "from-red-600 to-amber-600",
    description: "Official shift-wise CBT papers conducted by SSC for Constable Executive posts in Delhi Police.",
    totalShiftsCount: 45,
    years: ["2023", "2022", "2020"],
    conductingBody: "Delhi Police / SSC",
    shiftsByYear: {
      "2023": [
        {
          id: "dp-const-2023-nov14-s1",
          title: "Delhi Police Constable 2023 (14 Nov 2023 Shift-1)",
          tier: "CBT",
          date: "14 Nov 2023",
          shift: "Shift 1",
          totalQuestions: 100,
          totalDurationMinutes: 90,
          totalMarks: 100,
          negativeMarking: 0.25,
          language: "English / Hindi",
          status: "Available",
          liveExamId: "6aa5798a6d95008aa13f4884"
        }
      ]
    }
  },
  {
    slug: "ib-security-assistant",
    name: "IB Security Assistant",
    fullName: "Intelligence Bureau Security Assistant / Executive & Multi-Tasking Staff Exam",
    category: "defence",
    categoryLabel: "Defence & Police Exams",
    organization: "Ministry of Home Affairs (MHA)",
    logoType: "emblem",
    badgeColor: "from-slate-800 to-slate-950",
    description: "Tier-1 objective test papers for IB Security Assistant, Executive, and MTS examinations.",
    totalShiftsCount: 18,
    years: ["2024", "2023"],
    conductingBody: "MHA (Govt of India)",
    shiftsByYear: {
      "2023": [
        {
          id: "ib-sa-2023-mar23-s1",
          title: "IB SA & MTS 2023 Tier-1 (23 Mar 2023 Shift-1)",
          tier: "Tier-1",
          date: "23 Mar 2023",
          shift: "Shift 1",
          totalQuestions: 100,
          totalDurationMinutes: 60,
          totalMarks: 100,
          negativeMarking: 0.25,
          language: "English / Hindi",
          status: "Available",
          liveExamId: "6aa5798a6d95008aa13f4884"
        }
      ]
    }
  },
  {
    slug: "rrb-ntpc",
    name: "RRB NTPC",
    fullName: "Railway Recruitment Boards Non-Technical Popular Categories",
    category: "railways",
    categoryLabel: "Railways Exams",
    organization: "Indian Railways",
    logoType: "railway",
    badgeColor: "from-emerald-600 to-teal-700",
    description: "Official shift-wise CBT 1 and CBT 2 question papers for Station Master, Goods Guard, and Commercial Clerk.",
    totalShiftsCount: 133,
    years: ["2024", "2022", "2021"],
    conductingBody: "Railway Recruitment Boards (RRB)",
    shiftsByYear: {
      "2022": [
        {
          id: "rrb-ntpc-2022-cbt2-level6",
          title: "RRB NTPC CBT-2 Level 6 (09 May 2022 Shift-1)",
          tier: "CBT-2",
          date: "09 May 2022",
          shift: "Shift 1",
          totalQuestions: 120,
          totalDurationMinutes: 90,
          totalMarks: 120,
          negativeMarking: 0.33,
          language: "15 Regional Languages",
          status: "Available",
          liveExamId: "6aa5798a6d95008aa13f4884"
        }
      ]
    }
  },
  {
    slug: "rrb-alp",
    name: "RRB ALP",
    fullName: "Railway Recruitment Boards Assistant Loco Pilot & Technician",
    category: "railways",
    categoryLabel: "Railways Exams",
    organization: "Indian Railways",
    logoType: "railway",
    badgeColor: "from-emerald-600 to-teal-700",
    description: "CBT 1 and CBT 2 Part A & Part B trade-wise previous year question papers for Loco Pilot aspirants.",
    totalShiftsCount: 30,
    years: ["2024", "2018"],
    conductingBody: "Railway Recruitment Boards (RRB)",
    shiftsByYear: {
      "2024": [
        {
          id: "rrb-alp-2024-cbt1-sample",
          title: "RRB ALP 2024 CBT-1 Official Practice Shift",
          tier: "CBT-1",
          date: "25 Nov 2024",
          shift: "Shift 1",
          totalQuestions: 75,
          totalDurationMinutes: 60,
          totalMarks: 75,
          negativeMarking: 0.33,
          language: "15 Regional Languages",
          status: "Available",
          liveExamId: "6aa5798a6d95008aa13f4884"
        }
      ]
    }
  },
  {
    slug: "ibps-po",
    name: "IBPS PO",
    fullName: "Institute of Banking Personnel Selection - Probationary Officers / MT",
    category: "banking",
    categoryLabel: "Banking Exams",
    organization: "IBPS",
    logoType: "banking",
    badgeColor: "from-sky-600 to-blue-800",
    description: "Official shift question papers for IBPS PO Prelims and Mains examinations.",
    totalShiftsCount: 24,
    years: ["2024", "2023", "2022"],
    conductingBody: "IBPS",
    shiftsByYear: {
      "2024": [
        {
          id: "ibps-po-2024-pre-s1",
          title: "IBPS PO Prelims 2024 (19 Oct 2024 Shift-1)",
          tier: "Prelims",
          date: "19 Oct 2024",
          shift: "Shift 1",
          totalQuestions: 100,
          totalDurationMinutes: 60,
          totalMarks: 100,
          negativeMarking: 0.25,
          language: "English / Hindi",
          status: "Available",
          liveExamId: "6aa8f204f5b4b3603df83380"
        }
      ]
    }
  },
  {
    slug: "sbi-po",
    name: "SBI PO",
    fullName: "State Bank of India Probationary Officers Examination",
    category: "banking",
    categoryLabel: "Banking Exams",
    organization: "State Bank of India",
    logoType: "banking",
    badgeColor: "from-sky-600 to-blue-800",
    description: "Authentic Prelims & Mains examination papers with sectional time limits.",
    totalShiftsCount: 20,
    years: ["2024", "2023", "2022"],
    conductingBody: "SBI",
    shiftsByYear: {
      "2023": [
        {
          id: "sbi-po-2023-pre-s1",
          title: "SBI PO Prelims 2023 (01 Nov 2023 Shift-1)",
          tier: "Prelims",
          date: "01 Nov 2023",
          shift: "Shift 1",
          totalQuestions: 100,
          totalDurationMinutes: 60,
          totalMarks: 100,
          negativeMarking: 0.25,
          language: "English / Hindi",
          status: "Available",
          liveExamId: "6aa8f204f5b4b3603df83380"
        }
      ]
    }
  },
  {
    slug: "ctet",
    name: "CTET",
    fullName: "Central Teacher Eligibility Test (Paper 1 & Paper 2)",
    category: "teaching",
    categoryLabel: "Teaching Exams",
    organization: "CBSE",
    logoType: "teaching",
    badgeColor: "from-violet-600 to-purple-800",
    description: "Previous year question papers for Primary (Class I-V) and Elementary (Class VI-VIII) teachers.",
    totalShiftsCount: 30,
    years: ["2024", "2023", "2022"],
    conductingBody: "CBSE",
    shiftsByYear: {
      "2024": [
        {
          id: "ctet-2024-jan-paper2",
          title: "CTET Jan 2024 Paper-2 (Maths & Science)",
          tier: "Paper-2",
          date: "21 Jan 2024",
          shift: "Morning Shift",
          totalQuestions: 150,
          totalDurationMinutes: 150,
          totalMarks: 150,
          negativeMarking: 0.0,
          language: "Bilingual",
          status: "Available",
          liveExamId: "6aa5798a6d95008aa13f4884"
        }
      ]
    }
  },
  {
    slug: "upsc-cse",
    name: "UPSC CSE Prelims",
    fullName: "Civil Services Examination - General Studies Paper 1 & CSAT",
    category: "civil-services",
    categoryLabel: "Civil Services Exam",
    organization: "Union Public Service Commission",
    logoType: "emblem",
    badgeColor: "from-amber-600 to-yellow-800",
    description: "Official question papers for IAS, IPS, IFS Preliminary Examination GS-1 and CSAT Paper-2.",
    totalShiftsCount: 16,
    years: ["2024", "2023", "2022", "2021", "2020"],
    conductingBody: "UPSC (Govt of India)",
    shiftsByYear: {
      "2024": [
        {
          id: "upsc-cse-2024-gs1",
          title: "UPSC Civil Services Prelims 2024 - GS Paper 1",
          tier: "Prelims GS-1",
          date: "16 Jun 2024",
          shift: "Morning (09:30 AM - 11:30 AM)",
          totalQuestions: 100,
          totalDurationMinutes: 120,
          totalMarks: 200,
          negativeMarking: 0.66,
          language: "English / Hindi",
          status: "Available",
          liveExamId: "6aa5798a6d95008aa13f4884"
        }
      ]
    }
  },
  {
    slug: "avnl-junior-manager",
    name: "AVNL Junior Manager",
    fullName: "Armoured Vehicles Nigam Limited - Executive & Junior Manager CBT",
    category: "engineering",
    categoryLabel: "Engineering Recruitment Exams",
    organization: "AVNL (Ministry of Defence)",
    logoType: "defence",
    badgeColor: "from-emerald-700 to-slate-900",
    description: "Official CBT paper for Junior Manager & Executive positions in Armoured Vehicles Nigam Limited.",
    totalShiftsCount: 4,
    years: ["2026", "2025"],
    conductingBody: "AVNL India",
    shiftsByYear: {
      "2026": [
        {
          id: "avnl-jm-2026-ai",
          title: "AVNL Junior Manager (Artificial Intelligence) CBT 2026",
          tier: "CBT",
          date: "Official Shift",
          shift: "Shift 1",
          totalQuestions: 100,
          totalDurationMinutes: 90,
          totalMarks: 100,
          negativeMarking: 0.25,
          language: "English / Hindi",
          status: "Live CBT Available",
          liveExamId: "6aa5798a6d95008aa13f4884"
        }
      ]
    }
  },
  {
    slug: "coal-india-mt",
    name: "Coal India MT",
    fullName: "Coal India Limited - Management Trainee CBT (Computer Science)",
    category: "engineering",
    categoryLabel: "Engineering Recruitment Exams",
    organization: "Coal India Limited",
    logoType: "engineering",
    badgeColor: "from-stone-700 to-slate-900",
    description: "Recruitment examination for Management Trainees in Computer Science Engineering at Coal India Limited.",
    totalShiftsCount: 6,
    years: ["2026", "2024"],
    conductingBody: "Coal India Ltd (Govt of India)",
    shiftsByYear: {
      "2026": [
        {
          id: "cil-mt-2026-cs",
          title: "Coal India MT (Computer Science) CBT 2026 - Shift 1",
          tier: "CBT",
          date: "Official Shift",
          shift: "Shift 1",
          totalQuestions: 100,
          totalDurationMinutes: 120,
          totalMarks: 100,
          negativeMarking: 0.0,
          language: "English / Hindi",
          status: "Live CBT Available",
          liveExamId: "6aa8f204f5b4b3603df83380"
        }
      ]
    }
  }
];

export function getExamBySlug(slug) {
  return POPULAR_EXAMS.find((e) => e.slug.toLowerCase() === (slug || "").toLowerCase());
}

export function getExamsByCategory(categoryId) {
  if (!categoryId || categoryId === "all") return POPULAR_EXAMS;
  return POPULAR_EXAMS.filter((e) => e.category === categoryId);
}
