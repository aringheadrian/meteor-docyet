import './app_body.html';

import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import mstranslator from 'mstranslator';
console.log(client = new mstranslator({
  //"b4f3e006-dd25-48af-8105-ffb29a77138f"
  client_id: "DOCYET",
  client_secret: "dHLxUoTzbQBsaJ7B5pBmtV4a/X/ToRqjiZgd8KajywM="
}));

var params = {
  text: 'How\'s it going?'
  , from: 'en'
  , to: 'es'
};

// Don't worry about access token, it will be auto-generated if needed.
client.translate(params, function(err, data) {
  console.log(data);
});

Template.menu.events({
  'click #medical-profile'(e) {
    e.preventDefault();
    FlowRouter.go("/medical_profile");
  }
})