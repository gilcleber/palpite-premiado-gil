
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
        <div className="space-y-2 md:col-span-2">
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
          <p className="text-[10px] text-gray-400 pl-1">
            * Obrigatório: Conferimos se segue o perfil oficial.
          </p>
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
              // Strict Brazilian phone format (11 digits: (XX) XXXXX-XXXX)
              let value = e.target.value.replace(/\D/g, "");
              if (value.length > 11) value = value.slice(0, 11);

              if (value.length > 2) {
                value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
              }
              if (value.length > 9) { // (XX) XXXXX-
                value = `${value.slice(0, 10)}-${value.slice(10)}`;
              } else if (value.length > 6) { // (XX) XXXX-
                // Standard local legacy (obsolete but functional) or partial mobile
                // Keeping simple logic: just add hyphen after 5th digit of the main part if long enough
              }

              // Better logic for 11 digits: (11) 91234-5678
              // If it's already past 2, we formatted (XX). 
              // Now we have up to 9 more digits. 
              // We want (XX) XXXXX-XXXX

              // Let's redo using a simpler replacer for 11 digits
              const raw = e.target.value.replace(/\D/g, "");
              let formatted = raw;

              if (raw.length <= 11) {
                formatted = raw
                  .replace(/^(\d{2})(\d)/g, "($1) $2")
                  .replace(/(\d{5})(\d{4})$/, "$1-$2");
              }

              e.target.value = formatted;
              handleChange(e);
            }}
            label="Telefone (WhatsApp)"
            placeholder="(DD) 9XXXX-XXXX"
            maxLength={15}
            required
            className="touch-optimized"
          />
        </div>
        <div className="space-y-2">
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
