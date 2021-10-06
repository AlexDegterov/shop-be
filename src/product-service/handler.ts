import * as handlers from './src/handlers';
import { Client } from 'pg';
import { PostgresProductService } from './src/services/postgres-memory-product-service';

const databaseClient = new Client();
databaseClient.connect();
const productService = new PostgresProductService(databaseClient);

export const getProductById = handlers.getProductByIdHandler(productService);
export const getProductsList = handlers.getProductsListHandler(productService);
export const createProduct = handlers.createProductHandler(productService);
export const catalogBatchProcess = handlers.catalogBatchProcessHandler(productService);
