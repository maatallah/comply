
import axios from 'axios';

async function probe() {
    const base = 'https://www.pist.tn/jort/2026/2026F';
    const codes = ['Jo0192026', 'Jo192026', 'Jo019', 'Jo19'];
    const suffixes = ['', '_1', '_final', '_v1', '-1'];
    const exts = ['.pdf', '.PDF'];

    console.log(`--- Probing JORT 19 in ${base} ---`);

    for (const c of codes) {
        for (const s of suffixes) {
            for (const e of exts) {
                const filename = `${c}${s}${e}`;
                const url = `${base}/${filename}`;
                try {
                    await axios.head(url, {
                        headers: { 'User-Agent': 'Mozilla/5.0' },
                        validateStatus: () => true
                    }).then(res => {
                        if (res.status === 200) {
                            console.log(`✅ FOUND: ${url}`);
                            process.exit(0);
                        } else {
                            // process.stdout.write('.');
                        }
                    });
                } catch (err) { }
            }
        }
    }
    console.log("\n❌ Probe finished. No matches found.");
}

probe();
