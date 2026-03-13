async function testLogin() {
    try {
        const response = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@mathinova.com',
                password: 'Password@123'
            })
        });
        const data = await response.json();
        console.log('Login Status:', response.status);
        console.log('Login Result:', data);
    } catch (error: any) {
        console.error('Login Failed:', error.message);
    }
}

testLogin();
