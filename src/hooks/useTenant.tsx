import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Branding {
    primary_color: string;
    secondary_color: string;
    logo_url: string;
    banner_url: string;
    favicon_url: string;
    site_title: string;
}

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    branding: Branding;
}

interface TenantContextType {
    tenant: Tenant | null;
    loading: boolean;
}

const TenantContext = createContext<TenantContextType>({ tenant: null, loading: true });

export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const detectTenant = async () => {
            // 1. Get Hostname & Query Params
            const hostname = window.location.hostname;
            const searchParams = new URLSearchParams(window.location.search);
            const queryTenant = searchParams.get('tenant');

            // 2. Determine Slug logic
            let slug = 'official';

            if (queryTenant) {
                // Priority 1: Query Param (?tenant=slug)
                slug = queryTenant;
                console.log("Tenant detected via Query Param:", slug);
            } else if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
                // Priority 2: Localhost (Default to official if no query)
                console.log("Localhost detected without query param, defaulting to 'official'.");
                slug = 'official';
            } else {
                // Priority 3: Subdomain (client.domain.com)
                const parts = hostname.split('.');
                if (parts.length > 2 && parts[0] !== 'www') {
                    slug = parts[0];
                } else {
                    slug = 'official';
                }
            }

            console.log("Final detected slug:", slug);

            // 3. Fetch Tenant from DB
            const { data, error } = await supabase
                .from('tenants')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error || !data) {
                console.error("Tenant not found:", error);
                // Ideally redirect to 404 or Main Landing Page
                setTenant(null);
            } else {
                const tenantData = data as unknown as Tenant;
                setTenant(tenantData);

                // 4. White-labeling: Inject CSS Variables
                const branding = tenantData.branding;
                if (branding && branding.primary_color) {
                    document.documentElement.style.setProperty('--primary-color', branding.primary_color);
                    // Add more variables as needed
                }
                if (branding && branding.site_title) {
                    document.title = branding.site_title;
                }
                if (branding && branding.favicon_url) {
                    const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
                    if (link) link.href = branding.favicon_url;
                }
            }
            setLoading(false);
        };

        detectTenant();
    }, []);

    return (
        <TenantContext.Provider value={{ tenant, loading }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => useContext(TenantContext);
