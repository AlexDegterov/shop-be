import AWS from 'aws-sdk';
import * as handlers from './src';

const s3 = new AWS.S3({ region: 'eu-west-1', signatureVersion: 'v4' });

export const importFileParser = handlers.importFileParserHandler({
    s3,
});

export const importProductsFile = handlers.importProductsFileHandler({
    s3,
});

export const catalogBatchProcess = handlers.catalogBatchProcessHandler();
