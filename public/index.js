const backendURL = new URL('https://web-bugs.vercel.app/api');

const createId = (() => {
  let id = 0;
  return () => {
    id += 1;
    return id;
  }
})();
const createUser = ({ email, password, isAdmin = false }) => ({
  id: createId(),
  type: 'new',
  name: '',
  isAdmin,
  email,
  password,
});

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
        user = createUser({ email, password });
        users.push(user);
      }
      if (user.password !== password) {
        return {
          errors: ['Неправильный пароль'],
        };
      }

      return { user };
    },
    setName: () => {
      const name = backendURL.searchParams.get('name');
      const id = backendURL.searchParams.get('id');

      const user = users.find((user) => Number(user.id) === Number(id));
      user.name = name;

      return { user };
    },
    getUsers: () => {
      const u = users.map(({ id, name, email, isAdmin }) => ({ id, name, email, isAdmin }));
      return { users: u };
    },
  });

  const prod = () => ({
    auth: () => fetch(backendURL)
      .then((res) => res.json()),
    setName: () => fetch(backendURL)
      .then((res) => res.json()),
    getUsers: () => fetch(backendURL)
      .then((res) => res.json()),
  });

  return isProduction ? prod() : dev();
};

const initUser = {
  type: 'guest',
  email: '',
  password: '',
  id: 0,
};
const initState = {
  app: {
    isLoaded: false,
  },
  errors: [],
  user: initUser,
};

const render = (state, backend) => {
  const { user, app } = state;
  console.log(state);

  const loginButton = document.querySelector('#loginButton');
  const logoutButton = document.querySelector('#logoutButton');
  const editNameButton = document.querySelector('#editName');

  const toggleLoginButtons = () => {
    if (user.type === 'guest') {
      loginButton.classList.remove('d-none');
      logoutButton.classList.add('d-none');
      editNameButton.classList.add('d-none');
    } else {
      logoutButton.classList.remove('d-none');
      editNameButton.classList.remove('d-none');
      loginButton.classList.add('d-none');
    }
  };

  if (!app.isLoaded) {
    app.isLoaded = true;
    const loginForm = document.forms.login;
    const editNameForm = document.forms.editName;
    const cards = document.querySelectorAll('.card');
    const getUsersButton = document.querySelector('a[href="#users"]');

    const loginModal = new bootstrap.Modal('#loginModal');
    const editNameModal = new bootstrap.Modal('#editNameModal');
    const usersModalBody = document.querySelector('#usersModal .modal-body');

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginModal.hide();
      const formData = new FormData(e.target);
      const email = formData.get('email');
      const password = formData.get('password');

      backendURL.search = '';
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
      state.user = initUser;
      render(state);
    });

    editNameForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      editNameModal.hide();
      const formData = new FormData(e.target);
      const name = formData.get('name');

      backendURL.search = '';
      backendURL.searchParams.set('name', name);
      backendURL.searchParams.set('id', state.user.id);

      const result = await backend.setName();

      if (result.errors) {
        state.errors = result.errors;
      } else {
        state.user = result.user;
      }

      render(state, backend);
    });

    cards.forEach(card => {
      card.addEventListener('click', () => alert('Папався! 🦀'))
    });

    getUsersButton.addEventListener('click', async (e) => {
      e.preventDefault();

      backendURL.search = '';
      backendURL.searchParams.set('action', 'getUsers');

      const { users } = await backend.getUsers();
      if (users.length === 0) return;
      const table = document.createElement('table');
      const [firstUser] = users;
      const thr = document.createElement('tr');
      Object.keys(firstUser).forEach((key) => {
        const th = document.createElement('th');
        th.innerHTML = key;
        thr.append(th);
      });
      table.append(thr);

      users.forEach(user => {
        const tr = document.createElement('tr');
        Object.values(user).forEach((value) => {
          const td = document.createElement('td');
          td.innerHTML = value;
          tr.append(td);
        });
        table.append(tr);
      });

      usersModalBody.innerHTML = '';
      usersModalBody.append(table);
    })
  }

  toggleLoginButtons();

  const greeting = document.querySelector('#greeting');
  switch (user.type) {
    case 'user':
      greeting.innerHTML = `С возвращением, ${user.name || user.email}!`;
      break;
    case 'new':
      greeting.innerHTML = `Добро пожаловать, ${user.name || user.email}!`;
      break;
    default:
      greeting.innerHTML = `Привет, гость!`;
      break;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const isProduction = !window.location.href.includes('file:///');
  const backend = createBackend(isProduction);
  render(initState, backend);
});
