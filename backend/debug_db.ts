import mongoose from 'mongoose';
import { User } from './src/models/User';
import { Tenant } from './src/models/Tenant';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const checkDb = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/invoice-maker';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const tenants = await Tenant.find({});
        console.log('\n--- Tenants ---');
        if (tenants.length === 0) {
            console.log('No tenants found.');
        } else {
            tenants.forEach(t => {
                console.log(`Name: ${t.companyName}, Subdomain: ${t.subdomain}, ID: ${t._id}`);
            });
        }

        const users = await User.find({});
        console.log('\n--- Users ---');
        if (users.length === 0) {
            console.log('No users found.');
        } else {
            users.forEach(u => {
                console.log(`Email: ${u.email}, Role: ${u.role}, TenantId: ${u.tenantId}, ID: ${u._id}`);
            });
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkDb();
