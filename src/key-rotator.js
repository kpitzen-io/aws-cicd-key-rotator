const AWS = require('aws-sdk');

async function rotateKeys(groupId, apiKey) {
    const deleteAwsKeys = await asyncDeleteOldKeys();
    const newAwsKeys = await asyncGetNewKeys();
    const accessKey = newAwsKeys.AccessKeyId;
    const secretKey = newAwsKeys.SecretAccessKey;

    console.log(accessKey, secretKey);

    const accessKeyRotate = await asyncSetNewGroupKey(
        groupId,
        'AWS_ACCESS_KEY',
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
        "accessKey": accessKeyRotate,
        "secretKey": secretKeyRotate
    }
}

const asyncGetNewKeys = () => new Promise((resolve, reject) => {
    const iam = new AWS.IAM({region: 'us-east-1'});
    const gitlabUserParams = {
        UserName: "GitLabServiceUser"
    }
    const newAccessKey = iam.createAccessKey(gitlabUserParams, (error, data) => {
        if (error) {
            reject(error);
        }
        resolve(data);
    });
});

const asyncSetNewGroupKey = (groupId, keyName, keyValue, apiKey) => {
    const getGroupVariableUrl = `https://gitlab.com/api/v4/groups/${groupId}/variables/${keyName}`

    const createGroupVariableUrl = `https://gitlab.com/api/v4/groups/${groupId}/variables`
    const createGroupVariablePayload = {
        method: "POST",
        value: keyValue,
        protected: true
    };

    const updateGroupVariableUrl = `https://gitlab.com/api/v4/groups/${groupId}/variables/${keyName}`
    const updateGroupVariablePayload = {
        method: "PUT",
        value: keyValue,
        protected: true
    };

    return new Promise((resolve, reject) => {
        fetch(getGroupVariableUrl).then(response => {
            fetch(updateGroupVariableUrl, updateGroupVariablePayload).then(response => {
                resolve(response)
            }).catch(error => {
                reject(error)
            });
        }).catch(error => {
            fetch(createGroupVariableUrl, createGroupVariablePayload).then(response => {
                resolve(response)
            }).catch(error => {
                reject(error)
            });
        });
    });
};

const asyncListAccessKeys = () => new Promise ((resolve, reject) => {
    const iam = new AWS.IAM({region: 'us-east-1'});
    const gitlabUserParams = {
        UserName: "GitLabServiceUser"
    };

    iam.listAccessKeys(gitlabUserParams, (err, data) => {
        if (err) {
            reject(err)
        } else {
            resolve(data.AccessKeyMetadata)
        };
    });
});

const asyncDeleteOldKeys = () => new Promise ((resolve, reject) => {
    const iam = new AWS.IAM({region: 'us-east-1'});
    var deletedKeys = [];
    asyncListAccessKeys().then(accessKeys => {
        accessKeys.map(accessKey => {
            const deleteKeyParams = {
                AccessKeyId: accessKey.AccessKeyId,
                UserName: "GitLabServiceUser"
            };
            iam.deleteAccessKey(deleteKeyParams, (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    deletedKeys.push(data);
                }
                resolve(data);
            });
        });
    }).catch(error => {
        reject(error)
    });

});


module.exports = {
    rotateKeys
}