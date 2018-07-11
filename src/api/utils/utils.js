function handleUserNames(user) {
  const newUser = user;

  if (user.firstName && user.lastName && !user.name) {
    newUser.name = `${user.firstName} ${user.lastName}`;
  } else if (user.name && !user.firstName && !user.lastName) {
    const names = user.name.split(' ');
    const [first] = names;
    newUser.firstName = first;
    names.splice(0, 1);
    newUser.lastName = names.length > 0 ? names.join(' ') : '';
  }

  return newUser;
}

function getRandomNumber(min, max) {
  const num = (Math.random() * (max - min)) + min;
  return num.toFixed(2);
}

export {
  handleUserNames,
  getRandomNumber,
};
