import mongoose from 'mongoose';

const bikeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  brand: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Sports', 'Scooter', 'Commuter', 'Cruiser', 'Adventure'],
    required: true
  },
  specs: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  features: [{
    type: String
  }],
  availability: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export const Bike = mongoose.model('Bike', bikeSchema);
