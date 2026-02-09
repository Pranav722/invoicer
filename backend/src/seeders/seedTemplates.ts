import mongoose from 'mongoose';
import { InvoiceTemplate } from '../models/InvoiceTemplate';
import { PRESET_TEMPLATES } from '../shared/constants/presetTemplates';
import dotenv from 'dotenv';
import { TemplateConfig } from '../shared/types/InvoiceTemplate';

dotenv.config();

async function seedPresetTemplates() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('✅ Connected to MongoDB');

        // Clear existing preset templates
        await InvoiceTemplate.deleteMany({ type: 'preset' });
        console.log('🗑️  Cleared existing preset templates');

        // Insert preset templates
        const templates = Object.values(PRESET_TEMPLATES).map((config: TemplateConfig) => ({
            name: config.name,
            type: 'preset',
            isDefault: false,
            isPublic: true,
            config,
            usageCount: 0
        }));

        const inserted = await InvoiceTemplate.insertMany(templates);
        console.log(`✅ Inserted ${inserted.length} preset templates`);

        // List inserted templates
        inserted.forEach((template: any) => {
            console.log(`   - ${template.config.name}`);
        });

        await mongoose.disconnect();
        console.log('✅ Seeding complete!');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedPresetTemplates();
