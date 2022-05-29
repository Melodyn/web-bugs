const allowCors = (app) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
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
  return () => {
    id += 1;
    return id;
  }
})();
const createUser = ({ email, password, isAdmin = false }) => ({
  id: createId(),
  type: 'new',
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
  const { email, password, action = '' } = request.query;
  if (action === 'reset') {
    users = initUsers.slice();
    response.status(200).json({ users });
    return;
  }

  let user = users.find((user) => user.email === email);

  if (user && user.type === 'new') {
    user.type = 'user';
  }
  if (!user) {
    user = createUser({ email, password });
    users.push(user);
  }
  if (user.password !== password) {
    response.status(200).json({
      errors: ['Неправильный пароль'],
    });
    return;
  }

  response.status(200).json({ user, users });
};

export default allowCors(handler);
