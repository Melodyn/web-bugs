const backendURL = new URL('https://web-bugs.vercel.app/api');

document.addEventListener('DOMContentLoaded', () => {
  const form = document.forms.login;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    backendURL.searchParams.set('email', email);
    backendURL.searchParams.set('password', password);

    const result = await fetch(backendURL)
      .then((res) => res.json());

    console.log({ email, password, result });
  });
});
