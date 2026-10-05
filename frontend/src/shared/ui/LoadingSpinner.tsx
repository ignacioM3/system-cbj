import { PageContainer } from "./styles/PageContainer";

interface LoadingSpinnerPops {
  className?: string;
}

export default function LoadingSpinner({ className = "" }: LoadingSpinnerPops) {
  return (
    <PageContainer className="min-h-full min-w-full flex justify-center items-center">
      <div className={`loading`}>
        <div className={`sk-chase ${className}`}>
          <div className="sk-chase-dot"></div>
          <div className="sk-chase-dot"></div>
          <div className="sk-chase-dot"></div>
          <div className="sk-chase-dot"></div>
          <div className="sk-chase-dot"></div>
          <div className="sk-chase-dot"></div>
        </div>
      </div>
    </PageContainer>
  );
}
