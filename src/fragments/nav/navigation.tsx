// components/BottomNavigation.jsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AiOutlineHome, AiOutlineBell, AiOutlineClockCircle } from 'react-icons/ai';
import { BsCalendar } from 'react-icons/bs';

const BottomNavigation = () => {
    const pathname = usePathname();

    const navItems = [
        { href: '/home', icon: <AiOutlineHome className="text-2xl" />, name: 'Home' },
        { href: '/booking', icon: <BsCalendar className="text-2xl" />, name: 'Booking' },
        { href: '/history_booking', icon: <AiOutlineClockCircle className="text-2xl" />, name: 'History' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-black shadow-2xl shadow-gray-400 md:hidden z-50">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center ${isActive ? 'text-yellowCustom' : 'text-gray-600 hover:text-blue-600'
                                }`}
                        >
                            {item.icon}
                            {item.name}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNavigation;
