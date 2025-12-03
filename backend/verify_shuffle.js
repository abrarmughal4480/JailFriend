const http = require('http');

function fetch(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`Status Code: ${res.statusCode}, Body: ${data}`));
                    return;
                }
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`JSON Parse Error: ${e.message}, Body: ${data.substring(0, 100)}...`));
                }
            });
        }).on('error', reject);
    });
}

async function verify() {
    const baseUrl = 'http://localhost:5000/api';

    console.log(`Connecting to ${baseUrl}...`);

    console.log('Verifying Posts Shuffling...');
    try {
        const posts1 = await fetch(`${baseUrl}/posts`);
        const posts2 = await fetch(`${baseUrl}/posts`);

        if (!Array.isArray(posts1) || !Array.isArray(posts2)) {
            console.log('❌ Failed to fetch posts or invalid response');
        } else {
            const ids1 = posts1.map(p => p._id).join(',');
            const ids2 = posts2.map(p => p._id).join(',');

            console.log(`Fetched ${posts1.length} posts.`);
            if (posts1.length < 2) {
                console.log('⚠️ Not enough posts to verify shuffling.');
            } else if (ids1 === ids2) {
                console.log('❌ Posts are NOT shuffling (Order is identical).');
            } else {
                console.log('✅ Posts ARE shuffling.');
            }
        }
    } catch (e) {
        console.log('❌ Error fetching posts:', e.message);
    }

    console.log('\nVerifying Albums Shuffling...');
    try {
        const albums1 = await fetch(`${baseUrl}/albums`);
        const albums2 = await fetch(`${baseUrl}/albums`);

        if (!Array.isArray(albums1) || !Array.isArray(albums2)) {
            console.log('❌ Failed to fetch albums or invalid response');
        } else {
            const ids1 = albums1.map(a => a._id).join(',');
            const ids2 = albums2.map(a => a._id).join(',');

            console.log(`Fetched ${albums1.length} albums.`);
            if (albums1.length < 2) {
                console.log('⚠️ Not enough albums to verify shuffling.');
            } else if (ids1 === ids2) {
                console.log('❌ Albums are NOT shuffling (Order is identical).');
            } else {
                console.log('✅ Albums ARE shuffling.');
            }
        }
    } catch (e) {
        console.log('❌ Error fetching albums:', e.message);
    }
}

verify();
