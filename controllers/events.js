'use strict';

var events = require('../models/events');
var validator = require('validator');

// Date data that would be useful to you
// completing the project These data are not
// used a first.
//
var allowedDateInfo = {
  months: {
    0: 'January',
    1: 'February',
    2: 'March',
    3: 'April',
    4: 'May',
    5: 'June',
    6: 'July',
    7: 'August',
    8: 'September',
    9: 'October',
    10: 'November',
    11: 'December'
  },
  minutes: [0, 30],
  hours: [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
  ]
};

/**
 * Controller that renders a list of events in HTML.
 */
function listEvents(request, response) {
  var currentTime = new Date();
  var contextData = {
    'events': events.all,
    'time': currentTime
  };
  response.render('event.html', contextData);
}

// function goToEvent(request, response, next){
//   var id = request.params.id;
//   response.send("hello, event number " + id);
// }

/**
 * Controller that renders a page for creating new events.
 */
function newEvent(request, response){
  var contextData = {months:['January',
                              'February',
                              'March',
                              'April',
                              'May',
                              'June',
                              'July',
                              'August',
                              'September',
                              'October',
                              'November',
                              'December']};
  response.render('create-event.html', contextData);
}

function checkIntRange(request, fieldName, minVal, maxVal, contextData){
 var value = null; 
 if (validator.isInt(request.body[fieldName]) === false) {
    contextData.errors.push('Your '+ fieldName +' should be an integer.');
  }else{
  value = parseInt(request.body[fieldName], 10);
    if (value > maxVal || value < minVal) {
      contextData.errors.push('Your ' + fieldName +' should be somewhere from ' + minVal + '-' + maxVal );
    } 
  }
return value;
}
/**
 * Controller to which new events are submitted.
 * Validates the form and adds the new event to
 * our global list of events.
 */
function saveEvent(request, response){
  var contextData = {errors: [],months:['January',
                              'February',
                              'March',
                              'April',
                              'May',
                              'June',
                              'July',
                              'August',
                              'September',
                              'October',
                              'November',
                              'December']};

  if (validator.isLength(request.body.title, 1, 49) === false) {
    contextData.errors.push('Your title should be greater than 0 and less than 50 letters.');
  }
  if (validator.isLength(request.body.location, 1, 49) === false) {
    contextData.errors.push('Your location should be between greater than 0 and less than 50 letters.');
  }

  var year = checkIntRange(request, 'year', 2015, 2016, contextData);
  var month = checkIntRange(request, 'month', 0, 11, contextData);
  var day = checkIntRange(request, 'day', 1, 31, contextData);
  var hour = checkIntRange(request, 'hour', 0, 23, contextData);
  var minute = checkIntRange(request, 'minute', 0, 59, contextData);

  if (validator.isURL(request.body.image) === false) {
    contextData.errors.push('This image is not a URL');
  }
  if (!validator.matches(request.body.image, /.png$/) && !validator.matches(request.body.image,/.gif$/)) {
      contextData.errors.push('Your URL should be a gif or png');
  }
   if (!validator.matches(request.body.image, /^https:\/{2}/) && !validator.matches(request.body.image,/^http:\/{2}/ ) ) {
      contextData.errors.push('Your URL should begin with http:// or https://');
  }
  
  
  if (contextData.errors.length === 0) {
	var id = events.all[events.all.length-1].id + 1;
	// var id = events.all.length;
	
    var newEvent = {
      id: id,
      title: request.body.title,
      location: request.body.location,
      image: request.body.image,
      date: new Date(year, month, day, hour, minute),
      attending: []
    };
    events.all.push(newEvent);
    
    // console.log(events);
    response.redirect('/events/'+id.toString());
  }else{
    response.render('create-event.html', contextData);
  }
}

function eventDetail (request, response) {
  var ev = events.getById(parseInt(request.params.id));
  if (ev === null) {
    response.status(404).send('No such event');
  }
  response.render('event-detail.html', {event: ev});
}

function rsvp (request, response){
  var ev = events.getById(parseInt(request.params.id));

  if (ev === null) {
    response.status(404).send('No such event');
  }
  if(validator.isEmail(request.body.email)  && validator.matches(request.body.email, /@yale.edu$/i )){
    ev.attending.push(request.body.email);
    response.redirect('/events/' + ev.id);
  }else{
    var contextData = {errors: [], event: ev};
    contextData.errors.push('Invalid email: Must be valid email, ending in yale.edu');
    response.render('event-detail.html', contextData);    
  }

}

function api(request, response){
  var output = {events: []};
  var search = request.query.search;
  
  if(search){
    for(var i = 0; i < events.all.length; i++){
      if(events.all[i].title.indexOf(search) !== -1){
       output.events.push(events.all[i]);
      }  
    }
  }else{
    output.events = events.all;
  }
  response.json(output);
}

function donate(request, response){
	var contextData = {};
	response.render('donation.html', contextData); 
}

/**
 * Export all our functions (controllers in this case, because they
 * handles requests and render responses).
 */
module.exports = {
  'listEvents': listEvents,
  'eventDetail': eventDetail,
  'newEvent': newEvent,
  'saveEvent': saveEvent,
  'rsvp': rsvp,
  'api': api,
  'donate': donate
};