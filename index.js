import rotateKeys from 'src/key-rotator';

const apiKey = process.env["API_KEY"]
const groupId = process.env["GROUP_ID"]

export default handler = (event, context) => {
    return new Promise((resolve, reject) => {
        return rotateKeys(groupId, apiKey)
    });
};