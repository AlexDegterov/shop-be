import { ProductServiceInterface } from "./services/products";
import { winstonLogger } from "./utils/winstonLogger";
import { errorResponse, successResponse } from "./utils/apiResponseBuilder";

export const getAllProductsHandler = (productService: ProductServiceInterface) => async (event, _context) => {
    try {
        winstonLogger.logRequest(`Incoming event: ${ JSON.stringify( event ) }`);

        const products = await productService.getAllProducts();

        winstonLogger.logRequest(`"Received products: ${ JSON.stringify( products ) }`);

        return successResponse( products );
    } 
    catch (err) {
        return errorResponse( err );
    }
}
