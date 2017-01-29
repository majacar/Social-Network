/**
 * Module for sending mails
 * @type {exports}
 */

var sendgrid = require('sendgrid')(process.env.SENDGRID_KEY);

var templates = [
  {
    name: 'forgot-password',
    id: '80f5a606-5805-4ce9-adde-a7583cb5b819',
    from_mail: 'no-reply@social_network.com',
    fromname: 'Social Network',
    subject: 'Create your new Social Network password',
  }
];

function sendMail(address, subject, subParams, templateName, cb) {
  var email = new sendgrid.Email();
  email.to = address;

  for (var i = 0; i < subParams.length; i++) {
    email.addSubstitution(subParams[i][0], subParams[i][1]);
  }

  // Set template id
  for (var j = 0; j < templates.length; j++) {
    if (templateName == templates[j].name) {
      email.setFilters({
        templates: {
          settings: {
            enabled: 1,
            template_id: templates[j].id,
          },
        },
      });
      email.from = templates[j].from_mail;
      email.fromname = templates[j].fromname;
      email.subject = templates[j].subject;      
    }
  }

  email.html = '<h2></h2>';
  email.text = '';

  sendgrid.send(email, function (err, result) {
    if (err) {
      utils.logError('regular', err);
      console.log('Error sending mails: ', err);
      return cb(err);
    } else {
      return cb(null, result);
    }
  });
}

exports.sendMail = sendMail;
