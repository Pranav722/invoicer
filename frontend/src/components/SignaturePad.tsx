import { useRef, forwardRef, useImperativeHandle } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from './ui';

interface SignaturePadProps {
    onEnd?: () => void;
}

export interface SignaturePadRef {
    clear: () => void;
    toDataURL: () => string;
    isEmpty: () => boolean;
}

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(({ onEnd }, ref) => {
    const sigCanvas = useRef<SignatureCanvas>(null);

    useImperativeHandle(ref, () => ({
        clear: () => sigCanvas.current?.clear(),
        toDataURL: () => sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png') || '',
        isEmpty: () => sigCanvas.current?.isEmpty() || true
    }));

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{
                    className: 'w-full h-40 bg-white cursor-crosshair',
                    height: 160
                }}
                onEnd={onEnd}
            />
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center">
                <span className="text-xs text-gray-500">Sign above</span>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sigCanvas.current?.clear()}
                    type="button"
                >
                    Clear
                </Button>
            </div>
        </div>
    );
});

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;
