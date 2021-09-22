import AWS from 'aws-sdk';
import * as handlers from './src';
import { winstonLogger as logger } from './src/utils/winstonLogger';

const s3 = new AWS.S3({ region: 'eu-west-1' });

export const importFileParser = handlers.importFileParserHandler({
    s3,
    logger,
});

export const importProductsFile = handlers.importProductsFileHandler({
    s3,
});
