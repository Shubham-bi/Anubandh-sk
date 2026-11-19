const fs = require('fs');
const http = require('http');

const BASE_URL = 'http://levashubhmangal.com/web_service_14072020/userProfileData.php?nu_id=';
const INPUT_FILES = ['profiles.json', 'profile.json'];
const OUTPUT_FILE = 'user_profiles.json';
const DELAY_MS = 5000;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function loadNuIds() {
    let inputFile = null;
    for (const f of INPUT_FILES) {
        if (fs.existsSync(f)) {
            inputFile = f;
            break;
        }
    }

    if (!inputFile) {
        console.error(`[!] Error: Could not find any input file matching: ${INPUT_FILES.join(', ')}`);
        process.exit(1);
    }

    console.log(`[*] Reading source data from '${inputFile}'...`);
    const raw = fs.readFileSync(inputFile, 'utf-8');
    const data = JSON.parse(raw);

    const nuIds = [];
    const seen = new Set();

    function addId(id) {
        if (id !== null && id !== undefined) {
            const sId = String(id).trim();
            if (sId && !seen.has(sId)) {
                seen.add(sId);
                nuIds.push(sId);
            }
        }
    }

    let results = [];
    if (data && typeof data === 'object') {
        if (Array.isArray(data.results)) {
            results = data.results;
        } else if (Array.isArray(data.data)) {
            results = data.data;
        }
    } else if (Array.isArray(data)) {
        results = data;
    }

    for (const item of results) {
        if (item && typeof item === 'object') {
            const pageData = item.data || item;
            if (pageData && typeof pageData === 'object') {
                if (Array.isArray(pageData.bg_gotra)) {
                    for (const profile of pageData.bg_gotra) {
                        if (profile && profile.nu_id) addId(profile.nu_id);
                    }
                } else if (pageData.nu_id) {
                    addId(pageData.nu_id);
                }
            } else if (Array.isArray(pageData)) {
                for (const profile of pageData) {
                    if (profile && profile.nu_id) addId(profile.nu_id);
                }
            }
        }
    }

    console.log(`[*] Found ${nuIds.length} unique nu_ids to process.`);
    return nuIds;
}

function loadExistingResults() {
    if (fs.existsSync(OUTPUT_FILE)) {
        try {
            const content = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
            if (content && typeof content === 'object') {
                return content.results || content;
            }
        } catch (e) {
            console.warn('[!] Warning: Could not read existing output file:', e.message);
        }
    }
    return {};
}

function saveResults(resultsMap, totalCount) {
    const payload = {
        total_expected: totalCount,
        total_fetched: Object.keys(resultsMap).length,
        results: resultsMap
    };
    const tempFile = OUTPUT_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(payload, null, 2), 'utf-8');
    if (fs.existsSync(OUTPUT_FILE)) {
        fs.unlinkSync(OUTPUT_FILE);
    }
    fs.renameSync(tempFile, OUTPUT_FILE);
}

function fetchUserProfile(nuId) {
    const url = `${BASE_URL}${nuId}&lang_type=1&`;
    return new Promise((resolve, reject) => {
        const req = http.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/javascript, */*; q=0.01'
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                const trimmed = body.trim();
                if (!trimmed) return resolve(null);
                try {
                    resolve(JSON.parse(trimmed));
                } catch (e) {
                    resolve({ raw_text: trimmed });
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(30000, () => {
            req.abort();
            reject(new Error('Request timed out'));
        });
    });
}

async function main() {
    console.log('='.repeat(65));
    console.log('User Profile Detail Fetcher (Node.js)');
    console.log(`Delay between requests: ${DELAY_MS / 1000} seconds`);
    console.log(`Output file: ${OUTPUT_FILE}`);
    console.log('='.repeat(65));

    const nuIds = loadNuIds();
    if (nuIds.length === 0) {
        console.log('[!] No nu_ids found to fetch.');
        return;
    }

    const resultsMap = loadExistingResults();
    const completedIds = new Set(Object.keys(resultsMap));

    if (completedIds.size > 0) {
        console.log(`[*] Resuming: ${completedIds.size} profiles already fetched previously.`);
    }

    const remainingIds = nuIds.filter(id => !completedIds.has(id));
    console.log(`[*] Remaining profiles to fetch: ${remainingIds.length} / ${nuIds.length}`);

    if (remainingIds.length === 0) {
        console.log('[+] All profiles are already fetched and saved!');
        return;
    }

    process.on('SIGINT', () => {
        console.log('\n\n[!] Interrupted by user (Ctrl+C).');
        console.log(`[*] Progress saved: ${Object.keys(resultsMap).length} / ${nuIds.length} profiles in '${OUTPUT_FILE}'.`);
        console.log('[*] You can rerun the script anytime to resume where you left off.');
        process.exit(0);
    });

    for (let i = 0; i < remainingIds.length; i++) {
        const nuId = remainingIds[i];
        const totalDone = Object.keys(resultsMap).length + 1;
        process.stdout.write(`[${totalDone}/${nuIds.length}] Fetching nu_id: ${nuId} ... `);

        let profileData = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                profileData = await fetchUserProfile(nuId);
                break;
            } catch (err) {
                process.stdout.write(`(Attempt ${attempt} failed: ${err.message}) `);
                if (attempt < 3) await sleep(2000);
            }
        }

        if (profileData !== null) {
            resultsMap[nuId] = profileData;
            console.log('✓ Success');
        } else {
            resultsMap[nuId] = { error: 'Failed to fetch or empty response' };
            console.log('✗ Failed');
        }

        // Save progress after each request
        saveResults(resultsMap, nuIds.length);

        // Delay between requests
        if (i < remainingIds.length - 1) {
            console.log(`    [-] Waiting ${DELAY_MS / 1000}s ...`);
            await sleep(DELAY_MS);
        }
    }

    console.log('\n' + '='.repeat(65));
    console.log(`[SUCCESS] All done! ${Object.keys(resultsMap).length} profiles saved into '${OUTPUT_FILE}'.`);
    console.log('='.repeat(65));
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
