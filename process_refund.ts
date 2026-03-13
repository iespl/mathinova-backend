
import { AdminService } from './src/services/adminService';
import dotenv from 'dotenv';
dotenv.config();

const ADMIN_ID = 'de5273d6-0108-4353-95ea-249e05a0519a'; // Rajan
const PAYMENT_ID = '3977a622-9607-4750-b275-d48dd7e40a29';
const REASON = 'Manual refund request via Agent';

async function main() {
    console.log(`Processing refund for Payment: ${PAYMENT_ID}`);
    try {
        console.log('Initiating refund transaction...');
        const result = await AdminService.refundPayment(ADMIN_ID, PAYMENT_ID, REASON);
        console.log('Refund Transaction Complete.');
        console.log('Refund Successful!');
        console.log(JSON.stringify(result, null, 2));
    } catch (error: any) {
        console.error('Refund Failed:', error.message);
    }
}

main();
