
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ImageUploadProps {
    onUploadComplete: (url: string) => void;
    currentImageUrl?: string | null;
    onClear?: () => void;
    label?: string;
    bucketName?: string; // Optional bucket name
    className?: string;
}

const ImageUpload = ({ onUploadComplete, currentImageUrl, onClear, label = "Upload de Imagem", bucketName = "images", className = "" }: ImageUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [manualUrl, setManualUrl] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                .from(bucketName) // Use dynamic bucket name
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data } = supabase.storage
                .from(bucketName)
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

                <div className="flex flex-col gap-3">
                    {/* Upload Button */}
                    <Button
                        variant="outline"
                        className="relative w-full cursor-pointer bg-white border-dashed border-2 hover:bg-gray-50 h-12"
                        disabled={uploading}
                    >
                        {uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Upload className="h-4 w-4 mr-2" />
                        )}
                        {uploading ? "Enviando..." : "Escolher Arquivo do Computador"}
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploading}
                        />
                    </Button>

                    <div className="relative flex items-center">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Ou cole o link</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    {/* Manual URL Input */}
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            placeholder="https://exemplo.com/imagem.png"
                            value={currentImageUrl || ""}
                            onChange={(e) => onUploadComplete(e.target.value)}
                            className="bg-white"
                        />
                        {currentImageUrl && onClear && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClear}
                                title="Limpar"
                                className="shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
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
