import type { PropsWithChildren } from "react";


export function HomeLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex flex-col min-h-screen bg-[#8F21C7]">
                 <div className="w-full h-full">
                {children}
            </div>
        </div>
    )
}