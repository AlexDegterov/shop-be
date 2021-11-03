import { ProductServiceInterface, ProductInterface } from './products';
import { Client, QueryConfig } from 'pg';

class PostgresProductService implements ProductServiceInterface {

    private tableName = 'products';
    private tableNameStocks = 'stocks';

    constructor(private databaseClient: Client){}

    async getProductById(id: string): Promise<ProductInterface> {

        const query = {
            text: `SELECT * FROM ${this.tableName} AS p LEFT JOIN ${this.tableNameStocks} AS s ON (s.product_id = p.id) WHERE id = $1`,
            values: [id],
        } as QueryConfig;

        const result = await  this.databaseClient.query(query);
        return result.rows[0] ? result.rows[0] : null;
    }

    async getProductsList(): Promise<ProductInterface[]> {
        const query = {
            text: `SELECT * FROM ${this.tableName} AS p LEFT JOIN ${this.tableNameStocks} AS s ON (s.product_id = p.id)`,
        } as QueryConfig;

        const result = await this.databaseClient.query(query);
        return result.rows ? result.rows : null;
    }

    async create(product: Pick<ProductInterface, 'title' | 'description' | 'price' | 'logo' | 'count'>) {
        let { title, description, price, logo, count } = product;
        const query = {
            text: `INSERT INTO ${this.tableName}(title, description, price, logo) VALUES($1, $2, $3, $4) RETURNING *`,
            values: [title, description, price, logo],
        };
        const result = await this.databaseClient.query(query);
        if (result.rows[0]){
            const query2 = {
                text: `INSERT INTO ${this.tableNameStocks}(product_id, count) VALUES($1, $2) RETURNING *`,
                values: [result.rows[0]['id'], count],
            };
            await this.databaseClient.query(query2);
        }
        return result.rows[0] ? result.rows[0] : null;
    }
}

export { PostgresProductService };