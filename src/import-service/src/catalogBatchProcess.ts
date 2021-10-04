const BUCKET = process.env.BUCKET;
import { errorResponse, successResponse } from "./utils/apiResponseBuilder";
import AWS from "aws-sdk";

export const catalogBatchProcessHandler = () => async (event, context, callback) => {
    try {
        const sqs = new AWS.SQS();
        const users = JSON.parse(event.body);

        users.forEach(user => {
            sqs.sendMessage({
                QueueUrl: process.env.SQS_URL,
                MessageBody: user
            }, () => {
                console.log('Message for: ' + user);
            });
        });

        callback(null, {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        })
    } catch (error) {
        errorResponse(error);
    }
}

export const usersInvite = () => async (event) => {
    try {
        const users = event.Records.map(({ body }) => body);
        const sns = new AWS.SNS({ region: 'eu-west-1' });

        console.log(users);

    } catch (error) {
        errorResponse(error);
    }
}