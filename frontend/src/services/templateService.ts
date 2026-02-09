import api from './api';
import type { InvoiceTemplate, CreateTemplateRequest, UpdateTemplateRequest, DuplicateTemplateRequest } from '../types/InvoiceTemplate';

class TemplateService {

    // Get all templates (presets + custom)
    async getAll(): Promise<InvoiceTemplate[]> {
        const response = await api.get('/templates');
        return response.data;
    }

    // Get preset templates only
    async getPresets(): Promise<InvoiceTemplate[]> {
        const response = await api.get('/templates/presets');
        return response.data;
    }

    // Get user's custom templates
    async getCustom(): Promise<InvoiceTemplate[]> {
        const response = await api.get('/templates/custom');
        return response.data;
    }

    // Get single template by ID
    async getById(id: string): Promise<InvoiceTemplate> {
        const response = await api.get(`/templates/${id}`);
        return response.data;
    }

    // Create custom template
    async create(data: CreateTemplateRequest): Promise<InvoiceTemplate> {
        const response = await api.post('/templates', data);
        return response.data;
    }

    // Update template
    async update(id: string, data: UpdateTemplateRequest): Promise<InvoiceTemplate> {
        const response = await api.put(`/templates/${id}`, data);
        return response.data;
    }

    // Delete template
    async delete(id: string): Promise<void> {
        await api.delete(`/templates/${id}`);
    }

    // Duplicate template
    async duplicate(id: string, data: DuplicateTemplateRequest): Promise<InvoiceTemplate> {
        const response = await api.post(`/templates/${id}/duplicate`, data);
        return response.data;
    }

    // Set as default
    async setDefault(id: string): Promise<InvoiceTemplate> {
        const response = await api.put(`/templates/${id}/set-default`);
        return response.data;
    }
}

export default new TemplateService();
