import { CgMathPlus } from "react-icons/cg";
import type { PropsWithChildren } from "react";
import FloatButton from "./FloatButton";

interface ListAddButtonProps{
    to?: string;
    onClick: () => void
}

export function ListAddButton({
    children,
    onClick 
}: PropsWithChildren<ListAddButtonProps>) {
    return (
        <>
            <button 
                className="hidden cursor-pointer md:flex items-center gap-2 justify-center p-2 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                onClick={onClick}
                >
                <CgMathPlus />
                {children}
            </button>
            <FloatButton
                className="md:hidden text-xl"
                onClick={onClick}
                >
                <CgMathPlus />
            </FloatButton>
        </>
    )
}