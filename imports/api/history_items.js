import { Mongo } from 'meteor/mongo';

// Simple Schema validation
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// Mongo Collection
export const HistoryItems = new Mongo.Collection('HistoryItems');

HistoryItems.schema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  text: {
    type: String,
    min: 4
  },
  category: {
    type: String
  },
  createdAt: {
    type: Date,
  },
  owner: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  username: {
    type: String
  }
});

HistoryItems.attachSchema(HistoryItems.schema)