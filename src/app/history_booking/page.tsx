'use client'
import { getAllReservation } from '@/api/method';
import BottomNavigation from '@/fragments/nav/navigation';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

type Props = {}

const Page = (props: Props) => {
    const router = useRouter()
    const [booking, setBooking] = React.useState<any>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchData = async () => {
        setLoading(true);
        const userPhone = typeof window !== 'undefined' ? localStorage.getItem('userPhone') : null;
        const bookingData = await getAllReservation();

        if (userPhone) {
            const filtered = bookingData?.data?.filter((item: any) => item.phone === userPhone);
            setBooking(filtered || []);
        } else {
            setBooking([]);
        }
        setLoading(false);
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

    return (
        <section className='container mx-auto p-3'>
            <div className="w-full bg-primary rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col justify-center">
                {loading ? (
                    // Skeleton loading
                    Array(5).fill(0).map((_, index) => (
                        <div key={index} className="flex justify-between items-center py-3 border-b border-gray-700 animate-pulse">
                            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                        </div>
                    ))
                ) : booking.length > 0 ? (
                    booking.map((item: any, index: number) => (
                        <div
                            key={index}
                            onClick={() => router.push(`/booking_bils/${item._id}`)}
                            className="flex justify-between items-center py-3 border-b border-gray-200 cursor-pointer"
                        >
                            <h1 className='text-yellowCustom'>{formatTanggalIndonesia(item.date)}</h1>
                            <p className='text-white text-sm'> JAM {item.hour} : 00 </p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-center py-6">Tidak ada riwayat booking.</p>
                )}
            </div>
            <BottomNavigation />
        </section>
    )
}

export default Page;
