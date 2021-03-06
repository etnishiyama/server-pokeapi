import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

const pokemonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  pokeNumber: {
    type: Number,
    unique: true,
  },
  weight: {
    type: Number,
  },
  picture: {
    type: String,
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  stats: {
    speed: {
      type: Number,
    },
    attack: {
      type: Number,
    },
    defense: {
      type: Number,
    },
    hp: {
      type: Number,
    },
    specialDefense: {
      type: Number,
    },
    specialAttack: {
      type: Number,
    },
  },
  types: [{
    type: String,
  }],
}, {
  timestamps: true,
});

pokemonSchema.plugin(mongoosePaginate);

export default mongoose.model('Pokemon', pokemonSchema);
