
import { Label } from "@/components/ui/label";
import { ModernInput } from "@/components/ui/modern-input";
import { FormData } from "./BettingForm";

interface PersonalInfoSectionProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PersonalInfoSection = ({ formData, handleChange }: PersonalInfoSectionProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <ModernInput
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            label="Nome Completo"
            required
            className="touch-optimized"
          />
        </div>
        <div className="space-y-2">
          <ModernInput
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            label="E-mail"
            required
            className="touch-optimized"
          />
        </div>
        <div className="space-y-2">
          <ModernInput
            id="instagram"
            name="instagram"
            value={formData.instagram}
            onChange={handleChange}
            label="Instagram (@usuario)"
            required
            className="touch-optimized"
          />
        </div>
        <div className="space-y-2">
          <ModernInput
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, "");
              if (value.length <= 11) {
                // Format as 123.456.789-00
                if (value.length > 9) {
                  value = value.replace(
                    /^(\d{3})(\d{3})(\d{3})(\d{0,2})$/,
                    "$1.$2.$3-$4"
                  );
                } else if (value.length > 6) {
                  value = value.replace(/^(\d{3})(\d{3})(\d{0,3})$/, "$1.$2.$3");
                } else if (value.length > 3) {
                  value = value.replace(/^(\d{3})(\d{0,3})$/, "$1.$2");
                }
              }
              e.target.value = value;
              handleChange(e);
            }}
            label="CPF"
            maxLength={14}
            required
            className="touch-optimized"
          />
        </div>
        <div className="space-y-2">
          <ModernInput
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={(e) => {
              // Allow digits, spaces, parentheses, dashes and plus
              let value = e.target.value.replace(/[^\d\s()\-+]/g, "");
              e.target.value = value;
              handleChange(e);
            }}
            label="Telefone"
            required
            className="touch-optimized"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <ModernInput
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            label="Cidade"
            required
            className="touch-optimized"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
