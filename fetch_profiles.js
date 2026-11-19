const fs = require('fs');
const http = require('http');

const BASE_URL = 'http://levashubhmangal.com/web_service_14072020/new_user_updated_list_unseen_profile.php?nu_id=17500&lang_type=1&page=';
const OUTPUT_FILE = 'profiles.json';
const DELAY_MS = 5000;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchPage(page) {
    const url = `${BASE_URL}${page}`;
    return new Promise((resolve, reject) => {
        const req = http.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/javascript, */*; q=0.01'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const trimmed = data.trim();
                if (!trimmed) return resolve(null);
                try {
                    resolve(JSON.parse(trimmed));
                } catch (err) {
                    console.error(`  [!] Failed to parse JSON on page ${page}:`, err.message);
                    resolve(null);
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

function isEmptyValue(val) {
    return val === null || val === undefined || (typeof val === 'string' && val.trim() === '');
}

function isBgGotraEmpty(data) {
    if (!data) return true;

    if (Array.isArray(data)) {
        if (data.length === 0) return true;

        const gotraValues = data
            .filter(item => item && typeof item === 'object')
            .map(item => item.bg_gotra);

        if (gotraValues.length > 0 && gotraValues.every(isEmptyValue)) {
            return true;
        }

        if (gotraValues.length > 0 && isEmptyValue(gotraValues[0])) {
            return true;
        }

        return false;
    }

    if (typeof data === 'object') {
        if ('bg_gotra' in data) {
            return isEmptyValue(data.bg_gotra);
        }

        for (const key of ['data', 'profiles', 'user_list', 'result', 'records', 'users']) {
            if (Array.isArray(data[key])) {
                return isBgGotraEmpty(data[key]);
            }
        }
    }

    return false;
}

async function main() {
    console.log('='.repeat(60));
    console.log('Starting profile extraction...');
    console.log(`Delay between requests: ${DELAY_MS / 1000} seconds`);
    console.log(`Output destination: ${OUTPUT_FILE}`);
    console.log('='.repeat(60));

    let page = 1;
    const allResponses = [];
    let totalProfiles = 0;

    while (true) {
        console.log(`\n[Page ${page}] Fetching data...`);
        let data;
        try {
            data = await fetchPage(page);
        } catch (err) {
            console.error(`  [!] Request error:`, err.message);
            break;
        }

        if (data === null) {
            console.log('  [i] Empty or invalid response received. Stopping.');
            break;
        }

        if (isBgGotraEmpty(data)) {
            console.log("  [i] 'bg_gotra' is empty or missing. End of records reached.");
            break;
        }

        allResponses.push({
            page: page,
            data: data
        });

        if (Array.isArray(data)) {
            totalProfiles += data.length;
            console.log(`  [+] Retrieved ${data.length} profiles (Total so far: ${totalProfiles})`);
        } else {
            console.log(`  [+] Retrieved data object successfully`);
        }

        page++;
        console.log(`  [-] Waiting ${DELAY_MS / 1000} seconds before next request...`);
        await sleep(DELAY_MS);
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Saving collected data to '${OUTPUT_FILE}'...`);

    const outputPayload = {
        total_pages: allResponses.length,
        total_profiles: totalProfiles,
        results: allResponses
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputPayload, null, 2), 'utf-8');
    console.log(`[SUCCESS] Saved ${allResponses.length} pages to '${OUTPUT_FILE}'`);
    console.log('='.repeat(60));
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
