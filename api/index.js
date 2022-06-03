const allowCors = (app) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  console.log('request')

  if (req.method === 'OPTIONS') {
    console.log('OPTIONS', res.headers);
    res.status(200).json({ body: 'OK' });
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
//   createUser({
//     email: 'admin@tube.io',
//     password: 'hentai/NINJA',
//     isAdmin: true,
//   }),
  createUser({
    email: 'bqe3jnu2rdn@rambler.ru',
    password: 'anp@BQE3jnu2rdn!wtp',
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

  if (action === 'setName') {
    let user = users.find((user) => Number(userParams.id) === Number(user.id));
    user.name = userParams.name;
    response.status(200).json({ user });
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
  if (user.password !== userParams.password) {
    response.status(200).json({
      errors: ['Неправильный пароль'],
    });
    return;
  }

  response.status(200).json({ user });
};

export default allowCors(handler);
