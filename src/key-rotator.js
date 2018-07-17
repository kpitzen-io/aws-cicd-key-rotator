const AWS = require('aws-sdk');

const rotateKeys = (groupId, apiKey) => {

    keyRotatorPromise = new Promise ((resolve, reject) => {
        const deleteAwsKeys = asyncDeleteOldKeys();
        const newAwsKeys = asyncGetNewKeys();
        const accessKey = newAwsKeysAccessKey.AccessKeyId;
        const secretKey = newAwsKeysAccessKey.SecretAccessKey;
    
        const accessKeyRotate = asyncSetNewGroupKey(
            groupId,
            'AWS_ACCESS_KEY',
            accessKey,
            apiKey
        );
    
        const secretKeyRotate = asyncSetNewGroupKey(
            groupId,
            'AWS_SECRET_KEY',
            secretKey,
            apiKey
        );
        return {
            "accessKey": accessKeyRotate,
            "secretKey": secretKeyRotate
        }
    });
    return keyRotatorPromise.then(resolution => {
        return resolution
    }).catch(error => {
        throw error
    })
}

const asyncGetNewKeys = () => {
    const keyRotatorPromise = new Promise((resolve, reject) => {
        const iam = new AWS.IAM({region: 'us-east-1'});
        const gitlabUserParams = {
            UserName: "GitLabServiceUser"
        }
        const newAccessKey = iam.createAccessKey(gitlabUserParams, (error, data) => {
            if (error) {
                reject(error);
            }
            return data;
        });
    });
    return keyRotatorPromise;
};

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
    return oldAccessKeys;
});

const asyncDeleteOldKeys = async () => {
    const iam = new AWS.IAM({region: 'us-east-1'});

    const oldAccessKeys = await asyncListAccessKeys();

    const deleteAccessKeys = oldAccessKeys.map(accessKey => {
        const deleteKeyParams = {
            AccessKeyId: accessKey.AccessKeyId,
            UserName: "GitLabServiceUser"
        };
        iam.deleteAccessKey(deleteKeyParams, (err, data) => {
            if (err) {
                throw err
            } else {
                return data;
            }
        });
    });
}


module.exports = {
    rotateKeys
}