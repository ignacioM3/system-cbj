import {  useEffect, useState, type ComponentType } from 'react';
import type { RouterDefinition } from './routes-definition';
import { AuthGuard } from './auth-guard';

interface Props {
    route: RouterDefinition;
}

export function LazyComponentLoader({ route }: Props) {
    const [components, setComponents] = useState<{
        Page: ComponentType | null;
        Layout: ComponentType<{ children: React.ReactNode }> | null;
    }>({ Page: null, Layout: null });
    
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true;
        
        const loadComponents = async () => {
            try {
                // Reset state
                setComponents({ Page: null, Layout: null });
                setError(null);

                if (route.page) {
                    const pageModule = await route.page();
                    if (!isMounted) return;
                    
                    let layoutModule: ComponentType<{ children: React.ReactNode }> | null = null;
                    
                    if (route.layout) {
                        layoutModule = await route.layout();
                        if (!isMounted) return;
                    }

                    setComponents({
                        Page: pageModule as ComponentType,
                        Layout: layoutModule
                    });
                }
            } catch (err) {
                if (isMounted) {
                    setError(err as Error);
                    console.error('Error loading route:', err);
                }
            }
        };

        loadComponents();
        
        return () => {
            isMounted = false;
        };
    }, [route]); // 👈 Dependencia correcta

    if (error) {
        return (
            <div className="error-page">
                <h2>Error cargando la página</h2>
                <p>{error.message}</p>
                <button onClick={() => window.location.reload()}>
                    Reintentar
                </button>
            </div>
        );
    }

    if (!components.Page) {
        return <div className="loading">Cargando...</div>;
    }

    const PageComponent = components.Page;
    const LayoutComponent = components.Layout;

    const content = LayoutComponent ? (
        <LayoutComponent>
            <PageComponent />
        </LayoutComponent>
    ) : (
        <PageComponent />
    );

    return route.requiresAuth ? (
        <AuthGuard allowedRoles={route.allowedRoles}>
            {content}
        </AuthGuard>
    ) : (
        content
    );
}