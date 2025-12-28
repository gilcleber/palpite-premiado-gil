
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ImageUploadProps {
    bucket?: string;
    onUploadComplete: (url: string) => void;
    currentImageUrl?: string | null;
    onClear?: () => void;
    className?: string;
    label?: string;
}

const ImageUpload = ({
    bucket = "images",
    onUploadComplete,
    currentImageUrl,
    onClear,
    className = "",
    label = "Upload Imagem"
}: ImageUploadProps) => {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            setUploading(true);

            // Upload file to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            onUploadComplete(data.publicUrl);

            toast({
                title: "Sucesso",
                description: "Imagem enviada com sucesso!",
            });
        } catch (error) {
            console.error("Error uploading image:", error);
            toast({
                title: "Erro",
                description: "Erro ao enviar imagem. Verifique se o bucket 'images' foi criado.",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#1d244a]">{label}</label>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="relative w-full cursor-pointer bg-white border-dashed border-2 hover:bg-gray-50"
                        disabled={uploading}
                    >
                        {uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Upload className="h-4 w-4 mr-2" />
                        )}
                        {uploading ? "Enviando..." : "Escolher Arquivo"}
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploading}
                        />
                    </Button>

                    {currentImageUrl && onClear && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={onClear}
                            title="Remover imagem"
                            className="shrink-0"
                        >
                            <X className="h-4 w-4 text-red-500" />
                        </Button>
                    )}
                </div>
            </div>

            {currentImageUrl && (
                <div className="relative w-full h-32 bg-gray-50 rounded-lg border flex items-center justify-center overflow-hidden">
                    <img
                        src={currentImageUrl}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
