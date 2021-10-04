import csv from 'csv-parser';
import { winstonLogger } from "./utils/winstonLogger";

export const importFileParserHandler = ({
    s3
}) => async (event) => {
    winstonLogger.logRequest(`Start importFileParserHandler`);
    // winstonLogger.logRequest(`event.Records: ${JSON.stringify(event.Records)}`);

    event.Records.forEach(record => {
        const BUCKET = record.s3.bucket.name;
        const KEY = record.s3.object.key;

        const s3ReadStream = s3.getObject({
            Bucket: BUCKET,
            Key: KEY
        }).createReadStream();

        winstonLogger.logRequest(`Start s3ReadStream`);
        s3ReadStream
            .pipe(csv())
            .on('chunk', (chunk) => {
                winstonLogger.logRequest(`product parsed from csv: ${chunk}`);
            })
            .on('error', err => {
                winstonLogger.logError(`Failed: ${err}`);
            })
            .on('end', async () => {
                winstonLogger.logRequest(`Copy from ${BUCKET}/${KEY}`);
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

                winstonLogger.logRequest(`Copied into ${BUCKET}/${KEY.replace('uploaded', 'parsed')}`);
            });
    });
}
