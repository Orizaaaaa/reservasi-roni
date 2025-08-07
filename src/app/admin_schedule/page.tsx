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
            {capters.map((item: any, index) => {
                const todaySchedule = item.schedule?.[today]
                const isWorkingToday = todaySchedule?.is_active

                return (
                    <div className="p-3 border-2 border-slate-300 rounded-lg mb-4" key={index}>
                        <div className="flex gap-10 px-4">
                            <div className="h-28 w-28 rounded-full">
                                <img
                                    className="object-cover w-full h-full rounded-full"
                                    src={item.avatar}
                                    alt={item.username}
                                />
                            </div>

                            <div>
                                <h1 className="text-xl font-bold">{item.username}</h1>
                                <h1 className="font-semibold mt-2">Hari Kerja: Senin - Sabtu</h1>
                                <h1 className="font-semibold">Hari Libur: Minggu</h1>
                                <h1 className="font-semibold">
                                    Status:{' '}
                                    <span className="italic">
                                        {isWorkingToday ? 'Sedang bekerja' : 'Sedang libur'}
                                    </span>
                                </h1>
                            </div>
                        </div>

                        <h1 className="font-medium mt-4 px-4">Jam Kerja</h1>
                        <div className="grid grid-cols-3 gap-4 md:grid-cols-7 mt-2 text-sm">
                            {days.map((day) => {
                                const schedule = item?.schedule?.[day.key]
                                const isActive = schedule?.is_active
                                const jamKerja = schedule?.jam_kerja

                                return (
                                    <div
                                        key={day.key}
                                        className="gap-2 items-center font-light mx-auto text-center"
                                    >
                                        <h1 className="font-medium">{day.label}</h1>
                                        <h1 className={isActive ? "" : "text-gray-400 italic"}>
                                            {isActive ? jamKerja : "-"}
                                        </h1>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="px-4">
                            <ButtonPrimary className="py-1 px-3 mt-5 rounded-xl" onClick={() => router.push(`/admin_schedule/set_schedule/${item._id}`)} >
                                Atur Jadwal
                            </ButtonPrimary>
                        </div>
                    </div>
                )
            })}


        </DefaultLayout>
    )
}

export default page