import fetch from 'node-fetch';

async function verifyAPI() {
    try {
        const response = await fetch('http://localhost:4000/api/courses/advanced-structural-dynamics');
        const data = await response.json();
        console.log('API Response for Advanced Structural Dynamics:');
        console.log(JSON.stringify(data, null, 2));

        if (data.pricingType === 'free') {
            console.log('✅ API Verification Successful: pricingType is free');
        } else {
            console.log('❌ API Verification Failed: pricingType is', data.pricingType);
        }
    } catch (err) {
        console.error('API Verification Failed (Server might still be starting or unreachable):', err);
    }
}

verifyAPI();
