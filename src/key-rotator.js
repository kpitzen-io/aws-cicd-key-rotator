import * as AWS from 'aws-sdk';

export default (groupId, apiKey) => {

    keyRotatorPromise = new Promise ((resolve, reject) => {
        const newAwsKeys = await asyncGetNewKeys(groupId);
        const accessKey = newAwsKeysAccessKey.AccessKeyId;
        const secretKey = newAwsKeysAccessKey.SecretAccessKey;
    
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
    });
    return keyRotatorPromise.then(resolution => {
        return resolution
    }).catch(error => {
        throw error
    })
}

const asyncGetNewKeys = (groupId) => {
    const keyRotatorPromise = new Promise((resolve, reject) => {
        const iam = AWS.IAM({region: 'us-east-1'});
        const gitlabUserParams = {
            UserName: "GitLabServiceUser"
        }
        newAccessKey = await iam.createAccessKey(gitlabUserParams, (error, data) => {
            if (error) {
                reject(error);
            }
            return data;
        });
    return keyRotatorPromise;
    });
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