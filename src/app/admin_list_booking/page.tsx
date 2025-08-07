'use client'
import { deleteBooking, getAllCapster, getAllPayments, getAllReservation, updateBooking } from '@/api/method';
import DefaultLayout from '@/fragments/layout/adminLayout/DefaultLayout';
import ModalDefault from '@/fragments/modal/modal';
import ModalAlert from '@/fragments/modal/modalAlert';
import { Autocomplete, AutocompleteItem, getKeyValue, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from '@heroui/react'
import React, { useEffect } from 'react'
import toast from 'react-hot-toast';
import { BsWhatsapp } from 'react-icons/bs';
import { FaPenSquare, FaTrashAlt } from 'react-icons/fa';
import { IoMdCheckboxOutline } from 'react-icons/io';
import { MdCheckBoxOutlineBlank } from 'react-icons/md';
import { RiEdit2Line } from 'react-icons/ri';

type Props = {}

function page({ }: Props) {
    const [id, setId] = React.useState('')
    const { onOpen, onClose, isOpen } = useDisclosure();
    const { isOpen: isWarningOpen, onOpen: onWarningOpen, onClose: onWarningClose } = useDisclosure();
    const [loading, setLoading] = React.useState(false)
    const [capsters, setCapster] = React.useState<any[]>([])
    const [payments, setPayment] = React.useState<any[]>([])
    const [data, setData] = React.useState<any[]>([])
    const [page, setPage] = React.useState(1)
    const rowsPerPage = 4
    const [form, setForm] = React.useState({
        payment_id: '',
        status: '',
        capster_id: '',
    })

    const fetchData = async () => {
        setLoading(true)
        const result = await getAllReservation()
        const capster = await getAllCapster()
        const payment = await getAllPayments()
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
        setPayment(payment?.data || [])
        setData(formatted || [])
        setCapster(capster?.data || [])
        setLoading(false)
    }

    // Fetch data
    useEffect(() => {
        fetchData()
    }, [])

    // Pagination
    const pages = Math.ceil(data.length / rowsPerPage)

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage
        const end = start + rowsPerPage
        return data.slice(start, end)
    }, [page, data])

    // Aksi Edit dan Delete
    const openModalEdit = (item: any) => {
        onOpen()
        setId(item._id)
        console.log('Edit:', item);
        setForm({
            payment_id: item.payment_id._id,
            status: item.status,
            capster_id: item.capster_id._id,
        })
        // bisa navigasi ke halaman edit atau buka modal
    }

    const openModalDelete = (item: any) => {
        setId(item._id)
        onWarningOpen()
    }



    const handleDelete = async () => {
        const toastId = toast.loading('Menghapus booking...');
        try {
            const result = await deleteBooking(id); // id dari state atau props
            toast.success('Booking berhasil dihapus!', { id: toastId });
            console.log('result', result);

            // Refresh data dan tutup modal jika perlu
            fetchData(); // contoh fungsi ambil ulang data
            onWarningClose(); // jika kamu pakai modal
        } catch (error) {
            toast.error('Terjadi kesalahan saat menghapus booking.', { id: toastId });
        }
    };
    const handleChange = (e: any) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }
    const onSelectionChange = (_id: string) => {
        setForm({
            ...form,
            capster_id: _id
        });
    };
    const onSelectionChangeStatus = (value: string) => {
        setForm({
            ...form,
            status: value
        });
    };

    const onSelectionPayment = (_id: string) => {
        setForm({
            ...form,
            payment_id: _id
        })
    }

    const dataTipe = [
        { key: 'Menunggu', label: 'Menunggu', value: 'Menunggu' },
        { key: 'Selesai', label: 'Selesai', value: 'Selesai' }
    ];
    console.log('caoster', capsters);
    console.log('form', form);
    console.log('data', data);
    const handleWhatsApp = (item: any) => {
        if (!item || !item.phone) {
            console.error("Nomor telepon tidak ditemukan");
            return;
        }

        const phoneNumber = item.phone.replace(/\D/g, ''); // hapus karakter selain angka

        // Buat pesan default dengan detail booking
        const message = `Hallo, bookingan anda telah tiba.\n\n` +
            `Nama: ${item.name || '-'}\n` +
            `Tanggal: ${item.formatted_date || '-'}\n` +
            `Jenis Cukuran: ${item.haircut_type || '-'}\n` +
            `Jam: ${item.hour || '-'} : 00`;

        // Encode message untuk URL
        const encodedMessage = encodeURIComponent(message);

        const waUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        window.open(waUrl, '_blank'); // buka di tab baru
    };

    const handleUpdate = async (e: any) => {
        e.preventDefault();

        const toastId = toast.loading('Sedang memperbarui data...');

        try {
            await updateBooking(id, form, () => {
                fetchData();
                onClose();
            });

            toast.success('Berhasil diperbarui!', { id: toastId });
        } catch (error) {
            toast.error('Gagal memperbarui data.', { id: toastId });
        }
    };


    const handleStatusFinished = async (item: any) => {
        // Validasi apakah payment_id dan capster_id ada
        if (!item || !item.payment_id || !item.capster_id) {
            toast.error("Data tidak lengkap. Mohon periksa kembali.");
            console.error("Data tidak lengkap", item);
            return;
        }

        const updatedForm = {
            payment_id: item.payment_id._id,
            status: 'Selesai',
            capster_id: item.capster_id._id,
        };

        setId(item._id);
        setForm(updatedForm);

        const toastId = toast.loading("Memproses status booking...");

        try {
            await updateBooking(item._id, updatedForm, () => {
                fetchData();
                onClose();
            });
            toast.success("Status booking berhasil diubah!", { id: toastId });
        } catch (error) {
            console.error("Gagal memperbarui status", error);
            toast.error("Gagal memperbarui status booking", { id: toastId });
        }
    };
    console.log(id);
    console.log('payments', payments);

    return (
        <DefaultLayout>
            <h1 className="text-black text-xl font-semibold mb-4">LIST BOOKING</h1>
            <Table
                aria-label="Tabel Booking"
                bottomContent={
                    <div className="flex w-full justify-center">
                        <Pagination
                            isCompact
                            showControls
                            showShadow
                            classNames={{
                                cursor: "bg-primary text-white cursor-pointer"
                            }}
                            color="primary"
                            page={page}
                            total={pages}
                            onChange={(p) => setPage(p)}
                        />
                    </div>
                }
                classNames={{
                    wrapper: "min-h-[250px]",
                    th: 'bg-secondary text-white font-semibold',
                    td: 'text-black',
                }}
            >
                <TableHeader>
                    <TableColumn key="name">NAME</TableColumn>
                    <TableColumn key="phone">PHONE</TableColumn>
                    <TableColumn key="capster_name">CAPSTER</TableColumn>
                    <TableColumn key="service_name">SERVICE</TableColumn>
                    <TableColumn key="haircut_type">HAIRCUT</TableColumn>
                    <TableColumn key="formatted_date">DATE</TableColumn>
                    <TableColumn key="hour">HOUR</TableColumn>
                    <TableColumn key="payment_name">PAYMENT</TableColumn>
                    <TableColumn key="status">STATUS</TableColumn>
                    <TableColumn key="action">ACTION</TableColumn>
                </TableHeader>
                <TableBody items={items} isLoading={loading}>
                    {(item: any) => (
                        <TableRow key={item._id}>
                            {(columnKey: any) => (
                                <TableCell>
                                    {columnKey === 'action' ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleStatusFinished(item)}
                                            >
                                                {item.status === 'Menunggu' ? (
                                                    <MdCheckBoxOutlineBlank size={23} />
                                                ) :
                                                    <IoMdCheckboxOutline size={23} color='green' />
                                                }
                                            </button>
                                            <button
                                                onClick={openModalEdit.bind(null, item)}
                                            >
                                                <FaPenSquare color='#f9d41c' size={20} />
                                            </button>
                                            <BsWhatsapp className='cursor-pointer' onClick={() => handleWhatsApp(item)} color='green' size={18} />
                                            <button
                                                onClick={() => openModalDelete(item)}
                                            >
                                                <FaTrashAlt color='red' size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        getKeyValue(item, columnKey)
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <ModalDefault isOpen={isOpen} onClose={onClose}>
                <h1 className='font font-medium' >EDIT LIST BOOKING</h1>

                <div className="">
                    <h1>Jenis Pembayaran</h1>
                    <Autocomplete
                        className="w-full"
                        variant='bordered'
                        onSelectionChange={(e: any) => onSelectionPayment(e)}
                        value={form.status}
                        selectedKey={form.payment_id}
                    >
                        {payments.map((item: any) => (
                            <AutocompleteItem key={item._id}>{item.name}</AutocompleteItem>
                        ))}
                    </Autocomplete>
                </div>

                <div className="">
                    <h1>Status</h1>
                    <Autocomplete
                        className="w-full"
                        variant='bordered'
                        onSelectionChange={(e: any) => onSelectionChangeStatus(e)}
                        value={form.status}
                    >
                        {dataTipe.map((item: any) => (
                            <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
                        ))}
                    </Autocomplete>
                </div>

                <div className="">
                    <h1>Capster</h1>
                    <Autocomplete className="w-full"
                        variant='bordered'
                        onSelectionChange={(e: any) => onSelectionChange(e)} value={form.capster_id} selectedKey={form.capster_id}>
                        {capsters.map((item: any) => (
                            <AutocompleteItem key={item._id}>{item.username}</AutocompleteItem>
                        ))}
                    </Autocomplete>
                </div>


                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={handleUpdate}
                        className="bg-blue-800 text-white cursor-pointer px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                    >
                        Save
                    </button>
                    <button
                        className="bg-red-800 text-white cursor-pointer px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </ModalDefault>

            <ModalAlert isOpen={isWarningOpen} onClose={onWarningClose} >
                apakah anda yakin akan menghapus list booking ini ?
                <div className="flex justify-end gap-3">
                    <button className='bg-red-900  rounded-lg p-1 cursor-pointer py-2 px-3 text-white' onClick={onWarningClose}>Tidak</button>
                    <button className='bg-blue-500  rounded-lg p-1 cursor-pointer py-2 px-3 text-white' onClick={handleDelete} >Ya</button>
                </div>
            </ModalAlert>
        </DefaultLayout>
    )
}

export default page