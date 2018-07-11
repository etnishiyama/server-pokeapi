import User from '../../api/models/user';
import { generateToken } from '../utils/auth';
import patchUpdates from '../utils/mongoHelper';
import { NotAuthorizedError } from '../errors/knownErrors';
import { handleUserNames } from '../utils/utils';
import {
  handleEntityNotFound,
  handleError,
  respondWithDeletedMessage,
  respondWithResult,
} from '../utils/requestHelpers';

// Gets a list of users
export function getUserList(req, res) {
  const pageNumber = req.swagger.params.page.value || 1;
  return User.paginate({}, { page: pageNumber })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a specific User by id
export function getUserById(req, res) {
  return User.findById(req.swagger.params.id.value)
    .then(handleEntityNotFound())
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a User
export function postUserCreate(req, res) {
  const user = handleUserNames(req.body);

  return User.create(user)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// User authentication
export function postUserAuthenticate(req, res) {
  const reqPassword = req.body.password;
  const reqUsername = req.body.username;

  return User.findOne({ username: reqUsername })
    .then((userResult) => {
      if (userResult && userResult.comparePassword(reqPassword)) {
        const token = generateToken(userResult);
        const rtoken = generateToken(userResult);
        const response = {
          _id: userResult._id,
          token,
          rtoken,
          role: userResult.role,
          name: userResult.name,
          username: userResult.username,
          firstName: userResult.firstName,
          lastName: userResult.lastName,
          email: userResult.email,
        };
        return Promise.resolve(response);
      }
      return Promise.reject(new NotAuthorizedError());
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// upsert(put) a specific User
export function putUserUpsert(req, res) {
  const query = { _id: req.swagger.params.id.value };
  const queryOptions = { new: true };
  const updateUser = req.body;

  return User.findOneAndUpdate(query, updateUser, queryOptions)
    .then(respondWithResult(res, 200))
    .catch(handleError(res));
}

// patch a specific User
export function patchUpdateUser(req, res) {
  return User.findById(req.swagger.params.id.value).exec()
    .then(handleEntityNotFound())
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// destroy a specific User
export function deleteUserRemove(req, res) {
  return User.findById(req.swagger.params.id.value).exec()
    .then(handleEntityNotFound())
    .then(entity => entity.remove())
    .then(respondWithDeletedMessage(res))
    .catch(handleError(res));
}
