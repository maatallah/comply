import axios from 'axios';

async function debug() {
    console.log("--- Debugging JORT 19 Links ---");

    // 1. Search for JORT 19/2026
    const url = `https://www.pist.tn/search?ln=fr&as=1&cc=JORT&m1=a&p1=019&f1=jortnumber&op1=a&m2=a&p2=2026&f2=jortyear&op2=a&of=xd&rg=1`;

    try {
        console.log(`Searching: ${url}`);
        const res = await axios.get(url);

        const match = res.data.match(/<dc:identifier>http:\/\/www\.pist\.tn\/record\/(\d+)<\/dc:identifier>/);
        if (!match) {
            console.log("No record found via XML search.");
            return;
        }
        const recordId = match[1];
        console.log(`Found Record ID: ${recordId}`);

        // 2. Get Detail
        const detailUrl = `https://www.pist.tn/record/${recordId}?ln=fr`;
        console.log(`Fetching detail: ${detailUrl}`);
        const detailRes = await axios.get(detailUrl);
        const html = detailRes.data;

        console.log("--- Scanning for 'Jo0192026' ---");
        const filename = "Jo0192026";
        let pos = html.indexOf(filename);
        while (pos !== -1) {
            const start = Math.max(0, pos - 50);
            const end = Math.min(html.length, pos + 50);
            console.log(`Match at ${pos}: ...${html.substring(start, end).replace(/\n/g, ' ')}...`);
            pos = html.indexOf(filename, pos + 1);
        }

        console.log("--- Scanning for 'Ja0192026' (Arabic) ---");
        const filenameAr = "Ja0192026";
        let posAr = html.indexOf(filenameAr);
        while (posAr !== -1) {
            const start = Math.max(0, posAr - 50);
            const end = Math.min(html.length, posAr + 50);
            console.log(`Match at ${posAr}: ...${html.substring(start, end).replace(/\n/g, ' ')}...`);
            posAr = html.indexOf(filenameAr, posAr + 1);
        }

        // Check Arabic PDF availability
        const arUrl = `https://www.pist.tn/jort/2026/2026A/Ja0192026.pdf`;
        try {
            await axios.head(arUrl);
            console.log(`Arabic PDF is reachable: ${arUrl}`);
        } catch (e) {
            console.log(`Arabic PDF failed: ${e.response?.status}`);
        }

        console.log("--- Extracted HREFs ---");
        const matches = [...html.matchAll(/href="([^"]+\.pdf)"/g)];
        matches.forEach(m => {
            console.log(`Raw: ${m[1]}`);
            if (!m[1].startsWith('http')) {
                console.log(`Resolved: https://www.pist.tn${m[1].startsWith('/') ? '' : '/'}${m[1]}`);
            }
        });

    } catch (e) {
        console.error(e.message);
    }
}

debug();
