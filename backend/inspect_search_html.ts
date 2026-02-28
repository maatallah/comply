
import axios from 'axios';

async function inspectSearch() {
    console.log("--- Inspecting Search Page HTML ---");
    // Search for 2026 to emulate user view
    const url = 'https://www.pist.tn/search?ln=fr&p=%222026%22&f=jortyear';

    try {
        const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const html = res.data;

        // Look for the "Liens externes" section or Jort 019 link
        console.log("Searching for JORT 19 links...");

        // Find the block corresponding to JORT 19
        // The user saw "Jort N° 019/2026"
        const snippet = "019/2026";
        const idx = html.indexOf(snippet);

        if (idx !== -1) {
            const start = Math.max(0, idx - 300);
            const end = Math.min(html.length, idx + 300);
            console.log("\n--- Context around '019/2026' ---");
            console.log(html.substring(start, end));

            // Extract hrefs in this context
            const ctx = html.substring(start, end);
            const hrefs = [...ctx.matchAll(/href="([^"]+)"/g)];
            hrefs.forEach(m => console.log(`   Found Link: ${m[1]}`));
        } else {
            console.log("Could not find '019/2026' in search results HTML.");
        }

    } catch (e) {
        console.error(e.message);
    }
}

inspectSearch();
