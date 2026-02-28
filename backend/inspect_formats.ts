
import axios from 'axios';

async function inspectFormats() {
    console.log("--- Inspecting Output Formats for JORT 19 (Record 201860) ---");
    // Base URL for the record is easier than search for specific checking
    const base = 'https://www.pist.tn/record/201860'; // JORT 19

    // Guessing codes for formats based on standard Invenio/PIST options
    // hb: HTML brief
    // hd: HTML detailed
    // xm: MARCXML
    // xd: Dublin Core (what we use)
    const formats = ['hb', 'hd', 'xm', 'xd'];

    for (const fmt of formats) {
        const url = `${base}/export/${fmt}?ln=fr`;
        // Note: PIST usually uses /search?....&of=hb or /record/ID/export/hb if supported
        // Let's try the search endpoint with the specific query to be safe, like the user did.

        // Construct a search that isolates this record to see the list view format
        // p=201860 usually works if searching by ID, or we use unique criteria
        const searchUrl = `https://www.pist.tn/search?ln=fr&p=recid%3A201860&of=${fmt}`;

        console.log(`\nTesting format: ${fmt} (${searchUrl})`);
        try {
            const res = await axios.get(searchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const content = res.data;

            // Extract anything looking like a PDF link
            const links = [...content.matchAll(/href="([^"]+\.pdf)"/g)];
            if (links.length > 0) {
                links.forEach(m => console.log(`   Found PDF: ${m[1]}`));
            } else {
                console.log("   No .pdf links found in this format.");
            }

            // Also check for full URLs (http...)
            const fullLinks = [...content.matchAll(/href="(http[^"]+\.pdf)"/g)];
            fullLinks.forEach(m => console.log(`   Found Full PDF: ${m[1]}`));

        } catch (e) {
            console.log(`   Error: ${e.message}`);
        }
    }
}

inspectFormats();
