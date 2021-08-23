import * as handlers from './src';
import { Client } from 'pg';
import { PostgresProductService } from './src/services/postgres-memory-product-service';
import { InMemoryProductService } from './src/services/in-memory-product-service';

console.log(process.env);

const databaseClient = new Client();
databaseClient.connect();
const productService = new InMemoryProductService();
// const productService = new PostgresProductService(databaseClient)

export const getProductById = handlers.getProductByIdHandler(productService);
export const getProductsList = handlers.getProductsListHandler(productService);
export const createProduct = handlers.createProductHandler(productService);
