'use client'

import React, { useEffect } from 'react'
import ButtonPrimary from '@/elements/buttonPrimary';
import InputSecond from '@/elements/input/InputSecond';
import ModalDefault from '@/fragments/modal/modal';
import { formatDate, formatDateStr, formatRupiah, hours } from '@/utils/helper';
import { Autocomplete, AutocompleteItem, Calendar, DatePicker, Spinner, useDisclosure } from '@heroui/react';
import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import { useRouter } from 'next/navigation';
import { IoArrowBackCircleOutline } from 'react-icons/io5';
import { MdOutlineAccessTime } from 'react-icons/md';
import toast from 'react-hot-toast';
import { createBooking, getAllCapster, getAllPayments, getAllService, getCapsterHours } from '@/api/method';
import BottomNavigation from '@/fragments/nav/navigation';
import DefaultLayout from '@/fragments/layout/adminLayout/DefaultLayout';

type Props = {}

function page({ }: Props) {
    const router = useRouter();
    const [capsterHours, setCapsterHours] = React.useState<any>([]);
    const [capsters, setCapsters] = React.useState<any>([]);
    const [services, setServices] = React.useState<any>([]);
    const [payments, setPayments] = React.useState<any>([]);
    const { onOpen, onClose, isOpen } = useDisclosure();
    const dateNow = new Date();
    const [form, setForm] = React.useState({
        name: '',
        email: '',
        phone: '',
        date: parseDate(formatDate(dateNow)),
        hour: 0,
        capster_id: '',
        payment_id: '',
        rating: 5,
        image: '',
        haircut_type: '',
        service_id: '',
        status: 'Menunggu',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Khusus validasi untuk nomor telepon
        if (name === 'phone') {
            // Hapus semua karakter selain angka dan tanda '+'
            let sanitizedValue = value.replace(/[^\d+]/g, '');

            // Format nomor telepon Indonesia
            if (sanitizedValue.startsWith('0')) {
                // Ubah 08... menjadi +628...
                sanitizedValue = '+62' + sanitizedValue.slice(1);
            } else if (sanitizedValue.startsWith('62')) {
                // Ubah 62... menjadi +62...
                sanitizedValue = '+' + sanitizedValue;
            }

            // Batasan panjang nomor telepon
            const maxLength = 15; // +6281234567890 (13 digit) atau +62812345678901 (14 digit)
            if (sanitizedValue.length > maxLength) {
                // Potong jika melebihi maxLength
                sanitizedValue = sanitizedValue.substring(0, maxLength);
            }

            // Update state
            setForm({ ...form, [name]: sanitizedValue });
            return;
        }

        // Untuk field lainnya, update seperti biasa
        setForm({ ...form, [name]: value });
    };

    const handleSelectTime = (time: string) => {
        const [hour] = time.split(':');
        setForm(prev => ({ ...prev, hour: parseInt(hour) }));
        onClose();
    };

    useEffect(() => {
        if (form.capster_id) {
            getCapsterHours(form.capster_id, (data: any) => {
                setCapsterHours(data.data);
            });
        }
    }, [form.date]);


    const onSelectionChangeCapster = (_id: string) => {
        setForm({
            ...form,
            capster_id: _id
        });

        // Fetch capster hours when ID changes
        getCapsterHours(_id, (data: any) => {
            console.log("Fetched Capster Hours:", data);
            setCapsterHours(data.data);
            // You can handle the data here if needed
        });
    };
    const onSelectionChangePayment = (id: string) => {
        setForm({
            ...form,
            payment_id: id
        });
    };

    const onSelectionChangeService = (id: string) => {
        setForm({
            ...form,
            service_id: id
        });
    };

    const fetchDataDropdown = async () => {
        try {
            const resServices: any = await getAllService();
            const resPayments: any = await getAllPayments();
            const resCapsters: any = await getAllCapster();

            // Get current day in Indonesian (lowercase)
            const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
            const today = new Date().getDay(); // 0 (Sunday) to 6 (Saturday)
            const todayInIndonesian = days[today];

            // Filter capsters who are active today
            const activeCapstersToday = resCapsters.data.filter((capster: any) =>
                capster.schedule[todayInIndonesian]?.is_active === true
            );

            setCapsters(activeCapstersToday);
            setServices(resServices.data);
            setPayments(resPayments.data);
        } catch (error) {
            console.error('Gagal fetch data:', error);
        }
    };
    useEffect(() => {
        fetchDataDropdown();
    }, []);

    const handleSubmit = async () => {
        const requiredFields = [
            'name',
            'email',
            'phone',
            'date',
            'hour',
            'capster_id',
            'payment_id',
            'rating',
            'haircut_type',
            'service_id',
            'status',
        ];

        const isValid = requiredFields.every((field) => {
            const value = form[field as keyof typeof form];
            if (typeof value === 'number') {
                return value !== 0;
            }
            return value !== '' && value !== null && value !== undefined;
        });

        if (!isValid) {
            toast.error('Harap isi semua field terlebih dahulu!');
            return;
        }

        // ✅ Validasi: Tidak boleh lebih dari 7 hari dari hari ini
        const today = new Date();
        const selectedDate = new Date(formatDate(form.date)); // formatDate harus return "YYYY-MM-DD"
        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 7);

        if (selectedDate > maxDate) {
            toast.error('Booking tidak boleh lebih dari 7 hari ke depan.');
            return;
        }

        const loadingToast = toast.loading('Membuat booking...');

        const formattedForm = {
            ...form,
            date: formatDateStr(form.date), // pastikan formatDateStr return string "YYYY-MM-DD"
        };

        try {
            localStorage.setItem('userPhone', form.phone);

            await createBooking(formattedForm, (res: any) => {
                toast.success('Booking berhasil!', {
                    id: loadingToast,
                });
                router.push('/admin_list_booking');
                console.log('Booking berhasil:', res);
            });
        } catch (err) {
            console.error('Gagal membuat booking', err);
            toast.error('Gagal membuat booking.', {
                id: loadingToast,
            });
        }
    };


    const isHourBooked = (hour: number): boolean => {
        const selectedDate = formatDate(form.date); // hasil: "2025-07-28"
        return capsterHours.some((item: any) => {
            const itemDate = formatDate(item.date); // Convert juga ke format "2025-07-28"
            return itemDate === selectedDate && parseInt(item.hour) === hour;
        });
    };


    function addDaysToToday(days: number, timeZone: string) {
        const today = new Date();
        const result = new Date(today);
        result.setDate(result.getDate() + days);
        return parseDate(result.toISOString().split('T')[0]);
    }

    const isHourAvailable = (hour: number, selectedDate: string, schedule: any) => {
        if (!schedule) return false;

        const date = new Date(selectedDate);
        const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
        const dayName = days[date.getDay()];
        const daySchedule = schedule[dayName];

        if (!daySchedule || !daySchedule.is_active) return false;

        // Parse jam kerja (contoh: "10:00 - 21:00")
        const [workStartStr, workEndStr] = daySchedule.jam_kerja.split(' - ');
        const workStart = parseInt(workStartStr.split(':')[0]);
        const workEnd = parseInt(workEndStr.split(':')[0]);

        // Parse jam istirahat (contoh: "12:00 - 14:00")
        const [breakStartStr, breakEndStr] = daySchedule.jam_istirahat.split(' - ');
        const breakStart = parseInt(breakStartStr.split(':')[0]);
        const breakEnd = parseInt(breakEndStr.split(':')[0]);

        // Cek apakah jam termasuk dalam jam kerja (inklusif)
        const isInWorkHours = hour >= workStart && hour <= workEnd;

        // Cek apakah jam termasuk dalam jam istirahat (inklusif)
        const isInBreakTime = hour >= breakStart && hour <= breakEnd;

        // Cek apakah jam sudah lewat (untuk hari ini)
        const now = new Date();
        const isToday = selectedDate === formatDate(now);
        const isPastTime = isToday && (
            hour < now.getHours() ||
            (hour === now.getHours() && now.getMinutes() > 0)
        );

        // Jam tersedia jika:
        // 1. Termasuk jam kerja (inklusif)
        // 2. Bukan jam istirahat
        // 3. Belum lewat (jika hari ini)
        return isInWorkHours && !isInBreakTime && !isPastTime;
    };

    const isDateUnavailable = (date: any) => {
        if (!form.capster_id) return true; // Jika belum pilih capster, semua tanggal disabled

        const selectedCapster = capsters.find((c: any) => c._id === form.capster_id);
        if (!selectedCapster) return true;

        // Konversi tanggal ke hari dalam bahasa Indonesia (lowercase)
        const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
        const jsDate = new Date(date.year, date.month - 1, date.day);
        const dayName = days[jsDate.getDay()];

        // Cek apakah hari ini aktif atau tidak
        const daySchedule = selectedCapster.schedule[dayName];
        return !daySchedule || !daySchedule.is_active;
    };

    console.log(capsterHours);
    console.log(capsters);
    console.log(services);
    console.log(payments);
    console.log(formatDateStr(form.date));
    console.log(form);

    return (
        <DefaultLayout>
            <div className='container mx-auto px-3 py-4 mb-20' >
                <div className="rounded-full my-4 cursor-pointer" onClick={() => router.back()}>
                    <IoArrowBackCircleOutline size={25} />
                </div>
                <div className="form">
                    <div className="my-4">
                        <InputSecond
                            styleTitle="text-black"
                            bg="bg-none border border-gray-400 placeholder-gray-400"
                            className="w-full"
                            htmlFor="name"
                            placeholder="Masukan Nama Customer"
                            title="Nama Customer"
                            type="text"
                            onChange={handleChange}
                            value={form.name}
                        />
                    </div>

                    <div className="my-4">
                        <InputSecond
                            styleTitle="text-black"
                            bg="bg-none border border-gray-400 placeholder-gray-400"
                            className="w-full"
                            htmlFor="email"
                            placeholder="Masukan Email Customer"
                            title="Email Customer"
                            type="email"
                            onChange={handleChange}
                            value={form.email}
                        />
                    </div>

                    <div className="my-4">
                        <InputSecond
                            styleTitle="text-black"
                            bg="bg-none border border-gray-400 placeholder-gray-400"
                            className="w-full"
                            htmlFor="phone"
                            placeholder="Masukan Nomor Telepon"
                            title="Nomor Telepon"
                            type="tel"
                            onChange={handleChange}
                            value={form.phone}
                        />
                    </div>

                    <div className="w-full my-4">
                        <h1 className="font-medium text-black mb-1">Pilih Capster</h1>
                        <Autocomplete
                            placeholder="Pilih Capster"
                            className="w-full"
                            variant="bordered"
                            onSelectionChange={(e: any) => onSelectionChangeCapster(e)}
                            value={form.capster_id}
                        >
                            {capsters.map((item: any) => (
                                <AutocompleteItem key={item._id}>{item.username}</AutocompleteItem>
                            ))}
                        </Autocomplete>
                    </div>

                    {form.capster_id && (
                        <>
                            <div className="my-4">
                                <h1 className="text-black mb-2 font-medium">Tanggal</h1>
                                <DatePicker
                                    minValue={today(getLocalTimeZone())}
                                    maxValue={addDaysToToday(7, getLocalTimeZone())}
                                    aria-label="date"
                                    name="date"
                                    variant="bordered"
                                    value={form.date}
                                    showMonthAndYearPickers
                                    onChange={(e: any) => setForm({ ...form, date: e })}
                                    isDateUnavailable={isDateUnavailable}
                                />
                            </div>

                            <div className="w-full my-4">
                                <h1 className="font-medium text-black mb-1">Jenis Pembayaran</h1>
                                <Autocomplete
                                    variant="bordered"
                                    placeholder="Pilih Jenis Pembayaran"
                                    className="w-full"
                                    onSelectionChange={(e: any) => onSelectionChangePayment(e)}
                                    value={form.payment_id}
                                >
                                    {payments.map((item: any) => (
                                        <AutocompleteItem key={item._id}>{item.name}</AutocompleteItem>
                                    ))}
                                </Autocomplete>
                            </div>

                            <div className="w-full my-4">
                                <h1 className="font-medium text-black mb-1">Jenis Layanan</h1>
                                <Autocomplete
                                    variant="bordered"
                                    placeholder="Pilih Jenis Layanan"
                                    className="w-full"
                                    onSelectionChange={(e: any) => onSelectionChangeService(e)}
                                    value={form.service_id}
                                >
                                    {services.map((item: any) => (
                                        <AutocompleteItem key={item._id} textValue={item.name}>
                                            {item.name} <span className="text-green-800">{formatRupiah(item.price)}</span>
                                        </AutocompleteItem>

                                    ))}
                                </Autocomplete>
                            </div>

                            <div className="my-4">
                                <InputSecond
                                    styleTitle="text-black"
                                    bg="bg-none border border-gray-400 placeholder-gray-400"
                                    className="w-full"
                                    htmlFor="haircut_type"
                                    placeholder="Masukan Jenis Cukuran"
                                    title="Jenis Cukuran"
                                    type="text"
                                    onChange={handleChange}
                                    value={form.haircut_type}
                                />
                            </div>

                            <div className="my-4">
                                <h1 className="text-black mb-2 font-medium">Jam</h1>
                                <div
                                    className="border border-gray-400 flex justify-between py-1 px-3 rounded-lg items-center cursor-pointer"
                                    onClick={onOpen}
                                >
                                    <p>{form.hour}.00</p>
                                    <MdOutlineAccessTime size={20} color="gray" />
                                </div>
                            </div>
                        </>
                    )}

                    <ButtonPrimary onClick={handleSubmit} className="py-2 px-3 rounded-xl mt-4 w-full">
                        Booking
                    </ButtonPrimary>
                </div>


                <ModalDefault isOpen={isOpen} onClose={onClose}>
                    <h1 className="text-black text-xl font-semibold mb-4">JAM</h1>
                    <div className="bg-gray-100 rounded-md shadow text-center w-full">
                        <h2 className="text-gray-600 font-semibold text-lg mb-4 tracking-wide uppercase">
                            Waktu tersedia
                        </h2>
                        <div className="grid grid-cols-3 gap-4">
                            {Object.entries(hours).map(([label, times]) => (
                                <div key={label}>
                                    <h3 className="font-bold mb-2">{label}</h3>
                                    <div className="flex flex-col items-center gap-3">
                                        {times.map((time) => {
                                            const selectedCapster = capsters.find((c: any) => c._id === form.capster_id);
                                            const isDisabled = isHourBooked(time) ||
                                                !selectedCapster ||
                                                !isHourAvailable(time, formatDate(form.date), selectedCapster.schedule);

                                            return (
                                                <button
                                                    key={time}
                                                    disabled={isDisabled}
                                                    className={`px-3 py-1 rounded transition ${isDisabled
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-yellow-300 hover:bg-yellow-400'
                                                        }`}
                                                    onClick={() => !isDisabled && handleSelectTime(`${time}:00`)}
                                                >
                                                    {time}:00
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-3 text-sm text-gray-500">
                            Waktu dipilih: <strong>{form.hour ? `${form.hour}:00` : 'Belum dipilih'}</strong>
                        </p>
                    </div>
                </ModalDefault>
            </div>
        </DefaultLayout>
    )
}

export default page