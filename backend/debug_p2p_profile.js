const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/p2p/profiles/691c54bb1002bae3d21ce8b0',
    method: 'GET',
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            const p = parsed.profile;
            console.log("Raw Profile Data:");
            console.log(JSON.stringify(p, null, 2));
            if (p) {
                console.log("--- Extracted Fields ---");
                console.log("availableFromTime:", p.availableFromTime);
                console.log("availableToTime:", p.availableToTime);
                console.log("workingHours:", p.workingHours);
                console.log("timezone:", p.timezone);
            }
        } catch (e) {
            console.log("Raw Data:", data);
        }
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.end();
