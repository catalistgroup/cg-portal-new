import React from 'react';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import Image from 'next/image';

type Props = {
  title: string;
  value: number | undefined;
  format: 'currency' | 'percentage' | 'count';
  loading: boolean;
  img?: string;
  colors?: {
    iconBg?: string;
    iconColor?: string;
    valueColor?: string;
    titleColor?: string;
  };
};

function MetricCard({ title, value, format, loading, img, colors }: Props) {
  const formattedValue = () => {
    if (value === undefined) return '-';

    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }).format(value);
    }

    if (format === 'percentage') {
      return `${value.toFixed(2)}%`;
    }

    if (format === 'count') {
      return `${value.toFixed(0)}`;
    }

    return value.toString();
  };

  const iconColor = colors?.iconColor ?? 'text-orange-500';
  const iconBg = colors?.iconBg ?? 'bg-orange-100';
  const valueColor = colors?.valueColor ?? 'text-[#0F172A]'; // deep navy
  const titleColor = colors?.titleColor ?? 'text-gray-500';

  return (
    <Card className="py-4 px-4 rounded-xl shadow-sm border-[0.5px] border-gray-400/30 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            {loading ? (
              <Skeleton className="h-6 w-12 mb-1" />
            ) : (
              <h3 className={`text-catalogue_primary-background text-2xl font-extrabold`}>
                {formattedValue()}
              </h3>
            )}
            <p className={`text-sm font-medium mt-1 text-catalogue_primary-subTitle/50`}>{title}</p>
          </div>
          <div className={`h-14 w-14 rounded-full flex items-center justify-center`}>
            {img && <Image src={img} alt={title} width={44} height={44} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MetricCard;
