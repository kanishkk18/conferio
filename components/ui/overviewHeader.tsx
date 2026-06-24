import React from 'react';
import { cn } from '@/lib/utils';
import { useSession } from "next-auth/react";


interface DashboardHeaderProps {
    name: string;
    className?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = () => {
    const session = useSession();

    return (
        <div className={cn("flex justify-center items-center gap-1  py-0")}>
            <h1 className="md:text-xl font-semibold">Hello! {session.data?.user?.name ?? ''.slice(0, 15)}</h1>
        </div>
    );
};

export default DashboardHeader;
