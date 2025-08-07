'use client'
import { getAllCapster, getAllReservation } from '@/api/method'
import InputForm from '@/elements/input/InputForm'
import DefaultLayout from '@/fragments/layout/adminLayout/DefaultLayout'
import ModalDefault from '@/fragments/modal/modal'
import {
    Autocomplete,
    AutocompleteItem,
    getKeyValue,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure
} from '@heroui/react'
import React, { useEffect } from 'react'

type User = {
    jam: number;
    name: string;
    email: string;
};

const users: User[] = [
    { jam: 10, name: "Andi", email: "andi@example.com" },
    { jam: 20, name: "Budi", email: "budi@example.com" },
    { jam: 19, name: "Citra", email: "citra@example.com" },
];

const Page = () => {

    const [capsters, setCapster] = React.useState<any[]>([])
    const [data, setData] = React.useState<any[]>([])
    const [totalActiveBarbers, setTotalActiveBarbers] = React.useState(0)
    const [form, setForm] = React.useState({
        payment_id: '',
        status: '',
        capster_id: '',
    })

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            const result = await getAllReservation()
            const capster = await getAllCapster()
            const formatted = result?.data?.map((item: any) => ({
                ...item,
                capster_name: item.capster_id?.username || '-',
                service_name: item.service_id?.name || '-',
                payment_name: item.payment_id?.name || '-',
                formatted_date: new Date(item.date).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                }),
            }))
            setData(formatted || [])
            setCapster(capster?.data || [])

            // Hitung jumlah barberman aktif hari ini
            const dayName = new Date().toLocaleDateString('id-ID', { weekday: 'long' }).toLowerCase()
            const activeBarberCount = (capster?.data || []).filter((cap: any) => cap.schedule?.[dayName]?.is_active).length
            setTotalActiveBarbers(activeBarberCount)


        }

        fetchData()
    }, [])

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toLocaleDateString('sv-SE'); // "2025-07-28"

    // Filter today's reservations
    const todayReservations = data.filter(item => {
        const reservationDate = new Date(item.date).toISOString().split('T')[0];
        return reservationDate === today && item.status === "Menunggu"
    });

    // Count total bookings today
    const totalTodayBooking = todayReservations.length;

    // Get active barbers today (those with assigned reservations)
    const activeBarbers = todayReservations
        .filter(item => item.capster_id !== null)
        .map(item => item.capster_id);

    // Remove duplicates
    const uniqueActiveBarbers = [...new Map(activeBarbers.map(item => [item._id, item])).values()];

    // Group reservations by barber
    const reservationsByBarber = uniqueActiveBarbers.map(barber => {
        const barberReservations = todayReservations.filter(item =>
            item.capster_id && item.capster_id._id === barber._id && item.status === 'Menunggu'
        );

        return {
            barberName: barber.username,
            count: barberReservations.length,
            reservations: barberReservations.map(res => ({
                name: res.name,
                hour: res.hour,
                email: res.email
            }))
        };
    });

    // Aksi Edit dan Delete


    console.log('capsters:', capsters);
    console.log('reservations:', data);


    return (
        <DefaultLayout>
            {/* Section 1: Cards Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 rounded-2xl p-6 shadow-xl text-white transition hover:scale-[1.01]">
                    <h1 className="text-xl md:text-2xl font-semibold">Jumlah Barberman Aktif</h1>
                    <h2 className="text-4xl font-extrabold mt-3">{totalActiveBarbers}</h2>
                </div>
                <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 rounded-2xl p-6 shadow-xl text-white transition hover:scale-[1.01]">
                    <h1 className="text-xl md:text-2xl font-semibold">Total Booking Hari Ini</h1>
                    <h2 className="text-4xl font-extrabold mt-3">{totalTodayBooking}</h2>
                </div>
            </div>

            {/* Section 2: Antrian */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl">
                <h1 className="text-xl md:text-2xl font-bold text-emerald-800 mb-6">Jumlah Antrian</h1>

                {reservationsByBarber.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {reservationsByBarber.map((barber, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200"
                            >
                                <h2 className="text-lg font-semibold text-emerald-700 mb-2">Capster {barber.barberName}</h2>
                                <p className="text-3xl font-bold text-gray-900 my-4">{barber.count}</p>

                                <div className="overflow-x-auto rounded-lg">
                                    <table className="min-w-full text-sm">
                                        <thead className="text-gray-700 font-semibold bg-gray-100">
                                            <tr>
                                                <th className="py-3 px-4 text-left">Nama Customer</th>
                                                <th className="py-3 px-4 text-left">Jam</th>
                                                <th className="py-3 px-4 text-left">Email</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {barber.reservations.map((reservation, idx) => (
                                                <tr key={idx} className="hover:bg-gray-100 transition-all">
                                                    <td className="py-3 px-4 text-gray-900">{reservation.name}</td>
                                                    <td className="py-3 px-4 text-gray-900">{reservation.hour}:00</td>
                                                    <td className="py-3 px-4 text-gray-900">{reservation.email}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500">Tidak ada antrian hari ini</p>
                    </div>
                )}
            </div>
        </DefaultLayout>


    )
}

export default Page
