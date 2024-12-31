let SystemPurposes;
let defaultSystemPurposeId;

if (process.env.PROJECT_ENV === 'cx-agi') {
    SystemPurposes = require('./data.cx-agi').SystemPurposes;
    defaultSystemPurposeId = require('./data.cx-agi').defaultSystemPurposeId;
} else if (process.env.PROJECT_ENV === 'home-agi') {
    SystemPurposes = require('./data.home-agi').SystemPurposes;
    defaultSystemPurposeId = require('./data.home-agi').defaultSystemPurposeId;
} else {
    throw new Error('Invalid PROJECT_ENV value. Please set the correct environment variable.');
}

export { SystemPurposes, defaultSystemPurposeId };