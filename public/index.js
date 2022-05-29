const backendURL = new URL('https://web-bugs.vercel.app/api');

const cloneDeep = (obj) => Object.entries(obj).reduce((acc, [key, value]) => {
  const valueType = typeof value;
  const isArray = Array.isArray(valueType);
  const isObject = !isArray && (valueType === 'object');
  if (isArray) {
    acc[key] = value.slice();
  }
  if (isObject) {
    acc[key] = cloneDeep(value);
  }
  if (!isObject && !isArray) {
    acc[key] = value;
  }
  return acc;
}, {});

const createId = (() => {
  let id = 0;
  return () => {
    id += 1;
    return id;
  }
})();

const users = [];

const createBackend = (isProduction = false) => {
  const dev = () => ({
    auth: () => {
      const email = backendURL.searchParams.get('email');
      const password = backendURL.searchParams.get('password');
      let user = users.find((user) => user.email === email);

      if (user && user.type === 'new') {
        user.type = 'user';
      }
      if (!user) {
        user = {
          id: createId(),
          email,
          password,
          type: 'new',
        };
        users.push(user);
      }
      if (user.password !== password) {
        return {
          errors: ['Неправильный пароль'],
        };
      }

      return { user };
    },
  });

  const prod = () => ({
    auth: () => fetch(backendURL)
      .then((res) => res.json()),
  });

  return isProduction ? prod() : dev();
};

const initState = {
  app: {
    isLoaded: false,
  },
  errors: [],
  user: {
    type: 'guest',
    email: '',
    password: '',
    id: 0,
  },
};

const render = (state, backend) => {
  const { user, app } = state;
  console.log(state);

  const loginButton = document.querySelector('#loginButton');
  const logoutButton = document.querySelector('#logoutButton');

  const toggleLoginButtons = () => {
    if (user.type === 'guest') {
      loginButton.classList.remove('d-none');
      logoutButton.classList.add('d-none');
    } else {
      logoutButton.classList.remove('d-none');
      loginButton.classList.add('d-none');
    }
  };

  if (!app.isLoaded) {
    app.isLoaded = true;
    const form = document.forms.login;
    const modal = new bootstrap.Modal('#loginModal');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      modal.hide();
      const formData = new FormData(e.target);
      const email = formData.get('email');
      const password = formData.get('password');

      backendURL.searchParams.set('email', email);
      backendURL.searchParams.set('password', password);

      const result = await backend.auth();

      if (result.errors) {
        state.errors = result.errors;
      } else {
        state.user = result.user;
      }

      render(state, backend);
    });

    logoutButton.addEventListener('click', () => {
      state.user = initState.user;
      render(state);
    });
  }

  toggleLoginButtons();

  const greeting = document.querySelector('#greeting');
  switch (user.type) {
    case 'user':
      greeting.textContent = `С возвращением, ${user.email}!`;
      break;
    case 'new':
      greeting.textContent = `Добро пожаловать, ${user.email}!`;
      break;
    default:
      greeting.textContent = `Привет, гость!`;
      break;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const isProduction = !window.location.href.includes('file:///');
  const backend = createBackend(isProduction);
  const stateCopy = cloneDeep(initState);
  render(stateCopy, backend);
});
