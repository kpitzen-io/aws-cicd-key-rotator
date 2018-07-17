const keyRotator = require('key-rotator');

const apiKey = process.env["API_KEY"]
const groupId = process.env["GROUP_ID"]

const handler = (event, context) => {
    return keyRotator.rotateKeys(groupId, apiKey);
};

module.exports = {
    handler
}