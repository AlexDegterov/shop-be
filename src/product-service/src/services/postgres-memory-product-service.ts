import { ProductServiceInterface, ProductInterface } from './products';
import { Client, QueryConfig } from 'pg';

class PostgresProductService implements ProductServiceInterface {

    private tableName = 'products';

    constructor(private databaseClient: Client){}

    async getProductById(id: string): Promise<ProductInterface> {

        const query = {
            text: `SELECT * FROM ${this.tableName} WHERE id = $1`,
            values: [id],
        } as QueryConfig;

        const result = await  this.databaseClient.query(query);
        return result.rows[0] ? result.rows[0] : null;
    }

    async getProductsList(): Promise<ProductInterface[]> {
        const query = {
            text: `SELECT * FROM ${this.tableName}`,
        } as QueryConfig;

        const result = await this.databaseClient.query(query);
        return result.rows ? result.rows : null;
    }

    async create(product: Pick<ProductInterface, 'title' | 'description' | 'price' | 'logo'>) {
        let { title, description, price, logo } = product;
        const query = {
            text: `INSERT INTO ${this.tableName}(title, description, price, logo) VALUES($1, $2, $3, $4) RETURNING *`,
            values: [title, description, price, logo],
        };
        const result = await this.databaseClient.query(query);
        return result.rows[0] ? result.rows[0] : null;
    }
}

export { PostgresProductService };