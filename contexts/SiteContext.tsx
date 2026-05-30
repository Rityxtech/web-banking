import React, { createContext, useContext } from 'react';
import { APP_CONFIG } from '../config';

interface SiteContextValue {
    siteName: string;
    siteLogo: string;
}

const SiteContext = createContext<SiteContextValue>({
    siteName: APP_CONFIG.BANK_NAME,
    siteLogo: ''
});

export const SiteProvider: React.FC<{ children: React.ReactNode; siteName: string; siteLogo?: string }> = ({
    children,
    siteName,
    siteLogo = ''
}) => {
    return (
        <SiteContext.Provider value={{ siteName, siteLogo }}>
            {children}
        </SiteContext.Provider>
    );
};

export const useSiteName = (): string => {
    const ctx = useContext(SiteContext);
    return ctx.siteName;
};

export const useSiteLogo = (): string => {
    const ctx = useContext(SiteContext);
    return ctx.siteLogo;
};

export const useSiteContext = (): SiteContextValue => {
    return useContext(SiteContext);
};
