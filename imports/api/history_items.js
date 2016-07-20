import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

// Simple Schema validation
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { client } from './translator.js'

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
  },
  translation: {
    type: String,
    optional: true
  }
});

HistoryItems.attachSchema(HistoryItems.schema)


//client = new mstranslator({
  //"b4f3e006-dd25-48af-8105-ffb29a77138f"
  //client_id: "DOCYET",
  //client_secret: "dHLxUoTzbQBsaJ7B5pBmtV4a/X/ToRqjiZgd8KajywM="
//}, true);

if (Meteor.isServer) {
  Meteor.methods({
    'HistoryItems.translate'(params) {
      console.log("Calling ALL Jan Michael Vincents!")
      check(params.id, String);
      check(params.text, String);
      check(params.from, String);
      check(params.to, String);

      client.translate(params, Meteor.bindEnvironment(function(err,data) {
        HistoryItems.update(params.id, {$set: {translation: data}})
      }));

    },
    'HistoryItems.insert'(doc, params) {
      client.translate(params, Meteor.bindEnvironment(function(err,data) {
        HistoryItems.insert({
          text: doc.text,
          createdAt: new Date(),
          owner: doc.owner,
          category: doc.category,
          username: doc.username,
          translation: data
        });
      }));

    }


  })
}
