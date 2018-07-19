const keyRotator = require('src/gitlab-aws-key-rotator');

const handler = (event) => {
    const apiKey = event.apiKey;
    const groupId = event.groupId;
    const awsUser = event.awsUser;    
    return keyRotator.rotateKeys(groupId, apiKey, awsUser);
};

module.exports = {
    handler
};