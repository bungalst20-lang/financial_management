async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password
        })
    });

    const result = await response.json();

    alert(result.message);

    if (response.ok) {
        window.location.href = '/pages/dashboard.html';
    }
}