const https = require('https');
https.get('https://raw.githubusercontent.com/mehdiakram/royal-carrybee/main/includes/class-carrybee-api.php', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        const lines = data.split('\n');
        const idx = lines.findIndex(l => l.includes('function get_stores') || l.includes('/api/v2/stores'));
        if (idx !== -1) {
            console.log(lines.slice(Math.max(0, idx - 5), idx + 15).join('\n'));
        } else {
            console.log("Not found");
        }
    });
});
