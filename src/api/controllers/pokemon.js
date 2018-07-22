import * as jsonpatch from 'fast-json-patch';
import Pokemon from '../models/pokemon';
import User from '../models/user';
import patchUpdates from '../utils/mongoHelper';
import {
  handleEntityNotFound,
  handleError,
  respondWithDeletedMessage,
  respondWithResult,
} from '../utils/requestHelpers';
import constants from '../utils/constants';
import imageHelper from '../utils/imageHelper';

// Gets a list of Pokemons
export function getPokemonList(req, res) {
  const userRole = req.auth.role;
  const userId = req.auth._id;
  const queryOptions = { page: req.swagger.params.page.value || 1 };

  const queryPromise = userRole === constants.ROLE_USER ?
    User.findById(userId).select('pokemons').populate('pokemons') : Pokemon.paginate({}, queryOptions);

  return queryPromise
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a specific Pokemon by id
export function getPokemonById(req, res) {
  const id = req.swagger.params.id.value;
  const query = id.length > 4 ? { _id: id } : { pokeNumber: id };
  return Pokemon.findOne(query).exec()
    .then(handleEntityNotFound())
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a Pokemon
export function postPokemonCreate(req, res) {
  const newPokemon = req.body;
  return imageHelper.uploadImage(constants.PATH_POKEMON_PICTURE, newPokemon.picture)
    .then((url) => {
      newPokemon.picture = url;
      return Pokemon.create(newPokemon);
    })
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

export function postPokemonCaptureById(req, res) {
  const userId = req.auth._id;
  const pokemonId = req.swagger.params.id.value;

  const queryUser = {
    $and: [{ _id: userId },
      { pokemons: { $ne: pokemonId } }],
  };

  const updateQuery = { $push: { pokemons: pokemonId } };

  User.update(queryUser, updateQuery)
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// upsert(put) a specific Pokemon
export function putPokemonUpsert(req, res) {
  const updatePokemon = req.body;
  const query = { _id: req.swagger.params.id.value };
  const queryOptions = { new: true };

  return new Promise((resolve) => {
    if (updatePokemon.logo.length > 100) {
      return resolve(imageHelper.uploadImage(
        constants.PATH_POKEMON_PICTURE,
        updatePokemon.picture,
      ));
    }
    return resolve(updatePokemon.picture);
  })
    .then((url) => {
      updatePokemon.picture = url;
      return Pokemon.findOneAndUpdate(query, updatePokemon, queryOptions);
    })
    .then(respondWithResult(res, 200))
    .catch(handleError(res));
}

// patch a specific Pokemon
export function patchPokemonUpdate(req, res) {
  return Pokemon.findById(req.swagger.params.id.value).exec()
    .then(handleEntityNotFound())
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// destroy a specific Pokemon
export function deletePokemonRemove(req, res) {
  return Pokemon.findById(req.swagger.params.id.value).exec()
    .then(handleEntityNotFound())
    .then(entity => entity.remove())
    .then(respondWithDeletedMessage(res))
    .catch(handleError(res));
}
