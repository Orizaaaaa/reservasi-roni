'use client'
import { getAllCapster } from '@/api/method'
import ButtonPrimary from '@/elements/buttonPrimary'
import DefaultLayout from '@/fragments/layout/adminLayout/DefaultLayout'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

type Props = {}

const page = (props: Props) => {
    const router = useRouter();
    const [capters, setCapters] = useState([])
    const fetchData = async () => {
        const capster = await getAllCapster()
        setCapters(capster?.data || [])
    }

    useEffect(() => {
        fetchData()
    }, []);
    console.log(capters);

    const days = [
        { label: "Senin", key: "senin" },
        { label: "Selasa", key: "selasa" },
        { label: "Rabu", key: "rabu" },
        { label: "Kamis", key: "kamis" },
        { label: "Jumat", key: "jumat" },
        { label: "Sabtu", key: "sabtu" },
        { label: "Minggu", key: "minggu" },
    ];

    const today = new Date()
        .toLocaleDateString('id-ID', { weekday: 'long' })
        .toLowerCase()
    return (
        <DefaultLayout>
            <div className="grid grid-cols-1 gap-6">
                {capters.map((item: any, index: number) => {
                    const todaySchedule = item.schedule?.[today];
                    const isWorkingToday = todaySchedule?.is_active;

                    return (
                        <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 transition hover:shadow-md"
                        >
                            {/* Header Info */}
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                {/* Avatar */}
                                <div className="w-28 h-28 rounded-full overflow-hidden shadow-md">
                                    <img
                                        src={item.avatar}
                                        alt={item.username}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 text-center md:text-left">
                                    <h1 className="text-xl font-bold text-gray-800">{item.username}</h1>
                                    <p className="text-sm text-gray-600 mt-2">Hari Kerja: <span className="font-medium">Senin - Sabtu</span></p>
                                    <p className="text-sm text-gray-600">Hari Libur: <span className="font-medium">Minggu</span></p>
                                    <p className="text-sm mt-1">
                                        Status:{' '}
                                        <span className={`font-semibold ${isWorkingToday ? 'text-emerald-600' : 'text-red-500'} italic`}>
                                            {isWorkingToday ? 'Sedang bekerja' : 'Sedang libur'}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Jadwal Mingguan */}
                            <div className="mt-6">
                                <h2 className="font-semibold text-gray-700 mb-2">Jam Kerja</h2>
                                <div className="grid grid-cols-3 md:grid-cols-7 gap-4 text-center text-sm">
                                    {days.map((day) => {
                                        const schedule = item?.schedule?.[day.key];
                                        const isActive = schedule?.is_active;
                                        const jamKerja = schedule?.jam_kerja;

                                        return (
                                            <div key={day.key} className="p-2 rounded-lg bg-gray-50 border">
                                                <h3 className="font-medium text-gray-800">{day.label}</h3>
                                                <p className={`mt-1 ${isActive ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                                                    {isActive ? jamKerja : '-'}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Button */}
                            <div className="mt-6 text-right">
                                <ButtonPrimary
                                    className="py-2 px-4 rounded-xl"
                                    onClick={() => router.push(`/admin_schedule/set_schedule/${item._id}`)}
                                >
                                    Atur Jadwal
                                </ButtonPrimary>
                            </div>
                        </div>
                    );
                })}
            </div>
        </DefaultLayout>

    )
}

export default page