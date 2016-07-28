// Router and rendering packages
import { FlowRouter } from 'meteor/kadira:flow-router'
import { BlazeLayout } from 'meteor/kadira:blaze-layout'

// Template loading
import '../../ui/layouts/app_body.js'
import '../../ui/components/medical_profile.js'
import '../../ui/components/symptom_checker.js'

FlowRouter.route('/', {
  name: 'App.home',
  action() {
    BlazeLayout.render('AppBody',{ top: "header", main: "menu" })
  }
});

FlowRouter.route('/medical_profile', {
  name: 'App.medicalProfile',
  action() {
    BlazeLayout.render('AppBody', {top: 'header', main: 'MedicalProfile' })
  }
})

FlowRouter.route('/symptom_checker', {
  name: 'App.symptomChecker',
  action() {
    BlazeLayout.render('AppBody', {top: 'header', main: 'SymptomChecker' })
  }
})