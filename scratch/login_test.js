// Use global fetch

async function testLogin() {
  const credentials = { username: 'Aadhi', password: 'Admin786' };
  console.log('Sending login request with:', credentials);
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const status = res.status;
    const body = await res.json();
    console.log('Status:', status);
    console.log('Response body:', body);
  } catch (err) {
    console.error('Error connecting to backend:', err.message);
  }
}

testLogin();
