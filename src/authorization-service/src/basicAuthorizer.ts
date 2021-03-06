
export const basicAuthorizerHandler = () => async (event, ctx, cb) => {
    try {
        console.log('Event', JSON.stringify(event));
        console.log('process.env.NAME', process.env.NAME);
        console.log('process.env.PASSWORD', process.env.PASSWORD);
        if (event['type'] != 'TOKEN') {
            cb('Unauthorized');
        }
        
        const NAME = process.env.NAME;
        const PASSWORD = process.env.PASSWORD;
        const authorizationToken = event.authorizationToken;
        const encodedCreds = authorizationToken.split(' ')[1];
        const buff = Buffer.from(encodedCreds, 'base64');
        const plainCreds = buff.toString('utf-8').split(':');
        const username = plainCreds[0];
        const password = plainCreds[1];

        console.log(`username: ${username} and password: ${password}`);

        const effect = (NAME == username && PASSWORD == password) ? 'Allow' : 'Deny';
        console.log('effect', effect);

        const policy = generatorPolicy(encodedCreds, event.methodArn, effect);
        console.log(JSON.stringify(policy));
        cb(null, policy);

    } catch (error) {
        cb(`Unauthorized: ${error.message}`);
        // errorResponse(error);
    }
}

const generatorPolicy = (principalId, resource, effect = 'Allow') => {
    return { 
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: "execute-api:Invoke",
                    Effect: effect,
                    Resource: resource
                }
            ]
        }
    }
}
