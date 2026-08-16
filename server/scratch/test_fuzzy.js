const fuzzyMatchLocation = (query, items) => {
    const q = query.toLowerCase().trim();
    
    // 1. Exact match
    for (const item of items) {
        if (item.name.toLowerCase().trim() === q) return item.id;
    }
    
    // 2. Query contains item name or vice-versa
    for (const item of items) {
        const n = item.name.toLowerCase().trim();
        if (q.includes(n) || n.includes(q)) return item.id;
    }
    
    // 3. Word-level overlap
    const qWords = q.split(/[\s,।\-/]+/).filter(w => w.length > 2);
    let bestScore = 0;
    let bestId = null;
    
    for (const item of items) {
        const nWords = item.name.toLowerCase().split(/[\s,।\-/]+/).filter(w => w.length > 2);
        const score = qWords.filter(w => nWords.some(nw => nw.includes(w) || w.includes(nw))).length;
        if (score > bestScore) { bestScore = score; bestId = item.id; }
    }
    
    if (bestScore > 0 && bestId !== null) return bestId;

    // 4. Handle typos with Levenshtein Distance (for slight misspellings like "Mymenisngh")
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
        // Check distance against the whole query
        let dist = levenshtein(q, n);
        
        // Also check distance against individual words in the query
        for (const w of qWords) {
             const wordDist = levenshtein(w, n);
             if (wordDist < dist) dist = wordDist;
        }

        // Allow up to 2 typos for a match
        if (dist < bestLevenshteinDist && dist <= 2) {
            bestLevenshteinDist = dist;
            bestLevenshteinId = item.id;
        }
    }

    return bestLevenshteinId;
};

const items = [
    { id: 1, name: "Dhaka" },
    { id: 2, name: "Mymensingh" }
];

console.log("Match for Mymenisngh:", fuzzyMatchLocation("Mymenisngh", items));
