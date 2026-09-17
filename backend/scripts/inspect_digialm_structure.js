const path = require('path');
const { fetchResponseSheetUrl } = require('../src/services/digialmParser');

async function inspectDigialmHtml() {
  const url = process.argv[2] || process.env.TEST_DIGIALM_URL;
  if (!url) {
    console.log("Usage: node scripts/inspect_digialm_structure.js <response_sheet_url>");
    console.log("Or set TEST_DIGIALM_URL environment variable.");
    process.exit(1);
  }
  console.log("Fetching response sheet...");
  try {
    const html = await fetchResponseSheetUrl(url);
    console.log("Fetched HTML length:", html.length);

    // Find section labels
    const sections = [...html.matchAll(/class=["']section-lbl["'][^>]*>([\s\S]*?)<\/div>/gi)];
    console.log("Sections found:", sections.map(s => s[1].replace(/<[^>]+>/g, '').trim()));

    // Find question panels
    const qPanels = html.match(/<table[^>]*class=["'][^"']*questionPnlTbl[^"']*["'][\s\S]*?(?=<table[^>]*class=["'][^"']*questionPnlTbl[^"']*["']|<\/body|$)/gi) ||
                    html.match(/<div[^>]*class=["'][^"']*question-pnl[^"']*["'][\s\S]*?(?=<div[^>]*class=["'][^"']*question-pnl[^"']*["']|<\/body|$)/gi) || [];

    console.log("Total question panels found:", qPanels.length);

    if (qPanels.length > 0) {
      console.log("\n--- SAMPLE QUESTION PANEL 1 ---");
      console.log(qPanels[0].substring(0, 1500));
      console.log("\n--- SAMPLE QUESTION PANEL 2 ---");
      console.log(qPanels[1]?.substring(0, 1500));
    }
  } catch (err) {
    console.error("Error fetching demo Digialm:", err.message);
  }
}

inspectDigialmHtml();
