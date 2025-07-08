import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import AI from '../../public/AI.svg';
import Arrow from '../../public/Arrow.svg';
import Sparkles from '../../public/Sparkles.svg';
import Wishlist from '../../public/Wishlist.svg';
import Image from 'next/image';

interface ButtonGroupProps {
  isLoading?: boolean;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ isLoading = false }) => {
  const [selected, setSelected] = useState<string>('All');

  const buttons: { label: string; img?: string }[] = [
    { label: 'All', img: Wishlist },
    { label: 'New This Week', img: Arrow },
    { label: 'Most Popular Product This Week', img: Sparkles },
    { label: 'Smart Picks', img: AI },
  ];

  const handleClick = (label: string) => {
    setSelected(label);
    alert('Functionality pending !');
  };

  return (
    <div className="flex gap-2">
      {buttons.map(({ label, img }) => (
        <div
          key={label}
          onClick={() => handleClick(label)}
          className="inline-flex items-center justify-center p-[1px] rounded-full bg-gradient-to-r from-[#F208FD] to-[#0B24FB] cursor-pointer"
        >
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-1 ${
              selected === label
                ? 'bg-filter_section-selectedBtn text-white border border-transparent'
                : 'bg-white'
            }`}
          >
            {img && (
              <Image
                src={img}
                alt={label}
                width={16}
                height={16}
                className={`${
                  selected === label ? 'invert brightness-0' : 'brightness-100 saturate-150'
                }`}
              />
            )}

            <span
              className={`text-sm font-medium ${
                selected === label
                  ? 'text-white'
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-[rgba(242,8,253,1)] to-[rgba(11,36,251,1)]'
              }`}
            >
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ButtonGroup;
