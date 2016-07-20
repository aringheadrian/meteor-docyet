import './app_body.html';

import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';


Template.menu.events({
  'click #medical-profile'(e) {
    e.preventDefault();
    FlowRouter.go("/medical_profile");
  }
})