Free Code Camp voting app project

Created using Express.  Database using Mongodb/Mongoose.  Oath2 access for users of Github and Google using Passport. Charts with Chartjs.







---------------------

todos (only bullet point items still waiting for completion)

//login logout jquery functionality
//user id database integration
//* voting functionality
//* voting front end/js file
//* voting api routes
//* make sure database structure for voting is working and user id + vote OK
//* need to add create addl poll option for logged in users
//* function to check if voted on a poll already
//* display function to highlight the user choice when displaying polls--this needs to be accessible to the index and the profile pages. There are possibly other display functions that could be for both.  ID these.
//then refactoring
//* change display of addl option form--eliminate flash
//* work on css/display/color etc
//* change index to include pagination of poll list 
//* --also need to change datastore function for above change
//* delete option for polls created on profile

//* add sharing interface on profile--button done--wire in route tested in other app.
//* ?possible to pull out some controller display functions/language esp that are common between multiple views? -?stl

//* maybe also check for gmail oauth 2 and set up other use case for those users.  (this is a bit tricky, forego for now)

//possibly stats/pie chart with total votes for each created poll on profile--could put in same canvas--onload--then destroy for detail of each view.  link to get back?--can just refresh page.. -e/m
//* add responsive # of options on create -e

* datastore improvement to possibly eliminate data functions and change mongoose query to return only relevant fields. -e
* ?passport? -h
* responsive design issue-chart at end of list.  Push/pull and/or flex-first not working for putting chart at beginning when on small display (window resized to phone dimensions) but also on right on med to large display



