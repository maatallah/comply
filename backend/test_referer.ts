
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

async function testProtection() {
    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));
    const pdfUrl = 'https://www.pist.tn/jort/2026/2026F/Jo0192026.pdf';
    const detailUrl = 'https://www.pist.tn/record/201860';

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    console.log("--- Testing Protection Mechanisms ---");

    // 1. Simple Request with Browser UA
    try {
        console.log("1. Direct Request with Browser UA...");
        await axios.get(pdfUrl, { headers });
        console.log("   ✅ Success (200 OK)");
    } catch (e) {
        console.log(`   ❌ Failed: ${e.message} (Status: ${e.response?.status})`);
    }

    // 2. Session-based Request
    try {
        console.log("2. Session Request (Detail -> PDF)...");
        // Load detail page to set cookies
        await client.get(detailUrl, { headers });
        console.log("   Session established.");

        // Try download with cookies
        await client.get(pdfUrl, {
            headers: {
                ...headers,
                'Referer': detailUrl
            }
        });
        console.log("   ✅ Success (200 OK)");
    } catch (e) {
        console.log(`   ❌ Failed: ${e.message} (Status: ${e.response?.status})`);
    }
}

testProtection();

async function testAvailability() {
    console.log("--- Testing PDF Availability ---");

    // 1. Check a known old JORT (JORT 100 / 2024)
    // URL guess: https://www.pist.tn/jort/2024/2024F/Jo1002024.pdf
    // Or verify via search
    const oldUrl = 'https://www.pist.tn/jort/2024/2024F/Jo1002024.pdf';
    console.log(`Checking Old PDF: ${oldUrl}`);
    try {
        const res = await axios.head(oldUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            validateStatus: () => true
        });
        console.log(`   Status: ${res.status}`);
    } catch (e) {
        console.log(`   Error: ${e.message}`);
    }

    // 2. Check JORT 19/2026 Context
    console.log("\n--- Checking JORT 19 Context ---");
    const detailUrl = 'https://www.pist.tn/record/201860?ln=fr';
    try {
        const res = await axios.get(detailUrl);
        const html = res.data;
        const index = html.indexOf('Jo0192026.pdf');
        if (index !== -1) {
            const start = Math.max(0, index - 100);
            const end = Math.min(html.length, index + 100);
            console.log("Context:");
            console.log(html.substring(start, end));
        } else {
            console.log("Link not found in HTML?");
        }
    } catch (e) { console.error(e); }
}

testAvailability();
