
import axios from 'axios';

async function analyze() {
    console.log("--- Analyzing JORT 19 Evidence ---");

    // Use correct Advanced Search syntax for Invenio/PIST
    // p1=019 (jortnumber) AND p2=2026 (jortyear)
    const searchUrl = `https://www.pist.tn/search?ln=fr&as=1&cc=JORT&m1=a&p1=019&f1=jortnumber&op1=a&m2=a&p2=2026&f2=jortyear&op2=a&of=xm&rg=50`;

    try {
        const res = await axios.get(searchUrl);
        const xml = res.data;

        // Count records
        const records = xml.match(/<record>/g)?.length || 0;
        console.log(`Found ${records} records tagged with JORT 19/2026.`);

        // Extract titles and identifiers
        const titles = [...xml.matchAll(/<datafield tag="245"[^>]*>.*?<subfield code="a">(.*?)<\/subfield>/gs)];

        console.log("\n--- Records Found ---");
        titles.forEach((t, i) => {
            // clean up XML entities roughly
            const cleanTitle = t[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim().substring(0, 80);
            console.log(`${i + 1}. ${cleanTitle}...`);
        });

        // Check if they ALL point to the same PDF
        const pdfs = [...new Set([...xml.matchAll(/Jo0192026\.pdf/g)].map(m => m[0]))];
        console.log(`\nReferenced PDFs: ${pdfs.join(', ')}`);

    } catch (e) {
        console.error(e.message);
    }
}

analyze();
