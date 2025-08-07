'use client'
import { getAllReservation } from '@/api/method';
import BottomNavigation from '@/fragments/nav/navigation';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

type Props = {}

const page = (props: Props) => {
    const router = useRouter()
    const [booking, setBooking] = React.useState<any>([]);

    const fetchData = async () => {
        const userPhone = typeof window !== 'undefined' ? localStorage.getItem('userPhone') : null;
        const booking = await getAllReservation();

        if (userPhone) {
            const filtered = booking?.data?.filter((item: any) => item.phone === userPhone);
            setBooking(filtered || []);
        } else {
            setBooking([]);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    function formatTanggalIndonesia(dateString: string): string {
        const date = new Date(dateString);

        const hari = [
            'MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'
        ];
        const bulan = [
            'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
            'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
        ];

        const namaHari = hari[date.getDay()];
        const tanggal = date.getDate();
        const namaBulan = bulan[date.getMonth()];
        const tahun = date.getFullYear();

        return `${namaHari}, ${tanggal}, ${namaBulan} ${tahun}`;
    }

    console.log(booking); // hasil booking yang sudah difilter

    return (
        <section className='container mx-auto p-3'>
            <div className="w-full bg-black rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col justify-center">
                {booking?.map((item: any, index: number) => (
                    <div key={index} onClick={() => router.push(`/booking_bils/${item._id}`)} className="flex justify-between items-center py-3 border-b border-gray-200 cursor-pointer">
                        <h1 className='text-yellowCustom'>{formatTanggalIndonesia(item.date)}</h1>
                        <p className='text-white text-sm'> JAM {item.hour} : 00 </p>
                    </div>
                ))}

            </div>
            <BottomNavigation />
        </section>
    )
}

export default page;
