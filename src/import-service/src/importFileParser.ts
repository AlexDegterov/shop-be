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
                    logger.logRequest(`product parsed from csv: ${data}`);
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

                    console.log(`Copied`)

                    await s3.deleteObject({
                        Bucket: BUCKET,
                        Key: KEY
                    }).promise();
                    console.log('File deleted');

                    logger.logRequest(`Copied into ${BUCKET}/${KEY.replace('uploaded', 'parsed')}`);
                })
        )

        results.map(item => {
            sqs.sendMessage({
              QueueUrl: process.env.SQS_URL,
              MessageBody: JSON.stringify(item),
            }, (error, data) => {
              if (error) {
                logger.log(`Error for send to SQS: ${error}`);
              } else {
                logger.log(`Message was sent to SQS: ${data}`);
              }
            })
          })
    };
}
