import axios from 'axios';

export interface Product {
    id: number;
    name: string;
    description: string;
    price: string; // Use string to handle DecimalField
    stock: number;
    image?: string; // Optional image field
}

// URL for your products API endpoint
const API_URL = 'http://localhost:8000/api/products/';

export const getProducts = async (): Promise<Product[]> => {
    try {
        const response = await axios.get<Product[]>(API_URL);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return [];
    }
};

// New function to fetch a single product by ID
export const getProductById = async (id: number): Promise<Product | null> => {
    try {
        const response = await axios.get<Product>(`${API_URL}${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch product with ID ${id}:`, error);
        return null;
    }
};