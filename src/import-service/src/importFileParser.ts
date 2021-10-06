import csv from 'csv-parser';
import stream from 'stream';
import util from 'util';

const BUCKET = process.env.BUCKET;
const finished = util.promisify(stream.finished);

export const importFileParserHandler = ({
    s3,
    sqs,
    logger
}) => async (event) => {
    logger.logRequest(`Start importFileParserHandler`);

    for (const record of event.Records) {
        const KEY = record.s3.object.key;
        const results = [];

        const s3ReadStream = s3.getObject({
            Bucket: BUCKET,
            Key: KEY
        }).createReadStream();

        logger.logRequest(`Start s3ReadStream`);
        await finished(
            s3ReadStream
                .pipe(csv())
                .on('data', (data) => {
                    logger.logRequest(`product parsed from csv: ${JSON.stringify(data)}`);
                    results.push(data);
                   })
                .on('error', err => {
                    logger.logError(`Failed: ${err}`);
                })
                .on('end', async () => {
                    logger.logRequest(`Copy from ${BUCKET}/${KEY}`);

                    await s3.copyObject({
                        Bucket: BUCKET,
                        CopySource: `${BUCKET}/${KEY}`,
                        Key: KEY.replace('uploaded', 'parsed')
                    }).promise();

                    logger.logRequest(`Copied to folder "parsed" to ${KEY.replace('uploaded', 'parsed')}`)

                    await s3.deleteObject({
                        Bucket: BUCKET,
                        Key: KEY
                    }).promise();
                    logger.logRequest('File deleted');
                    logger.logRequest(`Copied into ${BUCKET}/${KEY.replace('uploaded', 'parsed')}`);
                })
        )

        for (const item of results) {
            logger.logRequest(`item: ${JSON.stringify(item)}`);
            await sqs.sendMessage({
              QueueUrl: process.env.SQSURL,
              MessageBody: JSON.stringify(item),
            }, (error, data) => {
              if (error) {
                logger.logRequest(`Error for send to SQS: ${error}`);
              } else {
                logger.logRequest(`Message was sent to SQS: ${JSON.stringify(data)}`);
              }
            }).promise();
        }
    };
}
