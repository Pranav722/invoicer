import { Request, Response, NextFunction } from 'express';
import path from 'path';

export class UploadController {
    /**
     * Upload a file
     */
    static async uploadFile(req: Request, res: Response, next: NextFunction) {
        try {
            const file = (req as any).file;
            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            // Construct public URL
            // Assuming the server serves 'uploads' directory at /uploads
            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

            res.status(200).json({
                success: true,
                data: {
                    url: fileUrl,
                    filename: file.filename,
                    mimetype: file.mimetype,
                    size: file.size
                }
            });
        } catch (error) {
            next(error);
        }
    }
}
