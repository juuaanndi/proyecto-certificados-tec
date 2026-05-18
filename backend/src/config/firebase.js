const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require('./firebase-credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;