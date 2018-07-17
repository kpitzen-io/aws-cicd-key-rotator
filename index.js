const keyRotator = require('src/key-rotator');

const apiKey = process.env['API_KEY'];
const groupId = process.env['GROUP_ID'];
const awsUser = process.env['AWS_USER'];

const handler = () => {
    return keyRotator.rotateKeys(groupId, apiKey);
};

module.exports = {
    handler
};