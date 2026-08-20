import type { PropsWithChildren } from "react";

interface PageContentProps{
    className?: string
}


export function PageContent({
    children,
    className = "",
}: PropsWithChildren<PageContentProps>) {
    return (
        <section
            className={`grow w-full md:p-4 mx-auto flex flex-col ${className}`}
        >
            {children}
        </section>
    );
}
