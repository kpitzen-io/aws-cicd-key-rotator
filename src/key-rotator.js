const AWS = require('aws-sdk');
const fetch = require('node-fetch');

async function rotateKeys(groupId, apiKey, awsUser) {
    const deleteAwsKeys = await asyncDeleteOldKeys(awsUser);
    const newAwsKeys = await asyncGetNewKeys(awsUser);
    const accessKey = newAwsKeys.AccessKeyId;
    const secretKey = newAwsKeys.SecretAccessKey;

    const accessKeyRotate = await asyncSetNewGroupKey(
        groupId,
        'AWS_ACCESS_KEY_ID',
        accessKey,
        apiKey
    );

    const secretKeyRotate = await asyncSetNewGroupKey(
        groupId,
        'AWS_SECRET_KEY',
        secretKey,
        apiKey
    );
    return {
        'accessKey': accessKeyRotate,
        'accessKeySet': accessKeyRotate === accessKey,
        'secretKey': secretKeyRotate,
        'secretKeySet': secretKeyRotate === secretKey
    };
}

const asyncGetNewKeys = (awsUser) => new Promise((resolve, reject) => {
    const iam = new AWS.IAM({region: 'us-east-1'});
    const gitlabUserParams = {
        UserName: awsUser
    };
    const newAccessKey = iam.createAccessKey(gitlabUserParams, (error, data) => {
        if (error) {
            reject(error);
        }
        resolve(data.AccessKey);
    });
});

const asyncSetNewGroupKey = (groupId, keyName, keyValue, apiKey) => {
    const getGroupVariableUrl = `https://gitlab.com/api/v4/groups/${groupId}/variables/${keyName}`;

    const createGroupVariableUrl = `https://gitlab.com/api/v4/groups/${groupId}/variables`;
    const createGroupVariablePayload = {
        method: 'POST',
        body: JSON.stringify({
            value: keyValue,
            protected: false,
        }),
        headers: JSON.stringify({
            'PRIVATE-TOKEN': apiKey,
            'Content-Type': 'application/json'
        })
    };

    const updateGroupVariableUrl = `https://gitlab.com/api/v4/groups/${groupId}/variables/${keyName}`;
    const updateGroupVariablePayload = {
        method: 'PUT',
        body: JSON.stringify({
            value: keyValue,
            protected: false,
        }),
        headers: JSON.stringify({
            'PRIVATE-TOKEN': apiKey,
            'Content-Type': 'application/json'
        })
    };

    return new Promise((resolve, reject) => {
        fetch(getGroupVariableUrl).then(response => {
            fetch(updateGroupVariableUrl, updateGroupVariablePayload).then(response => {
                response.json().then(json => {
                    resolve(json);
                })
            }).catch(error => {
                reject(error);
            });
        }).catch(error => {
            fetch(createGroupVariableUrl, createGroupVariablePayload).then(response => {
                response.json().then(json => {
                    resolve(json);
                })
            }).catch(error => {
                reject(error);
            });
        });
    });
};

const asyncListAccessKeys = (awsUser) => new Promise ((resolve, reject) => {
    const iam = new AWS.IAM({region: 'us-east-1'});
    const gitlabUserParams = {
        UserName: awsUser
    };

    iam.listAccessKeys(gitlabUserParams, (err, data) => {
        if (err) {
            reject(err);
        } else {
            resolve(data.AccessKeyMetadata);
        }
    });
});

const asyncDeleteOldKeys = (awsUser) => new Promise ((resolve, reject) => {
    const iam = new AWS.IAM({region: 'us-east-1'});
    var deletedKeys = [];
    asyncListAccessKeys(awsUser).then(accessKeys => {
        accessKeys.map(accessKey => {
            const deleteKeyParams = {
                AccessKeyId: accessKey.AccessKeyId,
                UserName: awsUser
            };
            iam.deleteAccessKey(deleteKeyParams, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    deletedKeys.push(data);
                }
                resolve(data);
            });
        });
    }).catch(error => {
        reject(error);
    });

});


module.exports = {
    rotateKeys
};