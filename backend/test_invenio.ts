
import axios from 'axios';

async function testInvenioPaths() {
    console.log("--- Testing Invenio Download Paths ---");
    const recordId = '201860';
    const filename = 'Jo0192026.pdf';

    const paths = [
        `https://www.pist.tn/record/${recordId}/files/${filename}`,
        `https://www.pist.tn/record/${recordId}/files/${filename}?version=1`,
        `https://www.pist.tn/record/${recordId}/export/xd`, // Just to check record existence
    ];

    for (const url of paths) {
        try {
            process.stdout.write(`Checking ${url} ... `);
            const res = await axios.head(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, validateStatus: () => true });
            console.log(`${res.status}`);
        } catch (e) {
            console.log(`Error: ${e.message}`);
        }
    }
}

testInvenioPaths();
