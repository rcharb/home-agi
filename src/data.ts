let SystemPurposes;

if (process.env.PROJECT_ENV === 'cx-agi') {
  SystemPurposes = require('./data.cx-agi').SystemPurposes;
} else if (process.env.PROJECT_ENV === 'home-agi') {
  SystemPurposes = require('./data.home-agi').SystemPurposes;
} else {
  throw new Error('Invalid PROJECT_ENV value. Please set the correct environment variable.');
}

export { SystemPurposes };