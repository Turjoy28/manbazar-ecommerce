

async function run() {
    const baseUrl = 'https://developers.carrybee.com';
    const headers = {
        'Content-Type': 'application/json',
        // Dummy or empty for public endpoints if possible, or use the ones from the code
        'Client-ID': '1a89c1a6-fc68-4395-9c09-628e0d3eaafc',
        'Client-Secret': '1d7152c9-5b2d-4e4e-9c20-652b93333704',
        'Client-Context': 'DzJwPsx31WaTbS745XZoBjmQLcNqwK'
    };

    const citiesRes = await fetch(`${baseUrl}/api/v2/cities`, { method: 'GET', headers });
    const citiesJson = await citiesRes.json();
    
    const citiesList = citiesJson?.data?.cities ?? citiesJson?.data?.data ?? (Array.isArray(citiesJson?.data) ? citiesJson.data : []);
    
    console.log("Total cities:", citiesList.length);
    const mCity = citiesList.find(c => c.name.toLowerCase().includes('mymen') || c.name.toLowerCase().includes('moim'));
    console.log("Found Mymensingh city in API:", mCity);

    // Run our fuzzy match
    const fuzzyMatchLocation = (query, items) => {
        const q = query.toLowerCase().trim();
        
        for (const item of items) {
            if (item.name.toLowerCase().trim() === q) return item.id;
        }
        for (const item of items) {
            const n = item.name.toLowerCase().trim();
            if (q.includes(n) || n.includes(q)) return item.id;
        }
        const qWords = q.split(/[\s,।\-/]+/).filter(w => w.length > 2);
        let bestScore = 0;
        let bestId = null;
        for (const item of items) {
            const nWords = item.name.toLowerCase().split(/[\s,।\-/]+/).filter(w => w.length > 2);
            const score = qWords.filter(w => nWords.some(nw => nw.includes(w) || w.includes(nw))).length;
            if (score > bestScore) { bestScore = score; bestId = item.id; }
        }
        if (bestScore > 0 && bestId !== null) return bestId;

        const levenshtein = (a, b) => {
            const matrix = [];
            for (let i = 0; i <= b.length; i++) matrix[i] = [i];
            for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
            for (let i = 1; i <= b.length; i++) {
                for (let j = 1; j <= a.length; j++) {
                    if (b.charAt(i - 1) === a.charAt(j - 1)) {
                        matrix[i][j] = matrix[i - 1][j - 1];
                    } else {
                        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
                    }
                }
            }
            return matrix[b.length][a.length];
        };

        let bestLevenshteinDist = Infinity;
        let bestLevenshteinId = null;

        for (const item of items) {
            const n = item.name.toLowerCase().trim();
            let dist = levenshtein(q, n);
            for (const w of qWords) {
                 const wordDist = levenshtein(w, n);
                 if (wordDist < dist) dist = wordDist;
            }
            if (dist < bestLevenshteinDist && dist <= 2) {
                bestLevenshteinDist = dist;
                bestLevenshteinId = item.id;
            }
        }
        return bestLevenshteinId;
    };

    console.log("Fuzzy Match Output:", fuzzyMatchLocation("Mymenisngh ", citiesList));
}

run();
