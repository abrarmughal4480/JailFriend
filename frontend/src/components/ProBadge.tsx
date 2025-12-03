import React from 'react';
import { Crown, Star, Zap, Rocket } from 'lucide-react';

interface ProBadgeProps {
    plan: 'Star' | 'Hot' | 'Ultima' | 'VIP';
    size?: 'sm' | 'md' | 'lg';
    showTooltip?: boolean;
}

const ProBadge: React.FC<ProBadgeProps> = ({ plan, size = 'sm', showTooltip = true }) => {
    // Unified configuration for all pro plans
    const config = {
        icon: Rocket,
        bgColor: 'bg-blue-400', // Lighter blue to match the screenshot
        textColor: 'text-white',
        label: 'PRO'
    };

    const IconComponent = config.icon;

    const sizeClasses = {
        sm: 'px-1.5 py-0.5 text-[10px]', // Smaller text for sm size
        md: 'px-2 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm'
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-3.5 h-3.5',
        lg: 'w-4 h-4'
    };

    return (
        <span
            className={`inline-flex items-center gap-1 ${config.bgColor} ${config.textColor} ${sizeClasses[size]} rounded-md font-bold ml-1 uppercase tracking-wide ${showTooltip ? 'group relative' : ''}`}
            title={showTooltip ? `${plan} Member` : undefined}
        >
            <IconComponent className={iconSizes[size]} strokeWidth={3} />
            <span>{config.label}</span>

            {showTooltip && (
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 normal-case font-normal">
                    {plan} Member
                </span>
            )}
        </span>
    );
};

export default ProBadge;
