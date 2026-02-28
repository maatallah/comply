
import axios from 'axios';

async function testVariations() {
    const base = 'https://www.pist.tn/jort/2026/2026F';
    const variations = [
        'Jo0192026.pdf',
    ];

    // Add path variations
    const paths = [
        'https://www.pist.tn/jort/2026/2026F',
        'https://www.pist.tn/jort/2026/2026f', // lowercase f
        'https://www.pist.tn/jort/2026/2026a', // try arabic path for french file??
    ];

    console.log("--- Testing URL Variations for JORT 19 ---");
    for (const p of paths) {
        for (const v of variations) {
            const url = `${p}/${v}`;
            try {
                process.stdout.write(`Checking ${url} ... `);
                await axios.head(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                console.log(`✅ FOUND!`);
                return;
            } catch (e) {
                console.log(`❌ ${e.response?.status}`);
            }
        }
    }

    // Dump HTML element
    console.log("\n--- HTML Element Dump ---");
    const recordId = '201860';
    const detailUrl = `https://www.pist.tn/record/${recordId}?ln=fr`;
    try {
        const res = await axios.get(detailUrl);
        const html = res.data;
        // Regex to capture full valid a tag or link tag
        const regex = /<[^>]+Jo0192026\.pdf[^>]*>/g;
        const matches = [...html.matchAll(regex)];
        matches.forEach(m => console.log(m[0]));
    } catch (e) { console.error(e); }

    console.log("\n--- Testing JORT 18 (Previous Issue) ---");
    const diffBase = 'https://www.pist.tn/jort/2026/2026F/Jo0182026.pdf';
    try {
        await axios.head(diffBase, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        console.log(`✅ JORT 18 Found: ${diffBase}`);
    } catch (e) {
        console.log(`❌ JORT 18 Failed: ${e.response?.status}`);
    }
}

testVariations();
