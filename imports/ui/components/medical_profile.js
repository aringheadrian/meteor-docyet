import { Template } from 'meteor/templating';

import { HistoryItems } from '../../api/history_items.js';

import './medical_profile.html';


  //"b4f3e006-dd25-48af-8105-ffb29a77138f"

Template.MedicalCategory.helpers({
  historyItems() {
    return HistoryItems.find();
  },
});

Template.MedicalCategory.events({
  'submit .new-item'(e) {
    e.preventDefault();

    const text = e.target.text.value;
    const category = e.target.category.value;

    HistoryItems.insert({
      text,
      createdAt: new Date(), // current time
      owner: Meteor.userId(),
      category: category,
      username: Meteor.user().username
    });

    e.target.text.value='';
  },
  'click .delete'(e) {
    HistoryItems.remove(this._id);
  },

})

Template.historyItem.helpers({
  belongsTo() {
    return Template.parentData(1).category == this.category;
  }
})

