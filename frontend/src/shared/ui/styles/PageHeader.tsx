import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import type { PropsWithChildren } from "react";

interface PageHeaderProps{
    className?: string;
    goBack?: boolean
    backString?: string;
    nameBack?: string;
}

export function PageHeader({
    children,
    className = "",
    backString = "",
    goBack = false,
    nameBack = "Volver"
}: PropsWithChildren<PageHeaderProps>) {
    const navigate = useNavigate();

    return (
        <header>
            {goBack && (
                <div className="w-full print:hidden">
                    <button onClick={() => {
                        if (backString) {
                            navigate(backString);
                        } else {
                            navigate(-1);
                        }
                    }} className="flex items-center gap-2 text-gray-600 cursor-pointer">
                        <FaArrowLeft />
                        {nameBack}
                    </button>
                </div>
            )}
            <div
                className={`flex w-full flex-wrap gap-2 py-4 md:p-4 items-center ${className}`}
            >
                {children}
            </div>
        </header>
    );
}