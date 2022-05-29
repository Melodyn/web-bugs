const allowCors = (app) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  // res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  return app(req, res);
};

const createId = (() => {
  let id = 0;
  return (reset = false) => {
    if (reset) {
      id = 0;
      return;
    }
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

const initUsers = [
  createUser({
    email: 'admin@tube.io',
    password: 'hentai/NINJA',
    isAdmin: true,
  }),
];
let users = initUsers.slice();

const handler = (request, response) => {
  console.log(users);
  const { action = '', ...userParams } = request.query;
  if (action === 'reset') {
    users = initUsers.slice();
    createId('reset');
    response.status(200).json({ success: true });
    return;
  }

  if (action === 'getUsers') {
    const u = users.map(({ id, name, email, isAdmin }) => ({ id, name, email, isAdmin }));
    response.status(200).json({ users: u });
    return;
  }

  let user = users.find((user) => userParams.email === user.email);

  if (user && user.type === 'new') {
    user.type = 'user';
  }
  if (!user) {
    user = createUser(userParams);
    users.push(user);
  }
  if (user.password !== password) {
    response.status(200).json({
      errors: ['Неправильный пароль'],
    });
    return;
  }

  response.status(200).json({ user });
};

export default allowCors(handler);
