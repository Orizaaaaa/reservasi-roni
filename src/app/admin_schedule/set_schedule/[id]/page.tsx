'use client'
import { getCapsterById, updateCapster } from '@/api/method'
import ButtonPrimary from '@/elements/buttonPrimary'
import DefaultLayout from '@/fragments/layout/adminLayout/DefaultLayout'
import ModalDefault from '@/fragments/modal/modal'
import { hourSchedule } from '@/utils/helper'
import {
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure,
} from '@heroui/react'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const Page = () => {
    const { onOpen, onClose, isOpen } = useDisclosure()
    const { id }: any = useParams()

    const [data, setData] = useState<any>(null)
    const [items, setItems] = useState<any[]>([])
    const [selectedDay, setSelectedDay] = useState<string | null>(null)
    const [selectedField, setSelectedField] = useState<'jam_kerja' | 'jam_istirahat' | null>(null)
    const [selectedPart, setSelectedPart] = useState<'start' | 'end' | null>(null)

    const [form, setForm] = useState<any>({
        username: '',
        phone: '',
        spesialis: '',
        description: '',
        avatar: '',
        rating: 0,
        schedule: {
            senin: { is_active: false, jam_kerja: '', jam_istirahat: '' },
            selasa: { is_active: false, jam_kerja: '', jam_istirahat: '' },
            rabu: { is_active: false, jam_kerja: '', jam_istirahat: '' },
            kamis: { is_active: false, jam_kerja: '', jam_istirahat: '' },
            jumat: { is_active: false, jam_kerja: '', jam_istirahat: '' },
            sabtu: { is_active: false, jam_kerja: '', jam_istirahat: '' },
            minggu: { is_active: false, jam_kerja: '', jam_istirahat: '' },
        },
        email: '',
        address: '',
    })

    useEffect(() => {
        if (!id) return
        getCapsterById(id, (res: any) => {
            const result = res.data
            setData(result)
            setForm((prev: any) => ({
                ...prev,
                ...result,
                schedule: result.schedule || prev.schedule,
            }))

            const days = [
                { key: 'senin', label: 'Senin' },
                { key: 'selasa', label: 'Selasa' },
                { key: 'rabu', label: 'Rabu' },
                { key: 'kamis', label: 'Kamis' },
                { key: 'jumat', label: 'Jumat' },
                { key: 'sabtu', label: 'Sabtu' },
                { key: 'minggu', label: 'Minggu' },
            ]

            const formattedItems = days.map((day) => {
                const sched = result.schedule?.[day.key] || {}
                return {
                    _id: day.key,
                    name: day.label,
                    is_active: sched.is_active,
                    jam_kerja: sched.jam_kerja || '',
                    jam_istirahat: sched.jam_istirahat || '',
                }
            })
            setItems(formattedItems)
        })
    }, [id])

    const handleToggle = (dayKey: string) => {
        setItems((prev) =>
            prev.map((item) =>
                item._id === dayKey ? { ...item, is_active: !item.is_active } : item
            )
        )

        setForm((prevForm: any) => ({
            ...prevForm,
            schedule: {
                ...prevForm.schedule,
                [dayKey]: {
                    ...prevForm.schedule[dayKey],
                    is_active: !prevForm.schedule[dayKey]?.is_active,
                },
            },
        }))
    }

    const openTimeModal = (
        dayKey: string,
        field: 'jam_kerja' | 'jam_istirahat',
        part: 'start' | 'end'
    ) => {
        setSelectedDay(dayKey)
        setSelectedField(field)
        setSelectedPart(part)
        onOpen()
    }

    const handleSelectTime = (time: string) => {
        if (!selectedDay || !selectedField || !selectedPart) return

        setItems((prev) =>
            prev.map((item) => {
                if (item._id === selectedDay) {
                    const [start = '', end = ''] = item[selectedField]?.split(' - ') || ['', '']
                    const newTime =
                        selectedPart === 'start' ? `${time} - ${end}` : `${start} - ${time}`
                    return { ...item, [selectedField]: newTime }
                }
                return item
            })
        )

        setForm((prevForm: any) => {
            const current = prevForm.schedule[selectedDay]?.[selectedField] || ''
            const [start = '', end = ''] = current.split(' - ')
            const newTime =
                selectedPart === 'start' ? `${time} - ${end}` : `${start} - ${time}`

            return {
                ...prevForm,
                schedule: {
                    ...prevForm.schedule,
                    [selectedDay]: {
                        ...prevForm.schedule[selectedDay],
                        [selectedField]: newTime,
                    },
                },
            }
        })

        onClose()
    }

    const handleSave = async () => {
        try {
            await updateCapster(id, form, (res: any) => {
                console.log('Update berhasil', res);
                toast.success('Data berhasil diperbarui!');
            });
        } catch (error) {
            console.error('Gagal update', error);
            toast.error('Gagal memperbarui data');
        }
    };

    return (
        <DefaultLayout>
            {data && (
                <>
                    <div className="flex gap-10 px-4 mb-6">
                        <div className="h-28 w-28 rounded-full">
                            <img
                                className="object-cover w-full h-full rounded-full"
                                src={data.avatar}
                                alt={data.username}
                            />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">{data.username}</h1>
                            <h1 className="font-semibold mt-2">Hari Kerja: Senin - Sabtu</h1>
                            <h1 className="font-semibold">Hari Libur: Minggu</h1>
                            <h1 className="font-semibold">
                                Status:{' '}
                                <span className="italic">
                                    {
                                        data.schedule?.[new Date().toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                        }).toLowerCase()]?.is_active
                                            ? 'Sedang bekerja'
                                            : 'Sedang libur'
                                    }
                                </span>
                            </h1>
                        </div>
                    </div>

                    <Table aria-label="Tabel Jadwal">
                        <TableHeader>
                            <TableColumn key="name">HARI</TableColumn>
                            <TableColumn key="is_active">STATUS</TableColumn>
                            <TableColumn key="jam_kerja">JAM KERJA</TableColumn>
                            <TableColumn key="jam_istirahat">JAM ISTIRAHAT</TableColumn>
                            <TableColumn key="action">ACTION</TableColumn>
                        </TableHeader>
                        <TableBody items={items}>
                            {(item: any) => (
                                <TableRow key={item._id}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={item.is_active}
                                                onChange={() => handleToggle(item._id)}
                                            />
                                            <div className="relative w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors">
                                                <div
                                                    className={`
                                                    absolute top-[2px] w-5 h-5 bg-white rounded-full transition-transform
                                                    ${item.is_active ? 'translate-x-5 left-[2px]' : 'left-[2px]'}
                                                `}
                                                />
                                            </div>
                                        </label>

                                    </TableCell>

                                    <TableCell>
                                        {item.is_active ? (
                                            <div className="flex justify-center items-center">
                                                <button
                                                    onClick={() =>
                                                        openTimeModal(item._id, 'jam_kerja', 'start')
                                                    }
                                                    className="py-1 px-3 border border-black rounded-md hover:bg-gray-100 text-center"
                                                >
                                                    {item.jam_kerja?.split(' - ')[0] || '--:--'}
                                                </button>
                                                <span className="mx-2">-</span>
                                                <button
                                                    onClick={() =>
                                                        openTimeModal(item._id, 'jam_kerja', 'end')
                                                    }
                                                    className="py-1 px-3 border border-black rounded-md hover:bg-gray-100 text-center"
                                                >
                                                    {item.jam_kerja?.split(' - ')[1] || '--:--'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-center text-gray-400">--:--</div>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {item.is_active ? (
                                            <div className="flex justify-center items-center">
                                                <button
                                                    onClick={() =>
                                                        openTimeModal(item._id, 'jam_istirahat', 'start')
                                                    }
                                                    className="py-1 px-3 border border-black rounded-md hover:bg-gray-100 text-center"
                                                >
                                                    {item.jam_istirahat?.split(' - ')[0] || '--:--'}
                                                </button>
                                                <span className="mx-2">-</span>
                                                <button
                                                    onClick={() =>
                                                        openTimeModal(item._id, 'jam_istirahat', 'end')
                                                    }
                                                    className="py-1 px-3 border border-black rounded-md hover:bg-gray-100 text-center"
                                                >
                                                    {item.jam_istirahat?.split(' - ')[1] || '--:--'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-center text-gray-400">--:--</div>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <ButtonPrimary
                                            onClick={handleSave}
                                            className="py-2 w-full rounded-lg"
                                        >
                                            Simpan
                                        </ButtonPrimary>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </>
            )}

            <ModalDefault isOpen={isOpen} onClose={onClose}>
                <h1 className="text-black text-xl font-semibold mb-4">Pilih Jam</h1>
                <div className="bg-gray-100 rounded-md shadow text-center w-full">
                    <h2 className="text-gray-600 font-semibold text-lg mb-4 uppercase">
                        Waktu tersedia
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                        {Object.entries(hourSchedule).map(([label, times]) => (
                            <div key={label}>
                                <h3 className="font-bold mb-2">{label}</h3>
                                <div className="flex flex-col items-center gap-3">
                                    {times.map((time) => (
                                        <button
                                            key={time}
                                            className="bg-yellow-300 px-3 py-1 rounded hover:bg-yellow-400 transition"
                                            onClick={() => handleSelectTime(time)}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </ModalDefault>
        </DefaultLayout>
    )
}

export default Page
